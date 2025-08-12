import { ethers } from 'ethers';
import { logger } from '../utils/logger';
import { AppError } from '../utils/AppError';
import { BlockchainTransaction, TransactionStatus, TransactionType } from '../models/BlockchainTransaction.model';

// Contract ABIs (simplified for key functions)
const DONATION_TRACKER_ABI = [
  "function recordDonation(string donationId, address donor, address projectAddress, uint256 amount, string projectName, string companyName)",
  "function getDonationById(string donationId) view returns (tuple(uint256 id, string donationId, address donor, address projectAddress, uint256 amount, uint256 timestamp, string projectName, string companyName, bool verified))",
  "function verifyDonation(string donationId)",
  "event DonationRecorded(uint256 indexed id, string indexed donationId, address indexed donor, address projectAddress, uint256 amount, string projectName, string companyName)"
];

const PROJECT_DISTRIBUTION_ABI = [
  "function registerProject(string projectId, string name, address walletAddress)",
  "function receiveFunds(string projectId, uint256 amount)",
  "function distributeFunds(string projectId, uint256 amount, string reason)",
  "function getProjectDetails(string projectId) view returns (tuple(string id, string name, address walletAddress, bool isActive, uint256 totalReceived, uint256 totalDistributed, uint256 pendingAmount))",
  "event FundsReceived(string indexed projectId, uint256 amount, address indexed from)",
  "event FundsDistributed(uint256 indexed distributionId, string indexed projectId, address indexed projectAddress, uint256 amount, string reason)"
];

class BlockchainService {
  private provider: ethers.Provider;
  private signer: ethers.Wallet;
  private donationTracker: ethers.Contract;
  private projectDistribution: ethers.Contract;
  private readonly chainId: number;
  private readonly treasuryAddress: string;

  constructor() {
    const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
    const privateKey = process.env.AVALANCHE_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
    const donationTrackerAddress = process.env.DONATION_TRACKER_ADDRESS;
    const projectDistributionAddress = process.env.PROJECT_DISTRIBUTION_ADDRESS;

    // Allow dev mock key in local mode

    if (!donationTrackerAddress || !projectDistributionAddress) {
      throw new Error('Contract addresses are required');
    }

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.signer = new ethers.Wallet(privateKey, this.provider);
    this.chainId = parseInt(process.env.AVALANCHE_CHAIN_ID || '43113');
    this.treasuryAddress = process.env.AVALANCHE_TREASURY_ADDRESS || this.signer.address;

    this.donationTracker = new ethers.Contract(
      donationTrackerAddress,
      DONATION_TRACKER_ABI,
      this.signer
    );

    this.projectDistribution = new ethers.Contract(
      projectDistributionAddress,
      PROJECT_DISTRIBUTION_ABI,
      this.signer
    );

    this.setupEventListeners();
  }

  private setupEventListeners() {
    // Listen for DonationRecorded events
    this.donationTracker.on('DonationRecorded', async (
      id: bigint,
      donationId: string,
      donor: string,
      projectAddress: string,
      amount: bigint,
      projectName: string,
      companyName: string,
      event: any
    ) => {
      try {
        await this.handleDonationRecordedEvent({
          id: id.toString(),
          donationId,
          donor,
          projectAddress,
          amount: amount.toString(),
          projectName,
          companyName,
          txHash: event.transactionHash,
          blockNumber: event.blockNumber
        });
      } catch (error) {
        logger.error('Error handling DonationRecorded event:', error);
      }
    });

    // Listen for FundsDistributed events
    this.projectDistribution.on('FundsDistributed', async (
      distributionId: bigint,
      projectId: string,
      projectAddress: string,
      amount: bigint,
      reason: string,
      event: any
    ) => {
      logger.info(`Funds distributed: ${amount} to project ${projectId} (${reason})`);
    });
  }

  async recordDonation(
    donationId: string,
    donorAddress: string,
    projectAddress: string,
    amount: number,
    projectName: string,
    companyName: string
  ): Promise<string> {
    try {
      // Convert amount to wei (assuming USDC with 6 decimals)
      const amountInWei = ethers.parseUnits(amount.toString(), 6);

      const tx = await this.donationTracker.recordDonation(
        donationId,
        donorAddress,
        projectAddress,
        amountInWei,
        projectName,
        companyName,
        {
          gasLimit: 300000
        }
      );

      logger.info(`Donation recorded on blockchain: ${tx.hash}`);

      // Store transaction in database
      await BlockchainTransaction.create({
        txHash: tx.hash,
        donationId,
        type: TransactionType.DONATION,
        fromAddress: this.signer.address,
        toAddress: projectAddress,
        value: amountInWei.toString(),
        status: TransactionStatus.PENDING,
        metadata: {
          contractAddress: await this.donationTracker.getAddress(),
          methodName: 'recordDonation',
          parameters: {
            donationId,
            donorAddress,
            projectAddress,
            amount: amount.toString(),
            projectName,
            companyName
          }
        }
      });

      return tx.hash;
    } catch (error: any) {
      logger.error('Error recording donation on blockchain:', error);
      throw new AppError('Failed to record donation on blockchain', 500);
    }
  }

  async verifyDonation(donationId: string): Promise<boolean> {
    try {
      const tx = await this.donationTracker.verifyDonation(donationId, {
        gasLimit: 100000
      });

      await tx.wait();
      
      logger.info(`Donation verified on blockchain: ${donationId}`);
      return true;
    } catch (error: any) {
      logger.error('Error verifying donation:', error);
      return false;
    }
  }

  async getDonationFromBlockchain(donationId: string): Promise<any> {
    try {
      const donation = await this.donationTracker.getDonationById(donationId);
      return {
        id: donation.id.toString(),
        donationId: donation.donationId,
        donor: donation.donor,
        projectAddress: donation.projectAddress,
        amount: ethers.formatUnits(donation.amount, 6),
        timestamp: new Date(Number(donation.timestamp) * 1000),
        projectName: donation.projectName,
        companyName: donation.companyName,
        verified: donation.verified
      };
    } catch (error: any) {
      logger.error('Error getting donation from blockchain:', error);
      throw new AppError('Failed to get donation from blockchain', 500);
    }
  }

  async registerProject(
    projectId: string,
    projectName: string,
    walletAddress: string
  ): Promise<string> {
    try {
      const tx = await this.projectDistribution.registerProject(
        projectId,
        projectName,
        walletAddress,
        {
          gasLimit: 200000
        }
      );

      logger.info(`Project registered on blockchain: ${projectId} -> ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error registering project on blockchain:', error);
      throw new AppError('Failed to register project on blockchain', 500);
    }
  }

  async distributeFundsToProject(
    projectId: string,
    amount: number,
    reason: string
  ): Promise<string> {
    try {
      const amountInWei = ethers.parseUnits(amount.toString(), 6);
      
      const tx = await this.projectDistribution.distributeFunds(
        projectId,
        amountInWei,
        reason,
        {
          gasLimit: 300000
        }
      );

      logger.info(`Funds distributed to project ${projectId}: ${tx.hash}`);
      return tx.hash;
    } catch (error: any) {
      logger.error('Error distributing funds to project:', error);
      throw new AppError('Failed to distribute funds to project', 500);
    }
  }

  async getProjectBalance(projectAddress: string): Promise<string> {
    try {
      // Get USDC balance
      const usdcAddress = this.chainId === 43114 
        ? "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"  // Mainnet
        : "0x5425890298aed601595a70AB815c96711a31Bc65";  // Fuji

      const usdcContract = new ethers.Contract(
        usdcAddress,
        ["function balanceOf(address) view returns (uint256)"],
        this.provider
      );

      const balance = await usdcContract.balanceOf(projectAddress);
      return ethers.formatUnits(balance, 6);
    } catch (error: any) {
      logger.error('Error getting project balance:', error);
      return '0';
    }
  }

  async getTransaction(txHash: string): Promise<any> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx || !receipt) {
        return null;
      }

      const block = await this.provider.getBlock(receipt.blockNumber);
      const currentBlock = await this.provider.getBlockNumber();

      return {
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        fromAddress: tx.from,
        toAddress: tx.to || '',
        value: tx.value.toString(),
        gasUsed: receipt.gasUsed.toString(),
        gasPrice: tx.gasPrice?.toString() || '0',
        status: receipt.status === 1 ? TransactionStatus.CONFIRMED : TransactionStatus.FAILED,
        confirmations: currentBlock - receipt.blockNumber,
        timestamp: new Date(Number(block?.timestamp || 0) * 1000)
      };
    } catch (error: any) {
      logger.error('Error getting transaction:', error);
      return null;
    }
  }

  private async handleDonationRecordedEvent(eventData: any) {
    try {
      const dbTx = await BlockchainTransaction.findOne({
        where: { txHash: eventData.txHash }
      });

      if (dbTx) {
        await dbTx.update({
          blockNumber: eventData.blockNumber,
          status: TransactionStatus.CONFIRMED,
          confirmedAt: new Date()
        });
      }

      logger.info(`DonationRecorded event processed: ${eventData.donationId}`);
    } catch (error) {
      logger.error('Error processing DonationRecorded event:', error);
    }
  }

  async getProvider(): Promise<ethers.Provider> {
    return this.provider;
  }

  async getTreasuryAddress(): Promise<string> {
    return this.treasuryAddress;
  }

  async waitForTransaction(txHash: string): Promise<any> {
    try {
      const receipt = await this.provider.waitForTransaction(txHash, 1);
      return receipt;
    } catch (error) {
      logger.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      return false;
    }
  }
}

let blockchainService: BlockchainService | null = null;

export const initializeBlockchain = async (): Promise<void> => {
  try {
    blockchainService = new BlockchainService();
    logger.info('Blockchain service initialized');
  } catch (error) {
    logger.error('Failed to initialize blockchain service:', error);
    throw error;
  }
};

export const getBlockchainService = (): BlockchainService => {
  if (!blockchainService) {
    throw new Error('Blockchain service not initialized');
  }
  return blockchainService;
};
import { ethers, Contract, Wallet, JsonRpcProvider } from 'ethers';
import { logger } from '../utils/logger';

// Smart contract ABI for donation tracking
const DONATION_CONTRACT_ABI = [
  "function recordDonation(string memory donationId, address donor, address charity, uint256 amount, string memory receiptHash) external",
  "function getDonation(string memory donationId) external view returns (address, address, uint256, string memory, uint256)",
  "function getTotalDonations() external view returns (uint256)",
  "function getCharityDonations(address charity) external view returns (uint256)",
  "event DonationRecorded(string indexed donationId, address indexed donor, address indexed charity, uint256 amount, string receiptHash, uint256 timestamp)"
];

interface DonationRecord {
  id: string;
  donor: string;
  charity: string;
  amount: number;
  receiptHash: string;
  timestamp: number;
}

class AvalancheL1Service {
  private provider: JsonRpcProvider;
  private wallet: Wallet;
  private contract: Contract;
  private isEnabled: boolean;

  constructor() {
    this.isEnabled = !!(
      process.env.AVALANCHE_RPC_URL && 
      process.env.AVALANCHE_PRIVATE_KEY && 
      process.env.AVALANCHE_CONTRACT_ADDRESS
    );

    if (this.isEnabled) {
      try {
        // Initialize provider
        this.provider = new JsonRpcProvider(process.env.AVALANCHE_RPC_URL);
        
        // Initialize wallet
        this.wallet = new Wallet(process.env.AVALANCHE_PRIVATE_KEY!, this.provider);
        
        // Initialize contract
        this.contract = new Contract(
          process.env.AVALANCHE_CONTRACT_ADDRESS!,
          DONATION_CONTRACT_ABI,
          this.wallet
        );

        logger.info('✅ Avalanche L1 service initialized successfully');
      } catch (error) {
        logger.error('❌ Failed to initialize Avalanche L1 service:', error);
        this.isEnabled = false;
      }
    } else {
      logger.info('⚠️ Avalanche L1 service disabled - missing configuration');
    }
  }

  /**
   * Record a donation on the Avalanche L1 blockchain
   */
  async recordDonation(
    donationId: string,
    donorAddress: string,
    charityAddress: string,
    amountInWei: bigint,
    receiptHash: string
  ): Promise<string | null> {
    if (!this.isEnabled) {
      logger.warn('Avalanche L1 not enabled, skipping blockchain recording');
      return null;
    }

    try {
      logger.info(`🔗 Recording donation ${donationId} on Avalanche L1...`);

      const tx = await this.contract.recordDonation(
        donationId,
        donorAddress,
        charityAddress,
        amountInWei,
        receiptHash,
        {
          gasLimit: 100000,
          gasPrice: process.env.AVALANCHE_GAS_PRICE ? 
            ethers.parseUnits(process.env.AVALANCHE_GAS_PRICE, 'wei') : 
            undefined
        }
      );

      logger.info(`📤 Transaction sent: ${tx.hash}`);
      
      const receipt = await tx.wait();
      
      if (receipt && receipt.status === 1) {
        logger.info(`✅ Donation recorded on blockchain: ${tx.hash}`);
        return tx.hash;
      } else {
        throw new Error('Transaction failed');
      }

    } catch (error) {
      logger.error(`❌ Failed to record donation on blockchain:`, error);
      throw error;
    }
  }

  /**
   * Get donation details from blockchain
   */
  async getDonation(donationId: string): Promise<DonationRecord | null> {
    if (!this.isEnabled) return null;

    try {
      const result = await this.contract.getDonation(donationId);
      
      return {
        id: donationId,
        donor: result[0],
        charity: result[1],
        amount: Number(result[2]),
        receiptHash: result[3],
        timestamp: Number(result[4])
      };

    } catch (error) {
      logger.error(`Failed to get donation from blockchain:`, error);
      return null;
    }
  }

  /**
   * Get total platform donations from blockchain
   */
  async getTotalDonations(): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const total = await this.contract.getTotalDonations();
      return Number(total);
    } catch (error) {
      logger.error('Failed to get total donations from blockchain:', error);
      return 0;
    }
  }

  /**
   * Get charity-specific donations from blockchain
   */
  async getCharityDonations(charityAddress: string): Promise<number> {
    if (!this.isEnabled) return 0;

    try {
      const total = await this.contract.getCharityDonations(charityAddress);
      return Number(total);
    } catch (error) {
      logger.error('Failed to get charity donations from blockchain:', error);
      return 0;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(): Promise<bigint> {
    if (!this.isEnabled) return BigInt(0);

    try {
      const feeData = await this.provider.getFeeData();
      return feeData.gasPrice || BigInt(25000000000); // Fallback gas price
    } catch (error) {
      logger.error('Failed to get gas price:', error);
      return BigInt(25000000000);
    }
  }

  /**
   * Get network information
   */
  async getNetworkInfo() {
    if (!this.isEnabled) return null;

    try {
      const network = await this.provider.getNetwork();
      const balance = await this.provider.getBalance(this.wallet.address);
      
      return {
        chainId: Number(network.chainId),
        name: network.name,
        walletAddress: this.wallet.address,
        balance: ethers.formatEther(balance),
        contractAddress: process.env.AVALANCHE_CONTRACT_ADDRESS
      };
    } catch (error) {
      logger.error('Failed to get network info:', error);
      return null;
    }
  }

  /**
   * Health check for Avalanche L1 connection
   */
  async healthCheck(): Promise<boolean> {
    if (!this.isEnabled) return false;

    try {
      const blockNumber = await this.provider.getBlockNumber();
      return blockNumber > 0;
    } catch (error) {
      logger.error('Avalanche L1 health check failed:', error);
      return false;
    }
  }

  /**
   * Convert NZD amount to Wei (assuming 1 AVAX = $X NZD)
   */
  nzdToWei(nzdAmount: number, avaxPriceInNZD: number = 50): bigint {
    const avaxAmount = nzdAmount / avaxPriceInNZD;
    return ethers.parseEther(avaxAmount.toString());
  }

  /**
   * Generate charity address from charity ID (deterministic)
   */
  generateCharityAddress(charityId: string): string {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(charityId));
    return ethers.getAddress('0x' + hash.slice(-40));
  }

  /**
   * Generate donor address from business info (deterministic)
   */
  generateDonorAddress(companyNumber: string, email: string): string {
    const combined = `${companyNumber}_${email}`;
    const hash = ethers.keccak256(ethers.toUtf8Bytes(combined));
    return ethers.getAddress('0x' + hash.slice(-40));
  }
}

export default new AvalancheL1Service();
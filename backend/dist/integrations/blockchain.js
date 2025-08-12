"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBlockchainService = exports.initializeBlockchain = void 0;
const ethers_1 = require("ethers");
const logger_1 = require("../utils/logger");
const AppError_1 = require("../utils/AppError");
const BlockchainTransaction_model_1 = require("../models/BlockchainTransaction.model");
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
    provider;
    signer;
    donationTracker;
    projectDistribution;
    chainId;
    treasuryAddress;
    constructor() {
        const rpcUrl = process.env.AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
        const privateKey = process.env.AVALANCHE_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000001';
        const donationTrackerAddress = process.env.DONATION_TRACKER_ADDRESS;
        const projectDistributionAddress = process.env.PROJECT_DISTRIBUTION_ADDRESS;
        // Allow dev mock key in local mode
        if (!donationTrackerAddress || !projectDistributionAddress) {
            throw new Error('Contract addresses are required');
        }
        this.provider = new ethers_1.ethers.JsonRpcProvider(rpcUrl);
        this.signer = new ethers_1.ethers.Wallet(privateKey, this.provider);
        this.chainId = parseInt(process.env.AVALANCHE_CHAIN_ID || '43113');
        this.treasuryAddress = process.env.AVALANCHE_TREASURY_ADDRESS || this.signer.address;
        this.donationTracker = new ethers_1.ethers.Contract(donationTrackerAddress, DONATION_TRACKER_ABI, this.signer);
        this.projectDistribution = new ethers_1.ethers.Contract(projectDistributionAddress, PROJECT_DISTRIBUTION_ABI, this.signer);
        this.setupEventListeners();
    }
    setupEventListeners() {
        // Listen for DonationRecorded events
        this.donationTracker.on('DonationRecorded', async (id, donationId, donor, projectAddress, amount, projectName, companyName, event) => {
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
            }
            catch (error) {
                logger_1.logger.error('Error handling DonationRecorded event:', error);
            }
        });
        // Listen for FundsDistributed events
        this.projectDistribution.on('FundsDistributed', async (distributionId, projectId, projectAddress, amount, reason, event) => {
            logger_1.logger.info(`Funds distributed: ${amount} to project ${projectId} (${reason})`);
        });
    }
    async recordDonation(donationId, donorAddress, projectAddress, amount, projectName, companyName) {
        try {
            // Convert amount to wei (assuming USDC with 6 decimals)
            const amountInWei = ethers_1.ethers.parseUnits(amount.toString(), 6);
            const tx = await this.donationTracker.recordDonation(donationId, donorAddress, projectAddress, amountInWei, projectName, companyName, {
                gasLimit: 300000
            });
            logger_1.logger.info(`Donation recorded on blockchain: ${tx.hash}`);
            // Store transaction in database
            await BlockchainTransaction_model_1.BlockchainTransaction.create({
                txHash: tx.hash,
                donationId,
                type: BlockchainTransaction_model_1.TransactionType.DONATION,
                fromAddress: this.signer.address,
                toAddress: projectAddress,
                value: amountInWei.toString(),
                status: BlockchainTransaction_model_1.TransactionStatus.PENDING,
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
        }
        catch (error) {
            logger_1.logger.error('Error recording donation on blockchain:', error);
            throw new AppError_1.AppError('Failed to record donation on blockchain', 500);
        }
    }
    async verifyDonation(donationId) {
        try {
            const tx = await this.donationTracker.verifyDonation(donationId, {
                gasLimit: 100000
            });
            await tx.wait();
            logger_1.logger.info(`Donation verified on blockchain: ${donationId}`);
            return true;
        }
        catch (error) {
            logger_1.logger.error('Error verifying donation:', error);
            return false;
        }
    }
    async getDonationFromBlockchain(donationId) {
        try {
            const donation = await this.donationTracker.getDonationById(donationId);
            return {
                id: donation.id.toString(),
                donationId: donation.donationId,
                donor: donation.donor,
                projectAddress: donation.projectAddress,
                amount: ethers_1.ethers.formatUnits(donation.amount, 6),
                timestamp: new Date(Number(donation.timestamp) * 1000),
                projectName: donation.projectName,
                companyName: donation.companyName,
                verified: donation.verified
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting donation from blockchain:', error);
            throw new AppError_1.AppError('Failed to get donation from blockchain', 500);
        }
    }
    async registerProject(projectId, projectName, walletAddress) {
        try {
            const tx = await this.projectDistribution.registerProject(projectId, projectName, walletAddress, {
                gasLimit: 200000
            });
            logger_1.logger.info(`Project registered on blockchain: ${projectId} -> ${tx.hash}`);
            return tx.hash;
        }
        catch (error) {
            logger_1.logger.error('Error registering project on blockchain:', error);
            throw new AppError_1.AppError('Failed to register project on blockchain', 500);
        }
    }
    async distributeFundsToProject(projectId, amount, reason) {
        try {
            const amountInWei = ethers_1.ethers.parseUnits(amount.toString(), 6);
            const tx = await this.projectDistribution.distributeFunds(projectId, amountInWei, reason, {
                gasLimit: 300000
            });
            logger_1.logger.info(`Funds distributed to project ${projectId}: ${tx.hash}`);
            return tx.hash;
        }
        catch (error) {
            logger_1.logger.error('Error distributing funds to project:', error);
            throw new AppError_1.AppError('Failed to distribute funds to project', 500);
        }
    }
    async getProjectBalance(projectAddress) {
        try {
            // Get USDC balance
            const usdcAddress = this.chainId === 43114
                ? "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664" // Mainnet
                : "0x5425890298aed601595a70AB815c96711a31Bc65"; // Fuji
            const usdcContract = new ethers_1.ethers.Contract(usdcAddress, ["function balanceOf(address) view returns (uint256)"], this.provider);
            const balance = await usdcContract.balanceOf(projectAddress);
            return ethers_1.ethers.formatUnits(balance, 6);
        }
        catch (error) {
            logger_1.logger.error('Error getting project balance:', error);
            return '0';
        }
    }
    async getTransaction(txHash) {
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
                status: receipt.status === 1 ? BlockchainTransaction_model_1.TransactionStatus.CONFIRMED : BlockchainTransaction_model_1.TransactionStatus.FAILED,
                confirmations: currentBlock - receipt.blockNumber,
                timestamp: new Date(Number(block?.timestamp || 0) * 1000)
            };
        }
        catch (error) {
            logger_1.logger.error('Error getting transaction:', error);
            return null;
        }
    }
    async handleDonationRecordedEvent(eventData) {
        try {
            const dbTx = await BlockchainTransaction_model_1.BlockchainTransaction.findOne({
                where: { txHash: eventData.txHash }
            });
            if (dbTx) {
                await dbTx.update({
                    blockNumber: eventData.blockNumber,
                    status: BlockchainTransaction_model_1.TransactionStatus.CONFIRMED,
                    confirmedAt: new Date()
                });
            }
            logger_1.logger.info(`DonationRecorded event processed: ${eventData.donationId}`);
        }
        catch (error) {
            logger_1.logger.error('Error processing DonationRecorded event:', error);
        }
    }
    async getProvider() {
        return this.provider;
    }
    async getTreasuryAddress() {
        return this.treasuryAddress;
    }
    async waitForTransaction(txHash) {
        try {
            const receipt = await this.provider.waitForTransaction(txHash, 1);
            return receipt;
        }
        catch (error) {
            logger_1.logger.error('Error waiting for transaction:', error);
            throw error;
        }
    }
    async verifyTransaction(txHash) {
        try {
            const receipt = await this.provider.getTransactionReceipt(txHash);
            return receipt !== null && receipt.status === 1;
        }
        catch (error) {
            return false;
        }
    }
}
let blockchainService = null;
const initializeBlockchain = async () => {
    try {
        blockchainService = new BlockchainService();
        logger_1.logger.info('Blockchain service initialized');
    }
    catch (error) {
        logger_1.logger.error('Failed to initialize blockchain service:', error);
        throw error;
    }
};
exports.initializeBlockchain = initializeBlockchain;
const getBlockchainService = () => {
    if (!blockchainService) {
        throw new Error('Blockchain service not initialized');
    }
    return blockchainService;
};
exports.getBlockchainService = getBlockchainService;
//# sourceMappingURL=blockchain.js.map
import { ethers } from 'ethers';

// Avalanche Fuji Testnet configuration
const FUJI_RPC_URL = 'https://api.avax-test.network/ext/bc/C/rpc';
const FUJI_CHAIN_ID = 43113;

// Contract ABIs (simplified for now)
const DONATION_TRACKER_ABI = [
  'function recordDonation(string memory donationId, address donor, address projectAddress, uint256 amount, string memory projectName, string memory companyName) external',
  'function getDonationById(string memory donationId) external view returns (uint256 id, address donor, address projectAddress, uint256 amount, uint256 timestamp, string memory projectName, string memory companyName, bool verified)',
  'function getTotalStats() external view returns (uint256 totalDonations, uint256 totalAmount)',
  'event DonationRecorded(uint256 indexed id, string indexed donationId, address indexed donor, address projectAddress, uint256 amount, string projectName, string companyName)'
];

const PROJECT_DISTRIBUTION_ABI = [
  'function registerProject(string memory projectId, string memory name, address walletAddress) external',
  'function getProject(string memory projectId) external view returns (string memory id, string memory name, address walletAddress, bool isActive, uint256 totalReceived, uint256 totalDistributed, uint256 pendingAmount)',
  'function distributeFunds(string memory projectId, uint256 amount, string memory reason) external',
  'event ProjectRegistered(string indexed projectId, string name, address indexed walletAddress)',
  'event FundsDistributed(uint256 indexed distributionId, string indexed projectId, address indexed projectAddress, uint256 amount, string reason)'
];

export interface BlockchainConfig {
  rpcUrl: string;
  chainId: number;
  contracts: {
    donationTracker: string;
    projectDistribution: string;
    usdc: string;
  };
}

export class BlockchainService {
  private provider: ethers.JsonRpcProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;
  private config: BlockchainConfig | null = null;

  constructor() {
    this.initializeProvider();
  }

  private initializeProvider() {
    try {
      this.provider = new ethers.JsonRpcProvider(FUJI_RPC_URL);
      console.log('✅ Blockchain provider initialized for Fuji testnet');
    } catch (error) {
      console.error('❌ Failed to initialize blockchain provider:', error);
    }
  }

  async connectWallet(): Promise<string | null> {
    try {
      if (!this.provider) {
        throw new Error('Provider not initialized');
      }

      // Request account access
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      const account = accounts[0];
      this.signer = await this.provider.getSigner(account);

      // Check if we're on the right network
      const network = await this.provider.getNetwork();
      if (network.chainId !== BigInt(FUJI_CHAIN_ID)) {
        await this.switchToFuji();
      }

      console.log('✅ Wallet connected:', account);
      return account;
    } catch (error) {
      console.error('❌ Failed to connect wallet:', error);
      return null;
    }
  }

  async switchToFuji(): Promise<void> {
    try {
      await (window as any).ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${FUJI_CHAIN_ID.toString(16)}` }]
      });
    } catch (error: any) {
      if (error.code === 4902) {
        // Chain not added, add it
        await this.addFujiNetwork();
      } else {
        throw error;
      }
    }
  }

  async addFujiNetwork(): Promise<void> {
    await (window as any).ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${FUJI_CHAIN_ID.toString(16)}`,
        chainName: 'Avalanche Fuji Testnet',
        nativeCurrency: {
          name: 'AVAX',
          symbol: 'AVAX',
          decimals: 18
        },
        rpcUrls: [FUJI_RPC_URL],
        blockExplorerUrls: ['https://testnet.snowtrace.io/']
      }]
    });
  }

  async setContracts(config: BlockchainConfig): Promise<void> {
    this.config = config;
    console.log('✅ Contract addresses configured:', config);
  }

  async recordDonation(
    donationId: string,
    donor: string,
    projectAddress: string,
    amount: string,
    projectName: string,
    companyName: string
  ): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.signer || !this.config) {
        throw new Error('Wallet not connected or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.donationTracker,
        DONATION_TRACKER_ABI,
        this.signer
      );

      const tx = await contract.recordDonation(
        donationId,
        donor,
        projectAddress,
        ethers.parseUnits(amount, 6), // USDC has 6 decimals
        projectName,
        companyName
      );

      console.log('✅ Donation recorded on blockchain:', tx.hash);
      return tx;
    } catch (error) {
      console.error('❌ Failed to record donation on blockchain:', error);
      return null;
    }
  }

  async getDonation(donationId: string): Promise<any | null> {
    try {
      if (!this.provider || !this.config) {
        throw new Error('Provider not initialized or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.donationTracker,
        DONATION_TRACKER_ABI,
        this.provider
      );

      const donation = await contract.getDonationById(donationId);
      return donation;
    } catch (error) {
      console.error('❌ Failed to get donation from blockchain:', error);
      return null;
    }
  }

  async getTotalStats(): Promise<{ totalDonations: number; totalAmount: string } | null> {
    try {
      if (!this.provider || !this.config) {
        throw new Error('Provider not initialized or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.donationTracker,
        DONATION_TRACKER_ABI,
        this.provider
      );

      const stats = await contract.getTotalStats();
      return {
        totalDonations: Number(stats.totalDonations),
        totalAmount: ethers.formatUnits(stats.totalAmount, 6) // USDC has 6 decimals
      };
    } catch (error) {
      console.error('❌ Failed to get total stats from blockchain:', error);
      return null;
    }
  }

  async registerProject(
    projectId: string,
    name: string,
    walletAddress: string
  ): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.signer || !this.config) {
        throw new Error('Wallet not connected or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.projectDistribution,
        PROJECT_DISTRIBUTION_ABI,
        this.signer
      );

      const tx = await contract.registerProject(projectId, name, walletAddress);
      console.log('✅ Project registered on blockchain:', tx.hash);
      return tx;
    } catch (error) {
      console.error('❌ Failed to register project on blockchain:', error);
      return null;
    }
  }

  async getProject(projectId: string): Promise<any | null> {
    try {
      if (!this.provider || !this.config) {
        throw new Error('Provider not initialized or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.projectDistribution,
        PROJECT_DISTRIBUTION_ABI,
        this.provider
      );

      const project = await contract.getProject(projectId);
      return project;
    } catch (error) {
      console.error('❌ Failed to get project from blockchain:', error);
      return null;
    }
  }

  async distributeFunds(
    projectId: string,
    amount: string,
    reason: string
  ): Promise<ethers.ContractTransactionResponse | null> {
    try {
      if (!this.signer || !this.config) {
        throw new Error('Wallet not connected or contracts not configured');
      }

      const contract = new ethers.Contract(
        this.config.contracts.projectDistribution,
        PROJECT_DISTRIBUTION_ABI,
        this.signer
      );

      const tx = await contract.distributeFunds(
        projectId,
        ethers.parseUnits(amount, 6), // USDC has 6 decimals
        reason
      );

      console.log('✅ Funds distributed on blockchain:', tx.hash);
      return tx;
    } catch (error) {
      console.error('❌ Failed to distribute funds on blockchain:', error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  getSignerAddress(): string | null {
    return this.signer ? this.signer.address : null;
  }
}

// Export singleton instance
export const blockchainService = new BlockchainService();

import { ethers } from 'ethers';
import { BlockchainTransaction } from '@/types';

const AVALANCHE_RPC_URL = import.meta.env.VITE_AVALANCHE_RPC_URL || 'https://api.avax-test.network/ext/bc/C/rpc';
const CHAIN_ID = parseInt(import.meta.env.VITE_AVALANCHE_CHAIN_ID || '43113');

class BlockchainService {
  private provider: ethers.Provider;
  
  constructor() {
    this.provider = new ethers.JsonRpcProvider(AVALANCHE_RPC_URL);
  }

  async getProvider(): Promise<ethers.Provider> {
    return this.provider;
  }

  async getTransaction(txHash: string): Promise<BlockchainTransaction | null> {
    try {
      const tx = await this.provider.getTransaction(txHash);
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!tx) return null;

      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = receipt?.blockNumber ? currentBlock - receipt.blockNumber : 0;

      let status: 'pending' | 'confirmed' | 'failed' = 'pending';
      if (receipt) {
        status = receipt.status === 1 ? 'confirmed' : 'failed';
      }

      let timestamp = new Date();
      if (receipt?.blockNumber) {
        const block = await this.provider.getBlock(receipt.blockNumber);
        timestamp = new Date(Number(block?.timestamp || 0) * 1000);
      }

      return {
        txHash: tx.hash,
        blockNumber: receipt?.blockNumber || 0,
        from: tx.from,
        to: tx.to || '',
        value: tx.value.toString(),
        gasUsed: receipt?.gasUsed.toString() || '0',
        status,
        confirmations,
        timestamp,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  async trackDonation(
    donationId: string,
    amount: number,
    projectAddress: string
  ): Promise<string> {
    // This would normally interact with smart contracts
    // For now, we'll simulate by returning a mock transaction hash
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    // In production, this would call the smart contract
    console.log('Tracking donation:', { donationId, amount, projectAddress });
    
    return mockTxHash;
  }

  async verifyTransaction(txHash: string): Promise<boolean> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);
      return receipt !== null && receipt.status === 1;
    } catch (error) {
      return false;
    }
  }

  async getProjectBalance(projectAddress: string): Promise<string> {
    try {
      // Get USDC balance for the project
      const usdcAddress = CHAIN_ID === 43114 
        ? "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664"  // Mainnet
        : "0x5425890298aed601595a70AB815c96711a31Bc65";  // Fuji

      const usdcContract = new ethers.Contract(
        usdcAddress,
        ["function balanceOf(address) view returns (uint256)"],
        this.provider
      );

      const balance = await usdcContract.balanceOf(projectAddress);
      return ethers.formatUnits(balance, 6);
    } catch (error) {
      console.error('Error getting project balance:', error);
      return '0';
    }
  }

  async waitForTransaction(txHash: string): Promise<any> {
    try {
      return await this.provider.waitForTransaction(txHash, 1);
    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  }

  async getTreasuryAddress(): Promise<string> {
    // Return the treasury address from environment or a default
    return import.meta.env.VITE_TREASURY_ADDRESS || '0x0000000000000000000000000000000000000000';
  }

  async recordDonation(
    donationId: string,
    amount: number,
    projectAddress: string
  ): Promise<string> {
    // This would call the smart contract to record the donation
    // For now, return a mock transaction hash
    const mockTxHash = '0x' + Array(64).fill(0).map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    
    console.log('Recording donation on blockchain:', {
      donationId,
      amount,
      projectAddress,
      txHash: mockTxHash
    });

    return mockTxHash;
  }

  getExplorerUrl(txHash: string): string {
    const baseUrl = CHAIN_ID === 43114
      ? 'https://snowtrace.io'
      : 'https://testnet.snowtrace.io';
    return `${baseUrl}/tx/${txHash}`;
  }

  async estimateGasPrice(): Promise<string> {
    try {
      const gasPrice = (await this.provider.getFeeData()).gasPrice;
      return gasPrice ? ethers.formatUnits(gasPrice, 'gwei') : '25';
    } catch (error) {
      return '25'; // Default gas price for Avalanche
    }
  }
}

export const blockchainService = new BlockchainService();
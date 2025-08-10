import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { blockchainService } from '@/services/blockchain';
import { BlockchainTransaction } from '@/types';
import toast from 'react-hot-toast';

interface BlockchainContextType {
  provider: ethers.Provider | null;
  isConnected: boolean;
  network: string | null;
  transactions: BlockchainTransaction[];
  getTransaction: (txHash: string) => Promise<BlockchainTransaction | null>;
  trackDonation: (donationId: string, amount: number, projectAddress: string) => Promise<string>;
  verifyTransaction: (txHash: string) => Promise<boolean>;
  getProjectBalance: (projectAddress: string) => Promise<string>;
}

const BlockchainContext = createContext<BlockchainContextType | undefined>(undefined);

export const useBlockchain = () => {
  const context = useContext(BlockchainContext);
  if (!context) {
    throw new Error('useBlockchain must be used within a BlockchainProvider');
  }
  return context;
};

export const BlockchainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [provider, setProvider] = useState<ethers.Provider | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [network, setNetwork] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);

  useEffect(() => {
    const initProvider = async () => {
      try {
        const providerInstance = await blockchainService.getProvider();
        setProvider(providerInstance);
        
        const networkInfo = await providerInstance.getNetwork();
        setNetwork(networkInfo.name);
        setIsConnected(true);
      } catch (error) {
        console.error('Failed to connect to Avalanche network:', error);
        setIsConnected(false);
      }
    };

    initProvider();
  }, []);

  const getTransaction = useCallback(async (txHash: string): Promise<BlockchainTransaction | null> => {
    if (!provider) return null;
    
    try {
      const tx = await blockchainService.getTransaction(txHash);
      if (tx) {
        setTransactions(prev => {
          const exists = prev.find(t => t.txHash === tx.txHash);
          if (exists) {
            return prev.map(t => t.txHash === tx.txHash ? tx : t);
          }
          return [...prev, tx];
        });
      }
      return tx;
    } catch (error) {
      console.error('Failed to get transaction:', error);
      return null;
    }
  }, [provider]);

  const trackDonation = useCallback(async (
    donationId: string,
    amount: number,
    projectAddress: string
  ): Promise<string> => {
    if (!provider) {
      throw new Error('Blockchain provider not initialized');
    }

    try {
      const txHash = await blockchainService.recordDonation(donationId, amount, projectAddress);
      
      const tx: BlockchainTransaction = {
        txHash,
        blockNumber: 0,
        from: await blockchainService.getTreasuryAddress(),
        to: projectAddress,
        value: amount.toString(),
        gasUsed: '0',
        status: 'pending',
        confirmations: 0,
        timestamp: new Date(),
      };
      
      setTransactions(prev => [...prev, tx]);
      
      blockchainService.waitForTransaction(txHash).then(async (receipt) => {
        const updatedTx = await getTransaction(txHash);
        if (updatedTx) {
          toast.success('Donation recorded on blockchain');
        }
      });
      
      return txHash;
    } catch (error: any) {
      console.error('Failed to track donation:', error);
      toast.error('Failed to record donation on blockchain');
      throw error;
    }
  }, [provider, getTransaction]);

  const verifyTransaction = useCallback(async (txHash: string): Promise<boolean> => {
    if (!provider) return false;
    
    try {
      return await blockchainService.verifyTransaction(txHash);
    } catch (error) {
      console.error('Failed to verify transaction:', error);
      return false;
    }
  }, [provider]);

  const getProjectBalance = useCallback(async (projectAddress: string): Promise<string> => {
    if (!provider) return '0';
    
    try {
      return await blockchainService.getProjectBalance(projectAddress);
    } catch (error) {
      console.error('Failed to get project balance:', error);
      return '0';
    }
  }, [provider]);

  return (
    <BlockchainContext.Provider
      value={{
        provider,
        isConnected,
        network,
        transactions,
        getTransaction,
        trackDonation,
        verifyTransaction,
        getProjectBalance,
      }}
    >
      {children}
    </BlockchainContext.Provider>
  );
};
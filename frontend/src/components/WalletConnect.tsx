import React, { useState, useEffect } from 'react';
import { blockchainService } from '../services/blockchainService';

const WalletConnect: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Check if wallet is already connected
    setIsConnected(blockchainService.isConnected());
    setAddress(blockchainService.getSignerAddress());
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      const connectedAddress = await blockchainService.connectWallet();
      if (connectedAddress) {
        setIsConnected(true);
        setAddress(connectedAddress);
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // For now, just reset the state
    // In a real app, you might want to disconnect from the provider
    setIsConnected(false);
    setAddress(null);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="flex items-center space-x-4">
      {!isConnected ? (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      ) : (
        <div className="flex items-center space-x-3">
          <div className="bg-green-100 text-green-800 px-3 py-2 rounded-lg text-sm font-medium">
            <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-2"></span>
            Connected
          </div>
          <div className="bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-mono">
            {address ? formatAddress(address) : 'Unknown'}
          </div>
          <button
            onClick={handleDisconnect}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;

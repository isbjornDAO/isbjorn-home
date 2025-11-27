import React from 'react';
import { useWallet } from '../contexts/WalletContext';

export const WalletConnect: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnecting, error } = useWallet();

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleConnect = async () => {
    await connectWallet();
  };

  if (account) {
    return (
      <div className="flex items-center gap-4">
        <div className="flex flex-col items-end">
          <span className="text-sm font-medium text-gray-200">Connected</span>
          <span className="text-xs text-gray-400 font-mono">{formatAddress(account)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="px-4 py-2 text-sm font-medium text-red-400 bg-red-400/10 rounded-lg hover:bg-red-400/20 transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 7V5C16 3.89543 15.1046 3 14 3H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Connect Core Wallet
          </>
        )}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400 max-w-xs text-center">
          {error}
          {error.includes('No crypto wallet found') && (
            <a
              href="https://core.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-1 text-orange-400 hover:text-orange-300 underline"
            >
              Install Core Wallet
            </a>
          )}
        </p>
      )}
    </div>
  );
};

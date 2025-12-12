import React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import bearGif from '../assets/bearrr.gif';

export const WalletConnect: React.FC = () => {
  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
            className="flex justify-center"
          >
            {(() => {
              if (!connected) {
                return (
                  <div className="flex flex-col items-center gap-2 w-full">
                    <img src={bearGif} alt="Isbjorn Bear" className="w-16 h-16 object-contain" />
                    <button
                      onClick={openConnectModal}
                      type="button"
                      className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-arctic-600 rounded-lg hover:bg-arctic-700 transition-colors w-full justify-center"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 7H5C3.89543 7 3 7.89543 3 9V18C3 19.1046 3.89543 20 5 20H19C20.1046 20 21 19.1046 21 18V9C21 7.89543 20.1046 7 19 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 7V5C16 3.89543 15.1046 3 14 3H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M16 14H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Connect Wallet
                    </button>
                  </div>
                );
              }

              if (chain.unsupported) {
                return (
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    Wrong network
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    type="button"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-arctic-700 bg-arctic-50 rounded-lg hover:bg-arctic-100 transition-colors"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 20,
                          height: 20,
                          borderRadius: 999,
                          overflow: 'hidden',
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 20, height: 20 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button>

                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-arctic-600 rounded-lg hover:bg-arctic-700 transition-colors"
                  >
                    {account.displayName}
                    <span className="text-xs opacity-75">
                      {account.displayBalance
                        ? ` (${account.displayBalance})`
                        : ''}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

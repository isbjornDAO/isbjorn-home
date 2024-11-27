import Web3 from "web3";

declare global {
  interface EthereumProvider {
    isMetaMask?: boolean;
    isBraveWallet?: boolean;
    isWalletConnect?: boolean;
    request: (args: { method: string; params?: any[] }) => Promise<any>;
    on?: (eventName: string, callback: (...args: any[]) => void) => void;
    removeListener?: (
      eventName: string,
      callback: (...args: any[]) => void
    ) => void;
  }

  interface Window {
    ethereum?: EthereumProvider;
    w3?: Web3;
    // just have dedicated web3 for Avvy so when using testnet on window.w3 still works
    avvyW3: Web3;
  }
}

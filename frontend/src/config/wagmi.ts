import { createConfig, http } from 'wagmi';
import { avalanche, avalancheFuji } from 'wagmi/chains';
import {
  rainbowWallet,
  walletConnectWallet,
  coreWallet,
  rabbyWallet,
  metaMaskWallet,
  injectedWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { connectorsForWallets } from '@rainbow-me/rainbowkit';

const wallets = [
  {
    groupName: 'Recommended',
    wallets: [coreWallet, rabbyWallet, metaMaskWallet],
  },
  {
    groupName: 'Other Wallets',
    wallets: [rainbowWallet, walletConnectWallet, injectedWallet],
  },
];

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'c588218e86933fc20e4a803aea450bd9';

const connectors = connectorsForWallets(wallets, {
  appName: 'Isbjorn DAO',
  projectId,
});

export const config = createConfig({
  connectors,
  chains: [avalanche, avalancheFuji],
  transports: {
    // Use explicit RPC URLs to avoid network detection issues
    [avalanche.id]: http('https://api.avax.network/ext/bc/C/rpc'),
    [avalancheFuji.id]: http('https://api.avax-test.network/ext/bc/C/rpc'),
  },
});

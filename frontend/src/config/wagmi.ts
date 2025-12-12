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

const connectors = connectorsForWallets(wallets, {
  appName: 'Isbjorn DAO',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
});

export const config = createConfig({
  connectors,
  chains: [avalanche, avalancheFuji],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
  },
});

// Thirdweb client configuration for x402 payments
import { createThirdwebClient } from 'thirdweb';

const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

if (!clientId) {
    console.warn(
        'VITE_THIRDWEB_CLIENT_ID not set. Get your client ID from https://thirdweb.com/dashboard'
    );
}

export const thirdwebClient = clientId
    ? createThirdwebClient({ clientId })
    : null;

export const getThirdwebClient = () => {
    if (!thirdwebClient) {
        throw new Error(
            'Thirdweb client not initialized. Please set VITE_THIRDWEB_CLIENT_ID in your environment.'
        );
    }
    return thirdwebClient;
};

// Export chain configuration with custom RPC
import { defineChain } from "thirdweb";

export const avalancheFuji = defineChain({
    id: 43113,
    rpc: "https://api.avax-test.network/ext/bc/C/rpc",
});

export const CHARITY_WALLET_ADDRESS = "0x4c48B6d6a5d9Aab0cf8cFC21A0A4F3dEC663E9Cf";

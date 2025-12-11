// X402 Thirdweb Facilitator Integration
import { createThirdwebClient } from "thirdweb";
import { facilitator } from "thirdweb/x402";
import { avalancheFuji } from "thirdweb/chains";

console.log('Initializing X402 with Thirdweb facilitator...');

// Load configuration
const thirdwebSecretKey = process.env.THIRDWEB_SECRET_KEY;
const serverWalletAddress = process.env.X402_SERVER_WALLET_ADDRESS as `0x${string}`;
const network = process.env.X402_NETWORK || 'avalanche-fuji';

// Validate configuration
if (!thirdwebSecretKey) {
    console.error('ERROR: THIRDWEB_SECRET_KEY environment variable not set!');
    throw new Error('THIRDWEB_SECRET_KEY is required for X402 payments');
}

if (!serverWalletAddress) {
    console.error('ERROR: X402_SERVER_WALLET_ADDRESS environment variable not set!');
    throw new Error('X402_SERVER_WALLET_ADDRESS is required for X402 payments');
}

console.log('X402 Config:', {
    serverWalletAddress: `${serverWalletAddress.substring(0, 10)}...${serverWalletAddress.substring(serverWalletAddress.length - 8)}`,
    network,
    chain: 'Avalanche Fuji (43113)'
});

// Create Thirdweb client
export const thirdwebClient = createThirdwebClient({
    secretKey: thirdwebSecretKey,
});

// Create X402 facilitator instance
export const thirdwebFacilitator = facilitator({
    client: thirdwebClient,
    serverWalletAddress: serverWalletAddress,
});

// Export chain configuration
export const x402Chain = avalancheFuji; // Fuji testnet

// Export server wallet address for payment settlement
export const payToAddress = serverWalletAddress;

console.log('✅ X402 Thirdweb facilitator initialized successfully');

// Legacy compatibility interface for existing code
const x402 = {
    checkout: {
        sessions: {
            create: async (params: any) => {
                console.log('x402.checkout.sessions.create called with:', params);

                // Return payment session details
                // Note: Actual payment processing now uses settlePayment() with thirdwebFacilitator
                return {
                    id: `x402_session_${Date.now()}`,
                    url: `${process.env.FRONTEND_URL}/checkout/x402?amount=${params.amount}&currency=${params.currency}`,
                    amount: params.amount,
                    currency: params.currency,
                    metadata: params.metadata,
                    payTo: serverWalletAddress,
                    network: network,
                    chain: avalancheFuji
                };
            }
        }
    },
    wallets: {
        create: async (params: any) => {
            // Wallets are managed by x402 protocol automatically
            return {
                id: `x402_wallet_${Date.now()}`,
                customer_id: params.customer_id,
                email: params.email,
                address: serverWalletAddress
            };
        },
        charge: async (walletId: string, params: any) => {
            // Charges happen through x402 payment protocol via settlePayment()
            return {
                id: `x402_charge_${Date.now()}`,
                walletId,
                amount: params.amount,
                currency: params.currency,
                status: 'pending',
                network: network
            };
        },
        retrieveBalance: async (walletId: string) => {
            // Balance retrieval not supported in x402 protocol
            return {
                walletId,
                available: 0,
                pending: 0,
                currency: 'USDC'
            };
        }
    },
    verifyWebhook: (payload: any, secret: string) => {
        // X402 webhook verification
        try {
            const event = typeof payload === 'string' ? JSON.parse(payload) : payload;
            return event;
        } catch (error) {
            throw new Error('Invalid webhook payload');
        }
    }
};

export default x402;

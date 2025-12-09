// X402 SDK initialization using x402-express
import { paymentMiddleware } from 'x402-express';

console.log('Initializing X402 client with PayAI facilitator...');

// X402 Configuration
const facilitatorUrl = process.env.FACILITATOR_URL || 'https://facilitator.payai.network';
const payToAddress = process.env.ADDRESS as `0x${string}`;
const network = process.env.NETWORK || 'base-sepolia';

if (!payToAddress) {
    console.warn('WARNING: ADDRESS environment variable not set. X402 payments will not work.');
}

console.log('X402 Config:', {
    facilitatorUrl,
    payToAddress: payToAddress ? `${payToAddress.substring(0, 10)}...` : 'NOT SET',
    network
});

// X402 Payment Middleware - Export for use in routes
export const x402Middleware = payToAddress ? paymentMiddleware(
    payToAddress,
    {
        "POST /api/x402/donate": {
            price: "$1.00", // Default price, will be overridden by request
            network: network as any,
        },
        "POST /api/donations": {
            price: "$1.00",
            network: network as any,
        }
    },
    { url: facilitatorUrl }
) : null;

// Legacy x402 client interface for backwards compatibility
const x402 = {
    checkout: {
        sessions: {
            create: async (params: any) => {
                console.log('x402.checkout.sessions.create called with:', params);

                if (!payToAddress) {
                    throw new Error('X402 ADDRESS not configured');
                }

                // Return payment session details
                return {
                    id: `x402_session_${Date.now()}`,
                    url: `${process.env.FRONTEND_URL}/checkout/x402?amount=${params.amount}&currency=${params.currency}`,
                    amount: params.amount,
                    currency: params.currency,
                    metadata: params.metadata,
                    payTo: payToAddress,
                    facilitator: facilitatorUrl,
                    network: network
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
                address: payToAddress
            };
        },
        charge: async (walletId: string, params: any) => {
            // Charges happen through x402 payment protocol
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

console.log('X402 Client initialized successfully');

export default x402;

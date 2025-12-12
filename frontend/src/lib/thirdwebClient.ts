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

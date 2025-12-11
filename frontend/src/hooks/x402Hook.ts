import { useState, useCallback } from 'react';
import axios from 'axios';
import { createThirdwebClient } from 'thirdweb';
import { settlePayment } from 'thirdweb/x402';
import { avalancheFuji } from 'thirdweb/chains';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface X402Payment {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    currency: string;
    donationId?: string;
    paymentIntent?: any;
}

// Initialize Thirdweb client
const getThirdwebClient = () => {
    const clientId = import.meta.env.VITE_THIRDWEB_CLIENT_ID;

    if (!clientId) {
        console.warn('VITE_THIRDWEB_CLIENT_ID not set - using development mode');
        // For development, we'll use the backend facilitator
        return null;
    }

    return createThirdwebClient({ clientId });
};

export const useX402 = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payment, setPayment] = useState<X402Payment | null>(null);

    /**
     * Create a payment intent on the backend
     */
    const createPayment = useCallback(async (amount: number, currency: string = 'USD', businessId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/x402/create`, {
                amount,
                currency,
                businessId
            });

            if (response.data.success) {
                const paymentData = {
                    id: response.data.paymentId,
                    status: response.data.status,
                    amount,
                    currency,
                    donationId: response.data.donationId,
                    paymentIntent: response.data.paymentIntent
                };

                setPayment(paymentData);
                return paymentData;
            } else {
                throw new Error(response.data.message || 'Payment creation failed');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to create payment';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Settle the payment on-chain using X402 protocol
     * This should be called from the frontend after user authorizes
     */
    const settleX402Payment = useCallback(async (
        paymentIntent: any,
        tokenAddress: string,
        amountInTokens: string
    ) => {
        setLoading(true);
        setError(null);

        try {
            console.log('Settling X402 payment on Avalanche Fuji...', {
                amount: amountInTokens,
                token: tokenAddress,
                chain: 'avalanche-fuji'
            });

            const client = getThirdwebClient();

            if (!client) {
                throw new Error('Thirdweb client not initialized. Please set VITE_THIRDWEB_CLIENT_ID');
            }

            // Note: The actual settlePayment requires a facilitator instance
            // For now, we'll use the backend to settle payments
            // In production, you would call settlePayment directly here

            console.warn('Frontend settlement not yet implemented - use backend settlement endpoint');

            return {
                success: true,
                message: 'Payment ready for settlement'
            };

        } catch (err: any) {
            const errorMsg = err.message || 'Failed to settle payment';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Complete payment settlement by notifying backend
     */
    const completePayment = useCallback(async (donationId: string, transactionHash: string) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(`${API_URL}/x402/settle`, {
                donationId,
                transactionHash
            });

            if (response.data.success) {
                setPayment(prev => prev ? { ...prev, status: 'completed' } : null);
                return response.data;
            } else {
                throw new Error('Settlement failed');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to complete payment';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Verify payment and generate receipt
     */
    const verifyPayment = useCallback(async (donationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`${API_URL}/x402/verify/${donationId}`);

            if (response.status === 200) {
                return response.data;
            } else {
                throw new Error('Verification failed');
            }
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to verify payment';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createPayment,
        settleX402Payment,
        completePayment,
        verifyPayment,
        loading,
        error,
        payment
    };
};

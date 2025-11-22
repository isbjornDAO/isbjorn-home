import { useState, useCallback } from 'react';
import axios from 'axios';

interface X402Payment {
    id: string;
    status: 'pending' | 'completed' | 'failed';
    amount: number;
    currency: string;
}

export const useX402 = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payment, setPayment] = useState<X402Payment | null>(null);

    const createPayment = useCallback(async (amount: number, currency: string = 'USD', businessId?: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post('/api/x402/create', {
                amount,
                currency,
                businessId
            });

            if (response.data.success) {
                setPayment({
                    id: response.data.paymentId,
                    status: response.data.status,
                    amount,
                    currency
                });
                return response.data;
            } else {
                throw new Error(response.data.message || 'Payment creation failed');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to create payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const verifyPayment = useCallback(async (donationId: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.post(`/api/x402/verify/${donationId}`);

            if (response.status === 200) {
                // Success - returns PDF blob usually, but let's handle the logic
                return response.data;
            } else {
                throw new Error('Verification failed');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to verify payment');
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        createPayment,
        verifyPayment,
        loading,
        error,
        payment
    };
};

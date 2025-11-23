import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { API_URL } from '@/utils/apiUrl';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder');

interface EmbeddedStripeCheckoutProps {
  amount: number;
  currency: string;
  charityName: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}

const CheckoutForm: React.FC<{
  amount: number;
  charityName: string;
  onSuccess: (paymentIntent: any) => void;
  onError: (error: string) => void;
  onCancel: () => void;
}> = ({ amount, charityName, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation-success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setMessage(error.message || 'Payment failed');
        onError(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage('Payment successful!');
        onSuccess(paymentIntent);
      }
    } catch (error: any) {
      setMessage('An unexpected error occurred');
      onError('An unexpected error occurred');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Complete Your Donation
          </h3>
          <p className="text-sm text-gray-600">
            Donating ${amount} to {charityName}
          </p>
        </div>
        
        <PaymentElement />
        
        <div className="mt-6 space-y-3">
          <button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-arctic-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-arctic-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isProcessing ? 'Processing...' : `Donate $${amount}`}
          </button>
          
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
        
        {message && (
          <div className="mt-4 p-3 rounded-lg bg-blue-50 text-blue-700 text-sm">
            {message}
          </div>
        )}
      </div>
    </form>
  );
};

const EmbeddedStripeCheckout: React.FC<EmbeddedStripeCheckoutProps> = ({
  amount,
  currency,
  charityName,
  onSuccess,
  onError,
  onCancel
}) => {
  const [clientSecret, setClientSecret] = useState<string>('');

  useEffect(() => {
    // Create payment intent
    const createPaymentIntent = async () => {
      try {
        const response = await fetch(`${API_URL}/stripe/create-payment-intent`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount,
            currency,
            charityName,
          }),
        });

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          onError('Failed to create payment intent');
        }
      } catch (error) {
        onError('Failed to create payment intent');
      }
    };

    createPaymentIntent();
  }, [amount, currency, charityName, onError]);

  if (!clientSecret) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-arctic-600"></div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm
        amount={amount}
        charityName={charityName}
        onSuccess={onSuccess}
        onError={onError}
        onCancel={onCancel}
      />
    </Elements>
  );
};

export default EmbeddedStripeCheckout;

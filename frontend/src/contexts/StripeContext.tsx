import React, { createContext, useContext, useEffect, useState } from 'react';
import { loadStripe, Stripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_placeholder';

interface StripeContextType {
  stripe: Stripe | null;
  isLoading: boolean;
}

const StripeContext = createContext<StripeContextType | undefined>(undefined);

export const useStripe = () => {
  const context = useContext(StripeContext);
  if (!context) {
    throw new Error('useStripe must be used within a StripeProvider');
  }
  return context;
};

export const StripeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stripe, setStripe] = useState<Stripe | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initStripe = async () => {
      try {
        const stripeInstance = await loadStripe(STRIPE_PUBLIC_KEY);
        setStripe(stripeInstance);
      } catch (error) {
        console.error('Failed to initialize Stripe:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initStripe();
  }, []);

  if (!stripe && !isLoading) {
    return (
      <StripeContext.Provider value={{ stripe: null, isLoading: false }}>
        {children}
      </StripeContext.Provider>
    );
  }

  return (
    <Elements 
      stripe={stripe} 
      options={{
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#0ea5e9',
            colorBackground: '#ffffff',
            colorText: '#1e293b',
            colorDanger: '#ef4444',
            fontFamily: 'Inter, system-ui, sans-serif',
            spacingUnit: '4px',
            borderRadius: '8px',
          },
        },
      }}
    >
      <StripeContext.Provider value={{ stripe, isLoading }}>
        {children}
      </StripeContext.Provider>
    </Elements>
  );
};
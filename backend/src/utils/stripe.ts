import Stripe from 'stripe';

// Determine which Stripe keys to use based on STRIPE_MODE
const getStripeConfig = () => {
  const mode = process.env.STRIPE_MODE || 'live';
  
  if (mode === 'live') {
    const liveKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!liveKey) {
      throw new Error('STRIPE_LIVE_SECRET_KEY not configured for live mode');
    }
    return {
      secretKey: liveKey,
      publishableKey: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      mode: 'live'
    };
  } else {
    const testKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!testKey) {
      throw new Error('STRIPE_TEST_SECRET_KEY not configured for test mode');
    }
    return {
      secretKey: testKey,
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      mode: 'test'
    };
  }
};

const config = getStripeConfig();

export const stripe = new Stripe(config.secretKey, {
  apiVersion: '2023-10-16',
});

export const stripeConfig = config;

// Helper function to get current mode
export const getStripeMode = () => config.mode;

// Helper function to check if we're in live mode
export const isLiveMode = () => config.mode === 'live';

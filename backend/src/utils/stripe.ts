import Stripe from 'stripe';

// Determine which Stripe keys to use based on STRIPE_MODE and NODE_ENV
const getStripeConfig = () => {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const mode =
    process.env.STRIPE_MODE ||
    (nodeEnv === 'production' ? 'live' : 'test');

  if (mode === 'live') {
    const liveKey = process.env.STRIPE_LIVE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;
    if (!liveKey) {
      throw new Error('STRIPE_LIVE_SECRET_KEY not configured for live mode');
    }
    return {
      secretKey: liveKey,
      publishableKey: process.env.STRIPE_LIVE_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY,
      mode: 'live' as const,
    };
  } else {
    const testKey = process.env.STRIPE_TEST_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

    // In development, allow running without real keys by using a mock key.
    // Actual payment calls will still fail until real test keys are configured.
    if (!testKey && nodeEnv !== 'production') {
      // eslint-disable-next-line no-console
      console.warn(
        '[Stripe] STRIPE_TEST_SECRET_KEY not configured; using mock key for local development. ' +
          'Configure real Stripe test keys to process payments.'
      );
    }

    return {
      secretKey: testKey || 'sk_test_mock_key',
      publishableKey: process.env.STRIPE_TEST_PUBLISHABLE_KEY || process.env.STRIPE_PUBLISHABLE_KEY || 'pk_test_mock_key',
      mode: 'test' as const,
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

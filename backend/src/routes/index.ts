import express from 'express';
import authRoutes from './auth';
import donationRoutes from './donations';
import streamlinedDonationRoutes from './streamlinedDonations';
import projectRoutes from './projects';
import { dashboardRoutes } from './dashboard.routes';
import { adminRoutes } from './admin.routes';
import { integrationsRoutes } from './integrations.routes';
import { workingAuthRoutes } from './working-auth';
import publicRoutes from './public';
import { body, validationResult } from 'express-validator';
import { stripeService } from '../services/stripeService';
import { logger } from '../utils/logger';
import { stripe } from '../utils/stripe';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0-streamlined',
    features: [
      'Ultra-streamlined NZ donations',
      'IRD compliance automation',
      'Real-time company verification',
      'Instant receipt generation',
      'Xero/MYOB integration ready'
    ]
  });
});

// API routes  
router.use('/auth', workingAuthRoutes); // Using working auth with real database
router.use('/donations', streamlinedDonationRoutes); // New streamlined endpoints
router.use('/donations-legacy', donationRoutes); // Legacy donation endpoints
router.use('/projects', projectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/integrations', integrationsRoutes);
// Stripe Checkout routes (inline to avoid module resolution issues)
router.post('/stripe-checkout/create-session', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
  body('charityId').isString().notEmpty().withMessage('Charity ID is required'),
  body('charityName').isString().notEmpty().withMessage('Charity name is required'),
  body('companyName').optional().isString(),
  body('companyEmail').isEmail().withMessage('Valid company email is required'),
  body('message').optional().isString(),
  body('isRecurring').optional().isBoolean(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const {
      amount,
      currency,
      charityId,
      charityName,
      companyName,
      companyEmail,
      message,
      isRecurring = false
    } = req.body;

    const session = await stripeService.createCheckoutSession({
      amount,
      currency,
      charityId,
      charityName,
      companyName,
      companyEmail,
      message,
      isRecurring
    });

    res.json({
      success: true,
      sessionId: session.sessionId,
      sessionUrl: session.sessionUrl,
      donationId: session.donation.id
    });

  } catch (error: any) {
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create checkout session'
    });
  }
});

// Stripe webhook handler
router.post('/stripe/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET not configured');
    return res.status(400).json({ error: 'Webhook secret not configured' });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig!, webhookSecret);
  } catch (err: any) {
    logger.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        logger.info(`Payment successful for session: ${session.id}`);
        
        // Update donation status
        await stripeService.handleSuccessfulPayment(session);
        break;
        
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        logger.info(`Payment intent succeeded: ${paymentIntent.id}`);
        break;
        
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Create payment intent for embedded checkout
router.post('/stripe/create-payment-intent', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
  body('charityName').isString().notEmpty().withMessage('Charity name is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { amount, currency, charityName } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: currency.toLowerCase(),
      description: `Donation to ${charityName}`,
      metadata: {
        charityName,
        platform: 'Isbjorn',
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
    });

  } catch (error: any) {
    logger.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create payment intent'
    });
  }
});

router.get('/stripe-checkout/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    res.json({
      success: true,
      sessionId,
      status: 'pending'
    });

  } catch (error: any) {
    logger.error('Error retrieving checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve checkout session'
    });
  }
});

// Convenience endpoints that map to streamlined routes
router.use('/companies', streamlinedDonationRoutes);
router.use('/charities', streamlinedDonationRoutes);
router.use('/receipts', streamlinedDonationRoutes);

export default router;
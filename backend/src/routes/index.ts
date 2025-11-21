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
import NZCompaniesRegisterService from '../services/nzCompaniesRegisterService';
import NZCharitiesService from '../services/nzCharitiesService';
import AvalancheL1Service from '../services/AvalancheL1Service';
import emailReceiptService from '../services/EmailReceiptService';
import { irdComplianceService } from '../services/irdComplianceService';

const router = express.Router();

// Basic API health info (lightweight)
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

// Deep infrastructure health check (Stripe, Avalanche, NZ APIs, Email, IRD)
router.get('/health/deep', async (req, res) => {
  const start = Date.now();

  const companiesService = new NZCompaniesRegisterService();
  const charitiesService = new NZCharitiesService();

  const results: any = {
    status: 'unknown',
    timestamp: new Date().toISOString(),
    checks: {
      stripe: { ok: false },
      avalanche: { ok: false },
      nzCompaniesApi: { ok: false },
      nzCharitiesApi: { ok: false },
      email: { ok: false },
      irdApi: { ok: false },
    },
  };

  try {
    // Stripe check: list a small page of customers (or simple API call)
    try {
      await stripe.customers.list({ limit: 1 });
      results.checks.stripe.ok = true;
    } catch (e: any) {
      results.checks.stripe.error = e.message || 'Stripe check failed';
    }

    // Avalanche / Iggy L1 check
    try {
      const healthy = await AvalancheL1Service.healthCheck();
      results.checks.avalanche.ok = healthy;
      if (healthy) {
        const info = await AvalancheL1Service.getNetworkInfo();
        results.checks.avalanche.details = info;
      }
    } catch (e: any) {
      results.checks.avalanche.error = e.message || 'Avalanche check failed';
    }

    // NZ Companies API check – attempt a harmless lookup for a non-existent company
    try {
      const fakeNumber = process.env.HEALTHCHECK_NZ_COMPANY_NUMBER || '9999999';
      await companiesService.lookupCompany(fakeNumber);
      results.checks.nzCompaniesApi.ok = true;
    } catch (e: any) {
      results.checks.nzCompaniesApi.error = e.message || 'NZ Companies API check failed';
    }

    // NZ Charities API check – search with a generic term
    try {
      await charitiesService.searchCharitiesByName('test', 1);
      results.checks.nzCharitiesApi.ok = true;
    } catch (e: any) {
      results.checks.nzCharitiesApi.error = e.message || 'NZ Charities API check failed';
    }

    // Email (SendGrid) configuration check
    try {
      const emailOk = await emailReceiptService.testConfiguration();
      results.checks.email.ok = emailOk;
      if (!emailOk) {
        results.checks.email.error = 'Email test failed or not configured';
      }
    } catch (e: any) {
      results.checks.email.error = e.message || 'Email check failed';
    }

    // IRD API (compliance) – just see if configured and can generate mock data without throwing
    try {
      const dummy = await irdComplianceService.generateIRDReceiptData(
        'HEALTHCHECK-DONATION',
        'HEALTHCHECK-USER',
        'HEALTHCHECK-CHARITY',
        10
      );
      results.checks.irdApi.ok = !!dummy;
    } catch (e: any) {
      results.checks.irdApi.error = e.message || 'IRD compliance check failed';
    }

    results.status = Object.values(results.checks).every((c: any) => c.ok) ? 'healthy' : 'degraded';
    results.durationMs = Date.now() - start;

    const httpStatus = results.status === 'healthy' ? 200 : 503;
    res.status(httpStatus).json(results);
  } catch (error: any) {
    logger.error('Deep health check failed:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Deep health check failed',
    });
  }
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
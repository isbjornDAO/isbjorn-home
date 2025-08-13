import express from 'express';
import { body, validationResult } from 'express-validator';
import { stripeService } from '../services/stripeService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Create Stripe Checkout session for donation
 * POST /api/stripe-checkout/create-session
 */
router.post('/create-session', [
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

/**
 * Get checkout session status
 * GET /api/stripe-checkout/session/:sessionId
 */
router.get('/session/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // You can add Stripe session retrieval here if needed
    // const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    res.json({
      success: true,
      sessionId,
      status: 'pending' // You can enhance this with actual Stripe session status
    });

  } catch (error: any) {
    logger.error('Error retrieving checkout session:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve checkout session'
    });
  }
});

export default router;

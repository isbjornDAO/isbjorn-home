import express from 'express';
import { body, validationResult } from 'express-validator';
import { Donation, DonationStatus } from '../models/Donation.model';
import { logger } from '../utils/logger';
import emailReceiptService from '../services/EmailReceiptService';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Isbjorn Foundation wallet address
const ISBJORN_WALLET = '0x0C39f0970CF3118Fd004A3f069E59dabc6714980';

/**
 * Simple direct payment endpoint - creates a donation and marks it as completed
 * This is for testing/demo purposes - in production you'd verify actual payment
 */
router.post('/direct-payment', [
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
  body('charityId').isString().notEmpty().withMessage('Charity ID is required'),
  body('charityName').isString().notEmpty().withMessage('Charity name is required'),
  body('donorName').isString().notEmpty().withMessage('Donor name is required'),
  body('donorEmail').isEmail().withMessage('Valid email is required'),
  body('walletAddress').optional().isString(),
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
      donorName,
      donorEmail,
      walletAddress,
      message
    } = req.body;

    // Generate transaction ID
    const transactionId = `x402_${uuidv4().substring(0, 8)}`;

    // Create donation record
    const donation = await Donation.create({
      amount,
      currency: currency.toUpperCase(),
      charityName,
      donorName,
      donorEmail,
      message,
      status: DonationStatus.COMPLETED,
      provider: 'x402',
      transactionId,
      completedAt: new Date(),
      // Store wallet addresses
      metadata: {
        donorWallet: walletAddress,
        recipientWallet: ISBJORN_WALLET,
        charityId // Store in metadata instead of as foreign key
      }
    });

    logger.info(`Direct payment donation created: ${donation.id}`);

    // Send receipt
    try {
      const receiptData = {
        donationId: donation.id,
        donorName,
        donorEmail,
        companyName: donorName,
        companyNumber: walletAddress || 'N/A',
        charityName,
        charityNumber: 'CC12345',
        amount,
        currency: currency.toUpperCase(),
        date: new Date(),
        receiptNumber: `IR-${donation.id.substring(0, 8).toUpperCase()}`,
        transactionId,
        blockchainTxHash: walletAddress ? `Payment to ${ISBJORN_WALLET}` : undefined
      };

      await emailReceiptService.sendReceipt(receiptData);
      logger.info(`Tax receipt sent for donation ${donation.id}`);
    } catch (receiptError) {
      logger.error('Failed to send receipt:', receiptError);
      // Continue even if receipt fails
    }

    res.json({
      success: true,
      message: 'Payment processed successfully',
      donation: {
        id: donation.id,
        amount: donation.amount,
        currency: donation.currency,
        charityName: donation.charityName,
        transactionId: donation.transactionId,
        receiptNumber: `IR-${donation.id.substring(0, 8).toUpperCase()}`,
        recipientAddress: ISBJORN_WALLET,
        status: 'completed'
      }
    });

  } catch (error: any) {
    logger.error('Direct payment error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process payment'
    });
  }
});

/**
 * Get Isbjorn wallet address
 */
router.get('/wallet-address', (req, res) => {
  res.json({
    success: true,
    address: ISBJORN_WALLET,
    network: 'Avalanche C-Chain'
  });
});

export default router;

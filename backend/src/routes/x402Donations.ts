import express from 'express';
import { body } from 'express-validator';
import { donationController } from '../controllers/donationController';
import { authenticateToken } from '../middleware/auth'; // Assuming this exists

const router = express.Router();

router.post(
    '/create',
    [
        body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
        body('currency').optional().isString(),
        body('businessId').optional().isString(),
    ],
    donationController.createX402Donation
);

router.post(
    '/verify/:donationId',
    donationController.verifyAndReceipt
);

router.post(
    '/settle',
    [
        body('donationId').isString().notEmpty().withMessage('Donation ID is required'),
        body('transactionHash').isString().notEmpty().withMessage('Transaction hash is required'),
    ],
    donationController.settleX402Payment
);

router.get(
    '/history',
    authenticateToken,
    donationController.getHistory
);

export default router;

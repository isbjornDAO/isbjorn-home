// Wallet routes for X402 integration
import express from 'express';
import { body, validationResult } from 'express-validator';
import { x402Service } from '../services/x402Service';
import { logger } from '../utils/logger';

const router = express.Router();

// Create a new wallet for a user
router.post('/create', [
    body('userId').isString().notEmpty().withMessage('User ID required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { userId } = req.body;
    try {
        const wallet = await x402Service.createWallet(userId);
        res.json({ success: true, wallet });
    } catch (error: any) {
        logger.error('Error creating wallet:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to create wallet' });
    }
});

// Charge wallet for a donation
router.post('/charge', [
    body('walletId').isString().notEmpty().withMessage('Wallet ID required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('currency').optional().isString(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }
    const { walletId, amount, currency } = req.body;
    try {
        const result = await x402Service.chargeWallet(walletId, amount, currency);
        res.json({ success: true, result });
    } catch (error: any) {
        logger.error('Error charging wallet:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to charge wallet' });
    }
});

// Get wallet balance
router.get('/balance/:walletId', async (req, res) => {
    const { walletId } = req.params;
    try {
        const balance = await x402Service.getWalletBalance(walletId);
        res.json({ success: true, balance });
    } catch (error: any) {
        logger.error('Error fetching wallet balance:', error);
        res.status(500).json({ success: false, message: error.message || 'Failed to get balance' });
    }
});

export default router;

import express from 'express';
import { verifyMessage } from 'ethers';
import { authService } from '../services/authService';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/register', async (req, res, next) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

router.post('/wallet-login', async (req, res, next) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({ message: 'Address, signature, and message are required' });
    }

    // Verify the signature cryptographically
    try {
      const recoveredAddress = verifyMessage(message, signature);
      const normalizedAddress = address.toLowerCase();
      const normalizedRecovered = recoveredAddress.toLowerCase();

      if (normalizedAddress !== normalizedRecovered) {
        logger.warn(`Signature verification failed: claimed ${normalizedAddress}, recovered ${normalizedRecovered}`);
        return res.status(401).json({ message: 'Invalid signature' });
      }
    } catch (verifyError: any) {
      logger.error('Signature verification error:', verifyError);
      return res.status(401).json({ message: 'Invalid signature format' });
    }

    const result = await authService.walletLogin(address, signature, message);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const decoded = authService.verifyToken(token);
    const user = await authService.getCurrentUser(decoded.id);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.patch('/profile', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;
    const user = await authService.updateProfile(userId, updates);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

router.post('/change-password', authenticateToken, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    await authService.changePassword(userId, currentPassword, newPassword);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
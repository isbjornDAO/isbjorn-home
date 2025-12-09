import express from 'express';
import { authService } from '../services/authService';

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

export default router;
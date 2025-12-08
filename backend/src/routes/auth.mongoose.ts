import express from 'express';
import { authService } from '../services/authService.mongoose';
import { body, validationResult } from 'express-validator';

const router = express.Router();

// Validation middleware
const validateRequest = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * POST /api/auth/register
 * Email/Password Registration
 */
router.post('/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('companyName').trim().notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/login
 * Email/Password Login
 */
router.post('/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/wallet/message
 * Generate message for wallet signature
 */
router.post('/wallet/message',
  [
    body('walletAddress').trim().notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { walletAddress } = req.body;
      const message = authService.generateWalletMessage(walletAddress);
      res.json({ message });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * POST /api/auth/wallet/authenticate
 * Wallet Authentication (Login or Register)
 */
router.post('/wallet/authenticate',
  [
    body('walletAddress').trim().notEmpty(),
    body('signature').trim().notEmpty(),
    body('message').trim().notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const result = await authService.authenticateWithWallet(req.body);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user
 */
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

/**
 * PATCH /api/auth/update-profile
 * Update user profile
 */
router.patch('/update-profile', async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const decoded = authService.verifyToken(token);
    const { companyName } = req.body;

    if (!companyName || !companyName.trim()) {
      return res.status(400).json({ message: 'Company name is required' });
    }

    await authService.updateUserProfile(decoded.id, { companyName: companyName.trim() });
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh',
  [
    body('refreshToken').trim().notEmpty(),
  ],
  validateRequest,
  async (req, res, next) => {
    try {
      const { refreshToken } = req.body;
      const result = await authService.refreshToken(refreshToken);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;

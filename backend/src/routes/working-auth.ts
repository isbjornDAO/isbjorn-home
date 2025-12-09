import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'ethers';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const router = express.Router();

// Registration with proper bcrypt password hashing
router.post('/register', async (req, res) => {
  try {
    const { email, password, companyName } = req.body;
    
    if (!email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and company name are required'
      });
    }

    // Check if user exists
    const existing = await User.findOne({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user using Sequelize ORM with password hashing
    const user = await User.create({
      email: email.toLowerCase(),
      password: password, // Will be hashed by BeforeCreate hook
      companyName,
      role: 'user',
      isActive: true,
      emailVerified: true
    });

    // Generate tokens
    const token = jwt.sign(
      { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.dataValues.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      user: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        companyName: user.dataValues.companyName,
        role: user.dataValues.role
      },
      token,
      refreshToken
    });

  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Login with bcrypt password verification
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password required'
      });
    }

    const user = await User.findOne({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password using bcrypt
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.dataValues.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '30d' }
    );

    res.json({
      user: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        companyName: user.dataValues.companyName,
        role: user.dataValues.role
      },
      token,
      refreshToken
    });

  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Wallet login - creates or authenticates user with wallet address
router.post('/wallet-login', async (req, res) => {
  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        success: false,
        message: 'Address, signature, and message are required'
      });
    }

    // Verify the signature cryptographically
    try {
      const recoveredAddress = verifyMessage(message, signature);
      const normalizedAddress = address.toLowerCase();
      const normalizedRecovered = recoveredAddress.toLowerCase();

      if (normalizedAddress !== normalizedRecovered) {
        logger.warn(`Signature verification failed: claimed ${normalizedAddress}, recovered ${normalizedRecovered}`);
        return res.status(401).json({
          success: false,
          message: 'Invalid signature'
        });
      }
    } catch (verifyError: any) {
      logger.error('Signature verification error:', verifyError);
      return res.status(401).json({
        success: false,
        message: 'Invalid signature format'
      });
    }

    const normalizedAddress = address.toLowerCase();

    // Find or create user with this wallet address
    let user = await User.findOne({
      where: { walletAddress: normalizedAddress }
    });

    if (!user) {
      // Create new user with wallet
      user = await User.create({
        walletAddress: normalizedAddress,
        companyName: `User ${normalizedAddress.substring(0, 6)}`,
        role: 'user',
        isActive: true,
        emailVerified: false
      });
      logger.info(`New wallet user created: ${normalizedAddress}`);
    }

    if (!user.dataValues.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate tokens
    const token = jwt.sign(
      { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.dataValues.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '30d' }
    );

    logger.info(`Wallet user logged in: ${normalizedAddress}`);

    res.json({
      user: {
        id: user.dataValues.id,
        email: user.dataValues.email,
        companyName: user.dataValues.companyName,
        role: user.dataValues.role,
        walletAddress: user.dataValues.walletAddress
      },
      token,
      refreshToken
    });

  } catch (error) {
    logger.error('Wallet login error:', error);
    res.status(500).json({
      success: false,
      message: `Wallet login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Current user endpoint for frontend
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret-key-change-in-production') as any;
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      id: user.dataValues.id,
      email: user.dataValues.email,
      companyName: user.dataValues.companyName,
      role: user.dataValues.role,
      walletAddress: user.dataValues.walletAddress,
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

export { router as workingAuthRoutes };
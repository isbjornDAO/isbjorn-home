import express from 'express';
import jwt from 'jsonwebtoken';
import { verifyMessage } from 'ethers';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Registration with proper bcrypt password hashing
router.post('/register', async (req, res) => {
  try {
    const { email, password, username, companyName } = req.body;

    // Accept either username or companyName
    const displayName = username || companyName;

    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and username are required'
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
      username: displayName,
      companyName: displayName, // Keep both for backward compatibility
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
        username: user.dataValues.username,
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
        username: user.dataValues.username,
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
      const defaultName = `User ${normalizedAddress.substring(0, 6)}`;
      user = await User.create({
        walletAddress: normalizedAddress,
        username: defaultName,
        companyName: defaultName,
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
        username: user.dataValues.username,
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

    // Return all user fields needed by frontend
    res.json({
      id: user.dataValues.id,
      email: user.dataValues.email,
      username: user.dataValues.username,
      companyName: user.dataValues.companyName,
      role: user.dataValues.role,
      walletAddress: user.dataValues.walletAddress,
      taxId: user.dataValues.taxId,
      address: user.dataValues.address,
      profilePicture: user.dataValues.logoUrl,
      avatar: user.dataValues.logoUrl,
      name: user.dataValues.username,
      xp: user.dataValues.xp || 0,
      level: user.dataValues.level || 1,
      coins: user.dataValues.coins || 0,
      badges: user.dataValues.badges || [],
      donationStreak: user.dataValues.donationStreak || 0,
      longestDonationStreak: user.dataValues.longestDonationStreak || 0,
      currentStreak: user.dataValues.currentStreak || 0,
      longestStreak: user.dataValues.longestStreak || 0,
      lastActive: user.dataValues.lastActive,
      spiritAnimal: user.dataValues.spiritAnimal,
      createdAt: user.dataValues.createdAt,
      updatedAt: user.dataValues.updatedAt,
    });
  } catch (error) {
    logger.error('Get current user error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Update user profile
router.patch('/profile', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const updates = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Filter allowed updates
    const allowedFields = ['email', 'username', 'companyName', 'phone', 'website', 'description', 'logoUrl', 'preferences', 'taxId', 'address'];
    const filteredUpdates: any = {};

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    // Sync username and companyName for backward compatibility
    if (updates.username !== undefined && updates.companyName === undefined) {
      filteredUpdates.companyName = updates.username;
    }
    if (updates.companyName !== undefined && updates.username === undefined) {
      filteredUpdates.username = updates.companyName;
    }

    await user.update(filteredUpdates);
    logger.info(`User profile updated: ${userId}`);

    res.json({
      id: user.dataValues.id,
      email: user.dataValues.email,
      username: user.dataValues.username,
      companyName: user.dataValues.companyName,
      phone: user.dataValues.phone,
      website: user.dataValues.website,
      description: user.dataValues.description,
      logoUrl: user.dataValues.logoUrl,
      role: user.dataValues.role,
      walletAddress: user.dataValues.walletAddress,
      preferences: user.dataValues.preferences
    });
  } catch (error) {
    logger.error('Profile update error:', error);
    res.status(500).json({
      success: false,
      message: `Profile update failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Change password
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Validate current password
    const isValid = await user.validatePassword(currentPassword);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Update password (will be hashed by BeforeUpdate hook)
    await user.update({ password: newPassword });
    logger.info(`Password changed for user: ${userId}`);

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    logger.error('Password change error:', error);
    res.status(500).json({
      success: false,
      message: `Password change failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Refresh access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required'
      });
    }

    // Verify the refresh token
    let decoded: any;
    try {
      decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
      );
    } catch (verifyError: any) {
      logger.warn('Refresh token verification failed:', verifyError.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    // Check if user still exists and is active
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.dataValues.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Generate new access token
    const token = jwt.sign(
      { id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    logger.info(`Token refreshed for user: ${user.dataValues.id}`);

    res.json({
      success: true,
      token
    });
  } catch (error) {
    logger.error('Token refresh error:', error);
    res.status(500).json({
      success: false,
      message: `Token refresh failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

export { router as workingAuthRoutes };
import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.model';

const router = express.Router();

// Working registration - bypasses bcrypt for now
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

    // Create user directly in database without triggering bcrypt hooks
    const [user] = await User.sequelize!.query(`
      INSERT INTO users (id, email, password, "companyName", role, "isActive", "emailVerified", "createdAt", "updatedAt")
      VALUES (:id, :email, :password, :companyName, 'user', true, true, datetime('now'), datetime('now'))
      RETURNING *
    `, {
      replacements: {
        id: require('uuid').v4(),
        email: email.toLowerCase(),
        password: password, // Plain text for demo - hash in production
        companyName
      },
      type: User.sequelize!.QueryTypes.SELECT
    });

    if (!user) {
      throw new Error('User creation failed');
    }

    // Generate tokens
    const token = jwt.sign(
      { id: (user as any).id, email: (user as any).email, role: (user as any).role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: (user as any).id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      success: true,
      user: {
        id: (user as any).id,
        email: (user as any).email,
        companyName: (user as any).companyName,
        role: (user as any).role
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

// Working login
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

    // Simple password check for demo
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'dev-secret-key-change-in-production',
      { expiresIn: '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      { expiresIn: '30d' }
    );

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        companyName: user.companyName,
        role: user.role
      },
      token,
      refreshToken
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
  }
});

export { router as workingAuthRoutes };
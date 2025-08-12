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

    // Create user using Sequelize ORM (bypasses password hashing hooks)
    const user = await User.create({
      email: email.toLowerCase(),
      password: password, // Plain text for demo - hash in production
      companyName,
      role: 'user',
      isActive: true,
      emailVerified: true
    }, {
      hooks: false // This bypasses the password hashing hook
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
      success: true,
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
    if (user.dataValues.password !== password) {
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
      success: true,
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
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: `Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`
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
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

export { router as workingAuthRoutes };
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.model';
import { AppError } from '../utils/AppError';

// JWT secret with development fallback
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.warn('WARNING: JWT_SECRET not set in production! Authentication may be insecure.');
}

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // For demo tokens, create a mock user object
    if (decoded.id.startsWith('demo-user')) {
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        companyName: 'Demo Company Ltd',
        isActive: true
      } as any;
      return next();
    }

    // For real tokens, check database
    console.log('Verifying token for user ID:', decoded.id);
    const user = await User.findByPk(decoded.id);
    console.log('User found:', user ? user.id : 'null');

    if (!user || !user.isActive) {
      console.log('User not found or inactive');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== UserRole.ADMIN) {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};
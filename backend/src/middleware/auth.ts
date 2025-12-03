import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.model';
import { logger } from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

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
      return res.status(401).json({ error: 'Access token required', code: 'TOKEN_MISSING' });
    }

    logger.info(`[Auth] Verifying token: ${token.substring(0, 10)}... using JWT_SECRET (first 10 chars): ${JWT_SECRET.substring(0, 10)}...`);
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    logger.info(`[Auth] Token verified successfully. Decoded ID: ${decoded.id}, Email: ${decoded.email}`);

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
    logger.info(`Verifying token for user ID: ${decoded.id}`);
    const user = await User.findByPk(decoded.id);
    logger.info(`User found: ${user ? user.id : 'null'}`);

    if (!user || !user.isActive) {
      logger.warn('User not found or inactive');
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error: any) {
    logger.error('[Auth] Token verification failed:', {
      error: error.message,
      name: error.name,
      expiredAt: error.expiredAt,
      JWT_SECRET_exists: !!process.env.JWT_SECRET,
      JWT_SECRET_length: process.env.JWT_SECRET?.length || 0
    });

    // Provide more specific error messages
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token', code: 'TOKEN_INVALID' });
    }

    return res.status(403).json({ error: 'Invalid or expired token', code: 'TOKEN_ERROR' });
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
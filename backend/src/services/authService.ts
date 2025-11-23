import jwt from 'jsonwebtoken';
import { User, UserRole } from '../models/User.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';

// JWT secrets with development fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';

if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  logger.warn('WARNING: JWT_SECRET not set in production! Authentication may be insecure.');
}
if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
  logger.warn('WARNING: JWT_REFRESH_SECRET not set in production!');
}

interface RegisterData {
  email: string;
  password: string;
  companyName: string;
  nzbn?: string;
  taxId?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
}

interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
}

export class AuthService {
  private generateTokens(user: User) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as any);

    const refreshToken = jwt.sign(
      { id: user.id },
      JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' } as any
    );

    return { token, refreshToken };
  }

  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      const existingUser = await User.findOne({
        where: { email: data.email.toLowerCase() },
      });

      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      const user = await User.create({
        ...data,
        email: data.email.toLowerCase(),
        role: UserRole.USER,
        preferences: {
          receiveNewsletter: true,
          receiveImpactReports: true,
          publicProfile: false,
          defaultCurrency: 'nzd',
        },
      });

      const { token, refreshToken } = this.generateTokens(user);

      logger.info(`New user registered: ${user.email}`);

      return {
        user,
        token,
        refreshToken,
      };
    } catch (error: any) {
      logger.error('Registration error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Registration failed', 500);
    }
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const user = await User.findOne({
        where: { email: email.toLowerCase() },
      });

      if (!user || !(await user.validatePassword(password))) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 401);
      }

      await user.update({
        lastLoginAt: new Date(),
        loginCount: user.loginCount + 1,
      });

      const { token, refreshToken } = this.generateTokens(user);

      logger.info(`User logged in: ${user.email}`);

      return {
        user,
        token,
        refreshToken,
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500);
    }
  }

  async refreshToken(refreshTokenStr: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshTokenStr, JWT_REFRESH_SECRET) as any;
      
      const user = await User.findByPk(decoded.id);
      if (!user || !user.isActive) {
        throw new AppError('Invalid refresh token', 401);
      }

      const { token } = this.generateTokens(user);
      
      return { token };
    } catch (error: any) {
      logger.error('Token refresh error:', error);
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async getCurrentUser(userId: string): Promise<User> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, updates: Partial<User>): Promise<User> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const allowedUpdates = [
        'companyName',
        'taxId',
        'address',
        'phone',
        'website',
        'description',
        'logoUrl',
        'preferences',
      ];

      const filteredUpdates = Object.keys(updates)
        .filter(key => allowedUpdates.includes(key))
        .reduce((obj: any, key) => {
          obj[key] = updates[key as keyof User];
          return obj;
        }, {});

      await user.update(filteredUpdates);
      
      logger.info(`User profile updated: ${user.email}`);
      
      return user;
    } catch (error: any) {
      logger.error('Profile update error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Profile update failed', 500);
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!(await user.validatePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 400);
      }

      await user.update({ password: newPassword });
      
      logger.info(`Password changed for user: ${user.email}`);
    } catch (error: any) {
      logger.error('Password change error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Password change failed', 500);
    }
  }

  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new AppError('Invalid token', 401);
    }
  }
}

export const authService = new AuthService();
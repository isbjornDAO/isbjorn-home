import jwt from 'jsonwebtoken';
import { ethers } from 'ethers';
import { User, UserRole, IUser } from '../models/User.mongoose';
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
  email?: string;
  password?: string;
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

interface WalletAuthData {
  walletAddress: string;
  signature: string;
  message: string;
  companyName?: string;
}

interface LoginResponse {
  user: IUser;
  token: string;
  refreshToken: string;
}

export class AuthService {
  private generateTokens(user: IUser) {
    const payload = {
      id: user._id,
      email: user.email,
      walletAddress: user.walletAddress,
      role: user.role,
    };

    const tokenExpiry = process.env.JWT_EXPIRES_IN || '7d';
    const refreshTokenExpiry = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: tokenExpiry,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { id: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: refreshTokenExpiry } as jwt.SignOptions
    );

    return { token, refreshToken };
  }

  /**
   * Email/Password Registration
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      // Validate required fields for email registration
      if (!data.email || !data.password) {
        throw new AppError('Email and password are required', 400);
      }

      // Check if email already exists
      const existingUser = await User.findOne({
        email: data.email.toLowerCase(),
      });

      if (existingUser) {
        throw new AppError('Email already registered', 400);
      }

      // Create new user
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
      throw new AppError(error.message || 'Registration failed', 500);
    }
  }

  /**
   * Email/Password Login
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user || !(await user.validatePassword(password))) {
        throw new AppError('Invalid email or password', 401);
      }

      if (!user.isActive) {
        throw new AppError('Account is deactivated', 401);
      }

      await user.updateOne({
        lastLoginAt: new Date(),
        $inc: { loginCount: 1 },
      });

      // Fetch updated user
      const updatedUser = await User.findById(user._id);
      if (!updatedUser) throw new AppError('User not found', 404);

      const { token, refreshToken } = this.generateTokens(updatedUser);

      logger.info(`User logged in: ${updatedUser.email}`);

      return {
        user: updatedUser,
        token,
        refreshToken,
      };
    } catch (error: any) {
      logger.error('Login error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Login failed', 500);
    }
  }

  /**
   * Wallet Authentication (Login or Register)
   */
  async authenticateWithWallet(data: WalletAuthData): Promise<LoginResponse> {
    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(data.message, data.signature);

      if (recoveredAddress.toLowerCase() !== data.walletAddress.toLowerCase()) {
        throw new AppError('Invalid signature', 401);
      }

      // Check if user exists with this wallet
      let user = await User.findOne({
        walletAddress: data.walletAddress.toLowerCase(),
      });

      if (user) {
        // Existing user - login
        if (!user.isActive) {
          throw new AppError('Account is deactivated', 401);
        }

        await user.updateOne({
          lastLoginAt: new Date(),
          $inc: { loginCount: 1 },
          walletSignature: data.signature,
        });

        const updatedUser = await User.findById(user._id);
        if (!updatedUser) throw new AppError('User not found', 404);

        const { token, refreshToken } = this.generateTokens(updatedUser);

        logger.info(`Wallet user logged in: ${updatedUser.walletAddress}`);

        return {
          user: updatedUser,
          token,
          refreshToken,
        };
      } else {
        // New user - register
        const companyName = data.companyName || `Wallet User ${data.walletAddress.slice(0, 6)}`;

        user = await User.create({
          walletAddress: data.walletAddress.toLowerCase(),
          walletSignature: data.signature,
          companyName,
          role: UserRole.USER,
          preferences: {
            receiveNewsletter: true,
            receiveImpactReports: true,
            publicProfile: false,
            defaultCurrency: 'nzd',
          },
        });

        const { token, refreshToken } = this.generateTokens(user);

        logger.info(`New wallet user registered: ${user.walletAddress}`);

        return {
          user,
          token,
          refreshToken,
        };
      }
    } catch (error: any) {
      logger.error('Wallet authentication error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError(error.message || 'Wallet authentication failed', 500);
    }
  }

  /**
   * Generate message for wallet signature
   */
  generateWalletMessage(walletAddress: string): string {
    const timestamp = Date.now();
    return `Sign this message to authenticate with Isbjorn.\n\nWallet: ${walletAddress}\nTimestamp: ${timestamp}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
  }

  async refreshToken(refreshTokenStr: string): Promise<{ token: string }> {
    try {
      const decoded = jwt.verify(refreshTokenStr, JWT_REFRESH_SECRET) as any;

      const user = await User.findById(decoded.id);
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

  async getCurrentUser(userId: string): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }
    return user;
  }

  async updateProfile(userId: string, updates: Partial<IUser>): Promise<IUser> {
    try {
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const allowedUpdates = [
        'companyName',
        'taxId',
        'nzbn',
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
          obj[key] = updates[key as keyof IUser];
          return obj;
        }, {});

      await user.updateOne(filteredUpdates);
      const updatedUser = await User.findById(userId);
      if (!updatedUser) throw new AppError('User not found', 404);

      logger.info(`User profile updated: ${updatedUser.email || updatedUser.walletAddress}`);

      return updatedUser;
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
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      if (!user.password) {
        throw new AppError('This account uses wallet authentication', 400);
      }

      if (!(await user.validatePassword(currentPassword))) {
        throw new AppError('Current password is incorrect', 400);
      }

      user.password = newPassword;
      await user.save();

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

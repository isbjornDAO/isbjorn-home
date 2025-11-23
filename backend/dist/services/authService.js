"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
// JWT secrets with development fallbacks
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret-key-change-in-production';
if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
    logger_1.logger.warn('WARNING: JWT_SECRET not set in production! Authentication may be insecure.');
}
if (!process.env.JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
    logger_1.logger.warn('WARNING: JWT_REFRESH_SECRET not set in production!');
}
class AuthService {
    generateTokens(user) {
        const payload = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        const token = jsonwebtoken_1.default.sign(payload, JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' });
        return { token, refreshToken };
    }
    async register(data) {
        try {
            const existingUser = await User_model_1.User.findOne({
                where: { email: data.email.toLowerCase() },
            });
            if (existingUser) {
                throw new AppError_1.AppError('Email already registered', 400);
            }
            const user = await User_model_1.User.create({
                ...data,
                email: data.email.toLowerCase(),
                role: User_model_1.UserRole.USER,
                preferences: {
                    receiveNewsletter: true,
                    receiveImpactReports: true,
                    publicProfile: false,
                    defaultCurrency: 'nzd',
                },
            });
            const { token, refreshToken } = this.generateTokens(user);
            logger_1.logger.info(`New user registered: ${user.email}`);
            return {
                user,
                token,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Registration error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Registration failed', 500);
        }
    }
    async login(email, password) {
        try {
            const user = await User_model_1.User.findOne({
                where: { email: email.toLowerCase() },
            });
            if (!user || !(await user.validatePassword(password))) {
                throw new AppError_1.AppError('Invalid email or password', 401);
            }
            if (!user.isActive) {
                throw new AppError_1.AppError('Account is deactivated', 401);
            }
            await user.update({
                lastLoginAt: new Date(),
                loginCount: user.loginCount + 1,
            });
            const { token, refreshToken } = this.generateTokens(user);
            logger_1.logger.info(`User logged in: ${user.email}`);
            return {
                user,
                token,
                refreshToken,
            };
        }
        catch (error) {
            logger_1.logger.error('Login error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Login failed', 500);
        }
    }
    async refreshToken(refreshTokenStr) {
        try {
            const decoded = jsonwebtoken_1.default.verify(refreshTokenStr, JWT_REFRESH_SECRET);
            const user = await User_model_1.User.findByPk(decoded.id);
            if (!user || !user.isActive) {
                throw new AppError_1.AppError('Invalid refresh token', 401);
            }
            const { token } = this.generateTokens(user);
            return { token };
        }
        catch (error) {
            logger_1.logger.error('Token refresh error:', error);
            throw new AppError_1.AppError('Invalid refresh token', 401);
        }
    }
    async getCurrentUser(userId) {
        const user = await User_model_1.User.findByPk(userId);
        if (!user) {
            throw new AppError_1.AppError('User not found', 404);
        }
        return user;
    }
    async updateProfile(userId, updates) {
        try {
            const user = await User_model_1.User.findByPk(userId);
            if (!user) {
                throw new AppError_1.AppError('User not found', 404);
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
                .reduce((obj, key) => {
                obj[key] = updates[key];
                return obj;
            }, {});
            await user.update(filteredUpdates);
            logger_1.logger.info(`User profile updated: ${user.email}`);
            return user;
        }
        catch (error) {
            logger_1.logger.error('Profile update error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Profile update failed', 500);
        }
    }
    async changePassword(userId, currentPassword, newPassword) {
        try {
            const user = await User_model_1.User.findByPk(userId);
            if (!user) {
                throw new AppError_1.AppError('User not found', 404);
            }
            if (!(await user.validatePassword(currentPassword))) {
                throw new AppError_1.AppError('Current password is incorrect', 400);
            }
            await user.update({ password: newPassword });
            logger_1.logger.info(`Password changed for user: ${user.email}`);
        }
        catch (error) {
            logger_1.logger.error('Password change error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Password change failed', 500);
        }
    }
    verifyToken(token) {
        try {
            return jsonwebtoken_1.default.verify(token, JWT_SECRET);
        }
        catch (error) {
            throw new AppError_1.AppError('Invalid token', 401);
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=authService.js.map
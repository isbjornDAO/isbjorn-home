"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_mongoose_1 = require("../models/User.mongoose");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required', code: 'TOKEN_MISSING' });
        }
        logger_1.logger.info(`[Auth] Verifying token: ${token.substring(0, 10)}... using JWT_SECRET (first 10 chars): ${JWT_SECRET.substring(0, 10)}...`);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        logger_1.logger.info(`[Auth] Token verified successfully. Decoded ID: ${decoded.id}, Email: ${decoded.email}`);
        // For demo tokens, create a mock user object
        if (decoded.id.startsWith('demo-user')) {
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                companyName: 'Demo Company Ltd',
                isActive: true
            };
            return next();
        }
        // For real tokens, check database
        logger_1.logger.info(`Verifying token for user ID: ${decoded.id}`);
        const user = await User_mongoose_1.User.findById(decoded.id);
        logger_1.logger.info(`User found: ${user ? user._id : 'null'}`);
        if (!user || !user.isActive) {
            logger_1.logger.warn('User not found or inactive');
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('[Auth] Token verification failed:', {
            error: error.message,
            name: error.name,
            expiredAt: error.expiredAt,
            JWT_SECRET_exists: !!process.env.JWT_SECRET,
            JWT_SECRET_length: process.env.JWT_SECRET?.length || 0
        });
        // Provide more specific error messages
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired', code: 'TOKEN_EXPIRED' });
        }
        else if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ error: 'Invalid token', code: 'TOKEN_INVALID' });
        }
        return res.status(403).json({ error: 'Invalid or expired token', code: 'TOKEN_ERROR' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== User_mongoose_1.UserRole.ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map
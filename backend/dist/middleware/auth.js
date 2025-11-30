"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAdmin = exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const logger_1 = require("../utils/logger");
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader && authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'Access token required' });
        }
        logger_1.logger.info(`[Auth] Verifying token: ${token.substring(0, 10)}...`);
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        logger_1.logger.info(`[Auth] Token verified. Decoded ID: ${decoded.id}`);
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
        const user = await User_model_1.User.findByPk(decoded.id);
        logger_1.logger.info(`User found: ${user ? user.id : 'null'}`);
        if (!user || !user.isActive) {
            logger_1.logger.warn('User not found or inactive');
            return res.status(401).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    }
    catch (error) {
        logger_1.logger.error('Auth error:', error);
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};
exports.authenticateToken = authenticateToken;
const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }
    if (req.user.role !== User_model_1.UserRole.ADMIN) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};
exports.requireAdmin = requireAdmin;
//# sourceMappingURL=auth.js.map
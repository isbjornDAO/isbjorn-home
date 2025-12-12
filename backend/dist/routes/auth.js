"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ethers_1 = require("ethers");
const authService_1 = require("../services/authService");
const logger_1 = require("../utils/logger");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService_1.authService.login(email, password);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/register', async (req, res, next) => {
    try {
        const result = await authService_1.authService.register(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
});
router.post('/wallet-login', async (req, res, next) => {
    try {
        const { address, signature, message } = req.body;
        if (!address || !signature || !message) {
            return res.status(400).json({ message: 'Address, signature, and message are required' });
        }
        // Verify the signature cryptographically
        try {
            const recoveredAddress = (0, ethers_1.verifyMessage)(message, signature);
            const normalizedAddress = address.toLowerCase();
            const normalizedRecovered = recoveredAddress.toLowerCase();
            if (normalizedAddress !== normalizedRecovered) {
                logger_1.logger.warn(`Signature verification failed: claimed ${normalizedAddress}, recovered ${normalizedRecovered}`);
                return res.status(401).json({ message: 'Invalid signature' });
            }
        }
        catch (verifyError) {
            logger_1.logger.error('Signature verification error:', verifyError);
            return res.status(401).json({ message: 'Invalid signature format' });
        }
        const result = await authService_1.authService.walletLogin(address, signature, message);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
router.get('/me', async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
        if (!token) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const decoded = authService_1.authService.verifyToken(token);
        const user = await authService_1.authService.getCurrentUser(decoded.id);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
router.patch('/profile', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const user = await authService_1.authService.updateProfile(userId, updates);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
router.post('/change-password', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }
        await authService_1.authService.changePassword(userId, currentPassword, newPassword);
        res.json({ message: 'Password changed successfully' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.workingAuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_model_1 = require("../models/User.model");
const logger_1 = require("../utils/logger");
const ethers_1 = require("ethers");
const router = express_1.default.Router();
exports.workingAuthRoutes = router;
// Generate a new wallet for the user
function generateWallet() {
    const wallet = ethers_1.Wallet.createRandom();
    return {
        address: wallet.address,
        privateKey: wallet.privateKey, // In production, encrypt this!
        mnemonic: wallet.mnemonic?.phrase || '',
    };
}
// Working registration with password hashing and auto-wallet generation
router.post('/register', async (req, res) => {
    try {
        const { email, password, companyName, nzbn, walletAddress } = req.body;
        if (!email || !password || !companyName) {
            return res.status(400).json({
                success: false,
                message: 'Email, password, and company name are required'
            });
        }
        // Check if user exists
        const existing = await User_model_1.User.findOne({ where: { email: email.toLowerCase() } });
        if (existing) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }
        // Generate wallet if not provided (user signed up with email/password)
        let userWalletAddress = walletAddress;
        let generatedWallet = null;
        if (!walletAddress) {
            generatedWallet = generateWallet();
            userWalletAddress = generatedWallet.address;
            logger_1.logger.info(`Auto-generated wallet for ${email}: ${userWalletAddress}`);
        }
        // Create user with password hashing enabled
        const user = await User_model_1.User.create({
            email: email.toLowerCase(),
            password: password, // Will be hashed by the model's beforeCreate hook
            companyName,
            nzbn: nzbn || undefined,
            x402WalletId: userWalletAddress,
            role: 'user',
            isActive: true,
            emailVerified: true,
            preferences: {
                receiveNewsletter: true,
                receiveImpactReports: true,
                publicProfile: false,
                defaultCurrency: 'nzd',
            },
        });
        // Generate tokens
        const token = jsonwebtoken_1.default.sign({ id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role }, process.env.JWT_SECRET || 'dev-secret-key-change-in-production', { expiresIn: '7d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.dataValues.id }, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', { expiresIn: '30d' });
        const responseData = {
            success: true,
            user: {
                id: user.dataValues.id,
                email: user.dataValues.email,
                companyName: user.dataValues.companyName,
                nzbn: user.dataValues.nzbn,
                role: user.dataValues.role,
                x402WalletId: userWalletAddress,
            },
            token,
            refreshToken
        };
        // Include wallet details if we generated one
        // WARNING: In production, NEVER send privateKey or mnemonic to client
        // This should be encrypted and stored securely, or let user manage their own wallet
        if (generatedWallet) {
            responseData.wallet = {
                address: generatedWallet.address,
                // For demo only - in production, use secure key management
                privateKey: generatedWallet.privateKey,
                mnemonic: generatedWallet.mnemonic,
            };
            logger_1.logger.warn('Sending wallet private key in response - DEMO ONLY! Implement secure key management for production.');
        }
        res.status(201).json(responseData);
    }
    catch (error) {
        logger_1.logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`
        });
    }
});
// Working login with password validation
router.post('/login', async (req, res) => {
    try {
        const { email, password, walletAddress } = req.body;
        // Support both email/password and wallet-based login
        let user;
        if (walletAddress) {
            // Wallet-based login
            user = await User_model_1.User.findOne({ where: { x402WalletId: walletAddress.toLowerCase() } });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Wallet not registered'
                });
            }
        }
        else {
            // Email/password login
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password required'
                });
            }
            user = await User_model_1.User.findOne({ where: { email: email.toLowerCase() } });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
            // Use the model's validatePassword method (bcrypt comparison)
            const isValidPassword = await user.validatePassword(password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Invalid email or password'
                });
            }
        }
        // Update last login
        await user.update({
            lastLoginAt: new Date(),
            loginCount: user.loginCount + 1,
        });
        const token = jsonwebtoken_1.default.sign({ id: user.dataValues.id, email: user.dataValues.email, role: user.dataValues.role }, process.env.JWT_SECRET || 'dev-secret-key-change-in-production', { expiresIn: '7d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.dataValues.id }, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', { expiresIn: '30d' });
        res.json({
            success: true,
            user: {
                id: user.dataValues.id,
                email: user.dataValues.email,
                companyName: user.dataValues.companyName,
                nzbn: user.dataValues.nzbn,
                role: user.dataValues.role,
                x402WalletId: user.dataValues.x402WalletId,
            },
            token,
            refreshToken
        });
    }
    catch (error) {
        logger_1.logger.error('Login error:', error);
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
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'dev-secret-key-change-in-production');
        const user = await User_model_1.User.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({
            id: user.dataValues.id,
            email: user.dataValues.email,
            companyName: user.dataValues.companyName,
            nzbn: user.dataValues.nzbn,
            role: user.dataValues.role,
            x402WalletId: user.dataValues.x402WalletId,
            lastLoginAt: user.dataValues.lastLoginAt,
            loginCount: user.dataValues.loginCount,
        });
    }
    catch (error) {
        logger_1.logger.error('Get current user error:', error);
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
});
//# sourceMappingURL=working-auth.js.map
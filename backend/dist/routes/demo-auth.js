"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.demoAuthRoutes = void 0;
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const router = express_1.default.Router();
exports.demoAuthRoutes = router;
// Demo users for testing the platform
const demoUsers = [
    {
        id: 'demo-user-1',
        email: 'demo@company.com',
        password: 'demo123',
        companyName: 'Demo Company Ltd',
        role: 'user'
    },
    {
        id: 'admin-user-1',
        email: 'admin@company.com',
        password: 'admin123',
        companyName: 'Admin Company Ltd',
        role: 'admin'
    }
];
// Demo registration (just returns a demo user)
router.post('/register', async (req, res) => {
    try {
        const { email, companyName } = req.body;
        const user = {
            id: 'demo-user-' + Date.now(),
            email: email || 'demo@company.com',
            companyName: companyName || 'Demo Company Ltd',
            role: 'user'
        };
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret-key-change-in-production', { expiresIn: '7d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', { expiresIn: '30d' });
        res.status(201).json({
            user,
            token,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Registration failed'
        });
    }
});
// Demo login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = demoUsers.find(u => u.email === email && u.password === password) || demoUsers[0];
        const token = jsonwebtoken_1.default.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'dev-secret-key-change-in-production', { expiresIn: '7d' });
        const refreshToken = jsonwebtoken_1.default.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret', { expiresIn: '30d' });
        res.json({
            user: {
                id: user.id,
                email: user.email,
                companyName: user.companyName,
                role: user.role
            },
            token,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Login failed'
        });
    }
});
//# sourceMappingURL=demo-auth.js.map
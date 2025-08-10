"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authService_1 = require("../services/authService");
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
router.get('/me', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: 'Not authenticated' });
        }
        const user = await authService_1.authService.getCurrentUser(userId);
        res.json(user);
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map
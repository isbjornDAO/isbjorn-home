"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get('/', async (req, res, next) => {
    try {
        res.json({ message: 'Donations endpoint - coming soon' });
    }
    catch (error) {
        next(error);
    }
});
router.post('/', async (req, res, next) => {
    try {
        res.json({ message: 'Create donation - coming soon' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=donations.js.map
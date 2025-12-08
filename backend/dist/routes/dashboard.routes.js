"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Donation_model_1 = require("../models/Donation.model");
const Charity_model_1 = require("../models/Charity.model");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
exports.dashboardRoutes = router;
router.get('/stats', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user?._id.toString();
        const userDonations = await Donation_model_1.Donation.findAll({
            where: { userId },
            include: [
                {
                    model: Charity_model_1.Charity,
                    as: 'charity',
                    attributes: ['name']
                }
            ]
        });
        const totalDonations = userDonations.length;
        const totalAmount = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
        const charitiesSupported = new Set(userDonations.map(d => d.charityId)).size;
        const lastDonationDate = userDonations.length > 0
            ? userDonations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
            : null;
        res.json({
            totalDonations,
            totalAmount,
            charitiesSupported,
            lastDonationDate
        });
    }
    catch (error) {
        logger_1.logger.error('Error fetching dashboard stats:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
});
//# sourceMappingURL=dashboard.routes.js.map
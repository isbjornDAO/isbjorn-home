"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const Donation_model_1 = require("../models/Donation.model");
const User_model_1 = require("../models/User.model");
const Charity_model_1 = require("../models/Charity.model");
const router = express_1.default.Router();
exports.adminRoutes = router;
router.get('/stats', auth_1.authenticateToken, auth_1.requireAdmin, async (req, res) => {
    try {
        const totalUsers = await User_model_1.User.count();
        const totalDonations = await Donation_model_1.Donation.count();
        const totalCharities = await Charity_model_1.Charity.count({ where: { isActive: true } });
        const donations = await Donation_model_1.Donation.findAll();
        const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
        const recentDonations = await Donation_model_1.Donation.findAll({
            limit: 10,
            order: [['createdAt', 'DESC']],
            include: [
                {
                    model: User_model_1.User,
                    as: 'user',
                    attributes: ['companyName']
                },
                {
                    model: Charity_model_1.Charity,
                    as: 'charity',
                    attributes: ['name']
                }
            ]
        });
        const formattedRecentDonations = recentDonations.map(donation => ({
            id: donation.id,
            amount: donation.amount,
            donorCompany: donation.user?.companyName || 'Unknown',
            charityName: donation.charity?.name || 'Unknown',
            createdAt: donation.createdAt
        }));
        res.json({
            totalUsers,
            totalDonations,
            totalAmount,
            totalCharities,
            recentDonations: formattedRecentDonations
        });
    }
    catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});
//# sourceMappingURL=admin.routes.js.map
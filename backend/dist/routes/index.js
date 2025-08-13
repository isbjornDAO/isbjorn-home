"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const donations_1 = __importDefault(require("./donations"));
const streamlinedDonations_1 = __importDefault(require("./streamlinedDonations"));
const projects_1 = __importDefault(require("./projects"));
const dashboard_routes_1 = require("./dashboard.routes");
const admin_routes_1 = require("./admin.routes");
const integrations_routes_1 = require("./integrations.routes");
const working_auth_1 = require("./working-auth");
const public_1 = __importDefault(require("./public"));
const express_validator_1 = require("express-validator");
const stripeService_1 = require("../services/stripeService");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
// Health check endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '2.0.0-streamlined',
        features: [
            'Ultra-streamlined NZ donations',
            'IRD compliance automation',
            'Real-time company verification',
            'Instant receipt generation',
            'Xero/MYOB integration ready'
        ]
    });
});
// API routes  
router.use('/auth', working_auth_1.workingAuthRoutes); // Using working auth with real database
router.use('/donations', streamlinedDonations_1.default); // New streamlined endpoints
router.use('/donations-legacy', donations_1.default); // Legacy donation endpoints
router.use('/projects', projects_1.default);
router.use('/dashboard', dashboard_routes_1.dashboardRoutes);
router.use('/admin', admin_routes_1.adminRoutes);
router.use('/public', public_1.default);
router.use('/integrations', integrations_routes_1.integrationsRoutes);
// Stripe Checkout routes (inline to avoid module resolution issues)
router.post('/stripe-checkout/create-session', [
    (0, express_validator_1.body)('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
    (0, express_validator_1.body)('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
    (0, express_validator_1.body)('charityId').isString().notEmpty().withMessage('Charity ID is required'),
    (0, express_validator_1.body)('charityName').isString().notEmpty().withMessage('Charity name is required'),
    (0, express_validator_1.body)('companyName').optional().isString(),
    (0, express_validator_1.body)('companyEmail').isEmail().withMessage('Valid company email is required'),
    (0, express_validator_1.body)('message').optional().isString(),
    (0, express_validator_1.body)('isRecurring').optional().isBoolean(),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { amount, currency, charityId, charityName, companyName, companyEmail, message, isRecurring = false } = req.body;
        const session = await stripeService_1.stripeService.createCheckoutSession({
            amount,
            currency,
            charityId,
            charityName,
            companyName,
            companyEmail,
            message,
            isRecurring
        });
        res.json({
            success: true,
            sessionId: session.sessionId,
            sessionUrl: session.sessionUrl,
            donationId: session.donation.id
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating checkout session:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create checkout session'
        });
    }
});
router.get('/stripe-checkout/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        res.json({
            success: true,
            sessionId,
            status: 'pending'
        });
    }
    catch (error) {
        logger_1.logger.error('Error retrieving checkout session:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to retrieve checkout session'
        });
    }
});
// Convenience endpoints that map to streamlined routes
router.use('/companies', streamlinedDonations_1.default);
router.use('/charities', streamlinedDonations_1.default);
router.use('/receipts', streamlinedDonations_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
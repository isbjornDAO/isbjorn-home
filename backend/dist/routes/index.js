"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// Backend route definitions for Isbjorn Home
const express_1 = __importDefault(require("express"));
const donations_1 = __importDefault(require("./donations"));
const streamlinedDonations_1 = __importDefault(require("./streamlinedDonations"));
const x402Donations_1 = __importDefault(require("./x402Donations"));
const projects_1 = __importDefault(require("./projects"));
const dashboard_routes_1 = require("./dashboard.routes");
const admin_routes_1 = require("./admin.routes");
const integrations_routes_1 = require("./integrations.routes");
const working_auth_1 = require("./working-auth");
const public_1 = __importDefault(require("./public"));
const simple_payment_1 = __importDefault(require("./simple-payment"));
const user_routes_1 = __importDefault(require("./user.routes"));
const node_routes_1 = require("./node.routes");
const collectables_routes_1 = __importDefault(require("./collectables.routes"));
const rewards_routes_1 = __importDefault(require("./rewards.routes"));
const express_validator_1 = require("express-validator");
const stripeService_1 = require("../services/stripeService");
const x402Service_1 = require("../services/x402Service");
const stripe_1 = require("../utils/stripe");
const x402_1 = __importDefault(require("../utils/x402"));
const logger_1 = require("../utils/logger");
const nzCompaniesRegisterService_1 = __importDefault(require("../services/nzCompaniesRegisterService"));
const nzCharitiesService_1 = __importDefault(require("../services/nzCharitiesService"));
const AvalancheL1Service_1 = __importDefault(require("../services/AvalancheL1Service"));
const EmailReceiptService_1 = __importDefault(require("../services/EmailReceiptService"));
const irdComplianceService_1 = require("../services/irdComplianceService");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Basic API health info (lightweight)
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
// Deep infrastructure health check (Stripe, Avalanche, NZ APIs, Email, IRD)
router.get('/health/deep', async (req, res) => {
    const start = Date.now();
    const companiesService = new nzCompaniesRegisterService_1.default();
    const charitiesService = new nzCharitiesService_1.default();
    const results = {
        status: 'unknown',
        timestamp: new Date().toISOString(),
        checks: {
            stripe: { ok: false },
            avalanche: { ok: false },
            nzCompaniesApi: { ok: false },
            nzCharitiesApi: { ok: false },
            email: { ok: false },
            irdApi: { ok: false },
        },
    };
    try {
        // Stripe check
        try {
            await stripe_1.stripe.customers.list({ limit: 1 });
            results.checks.stripe.ok = true;
        }
        catch (e) {
            results.checks.stripe.error = e.message || 'Stripe check failed';
        }
        // Avalanche / Iggy L1 check
        try {
            const healthy = await AvalancheL1Service_1.default.healthCheck();
            results.checks.avalanche.ok = healthy;
            if (healthy) {
                const info = await AvalancheL1Service_1.default.getNetworkInfo();
                results.checks.avalanche.details = info;
            }
        }
        catch (e) {
            results.checks.avalanche.error = e.message || 'Avalanche check failed';
        }
        // NZ Companies API check
        try {
            const fakeNumber = process.env.HEALTHCHECK_NZ_COMPANY_NUMBER || '9999999';
            await companiesService.lookupCompany(fakeNumber);
            results.checks.nzCompaniesApi.ok = true;
        }
        catch (e) {
            results.checks.nzCompaniesApi.error = e.message || 'NZ Companies API check failed';
        }
        // NZ Charities API check
        try {
            await charitiesService.searchCharitiesByName('test', 1);
            results.checks.nzCharitiesApi.ok = true;
        }
        catch (e) {
            results.checks.nzCharitiesApi.error = e.message || 'NZ Charities API check failed';
        }
        // Email (SendGrid) configuration check
        try {
            const emailOk = await EmailReceiptService_1.default.testConfiguration();
            results.checks.email.ok = emailOk;
            if (!emailOk) {
                results.checks.email.error = 'Email test failed or not configured';
            }
        }
        catch (e) {
            results.checks.email.error = e.message || 'Email check failed';
        }
        // IRD API (compliance)
        try {
            const dummy = await irdComplianceService_1.irdComplianceService.generateIRDReceiptData('HEALTHCHECK-DONATION', 'HEALTHCHECK-USER', 'HEALTHCHECK-CHARITY', 10);
            results.checks.irdApi.ok = !!dummy;
        }
        catch (e) {
            results.checks.irdApi.error = e.message || 'IRD compliance check failed';
        }
        results.status = Object.values(results.checks).every((c) => c.ok) ? 'healthy' : 'degraded';
        results.durationMs = Date.now() - start;
        const httpStatus = results.status === 'healthy' ? 200 : 503;
        res.status(httpStatus).json(results);
    }
    catch (error) {
        logger_1.logger.error('Deep health check failed:', error);
        res.status(500).json({
            status: 'error',
            message: error.message || 'Deep health check failed',
        });
    }
});
// API routes
router.use('/auth', working_auth_1.workingAuthRoutes);
router.use('/donations', streamlinedDonations_1.default);
router.use('/x402', x402Donations_1.default);
router.use('/donations-legacy', donations_1.default);
router.use('/projects', projects_1.default);
router.use('/dashboard', dashboard_routes_1.dashboardRoutes);
router.use('/admin', admin_routes_1.adminRoutes);
router.use('/public', public_1.default);
router.use('/integrations', integrations_routes_1.integrationsRoutes);
router.use('/payment', simple_payment_1.default);
router.use('/user', user_routes_1.default);
router.use('/node', node_routes_1.nodeRoutes);
router.use('/collectables', collectables_routes_1.default);
router.use('/rewards', rewards_routes_1.default);
// X402 Checkout session creation
router.post('/x402-checkout/create-session', [
    (0, express_validator_1.body)('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
    (0, express_validator_1.body)('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
    (0, express_validator_1.body)('charityId').isString().notEmpty().withMessage('Charity ID is required'),
    (0, express_validator_1.body)('charityName').isString().notEmpty().withMessage('Charity name is required'),
    (0, express_validator_1.body)('companyName').optional().isString(),
    (0, express_validator_1.body)('companyEmail').isEmail().withMessage('Valid company email is required'),
    (0, express_validator_1.body)('message').optional().isString(),
    (0, express_validator_1.body)('isRecurring').optional().isBoolean(),
], auth_1.authenticateToken, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { amount, currency, charityId, charityName, companyName, companyEmail, message, isRecurring = false } = req.body;
        if (!req.user || !req.user.id) {
            return res.status(401).json({ success: false, message: 'User not authenticated' });
        }
        const session = await x402Service_1.x402Service.createCheckoutSession({
            userId: req.user.id,
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
// Stripe Checkout session creation (legacy support)
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
// X402 webhook endpoint
router.post('/x402/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    const webhookSecret = process.env.X402_WEBHOOK_SECRET;
    if (!webhookSecret) {
        logger_1.logger.error('X402_WEBHOOK_SECRET not configured');
        return res.status(400).json({ error: 'Webhook secret not configured' });
    }
    let event;
    try {
        event = x402_1.default.verifyWebhook(req.body, webhookSecret);
    }
    catch (err) {
        logger_1.logger.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await x402Service_1.x402Service.handleSuccessfulPayment(event.data.object);
                break;
            case 'payment_intent.succeeded':
                // optional handling
                break;
            default:
                logger_1.logger.info(`Unhandled X402 event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('X402 webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
// Stripe webhook endpoint (legacy)
router.post('/stripe/webhook', express_1.default.raw({ type: 'application/json' }), async (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        logger_1.logger.error('STRIPE_WEBHOOK_SECRET not configured');
        return res.status(400).json({ error: 'Webhook secret not configured' });
    }
    let event;
    try {
        event = stripe_1.stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    }
    catch (err) {
        logger_1.logger.error('Stripe webhook signature verification failed:', err.message);
        return res.status(400).json({ error: 'Invalid signature' });
    }
    try {
        switch (event.type) {
            case 'checkout.session.completed':
                await stripeService_1.stripeService.handleSuccessfulPayment(event.data.object);
                break;
            case 'payment_intent.succeeded':
                // optional handling
                break;
            default:
                logger_1.logger.info(`Unhandled Stripe event type: ${event.type}`);
        }
        res.json({ received: true });
    }
    catch (error) {
        logger_1.logger.error('Stripe webhook handler error:', error);
        res.status(500).json({ error: 'Webhook handler failed' });
    }
});
// Create payment intent for embedded checkout (Stripe legacy)
router.post('/stripe/create-payment-intent', [
    (0, express_validator_1.body)('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
    (0, express_validator_1.body)('currency').isIn(['NZD', 'USD', 'AUD']).withMessage('Currency must be NZD, USD, or AUD'),
    (0, express_validator_1.body)('charityName').isString().notEmpty().withMessage('Charity name is required'),
], async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { amount, currency, charityName } = req.body;
        const paymentIntent = await stripe_1.stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency: currency.toLowerCase(),
            description: `Donation to ${charityName}`,
            metadata: {
                charityName,
                platform: 'Isbjorn',
            },
            automatic_payment_methods: {
                enabled: true,
            },
        });
        res.json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        logger_1.logger.error('Error creating payment intent:', {
            message: error.message,
            type: error.type,
            code: error.code,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create payment intent',
            code: error.code
        });
    }
});
// X402 session retrieval (placeholder)
router.get('/x402-checkout/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        // TODO: integrate with X402 SDK to fetch session status
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
// Convenience endpoints
router.use('/companies', streamlinedDonations_1.default);
router.use('/charities', streamlinedDonations_1.default);
router.use('/receipts', streamlinedDonations_1.default);
router.use('/wallet', require('../routes/wallet').default);
exports.default = router;
//# sourceMappingURL=index.js.map
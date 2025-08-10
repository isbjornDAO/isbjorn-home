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
const simple_auth_1 = require("./simple-auth");
const working_auth_1 = require("./working-auth");
const demo_auth_1 = require("./demo-auth");
const public_1 = __importDefault(require("./public"));
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
router.use('/auth', demo_auth_1.demoAuthRoutes); // Using demo auth for now
router.use('/donations', streamlinedDonations_1.default); // New streamlined endpoints
router.use('/donations-legacy', donations_1.default); // Legacy donation endpoints
router.use('/projects', projects_1.default);
router.use('/dashboard', dashboard_routes_1.dashboardRoutes);
router.use('/admin', admin_routes_1.adminRoutes);
router.use('/public', public_1.default);
router.use('/integrations', integrations_routes_1.integrationsRoutes);
router.use('/simple-auth', simple_auth_1.simpleAuthRoutes);
router.use('/working-auth', working_auth_1.workingAuthRoutes);
// Convenience endpoints that map to streamlined routes
router.use('/companies', streamlinedDonations_1.default);
router.use('/charities', streamlinedDonations_1.default);
router.use('/receipts', streamlinedDonations_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map
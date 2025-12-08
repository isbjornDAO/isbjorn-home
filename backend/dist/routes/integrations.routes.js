"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationsRoutes = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const accountingIntegrationService_1 = require("../services/accountingIntegrationService");
const irdComplianceService_1 = require("../services/irdComplianceService");
const logger_1 = require("../utils/logger");
const router = express_1.default.Router();
exports.integrationsRoutes = router;
/**
 * Get available integration URLs for setup
 */
router.get('/urls', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const urls = accountingIntegrationService_1.accountingIntegrationService.getIntegrationUrls(userId);
        res.json({
            success: true,
            data: {
                xero: urls.xero,
                myob: urls.myob,
                setupInstructions: {
                    xero: 'Click to connect your Xero account and automatically sync donations',
                    myob: 'Click to connect your MYOB account and automatically sync donations'
                }
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Integration URLs error:', error);
        res.status(500).json({ success: false, message: 'Failed to get integration URLs' });
    }
});
/**
 * Handle Xero OAuth callback
 */
router.get('/xero/callback', async (req, res) => {
    try {
        const { code, state: userId, error } = req.query;
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=${error}`);
        }
        if (!code || !userId) {
            return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=missing_code`);
        }
        await accountingIntegrationService_1.accountingIntegrationService.initializeIntegration(userId, accountingIntegrationService_1.IntegrationType.XERO, code);
        res.redirect(`${process.env.FRONTEND_URL}/integrations?success=xero_connected`);
    }
    catch (error) {
        logger_1.logger.error('Xero callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/integrations?error=xero_connection_failed`);
    }
});
/**
 * Handle MYOB OAuth callback
 */
router.get('/myob/callback', async (req, res) => {
    try {
        const { code, state: userId, error } = req.query;
        if (error) {
            return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=${error}`);
        }
        if (!code || !userId) {
            return res.redirect(`${process.env.FRONTEND_URL}/integrations?error=missing_code`);
        }
        await accountingIntegrationService_1.accountingIntegrationService.initializeIntegration(userId, accountingIntegrationService_1.IntegrationType.MYOB, code);
        res.redirect(`${process.env.FRONTEND_URL}/integrations?success=myob_connected`);
    }
    catch (error) {
        logger_1.logger.error('MYOB callback error:', error);
        res.redirect(`${process.env.FRONTEND_URL}/integrations?error=myob_connection_failed`);
    }
});
/**
 * Get user's integration status
 */
router.get('/status', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const settings = accountingIntegrationService_1.accountingIntegrationService.getIntegrationStatus(userId);
        if (!settings) {
            return res.json({
                success: true,
                data: {
                    connected: false,
                    integrations: {},
                    autoSync: false
                }
            });
        }
        // Don't expose sensitive token data
        const safeSettings = {
            connected: true,
            integrationType: settings.integrationType,
            integrations: {
                xero: !!settings.xeroTokens,
                myob: !!settings.myobTokens
            },
            autoSync: settings.autoSync,
            syncReceipts: settings.syncReceipts,
            syncFees: settings.syncFees,
            lastSyncDate: settings.lastSyncDate,
            syncErrors: settings.syncErrors?.slice(-5) || [] // Last 5 errors only
        };
        res.json({ success: true, data: safeSettings });
    }
    catch (error) {
        logger_1.logger.error('Integration status error:', error);
        res.status(500).json({ success: false, message: 'Failed to get integration status' });
    }
});
/**
 * Update integration settings
 */
router.patch('/settings', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { autoSync, syncReceipts, syncFees } = req.body;
        const updatedSettings = accountingIntegrationService_1.accountingIntegrationService.updateIntegrationSettings(userId, {
            autoSync,
            syncReceipts,
            syncFees
        });
        res.json({
            success: true,
            data: {
                autoSync: updatedSettings.autoSync,
                syncReceipts: updatedSettings.syncReceipts,
                syncFees: updatedSettings.syncFees
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Integration settings update error:', error);
        res.status(500).json({ success: false, message: 'Failed to update integration settings' });
    }
});
/**
 * Disconnect integration
 */
router.delete('/disconnect/:type?', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const integrationType = req.params.type;
        accountingIntegrationService_1.accountingIntegrationService.disconnectIntegration(userId, integrationType);
        res.json({
            success: true,
            message: integrationType
                ? `${integrationType} integration disconnected`
                : 'All integrations disconnected'
        });
    }
    catch (error) {
        logger_1.logger.error('Integration disconnect error:', error);
        res.status(500).json({ success: false, message: 'Failed to disconnect integration' });
    }
});
/**
 * Test integration connection
 */
router.post('/test', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const validations = await accountingIntegrationService_1.accountingIntegrationService.validateIntegrations();
        const userValidation = validations.get(userId);
        if (!userValidation) {
            return res.json({
                success: true,
                data: { connected: false, message: 'No integrations configured' }
            });
        }
        res.json({
            success: true,
            data: {
                connected: true,
                xero: userValidation.xero,
                myob: userValidation.myob,
                message: 'Integration test completed'
            }
        });
    }
    catch (error) {
        logger_1.logger.error('Integration test error:', error);
        res.status(500).json({ success: false, message: 'Failed to test integration' });
    }
});
/**
 * Verify business IRD number
 */
router.post('/verify-ird', auth_1.authenticateToken, async (req, res) => {
    try {
        const { irdNumber, companyName } = req.body;
        if (!irdNumber) {
            return res.status(400).json({ success: false, message: 'IRD number is required' });
        }
        const verification = await irdComplianceService_1.irdComplianceService.verifyBusinessIRD(irdNumber, companyName);
        res.json({
            success: true,
            data: verification
        });
    }
    catch (error) {
        logger_1.logger.error('IRD verification error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify IRD number' });
    }
});
/**
 * Get IRD compliance information
 */
router.get('/ird-info', auth_1.authenticateToken, async (req, res) => {
    try {
        const info = {
            minimumDonation: 5,
            currency: 'NZD',
            taxDeductible: true,
            receiptRequired: true,
            reportingThreshold: 200,
            requirements: [
                'Donation must be to a registered donee organisation',
                'Minimum donation amount is $5 NZD',
                'Receipt must include all IRD required elements',
                'Donations over $200 may require additional reporting'
            ],
            benefits: [
                'Tax credits available for eligible donations',
                'Automatic IRD-compliant receipts',
                'Simplified record keeping',
                'Professional documentation for audits'
            ]
        };
        res.json({ success: true, data: info });
    }
    catch (error) {
        logger_1.logger.error('IRD info error:', error);
        res.status(500).json({ success: false, message: 'Failed to get IRD information' });
    }
});
/**
 * Manual sync trigger for testing
 */
router.post('/sync-test', auth_1.authenticateToken, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { donationId } = req.body;
        // This would trigger a manual sync for testing purposes
        // In production, this would be restricted to admin users or removed
        res.json({
            success: true,
            message: 'Manual sync triggered',
            data: { donationId, userId }
        });
    }
    catch (error) {
        logger_1.logger.error('Manual sync error:', error);
        res.status(500).json({ success: false, message: 'Failed to trigger manual sync' });
    }
});
//# sourceMappingURL=integrations.routes.js.map
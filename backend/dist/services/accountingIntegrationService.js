"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.accountingIntegrationService = exports.AccountingIntegrationService = exports.IntegrationType = void 0;
const logger_1 = require("../utils/logger");
const User_model_1 = require("../models/User.model");
const Charity_model_1 = require("../models/Charity.model");
const xeroIntegrationService_1 = require("./xeroIntegrationService");
const myobIntegrationService_1 = require("./myobIntegrationService");
const irdComplianceService_1 = require("./irdComplianceService");
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["XERO"] = "xero";
    IntegrationType["MYOB"] = "myob";
    IntegrationType["BOTH"] = "both";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
class AccountingIntegrationService {
    userSettings = new Map();
    /**
     * Initialize integration for a user
     */
    async initializeIntegration(userId, integrationType, authCode) {
        try {
            const settings = {
                userId,
                integrationType,
                autoSync: true,
                syncReceipts: true,
                syncFees: true,
                syncErrors: []
            };
            // Exchange auth codes for tokens
            if (integrationType === IntegrationType.XERO || integrationType === IntegrationType.BOTH) {
                settings.xeroTokens = await xeroIntegrationService_1.xeroIntegrationService.exchangeCodeForTokens(authCode);
            }
            if (integrationType === IntegrationType.MYOB || integrationType === IntegrationType.BOTH) {
                settings.myobTokens = await myobIntegrationService_1.myobIntegrationService.exchangeCodeForTokens(authCode);
            }
            // Store settings (in production, this would be in database)
            this.userSettings.set(userId, settings);
            // Sync user contact information
            const user = await User_model_1.User.findByPk(userId);
            if (user) {
                await this.syncUserContact(user, settings);
            }
            logger_1.logger.info(`Integration initialized for user ${userId}`, { integrationType });
            return settings;
        }
        catch (error) {
            logger_1.logger.error('Integration initialization error:', error);
            throw new Error('Failed to initialize accounting integration');
        }
    }
    /**
     * Process a single donation across all enabled integrations
     */
    async processDonation(donation) {
        try {
            const settings = this.userSettings.get(donation.userId);
            if (!settings || !settings.autoSync) {
                return;
            }
            const [user, charity] = await Promise.all([
                User_model_1.User.findByPk(donation.userId),
                Charity_model_1.Charity.findByPk(donation.charityId)
            ]);
            if (!user || !charity) {
                throw new Error('User or charity not found');
            }
            // Generate IRD-compliant receipt data first
            const receiptData = await irdComplianceService_1.irdComplianceService.generateIRDReceiptData(donation.id, donation.userId, donation.charityId, donation.amount);
            const syncPromises = [];
            // Sync to Xero if enabled
            if (settings.xeroTokens && (settings.integrationType === IntegrationType.XERO || settings.integrationType === IntegrationType.BOTH)) {
                syncPromises.push(this.syncToXero(donation, user, charity, settings.xeroTokens, settings));
            }
            // Sync to MYOB if enabled
            if (settings.myobTokens && (settings.integrationType === IntegrationType.MYOB || settings.integrationType === IntegrationType.BOTH)) {
                syncPromises.push(this.syncToMYOB(donation, user, charity, settings.myobTokens, settings));
            }
            // Execute all syncs in parallel
            const results = await Promise.allSettled(syncPromises);
            // Log any errors but don't fail the donation
            results.forEach((result, index) => {
                if (result.status === 'rejected') {
                    const integration = index === 0 ? 'Xero' : 'MYOB';
                    logger_1.logger.error(`${integration} sync failed for donation ${donation.id}:`, result.reason);
                    settings.syncErrors = settings.syncErrors || [];
                    settings.syncErrors.push(`${integration}: ${result.reason.message}`);
                }
            });
            // Update last sync date
            settings.lastSyncDate = new Date();
            this.userSettings.set(donation.userId, settings);
            logger_1.logger.info(`Donation ${donation.id} processed for accounting integration`, {
                userId: donation.userId,
                amount: donation.amount,
                charity: charity.name,
                integrations: settings.integrationType
            });
        }
        catch (error) {
            logger_1.logger.error('Donation processing error:', error);
            throw error;
        }
    }
    /**
     * Sync donation to Xero
     */
    async syncToXero(donation, user, charity, tokens, settings) {
        try {
            // Create donation entry
            await xeroIntegrationService_1.xeroIntegrationService.createDonationEntry(donation, user, charity, tokens);
            // Create platform fee entry if enabled
            if (settings.syncFees) {
                const platformFee = donation.amount * 0.015; // 1.5% fee
                if (platformFee > 0) {
                    await xeroIntegrationService_1.xeroIntegrationService.createPlatformFeeEntry(donation, platformFee, tokens);
                }
            }
            logger_1.logger.info(`Donation ${donation.id} synced to Xero successfully`);
        }
        catch (error) {
            logger_1.logger.error(`Xero sync failed for donation ${donation.id}:`, error);
            throw error;
        }
    }
    /**
     * Sync donation to MYOB
     */
    async syncToMYOB(donation, user, charity, tokens, settings) {
        try {
            // Create donation entry
            await myobIntegrationService_1.myobIntegrationService.createDonationEntry(donation, user, charity, tokens);
            // Create platform fee entry if enabled
            if (settings.syncFees) {
                const platformFee = donation.amount * 0.015; // 1.5% fee
                if (platformFee > 0) {
                    await myobIntegrationService_1.myobIntegrationService.createPlatformFeeEntry(donation, platformFee, tokens);
                }
            }
            logger_1.logger.info(`Donation ${donation.id} synced to MYOB successfully`);
        }
        catch (error) {
            logger_1.logger.error(`MYOB sync failed for donation ${donation.id}:`, error);
            throw error;
        }
    }
    /**
     * Sync user contact information
     */
    async syncUserContact(user, settings) {
        try {
            const syncPromises = [];
            if (settings.xeroTokens) {
                syncPromises.push(xeroIntegrationService_1.xeroIntegrationService.syncContact(user, settings.xeroTokens));
            }
            if (settings.myobTokens) {
                syncPromises.push(myobIntegrationService_1.myobIntegrationService.syncCustomer(user, settings.myobTokens));
            }
            await Promise.all(syncPromises);
            logger_1.logger.info(`Contact synced for user ${user.id}`);
        }
        catch (error) {
            logger_1.logger.error('Contact sync error:', error);
            throw error;
        }
    }
    /**
     * Get integration status for a user
     */
    getIntegrationStatus(userId) {
        return this.userSettings.get(userId) || null;
    }
    /**
     * Update integration settings
     */
    updateIntegrationSettings(userId, updates) {
        const current = this.userSettings.get(userId);
        if (!current) {
            throw new Error('Integration not found for user');
        }
        const updated = { ...current, ...updates };
        this.userSettings.set(userId, updated);
        logger_1.logger.info(`Integration settings updated for user ${userId}`, updates);
        return updated;
    }
    /**
     * Disconnect integration
     */
    disconnectIntegration(userId, integrationType) {
        const settings = this.userSettings.get(userId);
        if (!settings) {
            return;
        }
        if (!integrationType || integrationType === IntegrationType.XERO) {
            delete settings.xeroTokens;
        }
        if (!integrationType || integrationType === IntegrationType.MYOB) {
            delete settings.myobTokens;
        }
        // If no tokens remain, remove entirely
        if (!settings.xeroTokens && !settings.myobTokens) {
            this.userSettings.delete(userId);
            logger_1.logger.info(`All integrations disconnected for user ${userId}`);
        }
        else {
            this.userSettings.set(userId, settings);
            logger_1.logger.info(`${integrationType} integration disconnected for user ${userId}`);
        }
    }
    /**
     * Bulk process multiple donations
     */
    async bulkProcessDonations(donations) {
        try {
            // Group donations by user for efficiency
            const donationsByUser = donations.reduce((acc, donation) => {
                if (!acc[donation.userId]) {
                    acc[donation.userId] = [];
                }
                acc[donation.userId].push(donation);
                return acc;
            }, {});
            // Process each user's donations
            for (const [userId, userDonations] of Object.entries(donationsByUser)) {
                const settings = this.userSettings.get(userId);
                if (!settings || !settings.autoSync) {
                    continue;
                }
                try {
                    // Process donations in batches to avoid rate limits
                    const batchSize = 10;
                    for (let i = 0; i < userDonations.length; i += batchSize) {
                        const batch = userDonations.slice(i, i + batchSize);
                        await Promise.all(batch.map(donation => this.processDonation(donation)));
                        // Wait between batches
                        if (i + batchSize < userDonations.length) {
                            await new Promise(resolve => setTimeout(resolve, 1000));
                        }
                    }
                }
                catch (error) {
                    logger_1.logger.error(`Bulk processing failed for user ${userId}:`, error);
                }
            }
            logger_1.logger.info(`Bulk processed ${donations.length} donations across ${Object.keys(donationsByUser).length} users`);
        }
        catch (error) {
            logger_1.logger.error('Bulk donation processing error:', error);
            throw error;
        }
    }
    /**
     * Get integration URLs for user setup
     */
    getIntegrationUrls(userId) {
        return {
            xero: xeroIntegrationService_1.xeroIntegrationService.getAuthorizationUrl(userId),
            myob: myobIntegrationService_1.myobIntegrationService.getAuthorizationUrl(userId)
        };
    }
    /**
     * Validate all user integrations
     */
    async validateIntegrations() {
        const results = new Map();
        for (const [userId, settings] of this.userSettings.entries()) {
            const validation = { xero: true, myob: true };
            if (settings.xeroTokens) {
                validation.xero = await xeroIntegrationService_1.xeroIntegrationService.validateConnection(settings.xeroTokens);
            }
            if (settings.myobTokens) {
                validation.myob = await myobIntegrationService_1.myobIntegrationService.validateConnection(settings.myobTokens);
            }
            results.set(userId, validation);
        }
        return results;
    }
}
exports.AccountingIntegrationService = AccountingIntegrationService;
exports.accountingIntegrationService = new AccountingIntegrationService();
//# sourceMappingURL=accountingIntegrationService.js.map
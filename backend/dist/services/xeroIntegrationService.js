"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.xeroIntegrationService = exports.XeroIntegrationService = void 0;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
const User_model_1 = require("../models/User.model");
const Charity_model_1 = require("../models/Charity.model");
class XeroIntegrationService {
    clientId;
    clientSecret;
    redirectUri;
    baseUrl = 'https://api.xero.com/api.xro/2.0';
    authUrl = 'https://identity.xero.com/connect/authorize';
    tokenUrl = 'https://identity.xero.com/connect/token';
    constructor() {
        this.clientId = process.env.XERO_CLIENT_ID || '';
        this.clientSecret = process.env.XERO_CLIENT_SECRET || '';
        this.redirectUri = process.env.XERO_REDIRECT_URI || 'http://localhost:3000/integrations/xero/callback';
        if (!this.clientId || !this.clientSecret) {
            logger_1.logger.warn('Xero credentials not configured - integration disabled');
        }
    }
    /**
     * Generate Xero OAuth authorization URL
     */
    getAuthorizationUrl(userId, state) {
        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            scope: 'accounting.transactions accounting.contacts accounting.settings',
            state: state || userId
        });
        return `${this.authUrl}?${params.toString()}`;
    }
    /**
     * Exchange authorization code for access tokens
     */
    async exchangeCodeForTokens(code) {
        try {
            const response = await axios_1.default.post(this.tokenUrl, {
                grant_type: 'authorization_code',
                code,
                redirect_uri: this.redirectUri,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const data = response.data;
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000),
                tenantId: data.tenant_id
            };
        }
        catch (error) {
            logger_1.logger.error('Xero token exchange error:', error);
            throw new Error('Failed to authenticate with Xero');
        }
    }
    /**
     * Refresh access tokens
     */
    async refreshAccessToken(refreshToken) {
        try {
            const response = await axios_1.default.post(this.tokenUrl, {
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: this.clientId,
                client_secret: this.clientSecret
            }, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
            const data = response.data;
            return {
                accessToken: data.access_token,
                refreshToken: data.refresh_token,
                expiresAt: new Date(Date.now() + data.expires_in * 1000),
                tenantId: data.tenant_id
            };
        }
        catch (error) {
            logger_1.logger.error('Xero token refresh error:', error);
            throw new Error('Failed to refresh Xero tokens');
        }
    }
    /**
     * Create or update contact in Xero
     */
    async syncContact(user, tokens) {
        try {
            const contact = {
                name: user.companyName,
                emailAddress: user.email,
                taxNumber: user.taxId,
                accountNumber: user.id.slice(0, 8)
            };
            const response = await this.makeXeroRequest('PUT', '/Contacts', tokens, { Contacts: [contact] });
            return response.data.Contacts[0].ContactID;
        }
        catch (error) {
            logger_1.logger.error('Xero contact sync error:', error);
            throw new Error('Failed to sync contact with Xero');
        }
    }
    /**
     * Create donation entry in Xero as a journal entry
     */
    async createDonationEntry(donation, user, charity, tokens) {
        try {
            // Create journal entry for the donation
            const journalLines = [
                {
                    AccountCode: '1200', // Bank account (asset)
                    Description: `Donation to ${charity.name}`,
                    NetAmount: donation.amount
                },
                {
                    AccountCode: '4000', // Donation income
                    Description: `Donation from ${user.companyName}`,
                    NetAmount: -donation.amount
                }
            ];
            const manualJournal = {
                Narration: `Donation processed through Isbjorn Platform - Receipt: ${donation.id}`,
                JournalLines: journalLines,
                Date: donation.createdAt.toISOString().split('T')[0],
                Reference: `DONATION-${donation.id.slice(-8)}`
            };
            const response = await this.makeXeroRequest('PUT', '/ManualJournals', tokens, { ManualJournals: [manualJournal] });
            logger_1.logger.info(`Donation ${donation.id} synced to Xero`, {
                xeroJournalId: response.data.ManualJournals[0].ManualJournalID,
                amount: donation.amount,
                charity: charity.name
            });
            return response.data.ManualJournals[0].ManualJournalID;
        }
        catch (error) {
            logger_1.logger.error('Xero donation entry error:', error);
            throw new Error('Failed to create donation entry in Xero');
        }
    }
    /**
     * Create expense entry for platform fee
     */
    async createPlatformFeeEntry(donation, platformFee, tokens) {
        try {
            const journalLines = [
                {
                    AccountCode: '6000', // Platform fee expense
                    Description: 'Isbjorn Platform Fee',
                    NetAmount: platformFee
                },
                {
                    AccountCode: '1200', // Bank account reduction
                    Description: 'Platform fee deduction',
                    NetAmount: -platformFee
                }
            ];
            const manualJournal = {
                Narration: `Platform fee for donation ${donation.id}`,
                JournalLines: journalLines,
                Date: donation.createdAt.toISOString().split('T')[0],
                Reference: `FEE-${donation.id.slice(-8)}`
            };
            const response = await this.makeXeroRequest('PUT', '/ManualJournals', tokens, { ManualJournals: [manualJournal] });
            return response.data.ManualJournals[0].ManualJournalID;
        }
        catch (error) {
            logger_1.logger.error('Xero platform fee entry error:', error);
            throw new Error('Failed to create platform fee entry in Xero');
        }
    }
    /**
     * Get Xero organisation details
     */
    async getOrganisation(tokens) {
        try {
            const response = await this.makeXeroRequest('GET', '/Organisation', tokens);
            return response.data.Organisations[0];
        }
        catch (error) {
            logger_1.logger.error('Xero organisation fetch error:', error);
            throw new Error('Failed to fetch organisation details from Xero');
        }
    }
    /**
     * Get chart of accounts
     */
    async getChartOfAccounts(tokens) {
        try {
            const response = await this.makeXeroRequest('GET', '/Accounts', tokens);
            return response.data.Accounts;
        }
        catch (error) {
            logger_1.logger.error('Xero chart of accounts fetch error:', error);
            throw new Error('Failed to fetch chart of accounts from Xero');
        }
    }
    /**
     * Bulk sync multiple donations
     */
    async bulkSyncDonations(donations, userTokens) {
        try {
            for (const donation of donations) {
                const tokens = userTokens.get(donation.userId);
                if (!tokens) {
                    logger_1.logger.warn(`No Xero tokens found for user ${donation.userId}`);
                    continue;
                }
                const [user, charity] = await Promise.all([
                    User_model_1.User.findByPk(donation.userId),
                    Charity_model_1.Charity.findByPk(donation.charityId)
                ]);
                if (user && charity) {
                    await this.createDonationEntry(donation, user, charity, tokens);
                    // Add platform fee entry if applicable
                    const platformFee = donation.amount * 0.015; // 1.5% platform fee
                    if (platformFee > 0) {
                        await this.createPlatformFeeEntry(donation, platformFee, tokens);
                    }
                }
                // Rate limiting - don't overwhelm Xero API
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
        catch (error) {
            logger_1.logger.error('Bulk sync error:', error);
            throw error;
        }
    }
    /**
     * Make authenticated request to Xero API
     */
    async makeXeroRequest(method, endpoint, tokens, data) {
        try {
            // Check if token needs refresh
            if (tokens.expiresAt < new Date()) {
                tokens = await this.refreshAccessToken(tokens.refreshToken);
            }
            const config = {
                method,
                url: `${this.baseUrl}${endpoint}`,
                headers: {
                    'Authorization': `Bearer ${tokens.accessToken}`,
                    'Xero-Tenant-Id': tokens.tenantId,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data
            };
            const response = await (0, axios_1.default)(config);
            return response;
        }
        catch (error) {
            logger_1.logger.error(`Xero API request error (${method} ${endpoint}):`, error);
            throw error;
        }
    }
    /**
     * Validate Xero connection
     */
    async validateConnection(tokens) {
        try {
            await this.getOrganisation(tokens);
            return true;
        }
        catch (error) {
            return false;
        }
    }
}
exports.XeroIntegrationService = XeroIntegrationService;
exports.xeroIntegrationService = new XeroIntegrationService();
//# sourceMappingURL=xeroIntegrationService.js.map
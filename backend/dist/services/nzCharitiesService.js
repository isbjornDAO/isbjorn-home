"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NZCharitiesService = void 0;
const axios_1 = __importDefault(require("axios"));
const Charity_model_1 = require("../models/Charity.model");
const logger_1 = require("../utils/logger");
class NZCharitiesService {
    baseUrl = 'https://api.charities.govt.nz/v1';
    apiKey;
    rateLimitDelay = 1000;
    lastRequestTime = 0;
    isProduction;
    constructor() {
        this.apiKey = process.env.NZ_CHARITIES_API_KEY || '';
        this.isProduction = process.env.NODE_ENV === 'production';
        if (!this.apiKey) {
            if (this.isProduction) {
                logger_1.logger.error('NZ Charities API key not configured in production - real lookups will fail');
            }
            else {
                logger_1.logger.warn('NZ Charities API key not configured - using mock data for development');
            }
        }
    }
    /**
     * Real-time charity verification for dropdown population
     */
    async verifyCharity(charityName) {
        try {
            await this.enforceRateLimit();
            if (!this.apiKey) {
                if (this.isProduction) {
                    throw new Error('NZ_CHARITIES_API_KEY is required in production');
                }
                return this.getMockCharityVerification(charityName);
            }
            const response = await axios_1.default.get(`${this.baseUrl}/charities/search`, {
                params: { name: charityName },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000, // Fast verification for real-time use
            });
            const charities = response.data.results;
            if (!charities || charities.length === 0) {
                return null;
            }
            const charity = charities[0];
            return {
                legalName: charity.legalName,
                diaNumber: charity.registrationNumber,
                irdNumber: charity.irdNumber,
                doneeStatus: charity.doneeOrganisationStatus,
                isVerified: charity.registrationStatus === 'Registered',
            };
        }
        catch (error) {
            logger_1.logger.error(`Error verifying charity ${charityName}:`, error);
            return null;
        }
    }
    /**
     * Get all pre-verified donee organisations for dropdown
     */
    async getVerifiedDoneeOrganisations() {
        try {
            // Check cache first
            const cachedCharities = await Charity_model_1.Charity.findAll({
                where: {
                    isDoneeOrganisation: true,
                    isActive: true,
                    verificationStatus: 'verified',
                },
                attributes: [
                    'id', 'name', 'legalName', 'category',
                    'diaCharitiesNumber', 'irdNumber', 'doneeOrganisationNumber'
                ],
                order: [['name', 'ASC']],
            });
            if (cachedCharities.length > 0) {
                return cachedCharities.map(charity => ({
                    id: charity.id,
                    name: charity.name,
                    legalName: charity.legalName,
                    category: charity.category,
                    diaNumber: charity.diaCharitiesNumber,
                    irdNumber: charity.irdNumber,
                    doneeOrganisationNumber: charity.doneeOrganisationNumber,
                }));
            }
            // If no cached data, populate from API
            await this.refreshDoneeOrganisationsList();
            // Return updated list
            const refreshedCharities = await Charity_model_1.Charity.findAll({
                where: {
                    isDoneeOrganisation: true,
                    isActive: true,
                    verificationStatus: 'verified',
                },
                attributes: [
                    'id', 'name', 'legalName', 'category',
                    'diaCharitiesNumber', 'irdNumber', 'doneeOrganisationNumber'
                ],
                order: [['name', 'ASC']],
            });
            return refreshedCharities.map(charity => ({
                id: charity.id,
                name: charity.name,
                legalName: charity.legalName,
                category: charity.category,
                diaNumber: charity.diaCharitiesNumber,
                irdNumber: charity.irdNumber,
                doneeOrganisationNumber: charity.doneeOrganisationNumber,
            }));
        }
        catch (error) {
            logger_1.logger.error('Error getting verified donee organisations:', error);
            return [];
        }
    }
    /**
     * Verify charity is legitimate donee organisation for IRD compliance
     */
    async verifyDoneeOrganisationStatus(diaCharitiesNumber) {
        try {
            await this.enforceRateLimit();
            if (!this.apiKey) {
                if (this.isProduction) {
                    throw new Error('NZ_CHARITIES_API_KEY is required in production');
                }
                return {
                    isDoneeOrganisation: true,
                    doneeOrganisationNumber: 'MOCK-123456',
                    taxDeductibleStatus: true,
                    lastVerified: new Date().toISOString(),
                };
            }
            const response = await axios_1.default.get(`${this.baseUrl}/charities/${diaCharitiesNumber}/donee-status`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            return response.data;
        }
        catch (error) {
            logger_1.logger.error(`Error verifying donee status for ${diaCharitiesNumber}:`, error);
            return {
                isDoneeOrganisation: false,
                taxDeductibleStatus: false,
                lastVerified: new Date().toISOString(),
            };
        }
    }
    /**
     * Auto-populate charity details for onboarding
     */
    async lookupCharityDetails(diaCharitiesNumber) {
        try {
            await this.enforceRateLimit();
            if (!this.apiKey) {
                if (this.isProduction) {
                    throw new Error('NZ_CHARITIES_API_KEY is required in production');
                }
                return this.getMockCharityData(diaCharitiesNumber);
            }
            const response = await axios_1.default.get(`${this.baseUrl}/charities/${diaCharitiesNumber}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            const charityData = response.data;
            return await this.createOrUpdateCharity(charityData);
        }
        catch (error) {
            logger_1.logger.error(`Error looking up charity ${diaCharitiesNumber}:`, error);
            // Fallback to existing record
            const existingCharity = await Charity_model_1.Charity.findOne({
                where: { diaCharitiesNumber }
            });
            return existingCharity;
        }
    }
    /**
     * Refresh the list of all donee organisations (daily cron job)
     */
    async refreshDoneeOrganisationsList() {
        try {
            logger_1.logger.info('Starting daily refresh of donee organisations list');
            if (!this.apiKey) {
                await this.createMockDoneeOrganisations();
                return;
            }
            let page = 1;
            let hasMore = true;
            let processedCount = 0;
            while (hasMore) {
                const response = await axios_1.default.get(`${this.baseUrl}/charities/donee-organisations`, {
                    params: {
                        page,
                        pageSize: 100,
                        status: 'active'
                    },
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                    timeout: 30000,
                });
                const { results, pagination } = response.data;
                for (const charity of results) {
                    await this.createOrUpdateCharity(charity);
                    processedCount++;
                }
                hasMore = pagination.hasNextPage;
                page++;
                // Rate limiting for bulk operations
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
            logger_1.logger.info(`Donee organisations refresh completed. Processed ${processedCount} charities.`);
        }
        catch (error) {
            logger_1.logger.error('Error refreshing donee organisations list:', error);
        }
    }
    /**
     * Quick charity lookup by name for real-time search
     */
    async searchCharitiesByName(query, limit = 10) {
        try {
            // Search local database first (fastest)
            const localResults = await Charity_model_1.Charity.findAll({
                where: {
                    name: { [require('sequelize').Op.iLike]: `%${query}%` },
                    isActive: true,
                },
                attributes: ['id', 'name', 'legalName', 'category', 'isDoneeOrganisation'],
                limit,
                order: [['name', 'ASC']],
            });
            if (localResults.length > 0) {
                return localResults.map(charity => ({
                    id: charity.id,
                    name: charity.name,
                    legalName: charity.legalName,
                    category: charity.category,
                    isDoneeOrganisation: charity.isDoneeOrganisation,
                }));
            }
            // If no local results, search API
            if (!this.apiKey) {
                if (this.isProduction) {
                    throw new Error('NZ_CHARITIES_API_KEY is required in production');
                }
                return this.getMockSearchResults(query, limit);
            }
            await this.enforceRateLimit();
            const response = await axios_1.default.get(`${this.baseUrl}/charities/search`, {
                params: {
                    name: query,
                    limit,
                    doneeOrganisationsOnly: true
                },
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 5000,
            });
            const results = response.data.results || [];
            return results.map((charity) => ({
                id: charity.registrationNumber,
                name: charity.charityName,
                legalName: charity.legalName,
                category: charity.category,
                isDoneeOrganisation: charity.doneeOrganisationStatus,
            }));
        }
        catch (error) {
            logger_1.logger.error(`Error searching charities for "${query}":`, error);
            return [];
        }
    }
    // Private helper methods
    async enforceRateLimit() {
        const now = Date.now();
        const timeSinceLastRequest = now - this.lastRequestTime;
        if (timeSinceLastRequest < this.rateLimitDelay) {
            await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest));
        }
        this.lastRequestTime = Date.now();
    }
    async createOrUpdateCharity(data) {
        const charityData = {
            charityNumber: data.registrationNumber.substring(0, 8), // Legacy field
            diaCharitiesNumber: data.registrationNumber,
            name: data.charityName,
            legalName: data.legalName,
            description: `${data.category} charity focused on ${data.purposes.join(', ')}`,
            category: this.mapCharityCategory(data.category),
            website: data.website,
            email: data.email,
            phone: data.phone,
            address: {
                street: data.address.street,
                suburb: data.address.suburb,
                city: data.address.city,
                region: data.address.region,
                postcode: data.address.postcode,
            },
            bankAccount: '00-0000-0000000-000', // Would need separate API or manual input
            irdNumber: data.irdNumber,
            taxDeductible: data.doneeOrganisationStatus,
            isDoneeOrganisation: data.doneeOrganisationStatus,
            doneeOrganisationNumber: data.doneeOrganisationNumber,
            verificationStatus: 'verified',
            platformFeeRate: 0.015, // 1.5%
            totalReceived: 0,
            donationCount: 0,
            isActive: data.registrationStatus === 'Registered',
            onboardedAt: new Date(),
            compliance: {
                irdVerified: !!data.irdNumber,
                charitiesRegisterVerified: true,
                doneeOrganisationVerified: data.doneeOrganisationStatus,
                reportingStatus: 'compliant',
                lastComplianceCheck: new Date(),
                autoComplianceReady: !!data.irdNumber && data.doneeOrganisationStatus,
            },
        };
        const [charity] = await Charity_model_1.Charity.upsert(charityData, {
            returning: true,
        });
        return charity;
    }
    mapCharityCategory(category) {
        const mapping = {
            'Health and Disability': 'Health',
            'Education and Training': 'Education',
            'Environment': 'Environment',
            'Social Services': 'Social Services',
            'Culture and Arts': 'Arts & Culture',
            'Animal Welfare': 'Animal Welfare',
            'Community Development': 'Community Development',
            'Religious Activities': 'Religion',
            'Sports and Recreation': 'Sports & Recreation',
            'Emergency Relief': 'Emergency Relief',
            'International Activities': 'International Aid',
            'Research': 'Research',
        };
        return mapping[category] || 'Community Development';
    }
    // Mock data methods for development
    async getMockCharityVerification(charityName) {
        return {
            legalName: `${charityName} (Mock)`,
            diaNumber: 'MOCK123456',
            irdNumber: '123456789',
            doneeStatus: true,
            isVerified: true,
        };
    }
    async getMockCharityData(diaCharitiesNumber) {
        const mockData = {
            charityNumber: diaCharitiesNumber.substring(0, 8),
            diaCharitiesNumber,
            name: `Mock Charity ${diaCharitiesNumber}`,
            legalName: `Mock Charity ${diaCharitiesNumber} Trust`,
            description: 'Mock charity for development purposes',
            category: 'Health',
            email: 'mock@charity.org.nz',
            address: {
                street: '123 Charity Street',
                city: 'Wellington',
                region: 'Wellington',
                postcode: '6011',
            },
            bankAccount: '12-1234-1234567-123',
            irdNumber: '123456789',
            taxDeductible: true,
            isDoneeOrganisation: true,
            doneeOrganisationNumber: 'DONEE-123456',
            verificationStatus: 'verified',
            platformFeeRate: 0.015,
            totalReceived: 0,
            donationCount: 0,
            isActive: true,
            onboardedAt: new Date(),
            compliance: {
                irdVerified: true,
                charitiesRegisterVerified: true,
                doneeOrganisationVerified: true,
                reportingStatus: 'compliant',
                lastComplianceCheck: new Date(),
                autoComplianceReady: true,
            },
        };
        const [charity] = await Charity_model_1.Charity.upsert(mockData, {
            returning: true,
        });
        return charity;
    }
    async createMockDoneeOrganisations() {
        const mockCharities = [
            {
                name: 'Auckland City Mission',
                legalName: 'Auckland City Mission Trust',
                category: 'Social Services',
                diaCharitiesNumber: 'CC10001',
            },
            {
                name: 'Forest & Bird',
                legalName: 'Royal Forest and Bird Protection Society of New Zealand Incorporated',
                category: 'Environment',
                diaCharitiesNumber: 'CC10002',
            },
            {
                name: 'Salvation Army',
                legalName: 'The Salvation Army New Zealand Trust',
                category: 'Social Services',
                diaCharitiesNumber: 'CC10003',
            },
            {
                name: 'SPCA',
                legalName: 'Royal New Zealand Society for the Prevention of Cruelty to Animals Incorporated',
                category: 'Animal Welfare',
                diaCharitiesNumber: 'CC10004',
            },
            {
                name: 'Red Cross',
                legalName: 'New Zealand Red Cross Incorporated',
                category: 'Emergency Relief',
                diaCharitiesNumber: 'CC10005',
            },
        ];
        for (const mockCharity of mockCharities) {
            await this.getMockCharityData(mockCharity.diaCharitiesNumber);
        }
    }
    getMockSearchResults(query, limit) {
        const mockResults = [
            {
                id: 'CC10001',
                name: 'Auckland City Mission',
                legalName: 'Auckland City Mission Trust',
                category: 'Social Services',
                isDoneeOrganisation: true,
            },
            {
                id: 'CC10002',
                name: 'Forest & Bird',
                legalName: 'Royal Forest and Bird Protection Society of New Zealand Incorporated',
                category: 'Environment',
                isDoneeOrganisation: true,
            },
        ].filter(charity => charity.name.toLowerCase().includes(query.toLowerCase())).slice(0, limit);
        return mockResults;
    }
}
exports.NZCharitiesService = NZCharitiesService;
exports.default = NZCharitiesService;
//# sourceMappingURL=nzCharitiesService.js.map
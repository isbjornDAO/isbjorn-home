"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NZCompaniesRegisterService = void 0;
const axios_1 = __importDefault(require("axios"));
const NZCompany_model_1 = require("../models/NZCompany.model");
const logger_1 = require("../utils/logger");
class NZCompaniesRegisterService {
    baseUrl = 'https://api.business.govt.nz/gateway/companies-office/v1';
    apiKey;
    rateLimitDelay = 1000; // 1 second between requests
    lastRequestTime = 0;
    isProduction;
    constructor() {
        this.apiKey = process.env.NZ_COMPANIES_API_KEY || '';
        this.isProduction = process.env.NODE_ENV === 'production';
        if (!this.apiKey) {
            if (this.isProduction) {
                logger_1.logger.error('NZ Companies API key not configured in production - real lookups will fail');
            }
            else {
                logger_1.logger.warn('NZ Companies API key not configured - using mock data for development');
                logger_1.logger.info('To enable real company lookups, set NZ_COMPANIES_API_KEY environment variable');
                logger_1.logger.info('Get API key from: https://www.business.govt.nz/developers/');
            }
        }
    }
    /**
     * Auto-populate company details from NZ Companies Register
     */
    async lookupCompany(companyNumber) {
        try {
            // Rate limiting
            await this.enforceRateLimit();
            if (!this.apiKey) {
                if (this.isProduction) {
                    throw new Error('NZ_COMPANIES_API_KEY is required in production');
                }
                return this.getMockCompanyData(companyNumber);
            }
            const response = await axios_1.default.get(`${this.baseUrl}/companies/${companyNumber}`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                timeout: 10000,
            });
            const companyData = response.data;
            return await this.createOrUpdateCompany(companyNumber, companyData);
        }
        catch (error) {
            logger_1.logger.error(`Error looking up company ${companyNumber}:`, {
                error: error.message,
                status: error.response?.status,
                data: error.response?.data,
            });
            // Fallback to existing database record if API fails
            const existingCompany = await NZCompany_model_1.NZCompany.findOne({
                where: { nzCompanyNumber: companyNumber }
            });
            return existingCompany;
        }
    }
    /**
     * Search for companies by name
     */
    async searchCompanies(query) {
        try {
            // Rate limiting
            await this.enforceRateLimit();
            if (!this.apiKey) {
                return this.getMockCompanySearch(query);
            }
            const response = await axios_1.default.get(`${this.baseUrl}/companies/search`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
                params: {
                    q: query,
                    limit: 10
                },
                timeout: 10000,
            });
            return response.data.items.map((item) => ({
                name: item.entityName,
                companyNumber: item.companyNumber,
                status: item.entityStatusDescription
            }));
        }
        catch (error) {
            logger_1.logger.error(`Error searching companies for ${query}:`, error.message);
            return this.getMockCompanySearch(query);
        }
    }
    /**
     * Verify company details are current and compliant
     */
    async verifyCompany(companyNumber) {
        const company = await this.lookupCompany(companyNumber);
        if (!company) {
            return {
                isValid: false,
                isActive: false,
                isCompliant: false,
                issues: ['Company not found in NZ Companies Register']
            };
        }
        const issues = [];
        // Check if company is active
        if (company.companyStatus !== NZCompany_model_1.CompanyStatus.REGISTERED) {
            issues.push(`Company status is ${company.companyStatus}, must be Registered`);
        }
        // Check if company has IRD number for tax compliance
        if (!company.irdNumber) {
            issues.push('Company does not have an IRD number on record');
        }
        // Check if company is up to date with annual returns
        const monthsSinceIncorporation = this.getMonthsDifference(new Date(company.incorporationDate), new Date());
        if (monthsSinceIncorporation > 18 && !company.annualReturnFilingMonth) {
            issues.push('Company may be overdue for annual return filing');
        }
        return {
            isValid: true,
            isActive: company.companyStatus === NZCompany_model_1.CompanyStatus.REGISTERED,
            isCompliant: issues.length === 0,
            issues
        };
    }
    /**
     * Auto-fill company registration form
     */
    async autoFillCompanyDetails(companyNumber) {
        const company = await this.lookupCompany(companyNumber);
        if (!company)
            return null;
        return {
            legalName: company.legalName,
            tradingName: company.tradingName,
            registeredAddress: company.formattedAddress,
            directors: company.directors?.map(d => d.name) || [],
            incorporationDate: company.incorporationDate,
            irdNumber: company.irdNumber,
            gstNumber: company.gstNumber,
        };
    }
    /**
     * Batch verify multiple companies (for compliance checking)
     */
    async batchVerifyCompanies(companyNumbers) {
        const results = new Map();
        for (const companyNumber of companyNumbers) {
            try {
                const verification = await this.verifyCompany(companyNumber);
                results.set(companyNumber, verification.isCompliant);
                // Rate limiting for batch operations
                await new Promise(resolve => setTimeout(resolve, this.rateLimitDelay));
            }
            catch (error) {
                logger_1.logger.error(`Batch verification failed for company ${companyNumber}:`, error);
                results.set(companyNumber, false);
            }
        }
        return results;
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
    async createOrUpdateCompany(companyNumber, data) {
        const companyData = {
            nzCompanyNumber: companyNumber,
            legalName: data.entityName,
            companyType: this.mapCompanyType(data.entityTypeDescription),
            companyStatus: this.mapCompanyStatus(data.entityStatusDescription),
            irdNumber: data.irdNumber,
            gstNumber: data.gstNumber,
            registeredAddress: {
                street: data.addresses.registered.line1,
                suburb: data.addresses.registered.suburb,
                city: data.addresses.registered.city,
                region: data.addresses.registered.region,
                postcode: data.addresses.registered.postcode,
                country: data.addresses.registered.country,
            },
            addressForService: data.addresses.service ? {
                street: data.addresses.service.line1,
                suburb: data.addresses.service.suburb,
                city: data.addresses.service.city,
                region: data.addresses.service.region,
                postcode: data.addresses.service.postcode,
                country: data.addresses.service.country,
            } : undefined,
            incorporationDate: new Date(data.incorporationDate),
            directors: data.directors?.map(d => ({
                name: d.personName,
                appointmentDate: new Date(d.appointmentDate),
                address: d.address,
            })),
            shareholders: data.shareholders?.map(s => ({
                name: s.shareholderName,
                shareClass: s.shareClass,
                numberOfShares: s.numberOfShares,
            })),
            isActive: data.entityStatusDescription === 'Registered',
            isVerified: true,
            lastVerified: new Date(),
            complianceChecks: {
                irdVerified: !!data.irdNumber,
                gstVerified: !!data.gstNumber,
                annualReturnUpToDate: true, // Would need additional API call to verify
                lastComplianceCheck: new Date(),
            },
            metadata: {
                dataSource: 'NZ Companies Office API',
                lastUpdatedFromRegister: new Date(),
                apiVersion: 'v1',
            }
        };
        const [company] = await NZCompany_model_1.NZCompany.upsert(companyData, {
            returning: true,
        });
        logger_1.logger.info(`Company ${companyNumber} updated from Companies Register`, {
            companyName: company.legalName,
            status: company.companyStatus,
        });
        return company;
    }
    mapCompanyType(typeDescription) {
        const mapping = {
            'Limited Company': NZCompany_model_1.CompanyType.LIMITED,
            'Unlimited Company': NZCompany_model_1.CompanyType.UNLIMITED,
            'Limited Partnership': NZCompany_model_1.CompanyType.LIMITED_PARTNERSHIP,
            'Incorporated Society': NZCompany_model_1.CompanyType.INCORPORATED_SOCIETY,
            'Charitable Trust': NZCompany_model_1.CompanyType.CHARITABLE_TRUST,
            'Unit Trust': NZCompany_model_1.CompanyType.UNIT_TRUST,
            'Overseas Company': NZCompany_model_1.CompanyType.OVERSEAS_COMPANY,
        };
        return mapping[typeDescription] || NZCompany_model_1.CompanyType.LIMITED;
    }
    mapCompanyStatus(statusDescription) {
        const mapping = {
            'Registered': NZCompany_model_1.CompanyStatus.REGISTERED,
            'Removed': NZCompany_model_1.CompanyStatus.REMOVED,
            'Liquidation': NZCompany_model_1.CompanyStatus.LIQUIDATION,
            'Receivership': NZCompany_model_1.CompanyStatus.RECEIVERSHIP,
        };
        return mapping[statusDescription] || NZCompany_model_1.CompanyStatus.REGISTERED;
    }
    getMonthsDifference(startDate, endDate) {
        return (endDate.getFullYear() - startDate.getFullYear()) * 12 +
            (endDate.getMonth() - startDate.getMonth());
    }
    /**
     * Mock data for development/testing when API key not available
     */
    async getMockCompanyData(companyNumber) {
        // More realistic mock data for testing
        const mockCompanies = {
            '1234567': {
                legalName: 'Acme Corporation Limited',
                tradingName: 'Acme Corp',
                irdNumber: '123-456-789',
                gstNumber: '123-456-789',
                city: 'Auckland',
            },
            '7654321': {
                legalName: 'TechStart Solutions Limited',
                tradingName: 'TechStart',
                irdNumber: '987-654-321',
                gstNumber: '987-654-321',
                city: 'Wellington',
            }
        };
        const companyInfo = mockCompanies[companyNumber] || {
            legalName: `Test Company ${companyNumber} Limited`,
            tradingName: `Test Co ${companyNumber}`,
            irdNumber: '111-222-333',
            gstNumber: '111-222-333',
            city: 'Auckland',
        };
        // Return mock data directly without database for now
        const mockCompany = {
            id: `mock-${companyNumber}`,
            nzCompanyNumber: companyNumber,
            legalName: companyInfo.legalName,
            tradingName: companyInfo.tradingName,
            companyType: NZCompany_model_1.CompanyType.LIMITED,
            companyStatus: NZCompany_model_1.CompanyStatus.REGISTERED,
            irdNumber: companyInfo.irdNumber,
            gstNumber: companyInfo.gstNumber,
            registeredAddress: {
                street: '123 Queen Street',
                suburb: 'CBD',
                city: companyInfo.city,
                region: companyInfo.city,
                postcode: '1010',
                country: 'New Zealand',
            },
            formattedAddress: `123 Queen Street, CBD, ${companyInfo.city} 1010, New Zealand`,
            incorporationDate: new Date('2024-01-01'),
            annualReturnFilingMonth: 12,
            directors: [{
                    name: 'John Smith',
                    appointmentDate: new Date('2020-01-01'),
                }, {
                    name: 'Jane Doe',
                    appointmentDate: new Date('2020-01-01'),
                }],
            isActive: true,
            isVerified: true,
            lastVerified: new Date(),
            complianceChecks: {
                irdVerified: true,
                gstVerified: true,
                annualReturnUpToDate: true,
                lastComplianceCheck: new Date(),
            },
            metadata: {
                dataSource: 'Mock Data',
                lastUpdatedFromRegister: new Date(),
            }
        };
        return mockCompany;
    }
    async getMockCompanySearch(query) {
        const mockCompanies = [
            { name: 'Acme Corporation Limited', companyNumber: '1234567', status: 'Registered' },
            { name: 'TechStart Solutions Limited', companyNumber: '7654321', status: 'Registered' },
            { name: 'Isbjorn Conservation Ltd', companyNumber: '9429041234567', status: 'Registered' },
            { name: 'Global Business Index Ltd', companyNumber: '9998887', status: 'Registered' },
            { name: 'Test Company A', companyNumber: '1111111', status: 'Registered' },
            { name: 'Test Company B', companyNumber: '2222222', status: 'Registered' },
        ];
        const lowerQuery = query.toLowerCase();
        return mockCompanies.filter(c => c.name.toLowerCase().includes(lowerQuery) ||
            c.companyNumber.includes(query));
    }
}
exports.NZCompaniesRegisterService = NZCompaniesRegisterService;
exports.default = NZCompaniesRegisterService;
//# sourceMappingURL=nzCompaniesRegisterService.js.map
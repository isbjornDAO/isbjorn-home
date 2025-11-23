import { NZCompany } from '../models/NZCompany.model';
export declare class NZCompaniesRegisterService {
    private baseUrl;
    private apiKey;
    private rateLimitDelay;
    private lastRequestTime;
    private isProduction;
    constructor();
    /**
     * Auto-populate company details from NZ Companies Register
     */
    lookupCompany(companyNumber: string): Promise<NZCompany | null>;
    /**
     * Search for companies by name
     */
    searchCompanies(query: string): Promise<Array<{
        name: string;
        companyNumber: string;
        status: string;
    }>>;
    /**
     * Verify company details are current and compliant
     */
    verifyCompany(companyNumber: string): Promise<{
        isValid: boolean;
        isActive: boolean;
        isCompliant: boolean;
        issues: string[];
    }>;
    /**
     * Auto-fill company registration form
     */
    autoFillCompanyDetails(companyNumber: string): Promise<{
        legalName: string;
        tradingName?: string;
        registeredAddress: string;
        directors: string[];
        incorporationDate: Date;
        irdNumber?: string;
        gstNumber?: string;
    } | null>;
    /**
     * Batch verify multiple companies (for compliance checking)
     */
    batchVerifyCompanies(companyNumbers: string[]): Promise<Map<string, boolean>>;
    private enforceRateLimit;
    private createOrUpdateCompany;
    private mapCompanyType;
    private mapCompanyStatus;
    private getMonthsDifference;
    /**
     * Mock data for development/testing when API key not available
     */
    private getMockCompanyData;
    private getMockCompanySearch;
}
export default NZCompaniesRegisterService;
//# sourceMappingURL=nzCompaniesRegisterService.d.ts.map
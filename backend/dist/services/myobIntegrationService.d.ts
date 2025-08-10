import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { Charity } from '../models/Charity.model';
export interface MYOBAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    companyFileId: string;
    companyFileUri: string;
}
export interface MYOBCustomer {
    UID?: string;
    CompanyName: string;
    LastName?: string;
    FirstName?: string;
    IsIndividual: boolean;
    Addresses: MYOBAddress[];
    Phone1?: string;
    Email?: string;
    ABN?: string;
    TaxCode: {
        UID: string;
        Code: string;
    };
}
export interface MYOBAddress {
    Location: number;
    Street: string;
    City: string;
    State: string;
    PostCode: string;
    Country: string;
}
export interface MYOBGeneralJournal {
    UID?: string;
    Date: string;
    Memo: string;
    IsTaxInclusive: boolean;
    Lines: MYOBJournalLine[];
}
export interface MYOBJournalLine {
    Account: {
        UID: string;
        DisplayID: string;
    };
    Amount: number;
    Memo: string;
    IsCredit: boolean;
    TaxCode: {
        UID: string;
        Code: string;
    };
}
export declare class MYOBIntegrationService {
    private clientId;
    private clientSecret;
    private redirectUri;
    private baseUrl;
    private apiUrl;
    private authUrl;
    private tokenUrl;
    constructor();
    /**
     * Generate MYOB OAuth authorization URL
     */
    getAuthorizationUrl(userId: string, state?: string): string;
    /**
     * Exchange authorization code for access tokens
     */
    exchangeCodeForTokens(code: string): Promise<MYOBAuthTokens>;
    /**
     * Refresh access tokens
     */
    refreshAccessToken(refreshToken: string): Promise<MYOBAuthTokens>;
    /**
     * Get available company files
     */
    getCompanyFiles(accessToken: string): Promise<any[]>;
    /**
     * Create or update customer in MYOB
     */
    syncCustomer(user: User, tokens: MYOBAuthTokens): Promise<string>;
    /**
     * Create donation entry in MYOB as a general journal
     */
    createDonationEntry(donation: Donation, user: User, charity: Charity, tokens: MYOBAuthTokens): Promise<string>;
    /**
     * Create platform fee entry
     */
    createPlatformFeeEntry(donation: Donation, platformFee: number, tokens: MYOBAuthTokens): Promise<string>;
    /**
     * Get chart of accounts
     */
    getChartOfAccounts(tokens: MYOBAuthTokens): Promise<any[]>;
    /**
     * Get company information
     */
    getCompanyInformation(tokens: MYOBAuthTokens): Promise<any>;
    /**
     * Bulk sync multiple donations
     */
    bulkSyncDonations(donations: Donation[], userTokens: Map<string, MYOBAuthTokens>): Promise<void>;
    /**
     * Make authenticated request to MYOB API
     */
    private makeMYOBRequest;
    /**
     * Helper methods to get account UIDs
     */
    private getBankAccountUID;
    private getDonationIncomeAccountUID;
    private getPlatformFeeAccountUID;
    private getDefaultTaxCodeUID;
    /**
     * Validate MYOB connection
     */
    validateConnection(tokens: MYOBAuthTokens): Promise<boolean>;
}
export declare const myobIntegrationService: MYOBIntegrationService;
//# sourceMappingURL=myobIntegrationService.d.ts.map
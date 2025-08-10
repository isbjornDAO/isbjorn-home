import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { Charity } from '../models/Charity.model';
export interface XeroAuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresAt: Date;
    tenantId: string;
}
export interface XeroContact {
    contactID?: string;
    name: string;
    emailAddress?: string;
    taxNumber?: string;
    accountNumber?: string;
}
export interface XeroInvoice {
    invoiceID?: string;
    invoiceNumber: string;
    type: 'ACCREC' | 'ACCPAY';
    contact: XeroContact;
    date: string;
    dueDate: string;
    lineAmountTypes: 'Exclusive' | 'Inclusive' | 'NoTax';
    lineItems: XeroLineItem[];
    status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED';
    reference?: string;
}
export interface XeroLineItem {
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode: string;
    taxType: string;
}
export declare class XeroIntegrationService {
    private clientId;
    private clientSecret;
    private redirectUri;
    private baseUrl;
    private authUrl;
    private tokenUrl;
    constructor();
    /**
     * Generate Xero OAuth authorization URL
     */
    getAuthorizationUrl(userId: string, state?: string): string;
    /**
     * Exchange authorization code for access tokens
     */
    exchangeCodeForTokens(code: string): Promise<XeroAuthTokens>;
    /**
     * Refresh access tokens
     */
    refreshAccessToken(refreshToken: string): Promise<XeroAuthTokens>;
    /**
     * Create or update contact in Xero
     */
    syncContact(user: User, tokens: XeroAuthTokens): Promise<string>;
    /**
     * Create donation entry in Xero as a journal entry
     */
    createDonationEntry(donation: Donation, user: User, charity: Charity, tokens: XeroAuthTokens): Promise<string>;
    /**
     * Create expense entry for platform fee
     */
    createPlatformFeeEntry(donation: Donation, platformFee: number, tokens: XeroAuthTokens): Promise<string>;
    /**
     * Get Xero organisation details
     */
    getOrganisation(tokens: XeroAuthTokens): Promise<any>;
    /**
     * Get chart of accounts
     */
    getChartOfAccounts(tokens: XeroAuthTokens): Promise<any[]>;
    /**
     * Bulk sync multiple donations
     */
    bulkSyncDonations(donations: Donation[], userTokens: Map<string, XeroAuthTokens>): Promise<void>;
    /**
     * Make authenticated request to Xero API
     */
    private makeXeroRequest;
    /**
     * Validate Xero connection
     */
    validateConnection(tokens: XeroAuthTokens): Promise<boolean>;
}
export declare const xeroIntegrationService: XeroIntegrationService;
//# sourceMappingURL=xeroIntegrationService.d.ts.map
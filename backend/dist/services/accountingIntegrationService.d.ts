import { Donation } from '../models/Donation.model';
import { XeroAuthTokens } from './xeroIntegrationService';
import { MYOBAuthTokens } from './myobIntegrationService';
export declare enum IntegrationType {
    XERO = "xero",
    MYOB = "myob",
    BOTH = "both"
}
export interface UserIntegrationSettings {
    userId: string;
    integrationType: IntegrationType;
    xeroTokens?: XeroAuthTokens;
    myobTokens?: MYOBAuthTokens;
    autoSync: boolean;
    syncReceipts: boolean;
    syncFees: boolean;
    lastSyncDate?: Date;
    syncErrors?: string[];
}
export declare class AccountingIntegrationService {
    private userSettings;
    /**
     * Initialize integration for a user
     */
    initializeIntegration(userId: string, integrationType: IntegrationType, authCode: string): Promise<UserIntegrationSettings>;
    /**
     * Process a single donation across all enabled integrations
     */
    processDonation(donation: Donation): Promise<void>;
    /**
     * Sync donation to Xero
     */
    private syncToXero;
    /**
     * Sync donation to MYOB
     */
    private syncToMYOB;
    /**
     * Sync user contact information
     */
    private syncUserContact;
    /**
     * Get integration status for a user
     */
    getIntegrationStatus(userId: string): UserIntegrationSettings | null;
    /**
     * Update integration settings
     */
    updateIntegrationSettings(userId: string, updates: Partial<UserIntegrationSettings>): UserIntegrationSettings;
    /**
     * Disconnect integration
     */
    disconnectIntegration(userId: string, integrationType?: IntegrationType): void;
    /**
     * Bulk process multiple donations
     */
    bulkProcessDonations(donations: Donation[]): Promise<void>;
    /**
     * Get integration URLs for user setup
     */
    getIntegrationUrls(userId: string): {
        xero?: string;
        myob?: string;
    };
    /**
     * Validate all user integrations
     */
    validateIntegrations(): Promise<Map<string, {
        xero: boolean;
        myob: boolean;
    }>>;
}
export declare const accountingIntegrationService: AccountingIntegrationService;
//# sourceMappingURL=accountingIntegrationService.d.ts.map
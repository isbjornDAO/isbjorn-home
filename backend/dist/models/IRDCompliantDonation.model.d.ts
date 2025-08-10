import { Model } from 'sequelize-typescript';
import { NZCompany } from './NZCompany.model';
import { Charity } from './Charity.model';
import { Receipt } from './Receipt.model';
export declare enum ComplianceStatus {
    PENDING = "pending",
    COMPLIANT = "compliant",
    NON_COMPLIANT = "non_compliant",
    REQUIRES_REVIEW = "requires_review"
}
export declare class IRDCompliantDonation extends Model {
    id: string;
    receiptNumber: string;
    legalDonationStatement: string;
    companyId: string;
    donorLegalName: string;
    donorRegisteredAddress: string;
    donationAmountNzd: number;
    donationDate: Date;
    authorisedPersonName: string;
    authorisedPersonDesignation: string;
    charityId: string;
    recipientCharityLegalName: string;
    recipientDiaCharitiesNumber: string;
    recipientIrdNumber: string;
    receiptPdfPath: string;
    receiptIssuedTimestamp: Date;
    irdAuditReady: boolean;
    archivedUntil: Date;
    taxYear: number;
    stripePaymentId?: string;
    accountingExportStatus: string;
    xeroTransactionId?: string;
    myobTransactionId?: string;
    complianceStatus: ComplianceStatus;
    complianceChecks?: {
        allIrdFieldsPresent: boolean;
        receiptNumberValid: boolean;
        donorVerified: boolean;
        charityVerified: boolean;
        amountValid: boolean;
        dateValid: boolean;
        lastChecked: Date;
        checkedBy?: string;
    };
    metadata?: {
        campaignId?: string;
        recurringDonationId?: string;
        userAgent?: string;
        ipAddress?: string;
        processingTime?: number;
    };
    avalancheTxHash?: string;
    company: NZCompany;
    charity: Charity;
    receipt: Receipt;
    static generateReceiptNumber(donation: IRDCompliantDonation): Promise<void>;
    static setArchivalDate(donation: IRDCompliantDonation): Promise<void>;
    static setTaxYear(donation: IRDCompliantDonation): Promise<void>;
    get isIrdCompliant(): boolean;
    get formattedAmount(): string;
    get isArchivalCompliant(): boolean;
}
export default IRDCompliantDonation;
//# sourceMappingURL=IRDCompliantDonation.model.d.ts.map
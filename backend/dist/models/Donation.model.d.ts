import { Model } from 'sequelize-typescript';
import { User } from './User.model';
import { Charity } from './Charity.model';
import { Receipt } from './Receipt.model';
import { NZCompany } from './NZCompany.model';
import { Project } from './Project.model';
export declare enum DonationStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    REFUNDED = "refunded",
    CANCELLED = "cancelled"
}
export declare enum DonationCurrency {
    NZD = "nzd",
    USD = "usd",
    AUD = "aud",
    EUR = "eur"
}
export declare class Donation extends Model {
    id: string;
    userId: string;
    charityId: string;
    companyId?: string;
    projectId?: string;
    amount: number;
    currency: DonationCurrency;
    exchangeRate?: number;
    usdAmount?: number;
    status: DonationStatus;
    stripePaymentId?: string;
    stripePaymentIntentId?: string;
    provider?: string;
    sessionId?: string;
    blockchainTxHash?: string;
    blockchainConfirmations: number;
    blockchainStatus?: string;
    taxDeductible: boolean;
    message?: string;
    isAnonymous: boolean;
    completedAt?: Date;
    refundedAt?: Date;
    refundReason?: string;
    platformFee: number;
    stripeFee: number;
    blockchainFee: number;
    netAmount?: number;
    metadata?: {
        userAgent?: string;
        ipAddress?: string;
        referrer?: string;
        campaignId?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
    };
    failureReason?: string;
    user: User;
    charity: Charity;
    company?: NZCompany;
    project?: Project;
    receipt: Receipt;
    get isCompleted(): boolean;
    get isPending(): boolean;
    get isFailed(): boolean;
}
export default Donation;
//# sourceMappingURL=Donation.model.d.ts.map
import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
import { IRDCompliantDonation } from './IRDCompliantDonation.model';
export declare class Receipt extends Model {
    id: string;
    donationId: string;
    irdDonationId?: string;
    receiptNumber: string;
    issueDate: Date;
    taxYear: number;
    amount: number;
    currency: string;
    taxDeductibleAmount: number;
    gstAmount?: number;
    donor: {
        name: string;
        email: string;
        taxId?: string;
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
    };
    charity: {
        name: string;
        address: {
            street: string;
            city: string;
            state: string;
            postalCode: string;
            country: string;
        };
        taxId: string;
        charityNumber: string;
        phone?: string;
        email?: string;
        website?: string;
    };
    pdfUrl: string;
    pdfPath?: string;
    emailSent: boolean;
    emailSentAt?: Date;
    downloaded: boolean;
    downloadCount: number;
    lastDownloadedAt?: Date;
    notes?: string;
    compliance: {
        nzGstCompliant: boolean;
        nzCharityCompliant: boolean;
        auTaxCompliant: boolean;
        validatedAt: Date;
        validatedBy?: string;
    };
    donation: Donation;
    irdDonation?: IRDCompliantDonation;
    static generateReceiptNumber(taxYear: number, sequenceNumber: number): string;
    get formattedReceiptNumber(): string;
    get isValid(): boolean;
}
export default Receipt;
//# sourceMappingURL=Receipt.model.d.ts.map
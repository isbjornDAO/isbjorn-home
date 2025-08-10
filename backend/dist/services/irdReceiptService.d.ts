import { IRDCompliantDonation } from '../models/IRDCompliantDonation.model';
export declare class IRDReceiptService {
    private emailTransporter;
    private receiptsDirectory;
    private templatePath;
    constructor();
    /**
     * Generate perfect IRD-compliant receipt in <5 seconds
     */
    generateIRDCompliantReceipt(donationId: string): Promise<{
        pdfPath: string;
        receiptNumber: string;
        irdCompliant: boolean;
        generationTime: number;
    }>;
    /**
     * Auto-email receipt to company accountant and donor
     */
    emailReceipt(donationId: string, recipients: {
        donor: string;
        accountant?: string;
        cc?: string[];
    }): Promise<{
        emailSent: boolean;
        sentTo: string[];
        messageId?: string;
    }>;
    /**
     * Validate complete IRD compliance per IRD255 requirements
     */
    validateIRDCompliance(donation: IRDCompliantDonation): {
        isCompliant: boolean;
        issues: string[];
        checklist: Record<string, boolean>;
    };
    /**
     * Generate sequential receipt number per IRD requirements
     */
    generateSequentialReceiptNumber(): Promise<string>;
    private createPDFReceipt;
    private generateEmailBody;
    private ensureDirectoriesExist;
}
export default IRDReceiptService;
//# sourceMappingURL=irdReceiptService.d.ts.map
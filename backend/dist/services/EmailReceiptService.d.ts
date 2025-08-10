interface ReceiptData {
    donationId: string;
    donorName: string;
    donorEmail: string;
    companyName: string;
    companyNumber: string;
    charityName: string;
    charityNumber: string;
    amount: number;
    currency: string;
    date: Date;
    receiptNumber: string;
    transactionId?: string;
    blockchainTxHash?: string;
    accountantEmail?: string;
}
declare class EmailReceiptService {
    private isEnabled;
    constructor();
    /**
     * Generate IRD-compliant PDF receipt
     */
    generatePDFReceipt(data: ReceiptData): Promise<Buffer>;
    /**
     * Send receipt email with PDF attachment
     */
    sendReceipt(data: ReceiptData): Promise<boolean>;
    /**
     * Send individual email
     */
    private sendSingleEmail;
    /**
     * Generate HTML email content
     */
    private generateEmailHTML;
    /**
     * Generate plain text email content
     */
    private generateEmailText;
    /**
     * Send welcome email to new users
     */
    sendWelcomeEmail(email: string, name: string, companyName?: string): Promise<boolean>;
    /**
     * Test email configuration
     */
    testConfiguration(): Promise<boolean>;
}
declare const _default: EmailReceiptService;
export default _default;
//# sourceMappingURL=EmailReceiptService.d.ts.map
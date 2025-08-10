interface StreamlinedDonationRequest {
    nzCompanyNumber: string;
    charityId: string;
    amount: number;
    stripePaymentMethodId: string;
    message?: string;
    recurringMonthly?: boolean;
    companyContactEmail: string;
    accountantEmail?: string;
}
interface StreamlinedDonationResponse {
    success: boolean;
    donationId: string;
    receiptNumber: string;
    processingTimeMs: number;
    receipt: {
        pdfUrl: string;
        emailSent: boolean;
    };
    accounting: {
        xeroExported: boolean;
        myobExported: boolean;
    };
    blockchain?: {
        transactionHash: string;
    };
}
export declare class StreamlinedDonationService {
    private companiesService;
    private charitiesService;
    private receiptService;
    private stripe;
    constructor();
    /**
     * THE 2-MINUTE DONATION PROCESS
     * Auto-fills everything, processes payment, generates receipt, exports to accounting
     */
    processStreamlinedDonation(request: StreamlinedDonationRequest): Promise<StreamlinedDonationResponse>;
    /**
     * Get pre-verified charities for instant dropdown population
     */
    getVerifiedCharitiesDropdown(): Promise<Array<{
        id: string;
        name: string;
        legalName: string;
        category: string;
        logoUrl?: string;
        description: string;
        totalDonations: number;
    }>>;
    /**
     * Auto-populate company form on company number entry
     */
    autoPopulateCompanyForm(nzCompanyNumber: string): Promise<{
        legalName: string;
        registeredAddress: string;
        directors: string[];
        isCompliant: boolean;
        canDonate: boolean;
        issues: string[];
    } | null>;
    /**
     * Get donation history for compliance dashboard
     */
    getCompanyDonationHistory(nzCompanyNumber: string, taxYear?: number): Promise<Array<{
        id: string;
        receiptNumber: string;
        charityName: string;
        amount: number;
        donationDate: Date;
        taxYear: number;
        receiptPdfUrl: string;
        irdCompliant: boolean;
    }>>;
    private getOrCreateCompany;
    private getVerifiedCharity;
    private processStripePayment;
    private createIRDCompliantDonation;
    private exportToAccountingSoftware;
    private recordOnBlockchain;
}
export default StreamlinedDonationService;
//# sourceMappingURL=streamlinedDonationService.d.ts.map
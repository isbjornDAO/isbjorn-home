export interface IRDVerificationResult {
    valid: boolean;
    companyName?: string;
    irdNumber?: string;
    gstRegistered?: boolean;
    businessType?: string;
    error?: string;
}
export interface DoneeOrganisationStatus {
    isDoneeOrganisation: boolean;
    doneeNumber?: string;
    taxDeductibleStatus: 'full' | 'partial' | 'none';
    lastVerified: Date;
}
export declare class IRDComplianceService {
    private apiKey;
    private baseUrl;
    constructor();
    /**
     * Verify a business IRD number and get company details
     */
    verifyBusinessIRD(irdNumber: string, companyName?: string): Promise<IRDVerificationResult>;
    /**
     * Verify charity donee organisation status
     */
    verifyDoneeOrganisation(charityId: string): Promise<DoneeOrganisationStatus>;
    /**
     * Generate IRD-compliant receipt number
     */
    generateIRDReceiptNumber(charityId: string, donationId: string): string;
    /**
     * Validate donation amount for IRD compliance
     */
    validateDonationAmount(amount: number, currency?: string): boolean;
    /**
     * Generate IRD-compliant donation receipt data
     */
    generateIRDReceiptData(donationId: string, userId: string, charityId: string, amount: number): Promise<any>;
    /**
     * Submit donation to IRD reporting system (if required)
     */
    submitToIRDReporting(donationData: any): Promise<boolean>;
    private getMockBusinessVerification;
    private getMockDoneeStatus;
    private convertToNZD;
    private formatAddress;
    private generateLegalStatement;
}
export declare const irdComplianceService: IRDComplianceService;
//# sourceMappingURL=irdComplianceService.d.ts.map
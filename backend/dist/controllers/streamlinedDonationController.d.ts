import { Request, Response } from 'express';
export declare class StreamlinedDonationController {
    private donationService;
    private companiesService;
    private charitiesService;
    constructor();
    /**
     * POST /api/donations/streamlined
     * Process the ultra-streamlined 2-minute donation
     */
    processDonation: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/companies/:companyNumber/auto-populate
     * Auto-populate company form on company number entry (30 seconds)
     */
    autoPopulateCompany: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/companies/search
     * Search companies by name
     */
    searchCompanies: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/charities/verified-dropdown
     * Get pre-verified donee organisations for instant dropdown
     */
    getVerifiedCharities: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/charities/search?q=searchTerm
     * Real-time charity search for dropdown
     */
    searchCharities: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/companies/:companyNumber/donations
     * Get company donation history for compliance dashboard
     */
    getCompanyDonations: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/companies/:companyNumber/compliance-dashboard
     * IRD audit readiness dashboard
     */
    getComplianceDashboard: (req: Request, res: Response) => Promise<void>;
    /**
     * GET /api/receipts/:donationId/download
     * Download IRD-compliant receipt PDF
     */
    downloadReceipt: (req: Request, res: Response) => Promise<void>;
    private getCurrentNZTaxYear;
    private calculateComplianceScore;
    private getComplianceNextSteps;
}
export default StreamlinedDonationController;
//# sourceMappingURL=streamlinedDonationController.d.ts.map
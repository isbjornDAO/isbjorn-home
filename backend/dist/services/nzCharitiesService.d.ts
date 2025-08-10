import { Charity } from '../models/Charity.model';
interface DoneeOrganisationStatus {
    isDoneeOrganisation: boolean;
    doneeOrganisationNumber?: string;
    taxDeductibleStatus: boolean;
    lastVerified: string;
}
export declare class NZCharitiesService {
    private baseUrl;
    private apiKey;
    private rateLimitDelay;
    private lastRequestTime;
    constructor();
    /**
     * Real-time charity verification for dropdown population
     */
    verifyCharity(charityName: string): Promise<{
        legalName: string;
        diaNumber: string;
        irdNumber: string;
        doneeStatus: boolean;
        isVerified: boolean;
    } | null>;
    /**
     * Get all pre-verified donee organisations for dropdown
     */
    getVerifiedDoneeOrganisations(): Promise<Array<{
        id: string;
        name: string;
        legalName: string;
        category: string;
        diaNumber: string;
        irdNumber: string;
        doneeOrganisationNumber?: string;
    }>>;
    /**
     * Verify charity is legitimate donee organisation for IRD compliance
     */
    verifyDoneeOrganisationStatus(diaCharitiesNumber: string): Promise<DoneeOrganisationStatus>;
    /**
     * Auto-populate charity details for onboarding
     */
    lookupCharityDetails(diaCharitiesNumber: string): Promise<Charity | null>;
    /**
     * Refresh the list of all donee organisations (daily cron job)
     */
    refreshDoneeOrganisationsList(): Promise<void>;
    /**
     * Quick charity lookup by name for real-time search
     */
    searchCharitiesByName(query: string, limit?: number): Promise<Array<{
        id: string;
        name: string;
        legalName: string;
        category: string;
        isDoneeOrganisation: boolean;
    }>>;
    private enforceRateLimit;
    private createOrUpdateCharity;
    private mapCharityCategory;
    private getMockCharityVerification;
    private getMockCharityData;
    private createMockDoneeOrganisations;
    private getMockSearchResults;
}
export default NZCharitiesService;
//# sourceMappingURL=nzCharitiesService.d.ts.map
interface DonationRecord {
    id: string;
    donor: string;
    charity: string;
    amount: number;
    receiptHash: string;
    timestamp: number;
}
declare class AvalancheL1Service {
    private provider;
    private wallet;
    private contract;
    private isEnabled;
    constructor();
    /**
     * Record a donation on the Avalanche L1 blockchain
     */
    recordDonation(donationId: string, donorAddress: string, charityAddress: string, amountInWei: bigint, receiptHash: string): Promise<string | null>;
    /**
     * Get donation details from blockchain
     */
    getDonation(donationId: string): Promise<DonationRecord | null>;
    /**
     * Get total platform donations from blockchain
     */
    getTotalDonations(): Promise<number>;
    /**
     * Get charity-specific donations from blockchain
     */
    getCharityDonations(charityAddress: string): Promise<number>;
    /**
     * Get current gas price
     */
    getGasPrice(): Promise<bigint>;
    /**
     * Get network information
     */
    getNetworkInfo(): Promise<{
        chainId: number;
        name: string;
        walletAddress: string;
        balance: string;
        contractAddress: string | undefined;
    } | null>;
    /**
     * Health check for Avalanche L1 connection
     */
    healthCheck(): Promise<boolean>;
    /**
     * Convert NZD amount to Wei (assuming 1 AVAX = $X NZD)
     */
    nzdToWei(nzdAmount: number, avaxPriceInNZD?: number): bigint;
    /**
     * Generate charity address from charity ID (deterministic)
     */
    generateCharityAddress(charityId: string): string;
    /**
     * Generate donor address from business info (deterministic)
     */
    generateDonorAddress(companyNumber: string, email: string): string;
}
declare const _default: AvalancheL1Service;
export default _default;
//# sourceMappingURL=AvalancheL1Service.d.ts.map
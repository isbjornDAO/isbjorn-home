import { ethers } from 'ethers';
declare class BlockchainService {
    private provider;
    private signer;
    private donationTracker;
    private projectDistribution;
    private readonly chainId;
    private readonly treasuryAddress;
    constructor();
    private setupEventListeners;
    recordDonation(donationId: string, donorAddress: string, projectAddress: string, amount: number, projectName: string, companyName: string): Promise<string>;
    verifyDonation(donationId: string): Promise<boolean>;
    getDonationFromBlockchain(donationId: string): Promise<any>;
    registerProject(projectId: string, projectName: string, walletAddress: string): Promise<string>;
    distributeFundsToProject(projectId: string, amount: number, reason: string): Promise<string>;
    getProjectBalance(projectAddress: string): Promise<string>;
    getTransaction(txHash: string): Promise<any>;
    private handleDonationRecordedEvent;
    getProvider(): Promise<ethers.Provider>;
    getTreasuryAddress(): Promise<string>;
    waitForTransaction(txHash: string): Promise<any>;
    verifyTransaction(txHash: string): Promise<boolean>;
}
export declare const initializeBlockchain: () => Promise<void>;
export declare const getBlockchainService: () => BlockchainService;
export {};
//# sourceMappingURL=blockchain.d.ts.map
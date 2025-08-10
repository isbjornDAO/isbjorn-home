import { Model } from 'sequelize-typescript';
import { Donation } from './Donation.model';
export declare enum TransactionStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    FAILED = "failed",
    DROPPED = "dropped"
}
export declare enum TransactionType {
    DONATION = "donation",
    DISTRIBUTION = "distribution",
    REFUND = "refund",
    ADMIN = "admin"
}
export declare class BlockchainTransaction extends Model {
    id: string;
    txHash: string;
    donationId?: string;
    type: TransactionType;
    blockNumber?: number;
    fromAddress: string;
    toAddress: string;
    value: string;
    gasLimit?: string;
    gasUsed?: string;
    gasPrice?: string;
    gasFee?: string;
    status: TransactionStatus;
    confirmations: number;
    blockTimestamp?: Date;
    nonce?: string;
    input?: string;
    logs?: {
        address: string;
        topics: string[];
        data: string;
    }[];
    errorMessage?: string;
    metadata?: {
        contractAddress?: string;
        methodName?: string;
        parameters?: any;
        eventName?: string;
        eventData?: any;
    };
    confirmedAt?: Date;
    retryCount: number;
    lastRetryAt?: Date;
    donation: Donation;
    get isConfirmed(): boolean;
    get isPending(): boolean;
    get isFailed(): boolean;
    get explorerUrl(): string;
}
export default BlockchainTransaction;
//# sourceMappingURL=BlockchainTransaction.model.d.ts.map
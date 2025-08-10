import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from './Donation.model';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  DROPPED = 'dropped',
}

export enum TransactionType {
  DONATION = 'donation',
  DISTRIBUTION = 'distribution',
  REFUND = 'refund',
  ADMIN = 'admin',
}

@Table({
  tableName: 'blockchain_transactions',
  timestamps: true,
  indexes: [
    { fields: ['txHash'] },
    { fields: ['donationId'] },
    { fields: ['status'] },
    { fields: ['type'] },
    { fields: ['createdAt'] },
  ],
})
export class BlockchainTransaction extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  txHash!: string;

  @ForeignKey(() => Donation)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  donationId?: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
  })
  type!: TransactionType;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  blockNumber?: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fromAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  toAddress!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  value!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gasLimit?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gasUsed?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gasPrice?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  gasFee?: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
    defaultValue: TransactionStatus.PENDING,
  })
  status!: TransactionStatus;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  confirmations!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  blockTimestamp?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nonce?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  input?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  logs?: {
    address: string;
    topics: string[];
    data: string;
  }[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  errorMessage?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: {
    contractAddress?: string;
    methodName?: string;
    parameters?: any;
    eventName?: string;
    eventData?: any;
  };

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  confirmedAt?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  retryCount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastRetryAt?: Date;

  @BelongsTo(() => Donation)
  donation!: Donation;

  get isConfirmed(): boolean {
    return this.status === TransactionStatus.CONFIRMED && this.confirmations >= 12;
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get explorerUrl(): string {
    const baseUrl = process.env.NODE_ENV === 'production'
      ? 'https://snowtrace.io'
      : 'https://testnet.snowtrace.io';
    return `${baseUrl}/tx/${this.txHash}`;
  }
}

export default BlockchainTransaction;
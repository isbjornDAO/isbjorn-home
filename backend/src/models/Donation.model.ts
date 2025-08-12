import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
  HasOne,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';
import { Charity } from './Charity.model';
import { Receipt } from './Receipt.model';
import { NZCompany } from './NZCompany.model';
import { Project } from './Project.model';

export enum DonationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

export enum DonationCurrency {
  NZD = 'nzd',
  USD = 'usd',
  AUD = 'aud',
  EUR = 'eur',
}

@Table({
  tableName: 'donations',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['charity_id'] },
    { fields: ['company_id'] },
    { fields: ['project_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['stripe_payment_id'] },
    { fields: ['blockchain_tx_hash'] },
  ],
})
export class Donation extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Charity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  charityId!: string;

  @ForeignKey(() => NZCompany)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  companyId?: string;

  @ForeignKey(() => Project)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  projectId?: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  amount!: number;

  @Column({
    type: DataType.ENUM(...Object.values(DonationCurrency)),
    allowNull: false,
    defaultValue: DonationCurrency.NZD,
  })
  currency!: DonationCurrency;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: true,
  })
  exchangeRate?: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: true,
  })
  usdAmount?: number;

  @Column({
    type: DataType.ENUM(...Object.values(DonationStatus)),
    allowNull: false,
    defaultValue: DonationStatus.PENDING,
  })
  status!: DonationStatus;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  stripePaymentId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  stripePaymentIntentId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  blockchainTxHash?: string;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  blockchainConfirmations!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  blockchainStatus?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  taxDeductible!: boolean;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  message?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  isAnonymous!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  refundedAt?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  refundReason?: string;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
  })
  platformFee!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
  })
  stripeFee!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    defaultValue: 0,
  })
  blockchainFee!: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: true,
  })
  netAmount?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    referrer?: string;
    campaignId?: string;
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
  };

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  failureReason?: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Charity)
  charity!: Charity;

  @BelongsTo(() => NZCompany)
  company?: NZCompany;

  @BelongsTo(() => Project)
  project?: Project;

  @HasOne(() => Receipt)
  receipt!: Receipt;

  get isCompleted(): boolean {
    return this.status === DonationStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === DonationStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.status === DonationStatus.FAILED;
  }
}

export default Donation;
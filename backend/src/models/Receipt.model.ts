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
import { IRDCompliantDonation } from './IRDCompliantDonation.model';

@Table({
  tableName: 'receipts',
  timestamps: true,
  indexes: [
    { fields: ['donation_id'] },
    { fields: ['ird_donation_id'] },
    { fields: ['receipt_number'] },
    { fields: ['issue_date'] },
    { fields: ['tax_year'] },
  ],
})
export class Receipt extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @ForeignKey(() => Donation)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  donationId!: string;

  @ForeignKey(() => IRDCompliantDonation)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  irdDonationId?: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  receiptNumber!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  issueDate!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  taxYear!: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  amount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  currency!: string;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
  })
  taxDeductibleAmount!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  gstAmount?: number;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  donor!: {
    name: string;
    email: string;
    taxId?: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  charity!: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
    taxId: string;
    charityNumber: string;
    phone?: string;
    email?: string;
    website?: string;
  };

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  pdfUrl!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pdfPath?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailSent!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailSentAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  downloaded!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  downloadCount!: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastDownloadedAt?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  compliance!: {
    nzGstCompliant: boolean;
    nzCharityCompliant: boolean;
    auTaxCompliant: boolean;
    validatedAt: Date;
    validatedBy?: string;
  };

  @BelongsTo(() => Donation)
  donation!: Donation;

  @BelongsTo(() => IRDCompliantDonation)
  irdDonation?: IRDCompliantDonation;

  static generateReceiptNumber(taxYear: number, sequenceNumber: number): string {
    return `ISB${taxYear}${sequenceNumber.toString().padStart(6, '0')}`;
  }

  get formattedReceiptNumber(): string {
    return this.receiptNumber;
  }

  get isValid(): boolean {
    return this.compliance?.nzGstCompliant && this.compliance?.nzCharityCompliant;
  }
}

export default Receipt;
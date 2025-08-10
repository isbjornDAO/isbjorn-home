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
  Unique,
  BeforeCreate,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { NZCompany } from './NZCompany.model';
import { Charity } from './Charity.model';
import { Receipt } from './Receipt.model';

export enum ComplianceStatus {
  PENDING = 'pending',
  COMPLIANT = 'compliant',
  NON_COMPLIANT = 'non_compliant',
  REQUIRES_REVIEW = 'requires_review',
}

@Table({
  tableName: 'ird_compliant_donations',
  timestamps: true,
  indexes: [
    { fields: ['receipt_number'], unique: true },
    { fields: ['company_id'] },
    { fields: ['charity_id'] },
    { fields: ['donation_date'] },
    { fields: ['tax_year'] },
    { fields: ['compliance_status'] },
    { fields: ['archived_until'] },
    { fields: ['stripe_payment_id'] },
    { fields: ['xero_transaction_id'] },
  ],
})
export class IRDCompliantDonation extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  // IRD Required Fields (exact IRD255 compliance)
  @Unique
  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  receiptNumber!: string; // ISB-2024-001234

  @Column({
    type: DataType.TEXT,
    allowNull: false,
    defaultValue: 'This amount was received as a donation',
  })
  legalDonationStatement!: string;

  @ForeignKey(() => NZCompany)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  companyId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  donorLegalName!: string; // From NZ Companies Register

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  donorRegisteredAddress!: string; // From NZ Companies Register

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    validate: {
      min: 1,
    },
  })
  donationAmountNzd!: number;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  donationDate!: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Sarah Johnson',
  })
  authorisedPersonName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'Treasurer',
  })
  authorisedPersonDesignation!: string;

  // Organisation Identifiers (IRD required)
  @ForeignKey(() => Charity)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  charityId!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  recipientCharityLegalName!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: false,
  })
  recipientDiaCharitiesNumber!: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: false,
  })
  recipientIrdNumber!: string;

  // Compliance & Audit Trail
  @Column({
    type: DataType.STRING(500),
    allowNull: false,
  })
  receiptPdfPath!: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  receiptIssuedTimestamp!: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  })
  irdAuditReady!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  archivedUntil!: Date; // 7 years from donation

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    validate: {
      min: 2024,
      max: 2050,
    },
  })
  taxYear!: number;

  // Business Process
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  stripePaymentId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    defaultValue: 'pending',
  })
  accountingExportStatus!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  xeroTransactionId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  myobTransactionId?: string;

  // Compliance Status
  @Column({
    type: DataType.ENUM(...Object.values(ComplianceStatus)),
    allowNull: false,
    defaultValue: ComplianceStatus.PENDING,
  })
  complianceStatus!: ComplianceStatus;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  complianceChecks?: {
    allIrdFieldsPresent: boolean;
    receiptNumberValid: boolean;
    donorVerified: boolean;
    charityVerified: boolean;
    amountValid: boolean;
    dateValid: boolean;
    lastChecked: Date;
    checkedBy?: string;
  };

  // Additional metadata
  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: {
    campaignId?: string;
    recurringDonationId?: string;
    userAgent?: string;
    ipAddress?: string;
    processingTime?: number;
  };

  // Blockchain (transparent but invisible to users)
  @Column({
    type: DataType.STRING(66),
    allowNull: true,
  })
  avalancheTxHash?: string;

  // Relationships
  @BelongsTo(() => NZCompany)
  company!: NZCompany;

  @BelongsTo(() => Charity)
  charity!: Charity;

  @HasOne(() => Receipt)
  receipt!: Receipt;

  // Hooks
  @BeforeCreate
  static async generateReceiptNumber(donation: IRDCompliantDonation) {
    if (!donation.receiptNumber) {
      const year = new Date().getFullYear();
      const count = await IRDCompliantDonation.count({
        where: { taxYear: year }
      });
      donation.receiptNumber = `ISB-${year}-${(count + 1).toString().padStart(6, '0')}`;
    }
  }

  @BeforeCreate
  static async setArchivalDate(donation: IRDCompliantDonation) {
    if (!donation.archivedUntil) {
      const archiveDate = new Date(donation.donationDate);
      archiveDate.setFullYear(archiveDate.getFullYear() + 7);
      donation.archivedUntil = archiveDate;
    }
  }

  @BeforeCreate
  static async setTaxYear(donation: IRDCompliantDonation) {
    if (!donation.taxYear) {
      const donationYear = new Date(donation.donationDate).getFullYear();
      // NZ tax year runs April 1 - March 31
      const donationMonth = new Date(donation.donationDate).getMonth();
      donation.taxYear = donationMonth >= 3 ? donationYear + 1 : donationYear; // April = month 3
    }
  }

  // Instance methods
  get isIrdCompliant(): boolean {
    return this.irdAuditReady && 
           this.complianceStatus === ComplianceStatus.COMPLIANT &&
           !!this.receiptNumber &&
           !!this.donorLegalName &&
           !!this.recipientCharityLegalName &&
           this.donationAmountNzd > 0;
  }

  get formattedAmount(): string {
    return `$${this.donationAmountNzd.toFixed(2)} NZD`;
  }

  get isArchivalCompliant(): boolean {
    return this.archivedUntil > new Date();
  }
}

export default IRDCompliantDonation;
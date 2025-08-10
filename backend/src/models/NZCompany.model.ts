import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  HasMany,
  Index,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from './Donation.model';

export enum CompanyType {
  LIMITED = 'Limited',
  UNLIMITED = 'Unlimited', 
  LIMITED_PARTNERSHIP = 'Limited Partnership',
  INCORPORATED_SOCIETY = 'Incorporated Society',
  CHARITABLE_TRUST = 'Charitable Trust',
  UNIT_TRUST = 'Unit Trust',
  OVERSEAS_COMPANY = 'Overseas Company',
}

export enum CompanyStatus {
  REGISTERED = 'Registered',
  REMOVED = 'Removed',
  LIQUIDATION = 'Liquidation',
  RECEIVERSHIP = 'Receivership',
}

@Table({
  tableName: 'nz_companies',
  timestamps: true,
  indexes: [
    { fields: ['nz_company_number'], unique: true },
    { fields: ['legal_name'] },
    { fields: ['ird_number'] },
    { fields: ['gst_number'] },
    { fields: ['company_status'] },
    { fields: ['last_verified'] },
  ],
})
export class NZCompany extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Unique
  @Column({
    type: DataType.STRING(10),
    allowNull: false,
    validate: {
      len: [1, 10],
      isNumeric: true,
    },
  })
  nzCompanyNumber!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  legalName!: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tradingName?: string;

  @Column({
    type: DataType.ENUM(...Object.values(CompanyType)),
    allowNull: false,
  })
  companyType!: CompanyType;

  @Column({
    type: DataType.ENUM(...Object.values(CompanyStatus)),
    allowNull: false,
    defaultValue: CompanyStatus.REGISTERED,
  })
  companyStatus!: CompanyStatus;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
    validate: {
      len: [8, 15],
    },
  })
  irdNumber?: string;

  @Column({
    type: DataType.STRING(15),
    allowNull: true,
    validate: {
      len: [9, 15],
    },
  })
  gstNumber?: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
  })
  registeredAddress!: {
    street: string;
    suburb?: string;
    city: string;
    region: string;
    postcode?: string;
    country: string;
  };

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  addressForService?: {
    street: string;
    suburb?: string;
    city: string;
    region: string;
    postcode?: string;
    country: string;
  };

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  incorporationDate!: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  annualReturnFilingMonth?: Date;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  natureOfBusiness?: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  directors?: Array<{
    name: string;
    appointmentDate: Date;
    address?: string;
  }>;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  shareholders?: Array<{
    name: string;
    shareClass: string;
    numberOfShares: number;
  }>;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isVerified!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    defaultValue: DataType.NOW,
  })
  lastVerified!: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  complianceChecks?: {
    irdVerified: boolean;
    gstVerified: boolean;
    annualReturnUpToDate: boolean;
    lastComplianceCheck: Date;
  };

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: {
    dataSource: string;
    lastUpdatedFromRegister: Date;
    apiVersion?: string;
  };

  @HasMany(() => Donation)
  donations!: Donation[];

  get formattedAddress(): string {
    const addr = this.registeredAddress;
    return [
      addr.street,
      addr.suburb,
      addr.city,
      addr.region,
      addr.postcode,
      addr.country
    ].filter(Boolean).join(', ');
  }

  get isCompliant(): boolean {
    return this.isActive && 
           this.isVerified && 
           this.companyStatus === CompanyStatus.REGISTERED &&
           (this.complianceChecks?.irdVerified ?? false);
  }
}

export default NZCompany;
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  HasMany,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from './Donation.model';

@Table({
  tableName: 'charities',
  timestamps: true,
})
export class Charity extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare charityNumber: string;

  @Column(DataType.STRING)
  declare legalName: string;

  @Column(DataType.STRING)
  declare diaCharitiesNumber: string;

  @Column(DataType.STRING)
  declare doneeOrganisationNumber: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isDoneeOrganisation: boolean;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.STRING)
  website?: string;

  @Column(DataType.STRING)
  email!: string;

  @Column(DataType.STRING)
  phone?: string;

  @Column(DataType.STRING)
  logoUrl?: string;

  @Column(DataType.STRING)
  charityPhoto?: string;

  @Column(DataType.STRING)
  icon?: string;

  @Column(DataType.STRING)
  location?: string;

  @Column(DataType.STRING)
  bankAccount!: string;

  @Column(DataType.STRING)
  irdNumber!: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  taxDeductible!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  gstRegistered!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.DECIMAL(12, 2),
    defaultValue: 0,
  })
  totalReceived!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  donationCount!: number;

  @HasMany(() => Donation)
  donations!: Donation[];

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Charity;
import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  HasMany,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from './Donation.model';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

@Table({
  tableName: 'users',
  timestamps: true,
  indexes: [
    { fields: ['email'] },
    { fields: ['company_name'] },
    { fields: ['created_at'] },
  ],
})
export class User extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: true,
    validate: {
      isEmail: true,
    },
  })
  email?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  password?: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  walletAddress?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  companyName?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  taxId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nzbn?: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  website?: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  logoUrl?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  emailVerified!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  emailVerificationToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  emailVerifiedAt?: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  passwordResetToken?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  passwordResetExpires?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  loginCount!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  preferences?: {
    receiveNewsletter: boolean;
    receiveImpactReports: boolean;
    publicProfile: boolean;
    defaultCurrency: string;
  };

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  stripeCustomerId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  x402WalletId?: string;

  // XP and Gamification System
  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  xp!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 1,
  })
  level!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  coins!: number;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  badges?: string[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  collectables?: {
    id: string;
    name: string;
    claimedAt: Date;
  }[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastDonationDate?: Date;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  donationStreak!: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  longestDonationStreak!: number;

  @HasMany(() => Donation)
  donations!: Donation[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(user: User) {
    if (user.changed('password') && user.password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
  }

  toJSON() {
    const values = { ...this.get() };
    delete values.password;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    return values;
  }
}

export default User;
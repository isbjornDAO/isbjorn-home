import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  HasMany,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { Donation } from './Donation.model';

export enum ProjectCategory {
  HABITAT = 'habitat',
  RESEARCH = 'research',
  RESCUE = 'rescue',
  EDUCATION = 'education',
}

export enum ProjectStatus {
  UPCOMING = 'upcoming',
  ACTIVE = 'active',
  COMPLETED = 'completed',
  PAUSED = 'paused',
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  achievedAmount: number;
  targetDate: Date;
  achievedDate?: Date;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface ImpactMetric {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
}

@Table({
  tableName: 'projects',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['category'] },
    { fields: ['location'] },
    { fields: ['created_at'] },
  ],
})
export class Project extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  id!: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  longDescription?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  imageUrl!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  imageGallery?: string[];

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  })
  goalAmount!: number;

  @Column({
    type: DataType.DECIMAL(15, 2),
    allowNull: false,
    defaultValue: 0,
  })
  raisedAmount!: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  coordinates?: {
    latitude: number;
    longitude: number;
  };

  @Column({
    type: DataType.ENUM(...Object.values(ProjectCategory)),
    allowNull: false,
  })
  category!: ProjectCategory;

  @Column({
    type: DataType.ENUM(...Object.values(ProjectStatus)),
    allowNull: false,
    defaultValue: ProjectStatus.UPCOMING,
  })
  status!: ProjectStatus;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    validate: {
      isEthereumAddress(value: string) {
        if (!/^0x[a-fA-F0-9]{40}$/.test(value)) {
          throw new Error('Invalid Ethereum address');
        }
      },
    },
  })
  walletAddress!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  milestones!: Milestone[];

  @Column({
    type: DataType.JSONB,
    allowNull: false,
    defaultValue: [],
  })
  impactMetrics!: ImpactMetric[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startDate?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  endDate?: Date;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  partners?: {
    name: string;
    website?: string;
    logoUrl?: string;
    description?: string;
  }[];

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  tags?: string[];

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  isActive!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  acceptingDonations!: boolean;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  donorCount!: number;

  @Column({
    type: DataType.DECIMAL(5, 2),
    allowNull: true,
  })
  averageRating?: number;

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  viewCount!: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  updates?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastUpdateAt?: Date;

  @HasMany(() => Donation)
  donations!: Donation[];

  get progressPercentage(): number {
    if (this.goalAmount === 0) return 0;
    return Math.round((Number(this.raisedAmount) / Number(this.goalAmount)) * 100);
  }

  get isCompleted(): boolean {
    return Number(this.raisedAmount) >= Number(this.goalAmount);
  }
}

export default Project;
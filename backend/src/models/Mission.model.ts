import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'missions',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['priority'] },
    { fields: ['start_date'] },
    { fields: ['is_featured'] },
  ],
})
export class Mission extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.TEXT)
  declare description: string;

  @Column({
    type: DataType.ENUM('active', 'planned', 'completed'),
    defaultValue: 'planned',
  })
  declare status: 'active' | 'planned' | 'completed';

  @Column(DataType.DECIMAL(12, 2))
  declare fundingGoal: number;

  @Column(DataType.DECIMAL(12, 2))
  declare fundingReceived: number;

  @Column(DataType.DATE)
  declare startDate: Date;

  @Column(DataType.DATE)
  declare endDate: Date;

  @Column(DataType.JSONB)
  declare polygonBounds: Array<[number, number]>;

  @Column(DataType.INTEGER)
  declare projectCount: number;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  })
  declare priority: 'low' | 'medium' | 'high' | 'critical';

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isFeatured: boolean;

  @Column(DataType.STRING)
  declare region: string;

  @Column(DataType.STRING)
  declare heroImage: string;

  @Column(DataType.JSONB)
  declare milestones: Array<{
    name: string;
    description: string;
    targetAmount: number;
    achieved: boolean;
  }>;

  @Column(DataType.JSONB)
  declare impactMetrics: {
    polarBearsProtected?: number;
    squareKmMonitored?: number;
    researchersDeployed?: number;
    dataPointsCollected?: number;
  };

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Mission;

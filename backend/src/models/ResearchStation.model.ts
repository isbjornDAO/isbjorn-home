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
  tableName: 'research_stations',
  timestamps: true,
  indexes: [
    { fields: ['type'] },
    { fields: ['is_active'] },
    { fields: ['category'] },
  ],
})
export class ResearchStation extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column(DataType.DECIMAL(10, 6))
  declare latitude: number;

  @Column(DataType.DECIMAL(10, 6))
  declare longitude: number;

  @Column({
    type: DataType.ENUM('headquarters', 'regional', 'field'),
    defaultValue: 'field',
  })
  declare type: 'headquarters' | 'regional' | 'field';

  @Column(DataType.INTEGER)
  declare activeProjects: number;

  @Column(DataType.STRING)
  declare category: string;

  @Column(DataType.DECIMAL(12, 2))
  declare fundingReceived: number;

  @Column(DataType.DATE)
  declare lastActivity: Date;

  @Column(DataType.DECIMAL(5, 2))
  declare impact: number;

  @Column(DataType.JSONB)
  declare properties: Record<string, any>;

  @Column(DataType.DECIMAL(3, 2))
  declare pulseIntensity: number;

  @Column(DataType.BOOLEAN)
  declare recentActivity: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  // Regional climate data
  @Column(DataType.DECIMAL(6, 2))
  declare avgTemperature: number;

  @Column(DataType.DECIMAL(6, 2))
  declare temperatureTrend: number;

  @Column(DataType.DECIMAL(6, 2))
  declare airQualityIndex: number;

  @Column(DataType.DECIMAL(5, 2))
  declare forestCoverage: number;

  @Column(DataType.DECIMAL(5, 2))
  declare waterAvailability: number;

  @Column(DataType.DECIMAL(12, 2))
  declare carbonFootprint: number;

  @Column(DataType.DECIMAL(5, 2))
  declare renewableEnergy: number;

  @Column(DataType.STRING)
  declare description: string;

  @Column(DataType.STRING)
  declare operatingOrganization: string;

  @Column(DataType.STRING)
  declare liveCamUrl: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default ResearchStation;

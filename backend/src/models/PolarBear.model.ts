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
  tableName: 'polar_bears',
  timestamps: true,
  indexes: [
    { fields: ['status'] },
    { fields: ['region'] },
    { fields: ['tag_id'] },
    { fields: ['last_updated'] },
  ],
})
export class PolarBear extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare name: string;

  @Column({
    type: DataType.ENUM('male', 'female'),
  })
  declare sex: 'male' | 'female';

  @Column(DataType.INTEGER)
  declare age: number;

  @Column(DataType.DECIMAL(10, 6))
  declare currentLatitude: number;

  @Column(DataType.DECIMAL(10, 6))
  declare currentLongitude: number;

  @Column({
    type: DataType.ENUM('active', 'inactive', 'hibernating'),
    defaultValue: 'active',
  })
  declare status: 'active' | 'inactive' | 'hibernating';

  @Column(DataType.JSONB)
  declare trackingHistory: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
    speed?: number;
  }>;

  @Column({
    type: DataType.ENUM('excellent', 'good', 'fair', 'poor'),
    defaultValue: 'good',
  })
  declare healthStatus: 'excellent' | 'good' | 'fair' | 'poor';

  @Column(DataType.DECIMAL(6, 2))
  declare weight: number;

  @Column(DataType.STRING)
  declare tagId: string;

  @Column(DataType.STRING)
  declare region: string;

  @Column({
    type: DataType.ENUM('stable', 'declining', 'critical'),
    defaultValue: 'stable',
  })
  declare seaIceCondition: 'stable' | 'declining' | 'critical';

  @Column(DataType.DECIMAL(5, 2))
  declare huntingSuccess: number;

  @Column(DataType.DECIMAL(10, 2))
  declare distanceTraveled: number;

  @Column(DataType.DATE)
  declare lastUpdated: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default PolarBear;

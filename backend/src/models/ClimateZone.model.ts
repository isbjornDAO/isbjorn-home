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
  tableName: 'climate_zones',
  timestamps: true,
  indexes: [
    { fields: ['severity'] },
    { fields: ['type'] },
    { fields: ['trend'] },
    { fields: ['last_updated'] },
  ],
})
export class ClimateZone extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.DECIMAL(10, 6))
  declare latitude: number;

  @Column(DataType.DECIMAL(10, 6))
  declare longitude: number;

  @Column(DataType.STRING)
  declare name: string;

  @Column({
    type: DataType.ENUM('low', 'medium', 'high', 'critical'),
    defaultValue: 'medium',
  })
  declare severity: 'low' | 'medium' | 'high' | 'critical';

  @Column({
    type: DataType.ENUM('drought', 'flooding', 'temperature', 'deforestation', 'pollution', 'ice_loss'),
  })
  declare type: 'drought' | 'flooding' | 'temperature' | 'deforestation' | 'pollution' | 'ice_loss';

  @Column(DataType.DECIMAL(10, 2))
  declare radius: number;

  @Column(DataType.INTEGER)
  declare affectedPopulation: number;

  @Column({
    type: DataType.ENUM('improving', 'stable', 'worsening'),
    defaultValue: 'stable',
  })
  declare trend: 'improving' | 'stable' | 'worsening';

  @Column(DataType.DECIMAL(6, 2))
  declare temperatureChange: number;

  @Column(DataType.DECIMAL(6, 2))
  declare co2Level: number;

  @Column(DataType.DECIMAL(8, 2))
  declare seaLevelRise: number;

  @Column(DataType.DECIMAL(5, 2))
  declare biodiversityLoss: number;

  @Column(DataType.DECIMAL(12, 2))
  declare deforestationRate: number;

  @Column(DataType.DECIMAL(5, 2))
  declare waterStress: number;

  @Column(DataType.JSONB)
  declare polygonBounds: Array<[number, number]>;

  @Column(DataType.DATE)
  declare lastUpdated: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default ClimateZone;

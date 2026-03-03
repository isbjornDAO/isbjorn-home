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
    tableName: 'glaciers',
    timestamps: true,
    indexes: [
        { fields: ['type'] },
        { fields: ['region'] },
        { fields: ['last_updated'] },
    ],
})
export class Glacier extends Model {
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

    @Column(DataType.STRING)
    declare region: string;

    @Column({
        type: DataType.ENUM('ice_sheet', 'glacier', 'ice_cap', 'ice_shelf'),
        defaultValue: 'glacier',
    })
    declare type: 'ice_sheet' | 'glacier' | 'ice_cap' | 'ice_shelf';

    @Column(DataType.DECIMAL(14, 2))
    declare areaKm2: number;

    @Column(DataType.DECIMAL(10, 2))
    declare massBalanceGt: number; // gigatonnes/year (negative = losing mass)

    @Column(DataType.DECIMAL(10, 2))
    declare volumeKm3: number;

    @Column(DataType.DECIMAL(8, 2))
    declare calvingRateKm3: number; // km³/year

    @Column(DataType.DECIMAL(6, 2))
    declare temperatureAnomalyC: number;

    @Column(DataType.DECIMAL(6, 2))
    declare meltRateMmPerYear: number;

    @Column(DataType.DECIMAL(8, 2))
    declare seaLevelContributionMm: number; // mm potential sea level rise

    @Column({
        type: DataType.ENUM('stable', 'retreating', 'advancing', 'critical'),
        defaultValue: 'stable',
    })
    declare status: 'stable' | 'retreating' | 'advancing' | 'critical';

    @Column(DataType.JSONB)
    declare polygonBounds: Array<[number, number]>;

    @Column(DataType.STRING)
    declare imageUrl: string;

    @Column(DataType.DATE)
    declare lastUpdated: Date;

    @Column(DataType.STRING)
    declare source: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}

export default Glacier;

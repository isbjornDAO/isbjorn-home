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
    tableName: 'sea_ice',
    timestamps: true,
    indexes: [
        { fields: ['region'] },
        { fields: ['date'] },
        { fields: ['source'] },
    ],
})
export class SeaIce extends Model {
    @PrimaryKey
    @Default(uuidv4)
    @Column(DataType.UUID)
    declare id: string;

    @Column(DataType.DATE)
    declare date: Date;

    @Column({
        type: DataType.ENUM('arctic', 'beaufort', 'chukchi', 'laptev', 'kara', 'barents', 'greenland', 'east_siberian', 'central_arctic'),
    })
    declare region: 'arctic' | 'beaufort' | 'chukchi' | 'laptev' | 'kara' | 'barents' | 'greenland' | 'east_siberian' | 'central_arctic';

    @Column(DataType.DECIMAL(14, 2))
    declare extentKm2: number;

    @Column(DataType.DECIMAL(5, 2))
    declare concentrationPercent: number;

    @Column(DataType.DECIMAL(6, 2))
    declare thicknessM: number;

    @Column(DataType.DECIMAL(6, 2))
    declare anomalyPercent: number; // vs 1981-2010 average

    @Column(DataType.DECIMAL(10, 6))
    declare centerLatitude: number;

    @Column(DataType.DECIMAL(10, 6))
    declare centerLongitude: number;

    @Column(DataType.JSONB)
    declare polygonBounds: Array<[number, number]>;

    @Column({
        type: DataType.ENUM('NSIDC', 'NASA', 'NOAA', 'manual'),
        defaultValue: 'NSIDC',
    })
    declare source: 'NSIDC' | 'NASA' | 'NOAA' | 'manual';

    @Column(DataType.STRING)
    declare dataUrl: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}

export default SeaIce;

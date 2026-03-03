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
    tableName: 'permafrost',
    timestamps: true,
    indexes: [
        { fields: ['region'] },
        { fields: ['thaw_status'] },
        { fields: ['last_updated'] },
    ],
})
export class Permafrost extends Model {
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

    @Column(DataType.DECIMAL(6, 2))
    declare temperatureC: number;

    @Column(DataType.DECIMAL(6, 2))
    declare depthM: number;

    @Column(DataType.DECIMAL(6, 2))
    declare activeLayerThicknessM: number;

    @Column({
        type: DataType.ENUM('stable', 'thawing', 'critical'),
        defaultValue: 'stable',
    })
    declare thawStatus: 'stable' | 'thawing' | 'critical';

    @Column(DataType.DECIMAL(14, 2))
    declare carbonStoreTonnes: number;

    @Column(DataType.DECIMAL(6, 2))
    declare methaneReleaseKg: number;

    @Column({
        type: DataType.ENUM('continuous', 'discontinuous', 'sporadic', 'isolated'),
        defaultValue: 'continuous',
    })
    declare permafrostType: 'continuous' | 'discontinuous' | 'sporadic' | 'isolated';

    @Column(DataType.JSONB)
    declare polygonBounds: Array<[number, number]>;

    @Column(DataType.DATE)
    declare lastUpdated: Date;

    @Column(DataType.STRING)
    declare source: string;

    @CreatedAt
    declare createdAt: Date;

    @UpdatedAt
    declare updatedAt: Date;
}

export default Permafrost;

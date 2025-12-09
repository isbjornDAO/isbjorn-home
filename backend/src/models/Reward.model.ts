import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

@Table({
  tableName: 'rewards',
  timestamps: true,
  indexes: [
    { fields: ['active'] },
    { fields: ['coins_required'] },
  ],
})
export class Reward extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name!: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  imageUrl?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
  })
  coinsRequired!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  totalAvailable?: number; // null means unlimited

  @Column({
    type: DataType.INTEGER,
    defaultValue: 0,
  })
  claimed!: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nftCollectionUrl?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tokenId?: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  limitedTime!: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  availableUntil?: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  active!: boolean;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  metadata?: {
    category?: string;
    rarity?: string;
    special?: boolean;
    [key: string]: any;
  };
}

export default Reward;

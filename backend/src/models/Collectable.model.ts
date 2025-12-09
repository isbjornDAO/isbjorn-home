import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';

export enum CollectableRarity {
  COMMON = 'common',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary',
}

@Table({
  tableName: 'collectables',
  timestamps: true,
  indexes: [
    { fields: ['collectable_id'] },
    { fields: ['category'] },
    { fields: ['rarity'] },
    { fields: ['active'] },
  ],
})
export class Collectable extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  collectableId!: string; // e.g., 'snowdog', 'vote_master', 'early_adopter'

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
    type: DataType.ENUM(...Object.values(CollectableRarity)),
    defaultValue: CollectableRarity.COMMON,
  })
  rarity!: CollectableRarity;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  category?: string; // e.g., 'mascot', 'character', 'achievement'

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
    unlockCondition?: string;
    special?: boolean;
    glowColor?: string;
    [key: string]: any;
  };
}

export default Collectable;

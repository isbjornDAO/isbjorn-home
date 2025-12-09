import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { v4 as uuidv4 } from 'uuid';
import { User } from './User.model';
import { Collectable } from './Collectable.model';

@Table({
  tableName: 'user_collectables',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['collectable_id'] },
    { fields: ['user_id', 'collectable_id'], unique: true },
  ],
})
export class UserCollectable extends Model {
  @PrimaryKey
  @Default(uuidv4)
  @Column(DataType.UUID)
  declare id: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  userId!: string;

  @ForeignKey(() => Collectable)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  collectableId!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  acquiredAt!: Date;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  nftMinted!: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nftTokenId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  nftContractAddress?: string;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Collectable)
  collectable!: Collectable;
}

export default UserCollectable;

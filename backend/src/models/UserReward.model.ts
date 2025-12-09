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
import { Reward } from './Reward.model';

@Table({
  tableName: 'user_rewards',
  timestamps: true,
  indexes: [
    { fields: ['user_id'] },
    { fields: ['reward_id'] },
    { fields: ['user_id', 'reward_id'], unique: true },
  ],
})
export class UserReward extends Model {
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

  @ForeignKey(() => Reward)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  rewardId!: string;

  @Column({
    type: DataType.DATE,
    defaultValue: DataType.NOW,
  })
  claimedAt!: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  coinsPaid!: number;

  @BelongsTo(() => User)
  user!: User;

  @BelongsTo(() => Reward)
  reward!: Reward;
}

export default UserReward;

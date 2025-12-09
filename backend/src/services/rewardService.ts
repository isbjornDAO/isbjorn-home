import { Reward } from '../models/Reward.model';
import { UserReward } from '../models/UserReward.model';
import { User } from '../models/User.model';
import { Op } from 'sequelize';
import sequelize from '../config/database';

export class RewardService {
  /**
   * Get all available rewards
   */
  async getAvailableRewards() {
    const rewards = await Reward.findAll({
      where: {
        active: true,
        [Op.or]: [
          { limitedTime: false },
          {
            limitedTime: true,
            availableUntil: {
              [Op.gte]: new Date(),
            },
          },
        ],
      },
      order: [['coinsRequired', 'ASC']],
    });

    return rewards.map((reward) => ({
      id: reward.id,
      name: reward.name,
      description: reward.description,
      imageUrl: reward.imageUrl,
      coinsRequired: reward.coinsRequired,
      totalAvailable: reward.totalAvailable,
      claimed: reward.claimed,
      remaining: reward.totalAvailable ? reward.totalAvailable - reward.claimed : null,
      soldOut: reward.totalAvailable ? reward.claimed >= reward.totalAvailable : false,
      nftCollectionUrl: reward.nftCollectionUrl,
      tokenId: reward.tokenId,
      limitedTime: reward.limitedTime,
      availableUntil: reward.availableUntil,
      metadata: reward.metadata,
    }));
  }

  /**
   * Claim a reward
   */
  async claimReward(userId: string, rewardId: string) {
    const transaction = await sequelize.transaction();

    try {
      // Get user
      const user = await User.findByPk(userId, { transaction });
      if (!user) {
        await transaction.rollback();
        return { success: false, error: 'User not found' };
      }

      // Get reward
      const reward = await Reward.findByPk(rewardId, { transaction });
      if (!reward || !reward.active) {
        await transaction.rollback();
        return { success: false, error: 'Reward not found or inactive' };
      }

      // Check if limited time reward is still available
      if (reward.limitedTime && reward.availableUntil && reward.availableUntil < new Date()) {
        await transaction.rollback();
        return { success: false, error: 'Reward expired' };
      }

      // Check if sold out
      if (reward.totalAvailable && reward.claimed >= reward.totalAvailable) {
        await transaction.rollback();
        return { success: false, error: 'Reward sold out' };
      }

      // Check if user already claimed this reward
      const existingClaim = await UserReward.findOne({
        where: { userId, rewardId },
        transaction,
      });

      if (existingClaim) {
        await transaction.rollback();
        return { success: false, error: 'Already claimed this reward' };
      }

      // Check if user has enough coins
      if (user.coins < reward.coinsRequired) {
        await transaction.rollback();
        return {
          success: false,
          error: `Insufficient coins. Required: ${reward.coinsRequired}, Available: ${user.coins}`,
        };
      }

      // Deduct coins from user
      user.coins -= reward.coinsRequired;
      await user.save({ transaction });

      // Create reward claim record
      const userReward = await UserReward.create(
        {
          userId,
          rewardId,
          coinsPaid: reward.coinsRequired,
        },
        { transaction }
      );

      // Increment claimed count
      reward.claimed += 1;
      await reward.save({ transaction });

      await transaction.commit();

      return {
        success: true,
        userReward: {
          id: userReward.id,
          rewardName: reward.name,
          claimedAt: userReward.claimedAt,
          coinsPaid: userReward.coinsPaid,
        },
        remainingCoins: user.coins,
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error claiming reward:', error);
      throw error;
    }
  }

  /**
   * Get user's claimed rewards
   */
  async getUserRewards(userId: string) {
    const userRewards = await UserReward.findAll({
      where: { userId },
      include: [
        {
          model: Reward,
          as: 'reward',
        },
      ],
      order: [['claimedAt', 'DESC']],
    });

    return userRewards.map((ur) => ({
      id: ur.id,
      rewardId: ur.reward.id,
      name: ur.reward.name,
      description: ur.reward.description,
      imageUrl: ur.reward.imageUrl,
      claimedAt: ur.claimedAt,
      coinsPaid: ur.coinsPaid,
      nftCollectionUrl: ur.reward.nftCollectionUrl,
      tokenId: ur.reward.tokenId,
    }));
  }

  /**
   * Check if user has claimed a specific reward
   */
  async hasClaimedReward(userId: string, rewardId: string): Promise<boolean> {
    const claim = await UserReward.findOne({
      where: { userId, rewardId },
    });

    return !!claim;
  }

  /**
   * Create a new reward (admin function)
   */
  async createReward(data: {
    name: string;
    description?: string;
    imageUrl?: string;
    coinsRequired: number;
    totalAvailable?: number;
    nftCollectionUrl?: string;
    tokenId?: string;
    limitedTime?: boolean;
    availableUntil?: Date;
    metadata?: any;
  }) {
    return await Reward.create(data);
  }

  /**
   * Update reward (admin function)
   */
  async updateReward(rewardId: string, updates: Partial<Reward>) {
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return null;
    }

    await reward.update(updates);
    return reward;
  }

  /**
   * Delete reward (admin function)
   */
  async deleteReward(rewardId: string) {
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return false;
    }

    await reward.update({ active: false });
    return true;
  }
}

export default new RewardService();

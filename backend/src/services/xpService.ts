import { User } from '../models/User.model';
import { calculateLevel, calculateDonationXP, calculateDonationCoins } from '../utils/xp';
import { logger } from '../utils/logger';

export class XPService {
  /**
   * Award XP and Coins for a donation
   */
  async awardDonationXP(
    userId: string,
    donationAmount: number
  ): Promise<{ xpAwarded: number; coinsAwarded: number; newXp: number; newCoins: number; newLevel: number; leveledUp: boolean }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const xpAwarded = calculateDonationXP(donationAmount);
      const coinsAwarded = calculateDonationCoins(donationAmount);

      const newXp = user.xp + xpAwarded;
      const newCoins = user.coins + coinsAwarded;
      const newLevel = calculateLevel(newXp);
      const leveledUp = newLevel > user.level;

      // Update donation streak
      const now = new Date();
      const lastDonation = user.lastDonationDate;
      let newStreak = user.donationStreak || 0;
      let longestStreak = user.longestDonationStreak || 0;

      if (lastDonation) {
        const daysSinceLastDonation = Math.floor((now.getTime() - lastDonation.getTime()) / (1000 * 60 * 60 * 24));
        if (daysSinceLastDonation === 1) {
          // Consecutive day donation
          newStreak += 1;
        } else if (daysSinceLastDonation > 1) {
          // Streak broken
          newStreak = 1;
        }
        // If same day, don't change streak
      } else {
        newStreak = 1;
      }

      longestStreak = Math.max(longestStreak, newStreak);

      await user.update({
        xp: newXp,
        coins: newCoins,
        level: newLevel,
        lastDonationDate: now,
        donationStreak: newStreak,
        longestDonationStreak: longestStreak
      });

      logger.info(`Awarded ${xpAwarded} XP and ${coinsAwarded} coins to user ${userId} for donation of $${donationAmount}`);

      return {
        xpAwarded,
        coinsAwarded,
        newXp,
        newCoins,
        newLevel,
        leveledUp
      };
    } catch (error) {
      logger.error('Error awarding donation XP:', error);
      throw error;
    }
  }

  /**
   * Award XP for various activities
   */
  async awardActivityXP(userId: string, activity: string, customXP?: number): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      let xpToAward = customXP || 1;

      // Activity-based XP rewards
      switch (activity) {
        case 'profile_complete':
          xpToAward = 10;
          break;
        case 'first_donation':
          xpToAward = 25;
          break;
        case 'wallet_connected':
          xpToAward = 5;
          break;
        case 'share_donation':
          xpToAward = 2;
          break;
        case 'monthly_recurring_setup':
          xpToAward = 15;
          break;
        default:
          xpToAward = 1;
      }

      const newXp = user.xp + xpToAward;
      const newLevel = calculateLevel(newXp);

      await user.update({
        xp: newXp,
        level: newLevel
      });

      logger.info(`Awarded ${xpToAward} XP to user ${userId} for activity: ${activity}`);
    } catch (error) {
      logger.error('Error awarding activity XP:', error);
      throw error;
    }
  }

  /**
   * Get user's XP stats
   */
  async getUserXPStats(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const { calculateLevel, getXpProgress, getXpForNextLevel } = await import('../utils/xp');
    const level = calculateLevel(user.xp);
    const progress = getXpProgress(user.xp);
    const xpForNextLevel = getXpForNextLevel(user.xp);

    return {
      xp: user.xp,
      level,
      coins: user.coins,
      xpForNextLevel,
      progress,
      donationStreak: user.donationStreak || 0,
      longestDonationStreak: user.longestDonationStreak || 0
    };
  }
}

export const xpService = new XPService();

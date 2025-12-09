import { Collectable, CollectableRarity } from '../models/Collectable.model';
import { UserCollectable } from '../models/UserCollectable.model';
import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { Op } from 'sequelize';

export class CollectableService {
  /**
   * Award a collectable to a user
   */
  async awardCollectable(userId: string, collectableId: string): Promise<UserCollectable | null> {
    try {
      // Check if collectable exists
      const collectable = await Collectable.findOne({
        where: { collectableId, active: true },
      });

      if (!collectable) {
        console.log(`Collectable ${collectableId} not found or inactive`);
        return null;
      }

      // Check if user already has this collectable
      const existing = await UserCollectable.findOne({
        where: {
          userId,
          collectableId: collectable.id,
        },
      });

      if (existing) {
        console.log(`User ${userId} already has collectable ${collectableId}`);
        return existing;
      }

      // Award the collectable
      const userCollectable = await UserCollectable.create({
        userId,
        collectableId: collectable.id,
        acquiredAt: new Date(),
      });

      console.log(`Awarded ${collectableId} to user ${userId}`);
      return userCollectable;
    } catch (error) {
      console.error('Error awarding collectable:', error);
      throw error;
    }
  }

  /**
   * Check if user has a specific collectable
   */
  async hasCollectable(userId: string, collectableId: string): Promise<boolean> {
    const collectable = await Collectable.findOne({
      where: { collectableId },
    });

    if (!collectable) return false;

    const userCollectable = await UserCollectable.findOne({
      where: {
        userId,
        collectableId: collectable.id,
      },
    });

    return !!userCollectable;
  }

  /**
   * Get all collectables for a user
   */
  async getUserCollectables(userId: string) {
    const userCollectables = await UserCollectable.findAll({
      where: { userId },
      include: [
        {
          model: Collectable,
          as: 'collectable',
        },
      ],
      order: [['acquiredAt', 'DESC']],
    });

    return userCollectables.map((uc) => ({
      id: uc.id,
      collectableId: uc.collectable.collectableId,
      name: uc.collectable.name,
      description: uc.collectable.description,
      imageUrl: uc.collectable.imageUrl,
      rarity: uc.collectable.rarity,
      category: uc.collectable.category,
      acquiredAt: uc.acquiredAt,
      nftMinted: uc.nftMinted,
      nftTokenId: uc.nftTokenId,
      metadata: uc.collectable.metadata,
    }));
  }

  /**
   * Get all available collectables
   */
  async getAllCollectables() {
    const collectables = await Collectable.findAll({
      where: { active: true },
      order: [
        ['rarity', 'DESC'],
        ['name', 'ASC'],
      ],
    });

    return collectables;
  }

  /**
   * Check and award achievements based on user activity
   */
  async checkAndAwardAchievements(userId: string) {
    const user = await User.findByPk(userId);
    if (!user) return [];

    const awarded: string[] = [];

    // Early Adopter - joined before a specific date
    const earlyAdopterDate = new Date('2024-12-01');
    if (user.createdAt < earlyAdopterDate) {
      const earlyAdopter = await this.awardCollectable(userId, 'early_adopter');
      if (earlyAdopter) awarded.push('early_adopter');
    }

    // Donation Master - 50+ donations
    const donationCount = await Donation.count({
      where: {
        userId,
        status: 'completed',
      },
    });

    if (donationCount >= 50) {
      const donationMaster = await this.awardCollectable(userId, 'donation_master');
      if (donationMaster) awarded.push('donation_master');
    }

    // Generous Donor - 100+ donations
    if (donationCount >= 100) {
      const generous = await this.awardCollectable(userId, 'generous_donor');
      if (generous) awarded.push('generous_donor');
    }

    // Streak Champion - 30 day donation streak
    if (user.longestDonationStreak >= 30) {
      const streakChamp = await this.awardCollectable(userId, 'streak_champion');
      if (streakChamp) awarded.push('streak_champion');
    }

    // Level achievements
    if (user.level >= 10) {
      const level10 = await this.awardCollectable(userId, 'level_10');
      if (level10) awarded.push('level_10');
    }

    if (user.level >= 25) {
      const level25 = await this.awardCollectable(userId, 'level_25');
      if (level25) awarded.push('level_25');
    }

    if (user.level >= 50) {
      const level50 = await this.awardCollectable(userId, 'level_50');
      if (level50) awarded.push('level_50');
    }

    return awarded;
  }

  /**
   * Create a new collectable (admin function)
   */
  async createCollectable(data: {
    collectableId: string;
    name: string;
    description?: string;
    imageUrl?: string;
    rarity?: CollectableRarity;
    category?: string;
    metadata?: any;
  }) {
    return await Collectable.create(data);
  }

  /**
   * Get collectable showcase (featured collectables)
   */
  async getShowcase(limit: number = 10) {
    return await Collectable.findAll({
      where: { active: true },
      order: [
        ['rarity', 'DESC'],
        ['createdAt', 'DESC'],
      ],
      limit,
    });
  }
}

export default new CollectableService();

import express from 'express';
import { User } from '../models/User.model';
import { Donation } from '../models/Donation.model';
import { xpService } from '../services/xpService';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = express.Router();

// Get user stats (XP, level, donations, etc.)
router.get('/stats', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get XP stats
    const xpStats = await xpService.getUserXPStats(userId);

    // Get donation stats
    const donations = await Donation.findAll({
      where: { userId },
      attributes: ['amount', 'currency', 'createdAt', 'charityName']
    });

    const totalDonations = donations.length;
    const totalAmountDonated = donations.reduce((sum, d) => sum + d.amount, 0);
    const charitiesSupported = new Set(donations.map(d => d.charityId)).size;

    res.json({
      success: true,
      stats: {
        ...xpStats,
        totalDonations,
        totalAmountDonated,
        charitiesSupported,
        badges: user.badges || [],
        collectables: user.collectables || []
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user profile by ID (public)
router.get('/:userId/profile', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: ['id', 'companyName', 'logoUrl', 'xp', 'level', 'badges', 'collectables', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const xpStats = await xpService.getUserXPStats(userId);

    const donations = await Donation.findAll({
      where: { userId },
      attributes: ['amount', 'currency', 'createdAt']
    });

    const totalDonations = donations.length;
    const totalAmountDonated = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({
      success: true,
      profile: {
        id: user.id,
        companyName: user.companyName,
        logoUrl: user.logoUrl,
        ...xpStats,
        totalDonations,
        totalAmountDonated,
        badges: user.badges || [],
        collectables: user.collectables || [],
        memberSince: user.createdAt
      }
    });
  } catch (error: any) {
    logger.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get user donation history
router.get('/donations/history', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.id;

    const donations = await Donation.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      donations
    });
  } catch (error: any) {
    logger.error('Error fetching donation history:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

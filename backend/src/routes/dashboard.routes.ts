import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { Donation } from '../models/Donation.model';
import { User } from '../models/User.model';
import { Charity } from '../models/Charity.model';

const router = express.Router();

router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    const userDonations = await Donation.findAll({
      where: { userId },
      include: [
        {
          model: Charity,
          as: 'charity',
          attributes: ['name']
        }
      ]
    });

    const totalDonations = userDonations.length;
    const totalAmount = userDonations.reduce((sum, donation) => sum + donation.amount, 0);
    const charitiesSupported = new Set(userDonations.map(d => d.charityId)).size;
    const lastDonationDate = userDonations.length > 0 
      ? userDonations.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
      : null;

    res.json({
      totalDonations,
      totalAmount,
      charitiesSupported,
      lastDonationDate
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export { router as dashboardRoutes };
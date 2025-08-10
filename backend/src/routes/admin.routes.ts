import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { Donation } from '../models/Donation.model';
import { User } from '../models/User.model';
import { Charity } from '../models/Charity.model';

const router = express.Router();

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalDonations = await Donation.count();
    const totalCharities = await Charity.count({ where: { isActive: true } });
    
    const donations = await Donation.findAll();
    const totalAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);

    const recentDonations = await Donation.findAll({
      limit: 10,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['companyName']
        },
        {
          model: Charity,
          as: 'charity',
          attributes: ['name']
        }
      ]
    });

    const formattedRecentDonations = recentDonations.map(donation => ({
      id: donation.id,
      amount: donation.amount,
      donorCompany: donation.user?.companyName || 'Unknown',
      charityName: donation.charity?.name || 'Unknown',
      createdAt: donation.createdAt
    }));

    res.json({
      totalUsers,
      totalDonations,
      totalAmount,
      totalCharities,
      recentDonations: formattedRecentDonations
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
});

export { router as adminRoutes };
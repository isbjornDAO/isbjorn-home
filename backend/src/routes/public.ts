import express from 'express';
import { Charity } from '../models/Charity.model';
import { IRDCompliantDonation } from '../models/IRDCompliantDonation.model';
import { NZCompany } from '../models/NZCompany.model';
import { logger } from '../utils/logger';
import nzbnSearchRoutes from './nzbn-search';

const router = express.Router();
const isProduction = process.env.NODE_ENV === 'production';

// Simple ping endpoint for health check
router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

router.get('/charities', async (req, res) => {
  try {
    // Prefer real charities from the database
    const charities = await Charity.findAll({
      where: { isActive: true },
      attributes: [
        'id',
        'name',
        'description',
        'category',
        'website',
        'logoUrl',
        'charityPhoto',
        'icon',
        'location',
        'totalReceived',
        'donationCount',
      ],
      order: [['name', 'ASC']],
      limit: 200,
    }).catch((dbError) => {
      logger.error('Database error fetching charities:', dbError);
      return [];
    });

    if (charities.length > 0) {
      res.json({ success: true, data: charities });
      return;
    }

    // In non-production, fall back to static data with images and emojis for demo/dev
    if (isProduction) {
      res.json({ success: true, data: [] });
      return;
    }

    const staticCharities = [
      {
        id: 'isbjorn',
        name: 'Isbjorn',
        description: 'Leading the fight against climate change through innovative blockchain-based climate action and transparency.',
        category: 'Climate',
        country: 'Global',
        location: 'Worldwide',
        website: 'https://isbjorn.io',
        logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
        charityPhoto: 'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?w=800',
        icon: 'https://logo.clearbit.com/isbjorn.io',
        totalReceived: 5200000,
        donationCount: 68400,
        followerCount: 0,
        verified: true
      },
      {
        id: 'greenpeace',
        name: 'Greenpeace International',
        description: 'Global environmental organization campaigning against climate change, deforestation, overfishing, and pollution through peaceful direct action.',
        category: 'Climate Action',
        country: 'Netherlands',
        location: 'Amsterdam',
        website: 'https://greenpeace.org',
        charityPhoto: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
        icon: 'https://logo.clearbit.com/greenpeace.org',
        verified: true,
        totalReceived: 5800000,
        donationCount: 76300,
        followerCount: 0
      },
      {
        id: 'wwf',
        name: 'World Wide Fund for Nature (WWF)',
        description: 'Leading conservation organization working to protect wildlife, halt deforestation, and combat climate change globally through science-based solutions.',
        category: 'Climate & Wildlife',
        country: 'Switzerland',
        location: 'Gland',
        website: 'https://worldwildlife.org',
        charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
        icon: 'https://logo.clearbit.com/worldwildlife.org',
        verified: true,
        totalReceived: 6500000,
        donationCount: 89200,
        followerCount: 0
      },
      {
        id: 'ocean-conservancy',
        name: 'Ocean Conservancy',
        description: 'Protecting ocean ecosystems and fighting climate change through science-based solutions and advocacy for healthy oceans.',
        category: 'Climate & Ocean',
        country: 'United States',
        location: 'Washington, DC',
        website: 'https://oceanconservancy.org',
        charityPhoto: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
        icon: 'https://logo.clearbit.com/oceanconservancy.org',
        verified: true,
        totalReceived: 3200000,
        donationCount: 45600,
        followerCount: 0
      },
      {
        id: 'rainforest-alliance',
        name: 'Rainforest Alliance',
        description: 'Protecting forests to fight climate change, conserve biodiversity, and ensure sustainable livelihoods.',
        category: 'Climate & Forests',
        country: 'United States',
        location: 'New York, NY',
        website: 'https://rainforest-alliance.org',
        charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
        icon: 'https://logo.clearbit.com/rainforest-alliance.org',
        verified: true,
        totalReceived: 3600000,
        donationCount: 49800,
        followerCount: 0
      },
      {
        id: 'sierra-club',
        name: 'Sierra Club',
        description: 'Fighting climate change by transitioning to clean energy, protecting wild places, and building a healthy planet for all.',
        category: 'Climate & Clean Energy',
        country: 'United States',
        location: 'Oakland, CA',
        website: 'https://sierraclub.org',
        charityPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
        icon: 'https://logo.clearbit.com/sierraclub.org',
        verified: true,
        totalReceived: 3800000,
        donationCount: 52400,
        followerCount: 0
      },
      {
        id: 'nature-conservancy',
        name: 'The Nature Conservancy',
        description: 'Protecting ecologically important lands and waters to combat climate change through nature-based solutions and carbon sequestration.',
        category: 'Climate Solutions',
        country: 'United States',
        location: 'Arlington, VA',
        website: 'https://nature.org',
        charityPhoto: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
        icon: 'https://logo.clearbit.com/nature.org',
        verified: true,
        totalReceived: 6200000,
        donationCount: 82400,
        followerCount: 0
      },
      {
        id: 'conservation-international',
        name: 'Conservation International',
        description: 'Protecting nature as a solution to climate change through science, partnerships, and field demonstration in biodiversity hotspots.',
        category: 'Climate & Nature',
        country: 'United States',
        location: 'Arlington, VA',
        website: 'https://conservation.org',
        charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
        icon: 'https://logo.clearbit.com/conservation.org',
        verified: true,
        totalReceived: 4900000,
        donationCount: 64800,
        followerCount: 0
      }
    ];

    res.json({ success: true, data: staticCharities });
  } catch (error: any) {
    logger.error('Error fetching charities:', error);

    // DEBUG: Return detailed error
    res.status(500).json({
      success: false,
      message: 'Failed to load charities',
      error: error.message,
      stack: error.stack
    });
  }
});

// Get single charity by ID - FAST endpoint (no need to load all charities)
router.get('/charities/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const charity = await Charity.findOne({
      where: { id, isActive: true },
      attributes: [
        'id',
        'name',
        'description',
        'category',
        'website',
        'email',
        'phone',
        'logoUrl',
        'charityPhoto',
        'icon',
        'location',
        'totalReceived',
        'donationCount',
        'taxDeductible',
        'irdNumber',
        'diaCharitiesNumber',
        'isDoneeOrganisation',
      ],
    });

    if (!charity) {
      res.status(404).json({ success: false, message: 'Charity not found' });
      return;
    }

    res.json({ success: true, data: charity });
  } catch (error) {
    logger.error('Error fetching charity:', error);
    res.status(500).json({ success: false, message: 'Failed to load charity' });
  }
});

// Admin endpoint to reset charity stats (protected by secret key)
router.post('/admin/reset-charity-stats', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'] || req.query.key;
    const expectedKey = process.env.ADMIN_SECRET_KEY || 'isbjorn-reset-2024';

    if (adminKey !== expectedKey) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    await Charity.update(
      { totalReceived: 0, donationCount: 0 },
      { where: {} }
    );

    const charities = await Charity.findAll({
      attributes: ['name', 'totalReceived', 'donationCount']
    });

    logger.info('Charity stats reset via admin endpoint');
    res.json({
      success: true,
      message: 'All charity stats reset to 0',
      charities: charities.map(c => ({
        name: c.name,
        totalReceived: c.totalReceived,
        donationCount: c.donationCount
      }))
    });
  } catch (error: any) {
    logger.error('Error resetting charity stats:', error);
    res.status(500).json({ success: false, message: 'Failed to reset stats' });
  }
});

// Public stats for homepage (no mock numbers)
router.get('/stats', async (req, res) => {
  try {
    const [charityCount, donationCount, totalDonatedRaw, companyCount] = await Promise.all([
      Charity.count({ where: { isActive: true } }),
      IRDCompliantDonation.count(),
      IRDCompliantDonation.sum('donationAmountNzd'),
      NZCompany.count({ where: { isVerified: true } }),
    ]);

    const totalDonatedNzd = Number(totalDonatedRaw || 0);

    res.json({
      success: true,
      data: {
        registeredCharities: charityCount,
        donationsProcessed: donationCount,
        totalDonatedNzd,
        businessPartners: companyCount,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching public stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load stats',
    });
  }
});

// NZBN company search routes
router.use('/nzbn', nzbnSearchRoutes);

export default router;

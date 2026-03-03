import express from 'express';
import { PolarBear } from '../models/PolarBear.model';
import { ClimateZone } from '../models/ClimateZone.model';
import { ResearchStation } from '../models/ResearchStation.model';
import { Mission } from '../models/Mission.model';
import { SeaIce } from '../models/SeaIce.model';
import { Permafrost } from '../models/Permafrost.model';
import { Glacier } from '../models/Glacier.model';
import { logger } from '../utils/logger';

const router = express.Router();

// Get all polar bears
router.get('/polar-bears', async (req, res) => {
  try {
    const bears = await PolarBear.findAll({
      order: [['lastUpdated', 'DESC']],
    });

    res.json({ success: true, data: bears });
  } catch (error: any) {
    logger.error('Error fetching polar bears:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch polar bears' });
  }
});

// Get single polar bear by ID
router.get('/polar-bears/:id', async (req, res) => {
  try {
    const bear = await PolarBear.findByPk(req.params.id);

    if (!bear) {
      return res.status(404).json({ success: false, message: 'Polar bear not found' });
    }

    res.json({ success: true, data: bear });
  } catch (error: any) {
    logger.error('Error fetching polar bear:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch polar bear' });
  }
});

// Get all climate zones
router.get('/climate-zones', async (req, res) => {
  try {
    const { severity, type } = req.query;

    const where: any = {};
    if (severity) where.severity = severity;
    if (type) where.type = type;

    const zones = await ClimateZone.findAll({
      where,
      order: [['severity', 'DESC'], ['lastUpdated', 'DESC']],
    });

    res.json({ success: true, data: zones });
  } catch (error: any) {
    logger.error('Error fetching climate zones:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch climate zones' });
  }
});

// Get single climate zone by ID
router.get('/climate-zones/:id', async (req, res) => {
  try {
    const zone = await ClimateZone.findByPk(req.params.id);

    if (!zone) {
      return res.status(404).json({ success: false, message: 'Climate zone not found' });
    }

    res.json({ success: true, data: zone });
  } catch (error: any) {
    logger.error('Error fetching climate zone:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch climate zone' });
  }
});

// Get all research stations
router.get('/research-stations', async (req, res) => {
  try {
    const { type, active } = req.query;

    const where: any = {};
    if (type) where.type = type;
    if (active !== undefined) where.isActive = active === 'true';

    const stations = await ResearchStation.findAll({
      where,
      order: [['lastActivity', 'DESC']],
    });

    res.json({ success: true, data: stations });
  } catch (error: any) {
    logger.error('Error fetching research stations:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch research stations' });
  }
});

// Get single research station by ID
router.get('/research-stations/:id', async (req, res) => {
  try {
    const station = await ResearchStation.findByPk(req.params.id);

    if (!station) {
      return res.status(404).json({ success: false, message: 'Research station not found' });
    }

    res.json({ success: true, data: station });
  } catch (error: any) {
    logger.error('Error fetching research station:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch research station' });
  }
});

// Get all missions
router.get('/missions', async (req, res) => {
  try {
    const { status, featured } = req.query;

    const where: any = {};
    if (status) where.status = status;
    if (featured !== undefined) where.isFeatured = featured === 'true';

    const missions = await Mission.findAll({
      where,
      order: [['priority', 'DESC'], ['startDate', 'DESC']],
    });

    res.json({ success: true, data: missions });
  } catch (error: any) {
    logger.error('Error fetching missions:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch missions' });
  }
});

// Get single mission by ID
router.get('/missions/:id', async (req, res) => {
  try {
    const mission = await Mission.findByPk(req.params.id);

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    res.json({ success: true, data: mission });
  } catch (error: any) {
    logger.error('Error fetching mission:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch mission' });
  }
});

// Get featured mission (like Svalbard)
router.get('/missions/featured/current', async (req, res) => {
  try {
    const mission = await Mission.findOne({
      where: { isFeatured: true, status: 'active' },
      order: [['priority', 'DESC']],
    });

    if (!mission) {
      return res.status(404).json({ success: false, message: 'No featured mission found' });
    }

    res.json({ success: true, data: mission });
  } catch (error: any) {
    logger.error('Error fetching featured mission:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch featured mission' });
  }
});

// Get all map data in one request (optimized for map loading)
router.get('/all', async (req, res) => {
  try {
    const [polarBears, climateZones, researchStations, missions] = await Promise.all([
      PolarBear.findAll({ limit: 50, order: [['lastUpdated', 'DESC']] }),
      ClimateZone.findAll({ limit: 100, order: [['severity', 'DESC']] }),
      ResearchStation.findAll({ where: { isActive: true }, limit: 50 }),
      Mission.findAll({ where: { status: 'active' }, limit: 20 }),
    ]);

    res.json({
      success: true,
      data: {
        polarBears,
        climateZones,
        researchStations,
        missions,
      },
    });
  } catch (error: any) {
    logger.error('Error fetching all map data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch map data' });
  }
});

// Add donation to mission (update funding received)
router.post('/missions/:id/donate', async (req, res) => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid donation amount' });
    }

    const mission = await Mission.findByPk(id);

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    // Update funding received
    const newFundingReceived = Number(mission.fundingReceived) + Number(amount);
    await mission.update({ fundingReceived: newFundingReceived });

    // Check if any milestones were achieved
    const achievedMilestones = mission.milestones?.map((milestone) => {
      if (!milestone.achieved && newFundingReceived >= milestone.targetAmount) {
        return { ...milestone, achieved: true };
      }
      return milestone;
    });

    if (achievedMilestones) {
      await mission.update({ milestones: achievedMilestones });
    }

    // Reload to get updated data
    await mission.reload();

    res.json({
      success: true,
      data: mission,
      message: `Successfully donated $${amount} to ${mission.name}`,
    });
  } catch (error: any) {
    logger.error('Error processing mission donation:', error);
    res.status(500).json({ success: false, message: 'Failed to process donation' });
  }
});

// ============================================
// ARCTIC CLIMATE DATA ROUTES
// ============================================

// Get Arctic summary - aggregated metrics for the data panel
router.get('/arctic/summary', async (req, res) => {
  try {
    const [seaIceData, permafrostData, glacierData, polarBearData] = await Promise.all([
      SeaIce.findOne({ where: { region: 'arctic' }, order: [['date', 'DESC']] }),
      Permafrost.findAll({ limit: 100 }),
      Glacier.findAll({ limit: 50 }),
      PolarBear.findAll({ where: { status: 'active' } }),
    ]);

    // Calculate aggregated metrics
    const totalThawingArea = permafrostData.reduce((sum, p) =>
      p.thawStatus !== 'stable' ? sum + (Number(p.carbonStoreTonnes) || 0) : sum, 0
    );
    const totalGlacierMassLoss = glacierData.reduce((sum, g) =>
      sum + Math.abs(Number(g.massBalanceGt) || 0), 0
    );
    const healthyBears = polarBearData.filter(b =>
      b.healthStatus === 'excellent' || b.healthStatus === 'good'
    ).length;

    res.json({
      success: true,
      data: {
        seaIce: seaIceData ? {
          extentKm2: Number(seaIceData.extentKm2) || 4180000,
          anomalyPercent: Number(seaIceData.anomalyPercent) || -13.2,
          concentrationPercent: Number(seaIceData.concentrationPercent) || 85,
          trend: 'decreasing',
        } : {
          extentKm2: 4180000,
          anomalyPercent: -13.2,
          concentrationPercent: 85,
          trend: 'decreasing',
        },
        temperature: {
          currentC: -18.5,
          anomalyC: 2.4,
          trend: 'warming',
        },
        permafrost: {
          thawingAreaKm2: totalThawingArea || 12500000,
          carbonReleaseGt: 1.5,
          zonesCount: permafrostData.length,
        },
        glaciers: {
          count: glacierData.length,
          totalMassLossGt: totalGlacierMassLoss || 280,
        },
        polarBears: {
          trackedCount: polarBearData.length,
          healthyPercent: polarBearData.length > 0
            ? Math.round((healthyBears / polarBearData.length) * 100)
            : 75,
        },
        lastUpdated: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Error fetching Arctic summary:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch Arctic summary' });
  }
});

// Get sea ice data
router.get('/sea-ice', async (req, res) => {
  try {
    const { region } = req.query;
    const where: any = {};
    if (region) where.region = region;

    const seaIce = await SeaIce.findAll({
      where,
      order: [['date', 'DESC']],
      limit: 100,
    });

    res.json({ success: true, data: seaIce });
  } catch (error: any) {
    logger.error('Error fetching sea ice data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sea ice data' });
  }
});

// Get latest sea ice extent for each region
router.get('/sea-ice/latest', async (req, res) => {
  try {
    const regions = ['arctic', 'beaufort', 'chukchi', 'laptev', 'kara', 'barents', 'greenland'];
    const latestData = await Promise.all(
      regions.map(region =>
        SeaIce.findOne({ where: { region }, order: [['date', 'DESC']] })
      )
    );

    res.json({
      success: true,
      data: latestData.filter(Boolean),
    });
  } catch (error: any) {
    logger.error('Error fetching latest sea ice:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch latest sea ice data' });
  }
});

// Get permafrost zones
router.get('/permafrost', async (req, res) => {
  try {
    const { status, region } = req.query;
    const where: any = {};
    if (status) where.thawStatus = status;
    if (region) where.region = region;

    const permafrost = await Permafrost.findAll({
      where,
      order: [['thawStatus', 'DESC'], ['lastUpdated', 'DESC']],
      limit: 100,
    });

    res.json({ success: true, data: permafrost });
  } catch (error: any) {
    logger.error('Error fetching permafrost data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch permafrost data' });
  }
});

// Get glaciers
router.get('/glaciers', async (req, res) => {
  try {
    const { type, status } = req.query;
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const glaciers = await Glacier.findAll({
      where,
      order: [['massBalanceGt', 'ASC']], // Most loss first
      limit: 100,
    });

    res.json({ success: true, data: glaciers });
  } catch (error: any) {
    logger.error('Error fetching glacier data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch glacier data' });
  }
});

// Get single glacier by ID
router.get('/glaciers/:id', async (req, res) => {
  try {
    const glacier = await Glacier.findByPk(req.params.id);

    if (!glacier) {
      return res.status(404).json({ success: false, message: 'Glacier not found' });
    }

    res.json({ success: true, data: glacier });
  } catch (error: any) {
    logger.error('Error fetching glacier:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch glacier' });
  }
});

export default router;

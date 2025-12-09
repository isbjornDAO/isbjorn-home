import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import collectableService from '../services/collectableService';

const router = Router();

/**
 * GET /api/collectables
 * Get all available collectables
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const collectables = await collectableService.getAllCollectables();
    res.json(collectables);
  } catch (error) {
    console.error('Error fetching collectables:', error);
    res.status(500).json({ error: 'Failed to fetch collectables' });
  }
});

/**
 * GET /api/collectables/user
 * Get authenticated user's collectables
 */
router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const collectables = await collectableService.getUserCollectables(userId);
    res.json(collectables);
  } catch (error) {
    console.error('Error fetching user collectables:', error);
    res.status(500).json({ error: 'Failed to fetch user collectables' });
  }
});

/**
 * GET /api/collectables/user/:userId
 * Get specific user's collectables (public)
 */
router.get('/user/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const collectables = await collectableService.getUserCollectables(userId);
    res.json(collectables);
  } catch (error) {
    console.error('Error fetching user collectables:', error);
    res.status(500).json({ error: 'Failed to fetch user collectables' });
  }
});

/**
 * GET /api/collectables/showcase
 * Get featured collectables
 */
router.get('/showcase', async (req: Request, res: Response) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const collectables = await collectableService.getShowcase(limit);
    res.json(collectables);
  } catch (error) {
    console.error('Error fetching showcase:', error);
    res.status(500).json({ error: 'Failed to fetch showcase' });
  }
});

/**
 * POST /api/collectables/check-achievements
 * Check and award achievements for authenticated user
 */
router.post('/check-achievements', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const awarded = await collectableService.checkAndAwardAchievements(userId);
    res.json({ awarded });
  } catch (error) {
    console.error('Error checking achievements:', error);
    res.status(500).json({ error: 'Failed to check achievements' });
  }
});

/**
 * POST /api/collectables (Admin only)
 * Create a new collectable
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const collectable = await collectableService.createCollectable(req.body);
    res.status(201).json(collectable);
  } catch (error) {
    console.error('Error creating collectable:', error);
    res.status(500).json({ error: 'Failed to create collectable' });
  }
});

export default router;

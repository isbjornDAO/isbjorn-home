import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import rewardService from '../services/rewardService';

const router = Router();

/**
 * GET /api/rewards
 * Get all available rewards
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const rewards = await rewardService.getAvailableRewards();
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching rewards:', error);
    res.status(500).json({ error: 'Failed to fetch rewards' });
  }
});

/**
 * GET /api/rewards/user
 * Get authenticated user's claimed rewards
 */
router.get('/user', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const rewards = await rewardService.getUserRewards(userId);
    res.json(rewards);
  } catch (error) {
    console.error('Error fetching user rewards:', error);
    res.status(500).json({ error: 'Failed to fetch user rewards' });
  }
});

/**
 * POST /api/rewards/claim
 * Claim a reward
 */
router.post('/claim', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { rewardId } = req.body;

    if (!rewardId) {
      return res.status(400).json({ error: 'Reward ID required' });
    }

    const result = await rewardService.claimReward(userId, rewardId);

    if (!result.success) {
      return res.status(400).json({ error: result.error });
    }

    res.json(result);
  } catch (error) {
    console.error('Error claiming reward:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
});

/**
 * POST /api/rewards (Admin only)
 * Create a new reward
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const reward = await rewardService.createReward(req.body);
    res.status(201).json(reward);
  } catch (error) {
    console.error('Error creating reward:', error);
    res.status(500).json({ error: 'Failed to create reward' });
  }
});

/**
 * PUT /api/rewards/:id (Admin only)
 * Update a reward
 */
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const reward = await rewardService.updateReward(id, req.body);

    if (!reward) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json(reward);
  } catch (error) {
    console.error('Error updating reward:', error);
    res.status(500).json({ error: 'Failed to update reward' });
  }
});

/**
 * DELETE /api/rewards/:id (Admin only)
 * Delete a reward (sets inactive)
 */
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userRole = (req as any).user.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const success = await rewardService.deleteReward(id);

    if (!success) {
      return res.status(404).json({ error: 'Reward not found' });
    }

    res.json({ message: 'Reward deleted successfully' });
  } catch (error) {
    console.error('Error deleting reward:', error);
    res.status(500).json({ error: 'Failed to delete reward' });
  }
});

export default router;

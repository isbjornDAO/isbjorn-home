import express from 'express';

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    res.json({ message: 'Donations endpoint - coming soon' });
  } catch (error) {
    next(error);
  }
});

router.post('/', async (req, res, next) => {
  try {
    res.json({ message: 'Create donation - coming soon' });
  } catch (error) {
    next(error);
  }
});

export default router;
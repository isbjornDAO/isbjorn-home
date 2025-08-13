import express from 'express';
import authRoutes from './auth';
import donationRoutes from './donations';
import streamlinedDonationRoutes from './streamlinedDonations';
import projectRoutes from './projects';
import { dashboardRoutes } from './dashboard.routes';
import { adminRoutes } from './admin.routes';
import { integrationsRoutes } from './integrations.routes';
import { workingAuthRoutes } from './working-auth';
import publicRoutes from './public';
import stripeCheckoutRoutes from './stripe-checkout';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0-streamlined',
    features: [
      'Ultra-streamlined NZ donations',
      'IRD compliance automation',
      'Real-time company verification',
      'Instant receipt generation',
      'Xero/MYOB integration ready'
    ]
  });
});

// API routes  
router.use('/auth', workingAuthRoutes); // Using working auth with real database
router.use('/donations', streamlinedDonationRoutes); // New streamlined endpoints
router.use('/donations-legacy', donationRoutes); // Legacy donation endpoints
router.use('/projects', projectRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/admin', adminRoutes);
router.use('/public', publicRoutes);
router.use('/integrations', integrationsRoutes);
router.use('/stripe-checkout', stripeCheckoutRoutes);

// Convenience endpoints that map to streamlined routes
router.use('/companies', streamlinedDonationRoutes);
router.use('/charities', streamlinedDonationRoutes);
router.use('/receipts', streamlinedDonationRoutes);

export default router;
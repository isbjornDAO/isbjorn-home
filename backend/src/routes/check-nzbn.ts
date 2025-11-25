import express from 'express';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * Check if a company NZBN is already registered
 * GET /api/auth/check-nzbn/:nzbn
 */
router.get('/check-nzbn/:nzbn', async (req, res) => {
    try {
        const { nzbn } = req.params;

        if (!nzbn) {
            return res.status(400).json({
                success: false,
                message: 'NZBN is required'
            });
        }

        // Check if user with this NZBN exists
        const existingUser = await User.findOne({
            where: { nzbn },
            attributes: ['id', 'email', 'companyName']
        });

        if (existingUser) {
            // Mask email for privacy (show first 2 chars and domain)
            const email = existingUser.dataValues.email;
            const [localPart, domain] = email.split('@');
            const maskedEmail = `${localPart.substring(0, 2)}***@${domain}`;

            return res.json({
                success: true,
                exists: true,
                companyName: existingUser.dataValues.companyName,
                email: maskedEmail
            });
        }

        return res.json({
            success: true,
            exists: false
        });

    } catch (error) {
        logger.error('Check NZBN error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check NZBN'
        });
    }
});

/**
 * Check if an email is already registered
 * GET /api/auth/check-email/:email
 */
router.get('/check-email/:email', async (req, res) => {
    try {
        const { email } = req.params;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: 'Email is required'
            });
        }

        const existingUser = await User.findOne({
            where: { email: email.toLowerCase() },
            attributes: ['id', 'companyName']
        });

        return res.json({
            success: true,
            exists: !!existingUser,
            companyName: existingUser?.dataValues.companyName
        });

    } catch (error) {
        logger.error('Check email error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check email'
        });
    }
});

export default router;

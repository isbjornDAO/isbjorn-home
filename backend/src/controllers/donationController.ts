import { Request, Response } from 'express';
import { Donation, DonationStatus, DonationCurrency } from '../models/Donation.model';
import { x402Service } from '../services/x402Service';
import { receiptService } from '../services/receiptService';
import { logger } from '../utils/logger';
import { validationResult } from 'express-validator';

export class DonationController {
    /**
     * Process a new donation via x402
     */
    async createX402Donation(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { amount, currency, businessId } = req.body;
            const userId = (req as any).user?.id; // Assuming auth middleware

            // 1. Create pending donation record
            const donation = await Donation.create({
                userId: userId || 'anonymous', // Handle anonymous for now if no auth
                amount,
                currency: currency || DonationCurrency.USD,
                status: DonationStatus.PENDING,
                metadata: { businessId, paymentMethod: 'x402' }
            });

            // 2. Initiate x402 payment (Mock)
            const payment = await x402Service.createPayment({
                amount,
                currency: currency || 'USD',
                recipient: process.env.ISBJORN_WALLET || '0xIsbjornWallet'
            });

            // 3. Update donation with payment ID
            await donation.update({ stripePaymentIntentId: payment.id }); // Reusing field or add new one

            res.json({
                success: true,
                donationId: donation.id,
                paymentId: payment.id,
                status: payment.status
            });

        } catch (error) {
            logger.error('Error creating x402 donation:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * Verify x402 payment and generate receipt
     */
    async verifyAndReceipt(req: Request, res: Response) {
        try {
            const { donationId } = req.params;
            const donation = await Donation.findByPk(donationId);

            if (!donation) {
                return res.status(404).json({ success: false, message: 'Donation not found' });
            }

            // 1. Verify payment
            // In real x402, this might be a webhook or polling
            const verification = await x402Service.verifyPayment(donation.stripePaymentIntentId!); // Using intent ID field for now

            if (verification.status === 'completed') {
                await donation.update({
                    status: DonationStatus.COMPLETED,
                    completedAt: new Date()
                });

                // 2. Trigger receipt generation
                // Pay for service via x402 micropayment (Mock)
                await x402Service.triggerMicropayment('receipt_service', 0.50);

                // Generate PDF
                const pdfBuffer = await receiptService.generateReceipt(donation);

                // Send response (or email in real scenario)
                res.set({
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': `attachment; filename=receipt-${donation.id}.pdf`
                });
                res.send(pdfBuffer);

            } else {
                res.status(400).json({ success: false, status: verification.status });
            }

        } catch (error) {
            logger.error('Error verifying donation:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }

    /**
     * Get donation history for a business
     */
    async getHistory(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) return res.status(401).json({ message: 'Unauthorized' });

            const donations = await Donation.findAll({
                where: { userId },
                order: [['createdAt', 'DESC']]
            });

            res.json({ success: true, data: donations });
        } catch (error) {
            logger.error('Error fetching history:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export const donationController = new DonationController();

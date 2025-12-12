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

            // 2. Initiate x402 payment
            const payment = await x402Service.createPayment({
                amount,
                currency: currency || 'USD',
                recipient: process.env.X402_SERVER_WALLET_ADDRESS || '0x4c48B6d6a5d9Aab0cf8cFC21A0A4F3dEC663E9Cf',
                donationId: donation.id,
                metadata: { businessId }
            });

            // 3. Update donation with payment ID
            await donation.update({
                stripePaymentIntentId: payment.id,
                provider: 'x402'
            });

            res.json({
                success: true,
                donationId: donation.id,
                paymentId: payment.id,
                paymentIntent: payment,
                status: payment.status,
                message: 'Payment intent created. Complete payment on frontend using x402.'
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

    /**
     * Settle payment on-chain using X402
     * This endpoint is called after user authorizes payment on frontend
     */
    async settleX402Payment(req: Request, res: Response) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { donationId, transactionHash } = req.body;

            // Find the donation
            const donation = await Donation.findByPk(donationId);
            if (!donation) {
                return res.status(404).json({ success: false, message: 'Donation not found' });
            }

            // Verify the transaction hash if provided
            if (transactionHash) {
                const verification = await x402Service.verifyPayment(
                    donation.stripePaymentIntentId!,
                    transactionHash
                );

                // Update donation with transaction details
                await donation.update({
                    status: DonationStatus.COMPLETED,
                    blockchainTxHash: transactionHash,
                    completedAt: new Date(),
                    transactionId: transactionHash
                });

                logger.info(`Donation ${donationId} settled with tx: ${transactionHash}`);

                return res.json({
                    success: true,
                    donation,
                    verification,
                    transactionHash
                });
            }

            res.status(400).json({
                success: false,
                message: 'Transaction hash required for settlement'
            });

        } catch (error) {
            logger.error('Error settling x402 payment:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
}

export const donationController = new DonationController();

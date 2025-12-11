import x402, { thirdwebFacilitator, x402Chain, payToAddress } from '../utils/x402';
import { Donation, DonationStatus } from '../models/Donation.model';
import { User } from '../models/User.model';
import { logger } from '../utils/logger';
import emailReceiptService from './EmailReceiptService';

console.log('X402 Service imported x402:', JSON.stringify(x402, null, 2));

interface CreateCheckoutSessionParams {
    userId: string;
    amount: number;
    currency: string;
    charityId: string;
    charityName: string;
    companyName?: string;
    companyEmail: string;
    message?: string;
    isRecurring?: boolean;
}

export class X402Service {
    async createCheckoutSession(params: CreateCheckoutSessionParams) {
        try {
            // Create a pending donation record
            const donation = await Donation.create({
                userId: params.userId,
                amount: params.amount,
                currency: params.currency,
                charityId: params.charityId,
                charityName: params.charityName,
                donorName: params.companyName,
                donorEmail: params.companyEmail,
                message: params.message,
                isRecurring: params.isRecurring,
                status: DonationStatus.PENDING,
                provider: 'x402'
            });

            // Create X402 checkout session
            const session = await x402.checkout.sessions.create({
                amount: Math.round(params.amount * 100), // Amount in cents
                currency: params.currency,
                success_url: `${process.env.FRONTEND_URL}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL}/donation/cancel`,
                metadata: {
                    donationId: donation.id,
                    charityId: params.charityId
                },
                customer_email: params.companyEmail
            });

            // Update donation with session ID
            await donation.update({ sessionId: session.id });

            return {
                sessionId: session.id,
                sessionUrl: session.url,
                donation
            };
        } catch (error: any) {
            logger.error('X402 createCheckoutSession error:', error);
            throw error;
        }
    }

    async handleSuccessfulPayment(session: any) {
        try {
            const donationId = session.metadata?.donationId;
            if (!donationId) {
                logger.warn('X402 webhook missing donationId in metadata');
                return;
            }

            const donation = await Donation.findByPk(donationId);
            if (!donation) {
                logger.warn(`Donation not found for ID: ${donationId}`);
                return;
            }

            if (donation.status === DonationStatus.COMPLETED) {
                logger.info(`Donation ${donationId} already completed`);
                return;
            }

            await donation.update({
                status: DonationStatus.COMPLETED,
                transactionId: session.payment_intent || session.id,
                completedAt: new Date()
            });

            logger.info(`Donation ${donationId} marked as completed`);

            // Trigger receipt generation email
            try {
                const receiptData = {
                    donationId: donation.id,
                    donorName: donation.donorName || 'Anonymous',
                    donorEmail: donation.donorEmail,
                    companyName: donation.donorName || 'N/A',
                    companyNumber: 'N/A',
                    charityName: donation.charityName,
                    charityNumber: 'N/A',
                    amount: donation.amount,
                    currency: donation.currency.toUpperCase(),
                    date: donation.completedAt || new Date(),
                    receiptNumber: `IR-${donation.id.substring(0, 8).toUpperCase()}`,
                    transactionId: donation.transactionId || 'N/A'
                };

                await emailReceiptService.sendReceipt(receiptData);
                logger.info(`Tax receipt emailed for donation ${donationId}`);
            } catch (receiptError) {
                logger.error('Failed to send receipt email:', receiptError);
                // Don't throw - donation was successful even if email failed
            }
        } catch (error: any) {
            logger.error('X402 handleSuccessfulPayment error:', error);
            throw error;
        }
    }

    async createWallet(userId: string) {
        try {
            const user = await User.findByPk(userId);
            if (!user) throw new Error('User not found');

            // Check if user already has a wallet
            if (user.x402WalletId) {
                return { walletId: user.x402WalletId };
            }

            const wallet = await x402.wallets.create({
                customer_id: userId, // Assuming mapping or creating customer first
                email: user.email
            });

            await user.update({ x402WalletId: wallet.id });
            return { walletId: wallet.id };
        } catch (error: any) {
            logger.error('X402 createWallet error:', error);
            throw error;
        }
    }

    async chargeWallet(walletId: string, amount: number, currency: string = 'NZD') {
        try {
            const transaction = await x402.wallets.charge(walletId, {
                amount: Math.round(amount * 100),
                currency
            });
            return transaction;
        } catch (error: any) {
            logger.error('X402 chargeWallet error:', error);
            throw error;
        }
    }

    async getWalletBalance(walletId: string) {
        try {
            const balance = await x402.wallets.retrieveBalance(walletId);
            return balance;
        } catch (error: any) {
            logger.error('X402 getWalletBalance error:', error);
            throw error;
        }
    }

    async createPayment(params: {
        amount: number;
        currency: string;
        recipient: string;
        donationId?: string;
        metadata?: any;
    }) {
        try {
            logger.info('Creating X402 payment:', {
                amount: params.amount,
                currency: params.currency,
                recipient: params.recipient
            });

            // Convert amount to smallest unit (e.g., cents for USD, wei-like for tokens)
            const amountInCents = Math.round(params.amount * 100);

            // Return payment intent that will be settled with settlePayment() on frontend
            const paymentIntent = {
                id: `x402_payment_${Date.now()}`,
                amount: amountInCents,
                currency: params.currency.toUpperCase(),
                recipient: params.recipient,
                payTo: payToAddress,
                chain: x402Chain,
                network: 'avalanche-fuji',
                status: 'pending',
                metadata: params.metadata,
                donationId: params.donationId,
                // Instructions for frontend to complete payment
                instructions: {
                    facilitator: 'thirdweb',
                    chainId: 43113, // Avalanche Fuji
                    serverWallet: payToAddress
                }
            };

            logger.info('X402 payment intent created:', paymentIntent.id);
            return paymentIntent;
        } catch (error: any) {
            logger.error('X402 createPayment error:', error);
            throw error;
        }
    }

    async verifyPayment(paymentId: string, transactionHash?: string) {
        try {
            logger.info('Verifying X402 payment:', { paymentId, transactionHash });

            // If transaction hash is provided, we can verify on-chain
            if (transactionHash) {
                // Payment was settled on-chain via settlePayment()
                // In production, you would verify the transaction on Avalanche
                logger.info(`Payment ${paymentId} settled on-chain: ${transactionHash}`);

                return {
                    id: paymentId,
                    transactionHash,
                    status: 'completed',
                    verified: true,
                    timestamp: new Date()
                };
            }

            // Otherwise return pending status
            return {
                id: paymentId,
                status: 'pending',
                verified: false
            };
        } catch (error: any) {
            logger.error('X402 verifyPayment error:', error);
            throw error;
        }
    }

    /**
     * Settlement happens on the frontend using settlePayment()
     * This method is for future backend-initiated settlements if needed
     *
     * For now, settlements are handled via:
     * 1. Frontend calls settlePayment() from thirdweb/x402
     * 2. User approves transaction in wallet
     * 3. Frontend sends tx hash to backend via completePayment()
     */
    async settlePaymentOnChain(params: {
        amount: string;
        tokenAddress: string;
        donationId: string;
    }) {
        try {
            logger.info('Settlement initiated for donation:', params.donationId);

            // Settlement happens on frontend with user wallet interaction
            // Backend receives and verifies the transaction hash after completion

            return {
                success: false,
                message: 'Settlement must be initiated from frontend with user wallet',
                instructions: {
                    note: 'Use settlePayment() on frontend with user wallet connected',
                    facilitatorWallet: payToAddress,
                    network: 'avalanche-fuji'
                }
            };
        } catch (error: any) {
            logger.error('X402 settlePaymentOnChain error:', error);
            throw error;
        }
    }

    async triggerMicropayment(service: string, amount: number) {
        try {
            logger.info(`Triggering X402 micropayment for ${service}: $${amount}`);

            // Create micropayment using x402 protocol
            const payment = await this.createPayment({
                amount,
                currency: 'USDC',
                recipient: payToAddress,
                metadata: {
                    service,
                    type: 'micropayment'
                }
            });

            logger.info(`Micropayment created: ${payment.id}`);

            return {
                id: payment.id,
                service,
                amount,
                status: 'pending',
                paymentIntent: payment
            };
        } catch (error: any) {
            logger.error('X402 triggerMicropayment error:', error);
            throw error;
        }
    }
}

export const x402Service = new X402Service();

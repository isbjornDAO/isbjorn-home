"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stripeService = exports.StripeService = void 0;
const stripe_1 = __importDefault(require("stripe"));
const Donation_model_1 = require("../models/Donation.model");
const User_model_1 = require("../models/User.model");
const Project_model_1 = require("../models/Project.model");
const AppError_1 = require("../utils/AppError");
const logger_1 = require("../utils/logger");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    apiVersion: '2023-10-16',
});
class StripeService {
    async createPaymentIntent(data) {
        try {
            const user = await User_model_1.User.findByPk(data.userId);
            if (!user) {
                throw new AppError_1.AppError('User not found', 404);
            }
            const project = await Project_model_1.Project.findByPk(data.projectId);
            if (!project) {
                throw new AppError_1.AppError('Project not found', 404);
            }
            if (!project.acceptingDonations) {
                throw new AppError_1.AppError('Project is not accepting donations', 400);
            }
            const amountInCents = Math.round(data.amount * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amountInCents,
                currency: data.currency.toLowerCase(),
                customer: await this.getOrCreateCustomer(user),
                description: `Donation to ${project.name} by ${user.companyName}`,
                metadata: {
                    donationId: 'pending',
                    userId: data.userId,
                    projectId: data.projectId,
                    projectName: project.name,
                    companyName: user.companyName,
                },
                statement_descriptor: 'ISBJORN DONATION',
                receipt_email: user.email,
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            const donation = await Donation_model_1.Donation.create({
                userId: data.userId,
                projectId: data.projectId,
                amount: data.amount,
                currency: data.currency,
                status: Donation_model_1.DonationStatus.PENDING,
                stripePaymentIntentId: paymentIntent.id,
                taxDeductible: true,
                message: data.message,
                isAnonymous: data.isAnonymous || false,
                platformFee: this.calculatePlatformFee(data.amount),
                stripeFee: this.calculateStripeFee(data.amount),
                metadata: {
                    userAgent: '',
                    ipAddress: '',
                },
            });
            await stripe.paymentIntents.update(paymentIntent.id, {
                metadata: {
                    ...paymentIntent.metadata,
                    donationId: donation.id,
                },
            });
            logger_1.logger.info(`Payment intent created: ${paymentIntent.id} for donation ${donation.id}`);
            return {
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id,
                donation,
            };
        }
        catch (error) {
            logger_1.logger.error('Create payment intent error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to create payment intent', 500);
        }
    }
    async handleWebhook(signature, payload) {
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!webhookSecret) {
            throw new AppError_1.AppError('Webhook secret not configured', 500);
        }
        let event;
        try {
            event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
        }
        catch (error) {
            logger_1.logger.error('Webhook signature verification failed:', error.message);
            throw new AppError_1.AppError('Webhook signature verification failed', 400);
        }
        logger_1.logger.info(`Processing webhook event: ${event.type}`);
        switch (event.type) {
            case 'payment_intent.succeeded':
                await this.handlePaymentSuccess(event.data.object);
                break;
            case 'payment_intent.payment_failed':
                await this.handlePaymentFailure(event.data.object);
                break;
            case 'payment_intent.canceled':
                await this.handlePaymentCanceled(event.data.object);
                break;
            default:
                logger_1.logger.info(`Unhandled event type: ${event.type}`);
        }
    }
    async handlePaymentSuccess(paymentIntent) {
        try {
            const donationId = paymentIntent.metadata.donationId;
            if (!donationId) {
                logger_1.logger.error('No donation ID in payment intent metadata');
                return;
            }
            const donation = await Donation_model_1.Donation.findByPk(donationId, {
                include: [User_model_1.User, Project_model_1.Project],
            });
            if (!donation) {
                logger_1.logger.error(`Donation not found: ${donationId}`);
                return;
            }
            const fees = this.extractFeesFromPaymentIntent(paymentIntent);
            const netAmount = donation.amount - fees.stripeFee - donation.platformFee;
            await donation.update({
                status: Donation_model_1.DonationStatus.COMPLETED,
                stripePaymentId: paymentIntent.charges?.data[0]?.id,
                completedAt: new Date(),
                stripeFee: fees.stripeFee,
                netAmount,
            });
            await donation.project.update({
                raisedAmount: Number(donation.project.raisedAmount) + Number(donation.amount),
                donorCount: donation.project.donorCount + 1,
            });
            logger_1.logger.info(`Payment succeeded for donation ${donation.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling payment success:', error);
        }
    }
    async handlePaymentFailure(paymentIntent) {
        try {
            const donationId = paymentIntent.metadata.donationId;
            if (!donationId)
                return;
            const donation = await Donation_model_1.Donation.findByPk(donationId);
            if (!donation)
                return;
            await donation.update({
                status: Donation_model_1.DonationStatus.FAILED,
                failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
            });
            logger_1.logger.info(`Payment failed for donation ${donation.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling payment failure:', error);
        }
    }
    async handlePaymentCanceled(paymentIntent) {
        try {
            const donationId = paymentIntent.metadata.donationId;
            if (!donationId)
                return;
            const donation = await Donation_model_1.Donation.findByPk(donationId);
            if (!donation)
                return;
            await donation.update({
                status: Donation_model_1.DonationStatus.FAILED,
                failureReason: 'Payment canceled by user',
            });
            logger_1.logger.info(`Payment canceled for donation ${donation.id}`);
        }
        catch (error) {
            logger_1.logger.error('Error handling payment cancellation:', error);
        }
    }
    async getOrCreateCustomer(user) {
        try {
            const existingCustomers = await stripe.customers.list({
                email: user.email,
                limit: 1,
            });
            if (existingCustomers.data.length > 0) {
                return existingCustomers.data[0].id;
            }
            const customer = await stripe.customers.create({
                email: user.email,
                name: user.companyName,
                metadata: {
                    userId: user.id,
                    companyName: user.companyName,
                },
            });
            return customer.id;
        }
        catch (error) {
            logger_1.logger.error('Error creating Stripe customer:', error);
            throw new AppError_1.AppError('Failed to create customer', 500);
        }
    }
    calculatePlatformFee(amount) {
        return Math.round(amount * 0.025 * 100) / 100;
    }
    calculateStripeFee(amount) {
        return Math.round((amount * 0.029 + 0.30) * 100) / 100;
    }
    extractFeesFromPaymentIntent(paymentIntent) {
        const charge = paymentIntent.charges?.data[0];
        if (!charge) {
            return { stripeFee: 0 };
        }
        const balanceTransaction = charge.balance_transaction;
        if (!balanceTransaction) {
            return { stripeFee: 0 };
        }
        return {
            stripeFee: balanceTransaction.fee / 100,
        };
    }
    async createRefund(donationId, reason) {
        try {
            const donation = await Donation_model_1.Donation.findByPk(donationId);
            if (!donation) {
                throw new AppError_1.AppError('Donation not found', 404);
            }
            if (!donation.stripePaymentId) {
                throw new AppError_1.AppError('No Stripe payment ID found', 400);
            }
            const refund = await stripe.refunds.create({
                charge: donation.stripePaymentId,
                reason: reason,
                metadata: {
                    donationId: donation.id,
                },
            });
            await donation.update({
                status: Donation_model_1.DonationStatus.REFUNDED,
                refundedAt: new Date(),
                refundReason: reason,
            });
            logger_1.logger.info(`Refund created for donation ${donation.id}: ${refund.id}`);
            return refund;
        }
        catch (error) {
            logger_1.logger.error('Create refund error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to create refund', 500);
        }
    }
    /**
     * Create Stripe Checkout session for donations
     */
    async createCheckoutSession(data) {
        try {
            const amountInCents = Math.round(data.amount * 100);
            // Create checkout session
            const session = await stripe.checkout.sessions.create({
                line_items: [
                    {
                        price_data: {
                            currency: data.currency.toLowerCase(),
                            product_data: {
                                name: `Donation to ${data.charityName}`,
                                description: data.message || `Thank you for your donation to ${data.charityName}`,
                            },
                            unit_amount: amountInCents,
                        },
                        quantity: 1,
                    },
                ],
                mode: 'payment',
                success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/donate`,
                customer_email: data.companyEmail,
                metadata: {
                    charityId: data.charityId,
                    charityName: data.charityName,
                    companyName: data.companyName || 'Anonymous',
                    message: data.message || '',
                    isRecurring: data.isRecurring ? 'true' : 'false',
                },
            });
            // Create donation record
            const donation = await Donation_model_1.Donation.create({
                charityId: data.charityId,
                amount: data.amount,
                currency: data.currency,
                status: Donation_model_1.DonationStatus.PENDING,
                stripePaymentIntentId: session.id, // Use session ID for now
                taxDeductible: true,
                message: data.message,
                isAnonymous: !data.companyName,
                platformFee: this.calculatePlatformFee(data.amount),
                stripeFee: this.calculateStripeFee(data.amount),
                metadata: {
                    stripeSessionId: session.id,
                    companyName: data.companyName,
                    companyEmail: data.companyEmail,
                },
            });
            logger_1.logger.info(`Checkout session created: ${session.id} for donation ${donation.id}`);
            return {
                sessionId: session.id,
                sessionUrl: session.url,
                donation,
            };
        }
        catch (error) {
            logger_1.logger.error('Create checkout session error:', error);
            if (error instanceof AppError_1.AppError)
                throw error;
            throw new AppError_1.AppError('Failed to create checkout session', 500);
        }
    }
}
exports.StripeService = StripeService;
exports.stripeService = new StripeService();
//# sourceMappingURL=stripeService.js.map
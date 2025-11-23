import Stripe from 'stripe';
import { Donation, DonationStatus, DonationCurrency } from '../models/Donation.model';
import { User } from '../models/User.model';
import { Project } from '../models/Project.model';
import { AppError } from '../utils/AppError';
import { logger } from '../utils/logger';
import { stripe, stripeConfig, isLiveMode } from '../utils/stripe';

interface CreatePaymentIntentRequest {
  amount: number;
  currency: DonationCurrency;
  userId: string;
  projectId: string;
  message?: string;
  isAnonymous?: boolean;
}

interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  donation: Donation;
}

interface CreateCheckoutSessionRequest {
  amount: number;
  currency: DonationCurrency;
  charityId: string;
  charityName: string;
  companyName?: string;
  companyEmail?: string;
  message?: string;
  isRecurring?: boolean;
}

interface CheckoutSessionResponse {
  sessionId: string;
  sessionUrl: string;
  donation: Donation;
}

export class StripeService {
  async createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    try {
      const user = await User.findByPk(data.userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      const project = await Project.findByPk(data.projectId);
      if (!project) {
        throw new AppError('Project not found', 404);
      }

      if (!project.acceptingDonations) {
        throw new AppError('Project is not accepting donations', 400);
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

      const donation = await Donation.create({
        userId: data.userId,
        projectId: data.projectId,
        amount: data.amount,
        currency: data.currency,
        status: DonationStatus.PENDING,
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

      logger.info(`Payment intent created: ${paymentIntent.id} for donation ${donation.id}`);

      return {
        clientSecret: paymentIntent.client_secret!,
        paymentIntentId: paymentIntent.id,
        donation,
      };
    } catch (error: any) {
      logger.error('Create payment intent error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create payment intent', 500);
    }
  }

  async handleWebhook(signature: string, payload: Buffer): Promise<void> {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new AppError('Webhook secret not configured', 500);
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error: any) {
      logger.error('Webhook signature verification failed:', error.message);
      throw new AppError('Webhook signature verification failed', 400);
    }

    logger.info(`Processing webhook event: ${event.type}`);
    logger.info(`[TradFi Verification] Webhook received for event: ${event.type} - ID: ${event.id}`);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await this.handlePaymentSuccess(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.payment_failed':
        await this.handlePaymentFailure(event.data.object as Stripe.PaymentIntent);
        break;
      case 'payment_intent.canceled':
        await this.handlePaymentCanceled(event.data.object as Stripe.PaymentIntent);
        break;
      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }
  }

  private async handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const donationId = paymentIntent.metadata.donationId;
      if (!donationId) {
        logger.error('No donation ID in payment intent metadata');
        return;
      }

      const donation = await Donation.findByPk(donationId, {
        include: [User, Project],
      });

      if (!donation) {
        logger.error(`Donation not found: ${donationId}`);
        return;
      }

      const fees = this.extractFeesFromPaymentIntent(paymentIntent);
      const netAmount = donation.amount - fees.stripeFee - donation.platformFee;

      await donation.update({
        status: DonationStatus.COMPLETED,
        stripePaymentId: (paymentIntent as any).charges?.data[0]?.id,
        completedAt: new Date(),
        stripeFee: fees.stripeFee,
        netAmount,
      });

      await donation.project.update({
        raisedAmount: Number(donation.project.raisedAmount) + Number(donation.amount),
        donorCount: donation.project.donorCount + 1,
      });

      logger.info(`Payment succeeded for donation ${donation.id}`);

    } catch (error) {
      logger.error('Error handling payment success:', error);
    }
  }

  private async handlePaymentFailure(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const donationId = paymentIntent.metadata.donationId;
      if (!donationId) return;

      const donation = await Donation.findByPk(donationId);
      if (!donation) return;

      await donation.update({
        status: DonationStatus.FAILED,
        failureReason: paymentIntent.last_payment_error?.message || 'Payment failed',
      });

      logger.info(`Payment failed for donation ${donation.id}`);
    } catch (error) {
      logger.error('Error handling payment failure:', error);
    }
  }

  private async handlePaymentCanceled(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    try {
      const donationId = paymentIntent.metadata.donationId;
      if (!donationId) return;

      const donation = await Donation.findByPk(donationId);
      if (!donation) return;

      await donation.update({
        status: DonationStatus.CANCELLED,
      });

      logger.info(`Payment canceled for donation ${donation.id}`);
    } catch (error) {
      logger.error('Error handling payment cancellation:', error);
    }
  }

  private async getOrCreateCustomer(user: User): Promise<string> {
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.companyName,
        metadata: {
          userId: user.id,
        },
      });

      await user.update({ stripeCustomerId: customer.id });
      return customer.id;
    } catch (error: any) {
      logger.error('Error creating Stripe customer:', error);
      throw new AppError('Failed to create customer', 500);
    }
  }

  private calculatePlatformFee(amount: number): number {
    return Math.round(amount * 0.025 * 100) / 100;
  }

  private calculateStripeFee(amount: number): number {
    return Math.round((amount * 0.029 + 0.30) * 100) / 100;
  }

  private extractFeesFromPaymentIntent(paymentIntent: Stripe.PaymentIntent): {
    stripeFee: number;
  } {
    const charge = (paymentIntent as any).charges?.data[0];
    if (!charge) {
      return { stripeFee: 0 };
    }

    const balanceTransaction = charge.balance_transaction as Stripe.BalanceTransaction;
    if (!balanceTransaction) {
      return { stripeFee: 0 };
    }

    return {
      stripeFee: balanceTransaction.fee / 100,
    };
  }

  async createRefund(donationId: string, reason?: string): Promise<Stripe.Refund> {
    try {
      const donation = await Donation.findByPk(donationId);
      if (!donation) {
        throw new AppError('Donation not found', 404);
      }

      if (!donation.stripePaymentId) {
        throw new AppError('No Stripe payment ID found', 400);
      }

      const refund = await stripe.refunds.create({
        charge: donation.stripePaymentId,
        reason: reason as any,
        metadata: {
          donationId: donation.id,
        },
      });

      await donation.update({
        status: DonationStatus.REFUNDED,
        refundedAt: new Date(),
        refundReason: reason,
      });

      logger.info(`Refund created for donation ${donation.id}: ${refund.id}`);

      return refund;
    } catch (error: any) {
      logger.error('Create refund error:', error);
      if (error instanceof AppError) throw error;
      throw new AppError('Failed to create refund', 500);
    }
  }

  /**
   * Handle successful payment from webhook
   */
  async handleSuccessfulPayment(session: Stripe.Checkout.Session): Promise<void> {
    try {
      const sessionId = session.id;
      const metadata = session.metadata;

      if (!metadata?.charityId) {
        logger.error(`No charity ID in session metadata: ${sessionId}`);
        return;
      }

      // Find the donation by session ID
      const donation = await Donation.findOne({
        where: {
          metadata: {
            stripeSessionId: sessionId
          }
        }
      });

      if (!donation) {
        logger.error(`No donation found for session: ${sessionId}`);
        return;
      }

      // Update donation status
      await donation.update({
        status: DonationStatus.COMPLETED,
        completedAt: new Date(),
        stripePaymentIntentId: session.payment_intent as string,
      });

      logger.info(`Donation ${donation.id} marked as completed for session ${sessionId}`);

      // TODO: Send receipt email
      // TODO: Update blockchain
      // TODO: Send confirmation to charity

    } catch (error: any) {
      logger.error('Error handling successful payment:', error);
      throw error;
    }
  }

  /**
   * Create Stripe Checkout session for donations
   */
  async createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse> {
    try {
      // Log the current Stripe configuration
      logger.info(`Stripe mode: ${stripeConfig.mode}`);
      logger.info(`Using Stripe key starting with: ${stripeConfig.secretKey.substring(0, 7)}...`);

      // Show warning for live mode
      if (isLiveMode()) {
        logger.warn('⚠️  LIVE MODE: Real money will be charged!');
      } else {
        logger.info('🧪 TEST MODE: No real money will be charged');
      }

      const amountInCents = Math.round(data.amount * 100);

      logger.info(`Creating Stripe checkout session for ${data.amount} ${data.currency} to ${data.charityName}`);

      // Create checkout session
      const session = await stripe.checkout.sessions.create({
        line_items: [
          {
            price_data: {
              currency: data.currency.toLowerCase(),
              product_data: {
                name: `Donation to ${data.charityName}`,
                description: data.message || `Thank you for your donation to ${data.charityName}`,
                images: ['https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400'], // Arctic image
              },
              unit_amount: amountInCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL || 'https://isbjorn-home-production.up.railway.app'}/donation-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'https://isbjorn-home-production.up.railway.app'}/donate`,
        customer_email: data.companyEmail,
        billing_address_collection: 'required',
        metadata: {
          charityId: data.charityId,
          charityName: data.charityName,
          companyName: data.companyName || 'Anonymous',
          message: data.message || '',
          isRecurring: data.isRecurring ? 'true' : 'false',
        },
      });

      logger.info(`Stripe checkout session created: ${session.id}`);

      // For checkout sessions, we need to handle the case where there's no user
      // We'll create a donation with a temporary user ID that can be updated later
      const tempUserId = 'temp-user-' + Date.now();

      // Create donation record
      const donation = await Donation.create({
        userId: tempUserId, // Temporary user ID for anonymous donations
        charityId: data.charityId,
        amount: data.amount,
        currency: data.currency,
        status: DonationStatus.PENDING,
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
          isAnonymousDonation: true,
          tempUserId: tempUserId,
        },
      });

      logger.info(`Checkout session created: ${session.id} for donation ${donation.id}`);

      return {
        sessionId: session.id,
        sessionUrl: session.url!,
        donation,
      };
    } catch (error: any) {
      logger.error('Create checkout session error:', error);
      if (error instanceof AppError) throw error;

      // Provide more specific error messages
      if (error.type === 'StripeInvalidRequestError') {
        throw new AppError(`Stripe configuration error: ${error.message}`, 400);
      } else if (error.type === 'StripeAuthenticationError') {
        throw new AppError('Invalid Stripe API key. Please check your configuration.', 401);
      } else if (error.type === 'StripePermissionError') {
        throw new AppError('Stripe permission error. Please check your account settings.', 403);
      }

      throw new AppError(`Failed to create checkout session: ${error.message}`, 500);
    }
  }
}

export const stripeService = new StripeService();
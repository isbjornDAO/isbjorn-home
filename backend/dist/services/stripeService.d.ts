import Stripe from 'stripe';
import { Donation, DonationCurrency } from '../models/Donation.model';
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
export declare class StripeService {
    createPaymentIntent(data: CreatePaymentIntentRequest): Promise<PaymentIntentResponse>;
    handleWebhook(signature: string, payload: Buffer): Promise<void>;
    private handlePaymentSuccess;
    private handlePaymentFailure;
    private handlePaymentCanceled;
    private getOrCreateCustomer;
    private calculatePlatformFee;
    private calculateStripeFee;
    private extractFeesFromPaymentIntent;
    createRefund(donationId: string, reason?: string): Promise<Stripe.Refund>;
    /**
     * Create Stripe Checkout session for donations
     */
    createCheckoutSession(data: CreateCheckoutSessionRequest): Promise<CheckoutSessionResponse>;
}
export declare const stripeService: StripeService;
export {};
//# sourceMappingURL=stripeService.d.ts.map
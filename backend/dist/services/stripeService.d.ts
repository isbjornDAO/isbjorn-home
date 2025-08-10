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
}
export declare const stripeService: StripeService;
export {};
//# sourceMappingURL=stripeService.d.ts.map
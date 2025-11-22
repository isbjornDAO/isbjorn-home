import request from 'supertest';
import express from 'express';
import donationRoutes from '../src/routes/x402Donations';
import { Donation } from '../src/models/Donation.model';

// Mock dependencies
jest.mock('../src/models/Donation.model');
jest.mock('../src/services/x402Service', () => ({
    x402Service: {
        createPayment: jest.fn().mockResolvedValue({
            id: 'mock_payment_id',
            status: 'pending',
            amount: 100,
            currency: 'USD'
        }),
        verifyPayment: jest.fn().mockResolvedValue({
            status: 'completed'
        }),
        triggerMicropayment: jest.fn().mockResolvedValue(true)
    }
}));
jest.mock('../src/services/receiptService', () => ({
    receiptService: {
        generateReceipt: jest.fn().mockResolvedValue(Buffer.from('mock_pdf'))
    }
}));

const app = express();
app.use(express.json());
app.use('/api/x402', donationRoutes);

describe('Donation API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('POST /api/x402/create - should create a donation', async () => {
        (Donation.create as jest.Mock).mockResolvedValue({
            id: 'donation_123',
            update: jest.fn()
        });

        const res = await request(app)
            .post('/api/x402/create')
            .send({
                amount: 100,
                currency: 'USD',
                businessId: 'biz_1'
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.paymentId).toBe('mock_payment_id');
    });

    it('POST /api/x402/verify/:id - should verify and return receipt', async () => {
        (Donation.findByPk as jest.Mock).mockResolvedValue({
            id: 'donation_123',
            stripePaymentIntentId: 'mock_payment_id',
            amount: 100,
            currency: 'USD',
            update: jest.fn()
        });

        const res = await request(app)
            .post('/api/x402/verify/donation_123');

        expect(res.status).toBe(200);
        expect(res.header['content-type']).toBe('application/pdf');
    });
});

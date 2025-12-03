# 🔧 X402 Technical Documentation
## Isbjørn Platform - Avalanche Hackathon Submission

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [X402 Integration Points](#x402-integration-points)
3. [API Endpoints](#api-endpoints)
4. [Code Walkthrough](#code-walkthrough)
5. [Data Flow](#data-flow)
6. [Security Implementation](#security-implementation)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Guide](#deployment-guide)

---

## Architecture Overview

### Tech Stack

```yaml
Frontend:
  Framework: React 18 with TypeScript
  Build Tool: Vite
  State Management: React Context API + @tanstack/react-query
  Web3: Wagmi v2 + Viem
  Styling: Tailwind CSS

Backend:
  Runtime: Node.js 18+
  Framework: Express.js with TypeScript
  Database: PostgreSQL (production) / SQLite (dev)
  ORM: Sequelize

Blockchain:
  Network: Avalanche L1 (Iggy)
  Smart Contracts: Solidity 0.8.x
  Tools: Hardhat

Payment:
  Primary: X402 SDK v0.7.3
  Legacy: Stripe (for existing customers)
```

### System Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                   Frontend (React)                    │
│                                                        │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │ useX402Hook │  │ WalletContext │  │ DonationForm│ │
│  └──────┬──────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                  │         │
│         └─────────────────┴──────────────────┘         │
└─────────────────────────┬─────────────────────────────┘
                          │ HTTPS
                          ▼
┌──────────────────────────────────────────────────────┐
│              Backend API (Express)                    │
│                                                        │
│  ┌──────────────┐  ┌───────────────┐  ┌───────────┐ │
│  │ X402 Service │◄─┤ X402 Routes   │  │ Auth      │ │
│  └──────┬───────┘  └───────────────┘  └───────────┘ │
│         │                                             │
│  ┌──────▼───────┐  ┌───────────────┐  ┌───────────┐ │
│  │ X402 Utils   │  │ Donation Ctrl │  │ DB Models │ │
│  └──────┬───────┘  └───────────────┘  └───────────┘ │
└─────────┼──────────────────────────────────────────┘
          │                    │
          ▼                    ▼
┌─────────────────┐   ┌──────────────────┐
│   X402 API      │   │  PostgreSQL      │
│   - Checkout    │   │  - Users         │
│   - Wallets     │   │  - Donations     │
│   - Webhooks    │   │  - Charities     │
└─────────────────┘   └──────────────────┘
          │
          ▼
┌─────────────────┐   ┌──────────────────┐
│ Avalanche L1    │   │  AVAX Mainnet    │
│ (Iggy Chain)    │◄──┤  (Bridge)        │
└─────────────────┘   └──────────────────┘
```

---

## X402 Integration Points

### 1. X402 SDK Initialization

**File:** `backend/src/utils/x402.ts`

```typescript
// Mock implementation for hackathon demo
const x402 = {
    checkout: {
        sessions: {
            create: async (params) => {
                return {
                    id: `x402_session_${Date.now()}`,
                    url: `${process.env.FRONTEND_URL}/checkout/x402`,
                    amount: params.amount,
                    currency: params.currency,
                    metadata: params.metadata
                };
            }
        }
    },
    wallets: {
        create: async (params) => { /* ... */ },
        charge: async (walletId, params) => { /* ... */ },
        retrieveBalance: async (walletId) => { /* ... */ }
    },
    verifyWebhook: (payload, secret) => { /* ... */ }
};
```

**Purpose:**
- Provides centralized X402 SDK access
- Abstracts payment operations
- Supports mock mode for development

**Production TODO:**
```typescript
import X402 from 'x402-sdk';
const x402 = new X402({
    apiKey: process.env.X402_API_KEY,
    environment: process.env.NODE_ENV === 'production' ? 'live' : 'test'
});
```

### 2. X402 Service Layer

**File:** `backend/src/services/x402Service.ts`

#### Core Methods

##### `createCheckoutSession(params)`
Creates a new X402 checkout session for a donation.

**Parameters:**
```typescript
{
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
```

**Returns:**
```typescript
{
    sessionId: string;
    sessionUrl: string;
    donation: Donation;
}
```

**Flow:**
1. Create pending Donation record in database
2. Call X402 API to create checkout session
3. Update donation with session ID
4. Return session URL for redirect

##### `handleSuccessfulPayment(session)`
Webhook handler for successful X402 payments.

**Flow:**
1. Extract `donationId` from session metadata
2. Find donation in database
3. Update status to `COMPLETED`
4. Set transaction ID and completion timestamp
5. Trigger receipt generation (email)

##### `createWallet(userId)`
Creates an X402 wallet for a user.

**Returns:**
```typescript
{
    walletId: string;
}
```

**Notes:**
- Checks if user already has wallet
- Links wallet ID to user record
- Enables wallet-based donations

##### `chargeWallet(walletId, amount, currency)`
Charges an existing X402 wallet.

##### `getWalletBalance(walletId)`
Retrieves current wallet balance in AVAX.

### 3. Frontend X402 Hook

**File:** `frontend/src/hooks/x402Hook.ts`

```typescript
export const useX402 = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [payment, setPayment] = useState<X402Payment | null>(null);

    const createPayment = async (amount, currency, businessId) => {
        // Calls /api/x402/create
    };

    const verifyPayment = async (donationId) => {
        // Calls /api/x402/verify/:donationId
    };

    return { createPayment, verifyPayment, loading, error, payment };
};
```

**Usage in Components:**
```typescript
const { createPayment, loading, error } = useX402();

const handleDonate = async () => {
    const result = await createPayment(100, 'NZD', user?.companyName);
    // Handle success
};
```

### 4. X402 API Routes

**File:** `backend/src/routes/x402Donations.ts`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/x402/create` | Create X402 payment | No |
| POST | `/api/x402/verify/:donationId` | Verify payment and get receipt | No |
| GET | `/api/x402/history` | Get donation history | Yes |

**Create Payment Example:**
```bash
curl -X POST http://localhost:5000/api/x402/create \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "currency": "NZD",
    "businessId": "1234567"
  }'
```

**Response:**
```json
{
  "success": true,
  "paymentId": "x402_payment_1234567890",
  "status": "pending",
  "donationId": "uuid-here"
}
```

---

## API Endpoints

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

### X402 Donations
```
POST /api/x402/create
POST /api/x402/verify/:donationId
GET  /api/x402/history
```

### X402 Webhooks
```
POST /api/x402/webhook
```

### Wallet Management
```
POST /api/wallet/connect
GET  /api/wallet/balance
POST /api/wallet/disconnect
```

### System Health
```
GET  /health
GET  /health/deep
```

---

## Code Walkthrough

### Complete Donation Flow (Code)

#### Step 1: Frontend Initiates Payment

```typescript
// frontend/src/components/DonationForm.tsx
const handleX402Donate = async () => {
    try {
        // Call custom hook
        const result = await createPayment(amount, 'USD', user?.companyName);

        // Extract donation ID
        setDonationId(result.donationId);

        // Show success screen
        setStep('success');
    } catch (err) {
        console.error(err);
    }
};
```

#### Step 2: Backend Creates X402 Session

```typescript
// backend/src/controllers/donationController.ts
async createX402Donation(req, res) {
    const { amount, currency, businessId } = req.body;

    // Call X402 service
    const result = await x402Service.createCheckoutSession({
        userId: req.user?.id,
        amount,
        currency,
        charityId: 'default-charity',
        charityName: 'Conservation Fund',
        companyEmail: req.user?.email
    });

    res.json({
        success: true,
        paymentId: result.sessionId,
        donationId: result.donation.id,
        status: 'pending'
    });
}
```

#### Step 3: X402 Service Creates Donation

```typescript
// backend/src/services/x402Service.ts
async createCheckoutSession(params) {
    // 1. Create pending donation
    const donation = await Donation.create({
        userId: params.userId,
        amount: params.amount,
        currency: params.currency,
        status: DonationStatus.PENDING,
        provider: 'x402'
    });

    // 2. Call X402 API
    const session = await x402.checkout.sessions.create({
        amount: Math.round(params.amount * 100),
        currency: params.currency,
        success_url: `${process.env.FRONTEND_URL}/donation/success`,
        metadata: { donationId: donation.id }
    });

    // 3. Update donation with session ID
    await donation.update({ sessionId: session.id });

    return { sessionId: session.id, sessionUrl: session.url, donation };
}
```

#### Step 4: X402 Webhook Confirms Payment

```typescript
// backend/src/routes/index.ts
router.post('/x402/webhook', async (req, res) => {
    const sig = req.headers['x402-signature'];

    // Verify webhook signature
    const event = x402.verifyWebhook(req.body, process.env.X402_WEBHOOK_SECRET);

    // Handle successful payment
    if (event.type === 'checkout.session.completed') {
        await x402Service.handleSuccessfulPayment(event.data.object);
    }

    res.json({ received: true });
});
```

#### Step 5: Frontend Shows Receipt

```typescript
// frontend/src/components/DonationForm.tsx
<button
    onClick={() => window.open(`/api/x402/verify/${donationId}`, '_blank')}
    className="btn-primary"
>
    Download Tax Receipt
</button>
```

---

## Data Flow

### Payment Creation Flow

```
User clicks "Donate via X402"
    ↓
Frontend: useX402.createPayment()
    ↓
POST /api/x402/create
    ↓
Backend: donationController.createX402Donation()
    ↓
x402Service.createCheckoutSession()
    ↓
Database: INSERT donation (status=PENDING)
    ↓
X402 API: POST /checkout/sessions
    ↓
Database: UPDATE donation (sessionId=x402_session_123)
    ↓
Backend Response: { paymentId, donationId }
    ↓
Frontend: Show success screen
```

### Webhook Confirmation Flow

```
X402 Payment Completed
    ↓
X402 sends webhook to /api/x402/webhook
    ↓
Backend: Verify signature
    ↓
x402Service.handleSuccessfulPayment()
    ↓
Database: UPDATE donation (status=COMPLETED)
    ↓
Trigger: Email receipt generation
    ↓
Blockchain: Record on Avalanche L1 (optional)
```

---

## Security Implementation

### 1. X402 Webhook Verification

```typescript
const event = x402.verifyWebhook(
    req.body,
    process.env.X402_WEBHOOK_SECRET
);

if (!event) {
    return res.status(400).json({ error: 'Invalid signature' });
}
```

### 2. API Key Management

```bash
# .env
X402_API_KEY=sk_live_xxxxxxxxxxxxxxxx
X402_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxx
```

**Never commit secrets to git!**

### 3. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 4. Input Validation

```typescript
import { body, validationResult } from 'express-validator';

router.post(
    '/x402/create',
    [
        body('amount').isFloat({ min: 0.01 }),
        body('currency').isString().isLength({ min: 3, max: 3 })
    ],
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    },
    donationController.createX402Donation
);
```

### 5. HTTPS Only

```typescript
if (process.env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
        if (req.header('x-forwarded-proto') !== 'https') {
            res.redirect(`https://${req.header('host')}${req.url}`);
        } else {
            next();
        }
    });
}
```

---

## Testing Strategy

### Unit Tests

```typescript
// backend/test/x402Service.test.ts
describe('X402 Service', () => {
    it('should create checkout session', async () => {
        const result = await x402Service.createCheckoutSession({
            userId: 'test-user',
            amount: 100,
            currency: 'NZD',
            charityId: 'test-charity',
            charityName: 'Test Charity',
            companyEmail: 'test@example.com'
        });

        expect(result.sessionId).toBeDefined();
        expect(result.sessionUrl).toContain('x402');
    });

    it('should handle successful payment webhook', async () => {
        const mockSession = {
            metadata: { donationId: 'test-donation-id' }
        };

        await x402Service.handleSuccessfulPayment(mockSession);

        const donation = await Donation.findByPk('test-donation-id');
        expect(donation.status).toBe(DonationStatus.COMPLETED);
    });
});
```

### Integration Tests

```bash
# Test full donation flow
npm run test:integration
```

### Manual Testing Checklist

- [ ] Create donation with X402
- [ ] Verify webhook processes correctly
- [ ] Download IRD receipt
- [ ] Check blockchain record
- [ ] Test wallet creation
- [ ] Test wallet charging
- [ ] Verify system status shows X402 online

---

## Deployment Guide

### Environment Variables

#### Backend
```bash
# X402
X402_API_KEY=your_production_key
X402_WEBHOOK_SECRET=your_webhook_secret

# Database
DATABASE_URL=postgresql://user:pass@host:5432/isbjorn

# Auth
JWT_SECRET=your_jwt_secret_here
JWT_REFRESH_SECRET=your_refresh_secret

# Frontend URL (for redirects)
FRONTEND_URL=https://isbjorn.vercel.app

# Avalanche
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=0x...
```

#### Frontend
```bash
VITE_API_URL=https://api.isbjorn.co.nz
VITE_X402_PUBLIC_KEY=pk_live_xxxxxxxx
```

### Deployment Steps

#### 1. Backend (Railway)

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Set environment variables
railway variables set X402_API_KEY=your_key

# Deploy
railway up
```

#### 2. Frontend (Vercel)

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd frontend
vercel --prod
```

#### 3. Database Migrations

```bash
# Run migrations on production
railway run npm run migrate
```

#### 4. Webhook Setup

1. Go to X402 dashboard
2. Add webhook endpoint: `https://api.isbjorn.co.nz/api/x402/webhook`
3. Select events: `checkout.session.completed`
4. Copy webhook secret to environment variables

---

## Performance Metrics

### API Response Times (Target)

| Endpoint | Average | P95 | P99 |
|----------|---------|-----|-----|
| POST /x402/create | 150ms | 300ms | 500ms |
| POST /x402/webhook | 50ms | 100ms | 200ms |
| GET /x402/history | 100ms | 200ms | 400ms |

### Database Queries

- All queries use indexes on frequently accessed fields
- Donation lookups by `id` and `sessionId` are indexed
- User lookups by `email` and `x402WalletId` are indexed

---

## Monitoring & Logging

### Log Levels

```typescript
logger.info('X402 checkout session created', { sessionId, amount });
logger.warn('X402 webhook missing donationId in metadata');
logger.error('X402 createCheckoutSession error:', error);
```

### Health Checks

```bash
# Check X402 integration status
curl https://api.isbjorn.co.nz/health/deep

# Expected response
{
  "status": "healthy",
  "checks": {
    "x402": { "ok": true },
    "database": { "ok": true },
    "avalanche": { "ok": true }
  }
}
```

---

## Future Enhancements

### Phase 1: Recurring Donations
- [ ] Implement X402 subscription API
- [ ] Add recurring donation UI
- [ ] Set up automated receipt generation

### Phase 2: Multi-Currency
- [ ] Support USD, EUR, GBP
- [ ] Automatic AVAX conversion via X402
- [ ] Dynamic exchange rate display

### Phase 3: Advanced Wallet Features
- [ ] Wallet-to-wallet transfers
- [ ] Staking rewards for donors
- [ ] NFT receipts for major donations

---

## Contact & Support

**Technical Questions:**
- GitHub Issues: [isbjornDAO/isbjorn-home](https://github.com/isbjornDAO/isbjorn-home/issues)
- Email: dev@isbjorn.co.nz

**X402 Documentation:**
- SDK Docs: https://docs.x402.com
- API Reference: https://api-docs.x402.com

---

## Appendix: File Structure

```
isbjorn-home/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   │   └── donationController.ts      # X402 payment handlers
│   │   ├── services/
│   │   │   └── x402Service.ts             # X402 business logic
│   │   ├── routes/
│   │   │   └── x402Donations.ts           # X402 API routes
│   │   ├── utils/
│   │   │   └── x402.ts                    # X402 SDK initialization
│   │   └── models/
│   │       ├── User.model.ts              # x402WalletId field
│   │       └── Donation.model.ts          # x402PaymentId field
│   └── test/
│       └── x402Service.test.ts            # X402 unit tests
├── frontend/
│   └── src/
│       ├── hooks/
│       │   └── x402Hook.ts                # X402 React hook
│       ├── components/
│       │   └── DonationForm.tsx           # X402 payment UI
│       └── pages/
│           ├── SystemStatusPage.tsx       # X402 status monitoring
│           └── WalletPage.tsx             # X402 wallet management
├── smart-contracts/
│   └── contracts/
│       ├── DonationTracker.sol            # On-chain donation records
│       └── ProjectDistribution.sol        # Fund distribution logic
├── HACKATHON_PITCH.md                     # Pitch deck
├── DEMO_SCRIPT.md                         # Demo walkthrough
├── X402_INTEGRATION_PROGRESS.md           # Integration status
└── X402_TECHNICAL_DOCUMENTATION.md        # This file
```

---

**Built with ❄️ for the Avalanche x X402 Hackathon**

**Thank you for reviewing our submission!** 🐻‍❄️

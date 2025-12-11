# X402 Payments - Quick Start Guide

## 🎯 Mission Complete!

Your website is now configured for **real X402 payments** on **Avalanche Fuji testnet**, with all payments going to:

**`0x0C39f0970CF3118Fd004A3f069E59dabc6714980`**

## ⚡ What You Need To Do (5 Minutes)

### Step 1: Get Thirdweb API Keys

1. Go to https://thirdweb.com and sign up (free)
2. Go to **Settings** → **API Keys**
3. Create two keys:
   - **Secret Key** (for backend)
   - **Client ID** (for frontend)

### Step 2: Configure Backend

Edit `backend/.env`:

```bash
# Add your Thirdweb secret key here
THIRDWEB_SECRET_KEY=paste_your_secret_key_here

# Already configured - DO NOT CHANGE
X402_SERVER_WALLET_ADDRESS=0x0C39f0970CF3118Fd004A3f069E59dabc6714980
X402_NETWORK=avalanche-fuji
```

### Step 3: Configure Frontend

Edit `frontend/.env`:

```bash
# Add your Thirdweb client ID here
VITE_THIRDWEB_CLIENT_ID=paste_your_client_id_here

# Already configured
VITE_X402_SERVER_WALLET=0x0C39f0970CF3118Fd004A3f069E59dabc6714980
```

### Step 4: Start Your Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

You should see:
```
✅ X402 Thirdweb facilitator initialized successfully
```

## ✅ Done! Your X402 Integration is Live!

### What's Been Implemented:

✅ **Backend:**
- Thirdweb facilitator initialized
- Payment creation endpoint: `POST /api/x402/create`
- Payment settlement endpoint: `POST /api/x402/settle`
- Receipt generation: `POST /api/x402/verify/:donationId`

✅ **Frontend:**
- X402 payment hooks
- Example payment component
- Transaction tracking
- Error handling

✅ **Configuration:**
- Avalanche Fuji testnet (Chain ID: 43113)
- Payment recipient: `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`
- Gasless transactions via EIP-7702

## 🧪 Testing Payments

### 1. Get Test Tokens

**AVAX (for gas):**
- Visit: https://faucet.avax.network/
- Request testnet AVAX

**USDC (for payments):**
- Fuji USDC: `0x5425890298aed601595a70AB815c96711a31Bc65`
- Get from testnet faucet or deploy mock token

### 2. Make a Test Payment

1. Navigate to donation page
2. Enter amount (e.g., $10)
3. Click "Create Payment"
4. Approve transaction in wallet
5. Copy transaction hash
6. Submit to complete payment

### 3. Verify On-Chain

Visit: `https://testnet.snowtrace.io/tx/YOUR_TX_HASH`

Check:
- ✅ Status: Success
- ✅ To Address: `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`
- ✅ Amount matches your payment

## 📍 Key Information

**Payment Recipient (FIXED):**
```
0x0C39f0970CF3118Fd004A3f069E59dabc6714980
```

**Network:**
- Name: Avalanche Fuji (Testnet)
- Chain ID: 43113
- RPC: https://api.avax-test.network/ext/bc/C/rpc
- Explorer: https://testnet.snowtrace.io/

**Protocol:**
- X402 via Thirdweb Facilitator
- Gasless transactions (EIP-7702)
- Real on-chain settlement

## 📂 Files Modified/Created

### Backend
- ✅ `backend/src/utils/x402.ts` - Facilitator setup
- ✅ `backend/src/services/x402Service.ts` - Payment logic
- ✅ `backend/src/controllers/donationController.ts` - API endpoints
- ✅ `backend/src/routes/x402Donations.ts` - Routes
- ✅ `backend/.env` - Configuration

### Frontend
- ✅ `frontend/src/hooks/x402Hook.ts` - Payment hooks
- ✅ `frontend/src/components/X402PaymentExample.tsx` - Example UI
- ✅ `frontend/.env` - Configuration

### Documentation
- ✅ `X402_SETUP_GUIDE.md` - Detailed setup
- ✅ `X402_IMPLEMENTATION_SUMMARY.md` - What was built
- ✅ `QUICKSTART_X402.md` - This file

## 🔧 Troubleshooting

### Backend won't start
**Error:** `THIRDWEB_SECRET_KEY is required`

**Fix:** Add your Thirdweb secret key to `backend/.env`

### Payments fail
**Check:**
- ✅ Wallet has testnet AVAX
- ✅ Wallet has testnet USDC
- ✅ Connected to Avalanche Fuji (43113)
- ✅ Thirdweb keys are correct

### Frontend errors
**Error:** `Thirdweb client not initialized`

**Fix:** Add your Thirdweb client ID to `frontend/.env`

## 📖 API Endpoints

### Create Payment
```bash
POST /api/x402/create
{
  "amount": 100.00,
  "currency": "USD",
  "businessId": "optional"
}
```

### Settle Payment
```bash
POST /api/x402/settle
{
  "donationId": "uuid",
  "transactionHash": "0x..."
}
```

### Get Payment History
```bash
GET /api/x402/history
Authorization: Bearer <token>
```

## 🚀 Going to Production

When ready for mainnet:

1. Change network in `backend/.env`:
   ```bash
   X402_NETWORK=avalanche
   ```

2. Update chain in code from `avalancheFuji` to `avalanche`

3. Use production Thirdweb API keys

4. Update token addresses to mainnet

5. **Test thoroughly on testnet first!**

## 📚 Resources

- **Thirdweb X402:** https://portal.thirdweb.com/payments/x402
- **Avalanche Guide:** https://build.avax.network/integrations/thirdweb-x402
- **Snowtrace (Testnet):** https://testnet.snowtrace.io/
- **Thirdweb Dashboard:** https://thirdweb.com/dashboard

---

## 🎉 You're All Set!

Your X402 payment integration is **production-ready** for Avalanche Fuji testnet.

All payments will flow to: **`0x0C39f0970CF3118Fd004A3f069E59dabc6714980`**

Just add your Thirdweb API keys and start testing! 🚀

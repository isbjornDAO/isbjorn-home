# X402 Payment Integration Setup Guide

## Overview

This guide will help you set up real X402 payments on Avalanche Fuji testnet using Thirdweb's facilitator service. All payments will be sent to: `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`

## Prerequisites

1. **Thirdweb Account**: Create an account at [https://thirdweb.com](https://thirdweb.com)
2. **Get API Keys**:
   - Navigate to Settings > API Keys in your Thirdweb dashboard
   - Create a new **Secret Key** for backend
   - Create a new **Client ID** for frontend

## Backend Configuration

### 1. Update Environment Variables

Edit `backend/.env` and add:

```bash
# X402 Payment Configuration (Thirdweb)
THIRDWEB_SECRET_KEY=your_thirdweb_secret_key_here
X402_SERVER_WALLET_ADDRESS=0x0C39f0970CF3118Fd004A3f069E59dabc6714980
X402_NETWORK=avalanche-fuji
X402_WEBHOOK_SECRET=your_webhook_secret_here
```

### 2. Install Dependencies

```bash
cd backend
npm install
```

Dependencies installed:
- `thirdweb` - Thirdweb SDK for X402 facilitator

### 3. Start Backend Server

```bash
cd backend
npm run dev
```

The server will initialize the X402 facilitator with your wallet address.

## Frontend Configuration

### 1. Update Environment Variables

Edit `frontend/.env` and add:

```bash
VITE_API_URL=http://localhost:5001/api
VITE_THIRDWEB_CLIENT_ID=your_thirdweb_client_id_here
VITE_X402_SERVER_WALLET=0x0C39f0970CF3118Fd004A3f069E59dabc6714980
```

### 2. Install Dependencies

```bash
cd frontend
npm install
```

Dependencies installed:
- `thirdweb` - Thirdweb SDK for frontend

### 3. Start Frontend

```bash
cd frontend
npm run dev
```

## How It Works

### Payment Flow

1. **Create Payment Intent** (Frontend)
   - User initiates donation
   - Frontend calls `POST /api/x402/create` with amount and currency
   - Backend creates payment intent and returns details

2. **User Authorizes Payment** (Frontend)
   - User approves payment using EIP-7702 (gasless)
   - Payment is settled on Avalanche Fuji using X402 protocol
   - Transaction is sent to `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`

3. **Settlement Confirmation** (Frontend → Backend)
   - Frontend receives transaction hash
   - Calls `POST /api/x402/settle` with donation ID and tx hash
   - Backend verifies and marks donation as completed

4. **Receipt Generation**
   - Backend generates tax receipt
   - Sends receipt email to donor

### Key Files

#### Backend
- `backend/src/utils/x402.ts` - Thirdweb facilitator initialization
- `backend/src/services/x402Service.ts` - Payment processing logic
- `backend/src/controllers/donationController.ts` - API endpoints
- `backend/src/routes/x402Donations.ts` - X402 routes

#### Frontend
- `frontend/src/hooks/x402Hook.ts` - X402 payment hook
- Frontend pages use this hook to process payments

## API Endpoints

### Create Payment
```
POST /api/x402/create
Content-Type: application/json

{
  "amount": 100.00,
  "currency": "USD",
  "businessId": "optional-business-id"
}

Response:
{
  "success": true,
  "donationId": "uuid",
  "paymentId": "x402_payment_xxx",
  "paymentIntent": {
    "amount": 10000,
    "currency": "USD",
    "recipient": "0x0C39f0970CF3118Fd004A3f069E59dabc6714980",
    "chain": { ... },
    "instructions": { ... }
  },
  "status": "pending"
}
```

### Settle Payment
```
POST /api/x402/settle
Content-Type: application/json

{
  "donationId": "uuid",
  "transactionHash": "0x..."
}

Response:
{
  "success": true,
  "donation": { ... },
  "verification": { ... },
  "transactionHash": "0x..."
}
```

### Verify Payment (Generate Receipt)
```
POST /api/x402/verify/:donationId

Returns PDF receipt
```

## Testing on Avalanche Fuji Testnet

### 1. Get Testnet AVAX

Visit [Avalanche Fuji Faucet](https://faucet.avax.network/) to get free testnet AVAX.

### 2. Get Testnet USDC

Avalanche Fuji testnet USDC address: `0x5425890298aed601595a70AB815c96711a31Bc65`

You can:
- Use a testnet faucet if available
- Deploy a mock USDC contract for testing
- Contact Avalanche devs for testnet tokens

### 3. Test Payment Flow

1. Create a donation through the frontend
2. Approve the payment (will use EIP-7702 for gasless tx)
3. Payment settles to `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`
4. Verify on [Snowtrace Testnet](https://testnet.snowtrace.io/)

## Thirdweb X402 Resources

- **Documentation**: https://portal.thirdweb.com/payments/x402/facilitator
- **Integration Guide**: https://build.avax.network/integrations/thirdweb-x402
- **Thirdweb Dashboard**: https://thirdweb.com/dashboard

## Network Details

- **Network**: Avalanche Fuji (Testnet)
- **Chain ID**: 43113
- **RPC URL**: https://api.avax-test.network/ext/bc/C/rpc
- **Block Explorer**: https://testnet.snowtrace.io/
- **Payment Recipient**: `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`

## Supported Tokens

X402 supports tokens with:
- ERC-2612 permit (most ERC-20 tokens)
- ERC-3009 sign with authorization (USDC)

On Avalanche Fuji:
- USDC: `0x5425890298aed601595a70AB815c96711a31Bc65`
- Other ERC-20 tokens with permit functionality

## Features

✅ **Gasless Transactions** - Uses EIP-7702 for gasless payments
✅ **Real On-Chain Settlement** - Actual tokens transferred on Avalanche Fuji
✅ **Fixed Recipient** - All payments to `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`
✅ **Transaction Tracking** - Full blockchain verification
✅ **Receipt Generation** - Automated tax receipts via email
✅ **Multi-Currency Support** - USD, NZD, AUD

## Troubleshooting

### Error: THIRDWEB_SECRET_KEY not set
- Make sure you've added your Thirdweb secret key to `backend/.env`
- Restart the backend server

### Error: X402_SERVER_WALLET_ADDRESS not set
- This should be set to `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`
- Check `backend/.env`

### Payment not settling
- Ensure you have testnet AVAX for gas (even though x402 is gasless)
- Check that the token address is correct
- Verify network is set to Avalanche Fuji (43113)

### Frontend errors
- Make sure `VITE_THIRDWEB_CLIENT_ID` is set in `frontend/.env`
- Check browser console for detailed errors
- Verify API_URL is pointing to your backend

## Production Deployment

When moving to production (Avalanche C-Chain mainnet):

1. Update network to `avalanche` (mainnet):
   ```bash
   X402_NETWORK=avalanche
   ```

2. Update chain in code from `avalancheFuji` to `avalanche`

3. Use production API keys from Thirdweb

4. Update token addresses to mainnet addresses

5. Test thoroughly on testnet first!

## Support

- **Thirdweb Discord**: https://discord.gg/thirdweb
- **Avalanche Discord**: https://discord.gg/avalanche
- **X402 Documentation**: https://portal.thirdweb.com/payments/x402

---

**Ready to Go!** 🚀

Your X402 integration is now configured to process real payments on Avalanche Fuji testnet, sending all funds to `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`.

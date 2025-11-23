# Railway Environment Variables Setup Guide

## Required Environment Variables for Backend

Add these in Railway Dashboard → isbjorn-backend → Variables tab:

### Critical - Must Add Now

```bash
# Frontend URL for CORS
FRONTEND_URL=https://isbjorn-home.vercel.app

# Node Environment
NODE_ENV=production

# Server Port (Railway auto-assigns, but good to have)
PORT=5000

# JWT Secret (generate a random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string

# Database URL (auto-set by Railway when you add Postgres)
# DATABASE_URL=${{Postgres.DATABASE_URL}}
```

### Stripe Configuration (Test Mode for Now)

```bash
# Get these from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Get this from https://dashboard.stripe.com/test/webhooks
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### Email Configuration (Optional - for tax receipts)

```bash
# SendGrid API Key
SENDGRID_API_KEY=SG.your_sendgrid_api_key_here

# Or use SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Blockchain Configuration (Add Later)

```bash
# Avalanche RPC URLs
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_TESTNET_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc

# L1 Configuration (after L1 is deployed)
L1_RPC_URL=your-l1-rpc-url
DONATION_CONTRACT_ADDRESS=0x...
NODE_REGISTRY_CONTRACT_ADDRESS=0x...

# Hot wallet private key for blockchain transactions
AVALANCHE_PRIVATE_KEY=0x...
```

## How to Add Variables in Railway

### Method 1: Railway Dashboard (Recommended)

1. Go to https://railway.com/project/389403df-96c8-4a8c-a411-6fd64f2a4f15
2. Click on your **backend service** (NOT Postgres)
3. Click **"Variables"** tab
4. Click **"New Variable"**
5. Enter variable name and value
6. Click **"Add"**
7. Repeat for each variable
8. Railway will automatically redeploy after you save

### Method 2: Railway CLI

```bash
# Navigate to backend directory
cd backend

# Set variables one by one
railway variables set FRONTEND_URL=https://isbjorn-home.vercel.app
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=your-secret-here
# ... etc
```

### Method 3: Bulk Import (Fastest)

1. Create a `.env.production` file locally (DON'T commit this!)
2. Add all variables in KEY=VALUE format
3. In Railway dashboard → Variables → Click "Raw Editor"
4. Copy/paste all variables
5. Click "Save"

## After Adding Variables

Railway will automatically:
1. Detect the change
2. Rebuild the backend
3. Redeploy with new environment variables
4. The CORS issue should be fixed once `FRONTEND_URL` is set

## Verification

After adding variables and redeployment completes:

```bash
# Test CORS
curl -H "Origin: https://isbjorn-home.vercel.app" \
  https://isbjorn-backend-production.up.railway.app/api/charities

# Should return charities data, not CORS error
```

## Priority Order

1. **FRONTEND_URL** - Fixes CORS immediately
2. **NODE_ENV** - Ensures production mode
3. **JWT_SECRET** - Required for authentication
4. **DATABASE_URL** - Auto-set by Railway Postgres
5. **Stripe keys** - Required for donations
6. **Email config** - Required for tax receipts
7. **Blockchain config** - Add later when L1 is deployed

## Notes

- `DATABASE_URL` is automatically set by Railway when you add the Postgres database
- Don't add sensitive keys to Git - only to Railway dashboard
- Test mode Stripe keys start with `sk_test_` and `pk_test_`
- Live mode keys start with `sk_live_` and `pk_live_`
- Generate JWT_SECRET with: `openssl rand -base64 32`

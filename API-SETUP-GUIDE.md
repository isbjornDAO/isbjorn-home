# 🔑 Isbjorn Platform - Complete API Setup Guide

This guide will help you configure all the API keys and services needed for a fully functional Isbjorn donation platform.

## 🚀 Quick Start (5 minutes)

For immediate functionality, you only need:

1. **Copy environment file**: `cp backend/.env.development backend/.env`
2. **Run the platform**: `./run-platform.sh`
3. **Open**: http://localhost:3001

The platform will work with mock data and demo functionality!

## 🔧 Full Production Setup

### 1. Payment Processing (Required for real donations)

**Stripe** - Accept credit card payments

```bash
# Get your keys from: https://dashboard.stripe.com/apikeys
STRIPE_SECRET_KEY=sk_test_51ABC123...
STRIPE_PUBLISHABLE_KEY=pk_test_51ABC123...
STRIPE_WEBHOOK_SECRET=whsec_123...
```

**Setup Steps:**
1. Create Stripe account at https://stripe.com
2. Go to Developers > API keys
3. Copy "Secret key" and "Publishable key"
4. Set up webhooks for donation confirmations

### 2. Email Receipts (Required for tax compliance)

**SendGrid** - Send IRD-compliant tax receipts

```bash
# Get API key from: https://app.sendgrid.com/settings/api_keys
SENDGRID_API_KEY=SG.ABC123...
FROM_EMAIL=donations@isbjorn.co.nz
FROM_NAME=Isbjorn Foundation
```

**Setup Steps:**
1. Create SendGrid account at https://sendgrid.com
2. Go to Settings > API Keys
3. Create new API key with "Full Access"
4. Verify your sender domain

### 3. New Zealand Business Verification (Recommended)

**NZ Companies Office** - Verify business details automatically

```bash
# Register at: https://www.companies.govt.nz/all-services/api-services-and-developers/
NZ_COMPANIES_REGISTER_API_KEY=your_api_key_here
NZ_CHARITIES_API_KEY=your_charities_api_key_here
```

**Setup Steps:**
1. Register for NZ Companies Register API
2. Get approval for commercial use
3. Obtain API key for automated lookups

### 4. Avalanche L1 Blockchain (Your Custom Network)

**Your Avalanche L1** - Record donations on blockchain

```bash
# Your custom Avalanche L1 network details:
AVALANCHE_RPC_URL=https://your-l1-rpc-endpoint.com
AVALANCHE_PRIVATE_KEY=0x123...
AVALANCHE_CONTRACT_ADDRESS=0x456...
AVALANCHE_CHAIN_ID=12345
AVALANCHE_GAS_PRICE=25000000000
```

**Setup Steps:**
1. Deploy the donation smart contract to your L1
2. Configure RPC endpoint
3. Set up wallet with native tokens for gas
4. Test blockchain integration

### 5. Cloud Storage (Optional but recommended)

**AWS S3** - Store PDF receipts securely

```bash
# Get from AWS Console: https://console.aws.amazon.com/iam/
AWS_ACCESS_KEY_ID=AKIA123...
AWS_SECRET_ACCESS_KEY=abc123...
AWS_REGION=ap-southeast-2
AWS_S3_BUCKET=isbjorn-receipts-prod
```

### 6. Database (Production)

**MongoDB Atlas** - Scalable cloud database

```bash
# Connection string from MongoDB Atlas
DATABASE_URL=mongodb+srv://username:password@cluster0.mongodb.net/isbjorn?retryWrites=true&w=majority
DB_TYPE=mongodb
```

**Setup Steps:**
1. Create MongoDB Atlas account
2. Create new cluster in Sydney/Melbourne region
3. Create database user with read/write access
4. Get connection string

### 7. Monitoring & Error Tracking (Recommended)

**Sentry** - Track errors and performance

```bash
# Get DSN from: https://sentry.io/settings/projects/
SENTRY_DSN=https://abc123@o123456.ingest.sentry.io/123456
```

## 📋 Environment Files Setup

### Development (.env)
```bash
# Copy the template
cp backend/.env.development backend/.env

# Edit with your keys
nano backend/.env
```

### Production (.env.production)
```bash
# Use production template
cp backend/.env.production backend/.env

# Configure all production keys
nano backend/.env
```

## 🚀 Deployment Commands

### Local Development
```bash
./run-platform.sh
```

### Production Deployment
```bash
./deploy.sh production
```

## 🎯 Service Priority

**Essential for MVP:**
1. ✅ Platform works without any API keys (mock data)
2. 🔑 Stripe (for real payments)
3. 📧 SendGrid (for receipts)

**Important for production:**
4. 🏢 NZ Companies API (business verification)
5. 🗄️ MongoDB Atlas (scalable database)
6. ☁️ AWS S3 (receipt storage)

**Optional but valuable:**
7. 🔗 Your Avalanche L1 (blockchain transparency)
8. 📊 Sentry (error monitoring)

## 🔐 Security Best Practices

1. **Never commit API keys** to version control
2. **Use environment variables** for all secrets
3. **Rotate keys regularly** in production
4. **Use separate keys** for development/production
5. **Monitor API usage** for unusual activity

## 🆘 Need Help?

**Common Issues:**
- **Stripe webhooks**: Ensure webhook URL points to `/api/webhooks/stripe`
- **Email delivery**: Verify sender domain in SendGrid
- **Database connection**: Check network access in MongoDB Atlas
- **Blockchain**: Ensure sufficient gas tokens in wallet

**Testing Commands:**
```bash
# Test email configuration
npm run test:email

# Test blockchain connection
npm run test:blockchain

# Test all services
npm run test:services
```

## 🎉 You're Ready!

With all APIs configured, your Isbjorn platform will have:

- ✅ Real credit card processing
- ✅ Automatic tax receipt generation
- ✅ NZ business verification
- ✅ Blockchain donation recording
- ✅ Secure receipt storage
- ✅ Error monitoring
- ✅ Production-ready infrastructure

**Next Steps:**
1. Configure your priority APIs
2. Run `./deploy.sh production`
3. Launch your donation platform!
4. Start helping NZ charities! 🐻‍❄️

---

*For additional help, check the logs or create an issue in the repository.*
# Stripe Webhook Setup Guide

## Quick Setup (5 minutes)

### Step 1: Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click **"Add endpoint"** button
3. **Endpoint URL**: `https://isbjorn-backend-production.up.railway.app/api/webhooks/stripe`
4. Click **"Select events"**
5. Add these events:
   - `payment_intent.succeeded`
   - `payment_intent.failed` 
   - `charge.refunded`
6. Click **"Add endpoint"**

### Step 2: Get Webhook Secret
1. Click on the newly created endpoint
2. Under "Signing secret", click **"Reveal"**
3. Copy the secret (starts with `whsec_`)

### Step 3: Add to Railway
1. Go to https://railway.app/project/389403df-96c8-4a8c-a411-6fd64f2a4f15
2. Click on your **backend service**
3. Go to **"Variables"** tab
4. Click **"New Variable"**
5. Name: `STRIPE_WEBHOOK_SECRET`
6. Value: (paste the whsec_ value you copied)
7. Click **"Add"**

### Step 4: Test Webhook
1. In Stripe dashboard, go to your webhook endpoint
2. Click **"Send test webhook"**
3. Select `payment_intent.succeeded`
4. Click **"Send test webhook"**
5. Check Railway logs to verify webhook was received

## What Webhooks Do

Webhooks allow your backend to receive real-time notifications when:
- ✅ A payment succeeds → Record donation in database
- ❌ A payment fails → Log error, notify user
- 💰 A charge is refunded → Update donation record

## Webhook Endpoint

Your backend already has the webhook handler at:
```
POST /api/webhooks/stripe
```

This endpoint:
1. Verifies the webhook signature using `STRIPE_WEBHOOK_SECRET`
2. Processes the event based on type
3. Updates database records accordingly
4. Returns 200 OK to acknowledge receipt

---

**After setup, your backend will automatically receive payment notifications!**

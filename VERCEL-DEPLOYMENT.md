# 🚀 Vercel Deployment Guide

## Quick Start

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in the project root
3. Follow prompts and add environment variables
4. Deploy!

## Prerequisites

- [ ] Vercel account (free tier works)
- [ ] PostgreSQL database (Vercel Postgres recommended)
- [ ] Stripe API keys (test or live)
- [ ] GitHub repository (optional, for auto-deploy)

---

## Step 1: Database Setup (Vercel Postgres)

### Create Database

1. Go to https://vercel.com/dashboard
2. Click "Storage" → "Create Database" → "Postgres"
3. Name it `isbjorn-db`
4. Copy the connection string (starts with `postgres://`)

### Update Backend Config

The database config at `backend/src/config/database.ts` already supports PostgreSQL via `DATABASE_URL` environment variable. No code changes needed!

---

## Step 2: Environment Variables

### Required Variables (Add in Vercel Dashboard)

Go to Project Settings → Environment Variables and add:

```bash
# Database
DATABASE_URL=postgres://...your_vercel_postgres_url

# JWT
JWT_SECRET=your_production_jwt_secret_min_32_chars
JWT_EXPIRES_IN=24h

# Stripe (use your actual keys)
STRIPE_SECRET_KEY=sk_live_... # or sk_test_ for testing
STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_
STRIPE_WEBHOOK_SECRET=whsec_...

# Frontend URL (will be auto-set by Vercel)
FRONTEND_URL=https://your-app.vercel.app

# Optional: External APIs
NZ_COMPANIES_API_KEY=your_key_here
NZ_CHARITIES_API_KEY=your_key_here

# Optional: Email (SendGrid)
SENDGRID_API_KEY=your_key_here
FROM_EMAIL=noreply@yourdomain.com

# Node Environment
NODE_ENV=production
```

### Frontend Environment Variables

Add these in Vercel dashboard with prefix for frontend:

```bash
VITE_API_URL=https://your-app.vercel.app
VITE_API_BASE_URL=https://your-app.vercel.app/api
VITE_STRIPE_PUBLIC_KEY=pk_live_... # or pk_test_
```

---

## Step 3: Deploy

### Option A: Vercel CLI (Recommended for First Deploy)

```bash
# From project root
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name? isbjorn-platform
# - Directory? ./
# - Override settings? No

# After successful deployment, add environment variables:
vercel env add DATABASE_URL
vercel env add STRIPE_SECRET_KEY
# ... add all required vars

# Redeploy with env vars:
vercel --prod
```

### Option B: GitHub Integration (Auto-Deploy)

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import your repository
4. Vercel will auto-detect the monorepo
5. Add environment variables in dashboard
6. Deploy!

---

## Step 4: Database Migration

After first deployment, run migrations:

```bash
# Using Vercel CLI
vercel env pull .env.production.local
cd backend
npm run db:migrate # or your migration command
```

Or connect directly to Vercel Postgres and run SQL:

```sql
-- Your schema will be created automatically by Sequelize sync
-- But you can also run manual migrations if needed
```

---

## Step 5: Verify Deployment

### Test Endpoints

```bash
# Health check
curl https://your-app.vercel.app/api/health

# Should return:
# {"status":"healthy","timestamp":"..."}
```

### Test Frontend

1. Visit `https://your-app.vercel.app`
2. Try registration
3. Try making a donation (test mode)

---

## Troubleshooting

### Build Fails

**Error**: `Module not found`
- **Fix**: Run `npm install` in both frontend and backend locally
- Check `package.json` has all dependencies

**Error**: `TypeScript errors`
- **Fix**: Run `npm run build` locally first
- Fix any TypeScript errors before deploying

### Database Connection Fails

**Error**: `ECONNREFUSED` or `Connection timeout`
- **Fix**: Check `DATABASE_URL` is set correctly
- Verify Vercel Postgres is in same region
- Check database allows connections from Vercel IPs

### API Returns 500

**Error**: Internal server error
- **Fix**: Check Vercel function logs (Dashboard → Deployments → Functions)
- Verify all environment variables are set
- Check database connection

### Stripe Payments Fail

**Error**: `Invalid API key`
- **Fix**: Verify `STRIPE_SECRET_KEY` is set in Vercel
- Make sure frontend has `VITE_STRIPE_PUBLIC_KEY`
- Check keys match (both test or both live)

---

## Configuration Files Created

✅ `/vercel.json` - Main Vercel configuration
✅ `/.vercelignore` - Files to exclude from deployment
✅ `/backend/api/index.ts` - Serverless function wrapper

---

## Production Checklist

Before going live:

- [ ] Switch to Stripe live keys
- [ ] Set strong JWT_SECRET (min 32 characters)
- [ ] Configure custom domain
- [ ] Set up Stripe webhooks (https://your-app.vercel.app/api/stripe/webhook)
- [ ] Enable Vercel Analytics
- [ ] Set up error monitoring (Sentry)
- [ ] Configure email service (SendGrid)
- [ ] Test all user flows
- [ ] Set up database backups

---

## Costs

### Free Tier Limits

- **Vercel**: 100GB bandwidth, 100 hours serverless execution
- **Vercel Postgres**: 256MB storage, 60 hours compute
- **Stripe**: Free (pay per transaction)

### When You'll Need to Upgrade

- \u003e1000 users/month → Vercel Pro ($20/mo)
- \u003e256MB data → Vercel Postgres Pro ($10/mo)
- Need custom domains → Vercel Pro

---

## Next Steps

1. Deploy to Vercel
2. Test thoroughly
3. Configure custom domain
4. Set up monitoring
5. Go live! 🎉

Need help? Check Vercel docs: https://vercel.com/docs

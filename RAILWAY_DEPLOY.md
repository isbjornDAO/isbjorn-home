# Railway Deployment Guide

## Quick Deploy to Railway

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Initialize Project:**
   ```bash
   railway init
   ```

4. **Link to GitHub Repo:**
   - Railway will auto-detect your GitHub repo
   - Or manually link: `railway link`

5. **Add PostgreSQL Database:**
   ```bash
   railway add --database postgresql
   ```

6. **Set Environment Variables:**
   ```bash
   railway variables set STRIPE_SECRET_KEY=your_key_here
   railway variables set JWT_SECRET=your_secret_here
   railway variables set NODE_ENV=production
   ```

7. **Deploy:**
   ```bash
   railway up
   ```

## Required Environment Variables

Add these in Railway dashboard (Settings → Variables):

```
NODE_ENV=production
PORT=5000
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=<generate-random-string>
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
FRONTEND_URL=https://isbjorn-home-fekcm4wvf-bear2.vercel.app
SENDGRID_API_KEY=<your-sendgrid-key>
```

## After Deployment

1. Get your Railway URL (e.g., `https://isbjorn-backend.up.railway.app`)
2. Update Vercel frontend environment variable:
   - `VITE_API_URL=https://isbjorn-backend.up.railway.app`
3. Configure Stripe webhook to point to Railway URL
4. Run database migrations (Railway console or CLI)

## Alternative: Deploy via Railway Dashboard

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `isbjornDAO/isbjorn-home`
5. Set root directory to `backend`
6. Add PostgreSQL database
7. Configure environment variables
8. Deploy!

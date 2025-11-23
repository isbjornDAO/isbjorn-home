# Vercel Deployment - Quick Reference

## ✅ Files Created

- `/vercel.json` - Main configuration
- `/.vercelignore` - Exclude files
- `/backend/api/index.ts` - Serverless wrapper
- `/backend/vercel.json` - Backend config
- `/frontend/vercel.json` - Frontend config
- `/VERCEL-DEPLOYMENT.md` - Full guide

## 🚀 Deploy Now

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy (from project root)
vercel

# Add environment variables in dashboard, then:
vercel --prod
```

## 📋 Required Environment Variables

Add these in Vercel Dashboard → Settings → Environment Variables:

### Backend
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Min 32 characters
- `STRIPE_SECRET_KEY` - Your Stripe secret key
- `STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `NODE_ENV=production`

### Frontend  
- `VITE_API_URL` - https://your-app.vercel.app
- `VITE_API_BASE_URL` - https://your-app.vercel.app/api
- `VITE_STRIPE_PUBLIC_KEY` - Your Stripe publishable key

## 📖 Full Guide

See `VERCEL-DEPLOYMENT.md` for complete step-by-step instructions.

## ⚡ Current Status

Your project is **Vercel-ready**! Just run `vercel` to deploy.

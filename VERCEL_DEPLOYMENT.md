# Vercel Deployment Guide

## Fixed Issues
- ✅ Updated build command to use npm workspace command
- ✅ Added environment variables to vercel.json
- ✅ Fixed .vercelignore to not block dist during build

## Environment Variables to Set in Vercel Dashboard

Go to your Vercel project settings → Environment Variables and add:

### Required Variables:
1. **VITE_API_URL**
   - For Production: `https://your-backend-api.com/api`
   - For Development: Leave blank or set to local URL

2. **VITE_WALLETCONNECT_PROJECT_ID** (already in vercel.json)
   - Value: `c588218e86933fc20e4a803aea450bd9`

3. **VITE_THIRDWEB_CLIENT_ID** (already in vercel.json)
   - Value: `5b84b94777bfabc076a9b38c5d4aa68b`

4. **VITE_X402_SERVER_WALLET** (already in vercel.json)
   - Value: `0x0C39f0970CF3118Fd004A3f069E59dabc6714980`

## Deployment Steps

### 1. Commit and Push Changes
```bash
git add .
git commit -m "Fix: Update CSS theme and Vercel configuration"
git push origin main
```

### 2. Redeploy in Vercel
- Go to your Vercel dashboard
- Click on your project
- Click "Redeploy" on the latest deployment
- OR: Vercel will auto-deploy when you push to main

### 3. Clear Cache (if still showing old version)
```bash
# In Vercel dashboard:
# Deployments → (Latest deployment) → ... menu → Redeploy
# Check "Clear cache and redeploy"
```

## Troubleshooting

### If site shows blank/white screen:
1. Check browser console (F12) for errors
2. Verify VITE_API_URL is set correctly in Vercel
3. Check that the build completed successfully in Vercel logs

### If site shows old dark theme:
1. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
2. Clear browser cache
3. Redeploy with cache cleared in Vercel

### If build fails:
1. Check Vercel build logs
2. Ensure all dependencies are in package.json
3. Verify Node version (requires >=18.0.0)

## Build Configuration Summary

- **Framework**: Vite
- **Build Command**: `npm run build:frontend`
- **Output Directory**: `frontend/dist`
- **Install Command**: `npm install`
- **Node Version**: >=18.0.0

## Testing Local Production Build

Before deploying, test the production build locally:

```bash
cd frontend
npm run build
npm run preview
```

This will serve the production build at http://localhost:4173

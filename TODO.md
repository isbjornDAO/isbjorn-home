# Isbjorn Platform - Master TODO List

**Last Updated:** 2025-11-23  
**Status:** Backend & Frontend Deployed, CORS Issue Being Resolved

---

## 🔴 CRITICAL - Must Fix Now

### Backend Connection Issues
- [/] **Fix CORS between Vercel frontend and Railway backend**
  - Current Error: Frontend can't fetch from backend API
  - Fix Pushed: Added Vercel URL to CORS allowlist in code
  - Issue: Railway needs FRONTEND_URL environment variable set
  - **ACTION REQUIRED:** Add FRONTEND_URL=https://isbjorn-home.vercel.app to Railway
  - See: [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md) for full guide
  - Test: Visit https://isbjorn-home.vercel.app/donate
  - Expected: Should load charities instead of "Failed to load charities"

### Database Setup
- [ ] **Run database migrations on Railway PostgreSQL**
  - Backend is deployed but database tables don't exist yet
  - Need to run: `npm run migrate` in Railway backend
  - Creates: Users, Donations, Projects, Charities tables
  
- [ ] **Seed initial data**
  - Need at least one charity/project for testing
  - Run: `npm run seed` in Railway backend
  - Or manually add via SQL/admin panel

### Environment Variables
- [/] **Add missing Railway backend environment variables** 🔥 CRITICAL
  - **MUST ADD NOW:** `FRONTEND_URL=https://isbjorn-home.vercel.app` (fixes CORS!)
  - `NODE_ENV=production`
  - `JWT_SECRET` - Generate with: `openssl rand -base64 32`
  - `STRIPE_SECRET_KEY` - From Stripe dashboard (test mode for now)
  - `STRIPE_PUBLISHABLE_KEY` - From Stripe dashboard
  - `STRIPE_WEBHOOK_SECRET` - From Stripe webhook config
  - `DATABASE_URL` - Auto-set by Railway Postgres
  - **Full Guide:** See [RAILWAY_ENV_SETUP.md](./RAILWAY_ENV_SETUP.md)

---

## 🟡 HIGH PRIORITY - Next Steps

### Stripe Integration
- [ ] **Activate Stripe live mode**
  - Complete business verification
  - Get live API keys
  - Replace test keys in Railway env vars

- [ ] **Configure Stripe webhooks**
  - Add webhook endpoint: https://isbjorn-backend-production.up.railway.app/api/webhooks/stripe
  - Select events: payment_intent.succeeded, payment_intent.failed, charge.refunded
  - Copy webhook secret to Railway env vars

- [ ] **Test donation flow end-to-end**
  - Visit /donate page
  - Select charity
  - Enter amount
  - Complete Stripe checkout
  - Verify donation recorded in database
  - Check tax receipt generated

### Authentication & User Management
- [ ] **Test user registration**
  - Create account via /register
  - Verify email functionality (SendGrid)
  - Test login flow

- [ ] **Test business dashboard**
  - Login as business user
  - View donation history
  - Download tax receipts
  - Check impact metrics

---

## 🟢 MEDIUM PRIORITY - Features & Polish

### L1 Blockchain Deployment
- [ ] **Decide: Mainnet vs Fuji Testnet**
  - Mainnet: Production-ready, costs money
  - Fuji: Free testing, not real value
  - Decision needed before proceeding

- [ ] **Deploy Avalanche L1**
  - Use `avalanche-cli` with existing config files
  - Deploy `DonationContract.sol`
  - Deploy `NodeRegistry.sol`
  - Get contract addresses

- [ ] **Configure blockchain in backend**
  - Add L1 RPC URL to Railway env vars
  - Add contract addresses to env vars
  - Add private key for blockchain transactions (hot wallet)

- [ ] **Test blockchain donation flow**
  - Connect MetaMask/Core wallet
  - Make donation with AVAX
  - Verify transaction on blockchain
  - Check donation recorded in database

### Validator Node System
- [ ] **Set up node deployment infrastructure**
  - Choose cloud provider (AWS/GCP/Azure)
  - Create node deployment scripts
  - Configure monitoring

- [ ] **Implement node allocation logic**
  - Monitor donation pool threshold
  - Trigger node deployment when threshold reached
  - Assign nodes to donors proportionally
  - Update NodeRegistry contract

### Tax & Compliance
- [ ] **NZ IRD integration**
  - Integrate with IRD API for donation verification
  - Ensure tax receipts are IRD compliant

- [ ] **NZ Charities Register integration**
  - Verify charity status automatically
  - Display charity registration numbers

- [ ] **NZ Companies Register integration**
  - Auto-verify business donors
  - Pull company details for receipts

### Accounting Integrations
- [ ] **Xero integration**
  - OAuth setup
  - Automated donation export
  - Reconciliation reports

- [ ] **QuickBooks integration**
  - OAuth setup
  - Donation sync

---

## 🔵 LOW PRIORITY - Nice to Have

### UI/UX Improvements
- [ ] Add loading states to all forms
- [ ] Improve error messages
- [ ] Add success animations
- [ ] Mobile responsiveness check
- [ ] Accessibility audit (WCAG 2.1)

### Performance Optimization
- [ ] Add Redis caching (Railway Redis)
- [ ] Optimize database queries
- [ ] Add CDN for static assets
- [ ] Implement lazy loading

### Monitoring & Analytics
- [ ] Set up Sentry for error tracking
- [ ] Add Google Analytics
- [ ] Create admin analytics dashboard
- [ ] Set up uptime monitoring (UptimeRobot)

### Documentation
- [ ] User guide for donors
- [ ] User guide for charities
- [ ] Admin panel documentation
- [ ] API documentation (Swagger)
- [ ] Developer setup guide

### Security Enhancements
- [ ] Smart contract security audit (CertiK/OpenZeppelin)
- [ ] Penetration testing
- [ ] Rate limiting review
- [ ] GDPR compliance check
- [ ] Bug bounty program

---

## 📋 COMPLETED ✅

### Deployment
- [x] Frontend deployed to Vercel
- [x] Backend deployed to Railway
- [x] PostgreSQL database added to Railway
- [x] Environment variable `VITE_API_URL` added to Vercel
- [x] SPA routing configured for Vercel
- [x] Build scripts working
- [x] Git repository cleaned of secrets

### Configuration
- [x] Railway project created: `isbjorn-backend`
- [x] Vercel project: `isbjorn-home`
- [x] Railway domain: https://isbjorn-backend-production.up.railway.app
- [x] Vercel domain: https://isbjorn-home.vercel.app
- [x] CORS configuration added (pending redeploy)

### Code Quality
- [x] TypeScript build errors fixed
- [x] Stripe namespace issues resolved
- [x] Backend compiles successfully
- [x] Frontend builds successfully

---

## 🎯 IMMEDIATE NEXT SESSION PLAN

When you return, here's what to do first:

1. **Check if CORS is fixed** (2 min)
   - Visit https://isbjorn-home.vercel.app/donate
   - If charities load: ✅ Move to step 2
   - If still broken: Debug CORS further

2. **Run database migrations** (5 min)
   - Railway dashboard → isbjorn-backend → Terminal
   - Run: `npm run migrate`
   - Verify tables created

3. **Seed test data** (5 min)
   - Run: `npm run seed`
   - Or manually add one charity via SQL

4. **Add environment variables** (10 min)
   - Railway dashboard → Variables
   - Add all missing vars from list above
   - Redeploy backend

5. **Test donation flow** (10 min)
   - Make test donation
   - Verify it works end-to-end

**Total time: ~30 minutes to get fully operational**

---

## 📝 NOTES & DECISIONS

### Architecture Decisions
- **Frontend:** Vercel (static hosting, fast CDN)
- **Backend:** Railway (easy PostgreSQL, auto-deploy from GitHub)
- **Database:** PostgreSQL on Railway (production-ready)
- **Payments:** Stripe (traditional) + Blockchain (transparent)
- **L1:** Avalanche (decision pending: Mainnet vs Fuji)

### Known Issues
1. CORS between frontend/backend - Fix deployed, waiting for Railway redeploy
2. Database tables don't exist - Need to run migrations
3. No seed data - Need to add test charity
4. Missing env vars - Need to add to Railway

### Questions to Decide
- [ ] Use Mainnet or Fuji for L1?
- [ ] Which cloud provider for validator nodes?
- [ ] Enable recurring donations?
- [ ] Support international currencies?
- [ ] Build mobile app?

---

## 🔗 QUICK LINKS

- **Frontend:** https://isbjorn-home.vercel.app
- **Backend API:** https://isbjorn-backend-production.up.railway.app
- **Backend Health:** https://isbjorn-backend-production.up.railway.app/health
- **Railway Dashboard:** https://railway.com/project/389403df-96c8-4a8c-a411-6fd64f2a4f15
- **Vercel Dashboard:** https://vercel.com/bear2/isbjorn-home
- **GitHub Repo:** https://github.com/isbjornDAO/isbjorn-home
- **Implementation Plan:** [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md)
- **Railway Deploy Guide:** [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

---

**💡 TIP:** Keep this file updated as you complete tasks. Check off items with `[x]` and add new items as needed. This is your single source of truth!

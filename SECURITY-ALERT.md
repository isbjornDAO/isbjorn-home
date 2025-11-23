# 🔐 SECURITY ALERT - API Keys Exposed

## ⚠️ IMMEDIATE ACTION REQUIRED

Your Stripe API keys were committed to Git and are now visible in your repository history.

### What Was Exposed

- **Stripe Secret Key**: `sk_test_51RvReN...`
- **Stripe Publishable Key**: `pk_test_51RvReN...`

### What You Must Do NOW

1. **Revoke the exposed keys immediately**:
   - Go to https://dashboard.stripe.com/test/apikeys
   - Click "..." next to the exposed key
   - Click "Roll key" or "Delete"
   - Generate a new key

2. **Create new keys**:
   - Generate new test keys in Stripe dashboard
   - Save them securely (NOT in Git)

3. **Update your local environment**:
   - Add new keys to `backend/.env.development` (locally only)
   - Add new keys to `frontend/.env.development` (locally only)
   - **DO NOT commit these files**

### Files Cleaned

✅ `backend/.env.development` - Stripe keys removed
✅ `frontend/.env.development` - Stripe keys removed

### How to Use API Keys Safely

#### For Local Development

1. Create a `.env.local` file (gitignored):
   ```bash
   # backend/.env.local
   STRIPE_SECRET_KEY=sk_test_your_new_key_here
   STRIPE_PUBLISHABLE_KEY=pk_test_your_new_key_here
   ```

2. This file is already in `.gitignore` and won't be committed

#### For Production (Vercel)

1. Add keys in Vercel Dashboard → Settings → Environment Variables
2. Never commit production keys to Git

### Git History Cleanup (Optional but Recommended)

The old keys are still in Git history. To remove them:

```bash
# WARNING: This rewrites history and requires force push
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch backend/.env.development frontend/.env.development" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (coordinate with team first!)
git push origin --force --all
```

**OR** simpler: Just revoke the old keys in Stripe (recommended).

### Prevention

✅ `.env.development` files are now safe (placeholders only)
✅ `.env.local` is in `.gitignore`
✅ `.env.production` should never be committed

### Checklist

- [ ] Revoke exposed Stripe keys in dashboard
- [ ] Generate new Stripe keys
- [ ] Add new keys to `.env.local` (not `.env.development`)
- [ ] Test that app still works with new keys
- [ ] Add keys to Vercel dashboard for production

---

**Remember**: NEVER commit real API keys to Git. Always use:
- `.env.local` for local secrets (gitignored)
- Vercel dashboard for production secrets
- `.env.development` for placeholders only

# JWT_SECRET Authentication Fix

## Problem
Users are getting "Invalid token" errors when trying to donate. This is caused by a JWT_SECRET mismatch between different environments.

## Root Cause
When users register or log in, they receive a JWT token signed with the Railway backend's `JWT_SECRET`. If the Railway backend's `JWT_SECRET` environment variable is:
- Not set at all (falls back to default)
- Different from what was used to create the token
- Changed after tokens were issued

...then token verification will fail with "Invalid token" errors.

## Solution

### Step 1: Check Railway Environment Variables

1. Go to https://railway.app
2. Navigate to your `isbjorn-backend` project
3. Go to Variables/Environment section
4. Check if `JWT_SECRET` is set

### Step 2: Set Consistent JWT_SECRET on Railway

The `JWT_SECRET` on Railway should match your development environment for consistency:

```bash
JWT_SECRET=dev_secret_key_change_in_production_please_use_secure_random_string
```

**For Production (recommended):**
Generate a secure random string:
```bash
openssl rand -base64 32
```

Then set it as `JWT_SECRET` in Railway environment variables.

### Step 3: Redeploy Backend

After setting the environment variable:
1. Trigger a redeploy of the backend on Railway
2. Wait for deployment to complete
3. All new tokens will be signed with the correct secret

### Step 4: Existing Users Need to Re-login

Users who logged in before the fix will have tokens signed with the old secret. They need to:
1. Log out (or just clear browser localStorage)
2. Log back in to get a new token

The improved error handling will automatically detect invalid tokens and redirect users to log in again.

## Testing the Fix

### 1. Test Token Generation
```bash
# In backend directory
node -e "
const jwt = require('jsonwebtoken');
const secret = 'dev_secret_key_change_in_production_please_use_secure_random_string';
const token = jwt.sign({ id: 'test123', email: 'test@example.com' }, secret, { expiresIn: '7d' });
console.log('Generated token:', token);
console.log('Verified:', jwt.verify(token, secret));
"
```

### 2. Check Backend Logs
After the fix, look for these log messages:
- `[Auth] Verifying token: abc123xyz... using JWT_SECRET (first 10 chars): dev_secret...`
- `[Auth] Token verified successfully. Decoded ID: xxx, Email: xxx`

If you see errors like:
- `[Auth] Token verification failed: invalid signature`

This means the JWT_SECRET still doesn't match.

## Changes Made in This Fix

### Backend Changes (`backend/src/middleware/auth.ts`)

1. **Better Error Messages**: Now returns specific error codes:
   - `TOKEN_MISSING`: No token provided
   - `TOKEN_EXPIRED`: Token has expired
   - `TOKEN_INVALID`: Token signature doesn't match
   - `TOKEN_ERROR`: Other token errors

2. **Enhanced Logging**: Logs show:
   - First 10 characters of JWT_SECRET being used
   - Whether JWT_SECRET environment variable exists
   - Specific JWT error details (expiration time, error type)

3. **Clearer Debug Info**: Helps diagnose mismatches quickly

### Frontend Changes (`frontend/src/pages/CharityDetailsPage.tsx`)

1. **Token Error Detection**: Checks for authentication error codes
2. **Auto-redirect**: Clears invalid tokens and redirects to login
3. **User-friendly Message**: Shows "Your session has expired. Please log in again."

## Environment Variable Reference

| Environment | JWT_SECRET Value |
|------------|------------------|
| Development (.env.development) | `dev_secret_key_change_in_production_please_use_secure_random_string` |
| Code Fallback | `dev-secret-key-change-in-production` |
| Production (Railway) | **MUST BE SET MANUALLY** |

## Common Issues

### Issue 1: "Invalid token" immediately after login
**Cause**: Backend restarted between login and donation attempt
**Fix**: Set JWT_SECRET on Railway so it persists across restarts

### Issue 2: Different errors on different pages
**Cause**: Multiple backend instances with different secrets
**Fix**: Ensure all backend instances use the same JWT_SECRET

### Issue 3: Token works in development but not production
**Cause**: Railway doesn't have JWT_SECRET set
**Fix**: Add JWT_SECRET to Railway environment variables

## Verification Steps

After applying the fix:

1. **Clear browser data**
   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Register a new test account**
   - Go to /register
   - Complete registration
   - Should redirect to dashboard

3. **Try to donate**
   - Go to /donate
   - Select a charity
   - Click donate
   - Should redirect to checkout (not show "invalid token")

4. **Check Railway logs**
   ```
   [Auth] Verifying token: ...
   [Auth] Token verified successfully. Decoded ID: ...
   ```

## Security Notes

- Never commit JWT_SECRET to git
- Use a strong, random secret in production (min 32 characters)
- Rotate secrets periodically (requires all users to re-login)
- Current development secret is for development ONLY

## Next Steps

1. ✅ Backend error handling improved
2. ✅ Frontend token validation improved
3. ⏳ Set JWT_SECRET on Railway
4. ⏳ Redeploy backend
5. ⏳ Test donation flow end-to-end

Once Railway environment variable is set, the "invalid token" error should be resolved.

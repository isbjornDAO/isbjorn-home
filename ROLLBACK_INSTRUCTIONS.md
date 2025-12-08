# Repository Rollback to Working Version

## Target Commit
**Commit:** `96dd7bd0682878cfacdc952c9eb6ebb6cc8f8074`
**Message:** feat: match RegisterPage header styling to LoginPage
**Date:** Sat Dec 6 03:37:41 2025 +0000

This corresponds to your working Vercel deployment.

## What Was Done

1. ✅ Created rollback branch at commit 96dd7bd
2. ✅ Pushed rollback branch to remote: `claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ`
3. ⚠️ **Cannot force push to main** - Branch is protected (HTTP 403)

## What You Need To Do

Since the `main` branch is protected, you have **3 options** to complete the rollback:

### Option 1: Merge the PR (Recommended)
```bash
# Visit the PR created by the push:
https://github.com/isbjornDAO/isbjorn-home/pull/new/claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ

# Or merge via command line (if you have permissions):
git checkout main
git merge claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ
git push origin main
```

### Option 2: Force Push to Main (Requires Admin)
```bash
# Temporarily disable branch protection in GitHub Settings, then:
git fetch origin
git checkout -B main claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ
git push -f origin main
# Re-enable branch protection
```

### Option 3: Update Main Branch via GitHub UI
1. Go to: https://github.com/isbjornDAO/isbjorn-home/settings/branches
2. Remove branch protection from `main` temporarily
3. Go to: https://github.com/isbjornDAO/isbjorn-home/tree/claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ
4. Click "Contribute" → "Open pull request"
5. Merge the PR
6. Re-enable branch protection

## Changes in Rollback

The rollback includes these 8 commits ahead of current main (37837f7):

```
96dd7bd feat: match RegisterPage header styling to LoginPage
6491b58 fix: prevent sidebars from moving when form content changes
475ea52 feat: change nav button from 'Donate now' to 'Sign up'
67e0c34 feat: reduce curved banner to slither size for better page fit
e34eeaf feat: restore complete auth pages with social buttons, sidebars, and curved banner
24a5992 fix: add missing toast import to RegisterPage
d554c57 feat: add social login buttons and curved banner to auth pages
246305f feat: add curved banner background to top of sign in and sign up pages
```

**Files Modified:**
- `frontend/src/components/Layout.tsx` (4 lines changed)
- `frontend/src/pages/LoginPage.tsx` (442 lines added, significant redesign)
- `frontend/src/pages/RegisterPage.tsx` (519 lines added, significant redesign)

## Vercel Deployment

Once main is updated, Vercel should automatically redeploy to match the working version.

If you need to deploy immediately without updating main:
1. Go to Vercel Dashboard
2. Select the `claude/rollback-to-working-version-01XBjErNayKcchY6P1U93XhQ` branch for deployment
3. Or manually trigger deployment of that branch

## Avalanche AI/LLM Documentation

As requested, here are the Avalanche resources for AI agent development:

- **Avalanche Tooling SDK (Go):** https://github.com/ava-labs/avalanche-tooling-sdk-go
- **Avalanche Developer Hub:** https://www.avax.network/build/developer-hub
- **Note:** The original docs URL (build.avax.network/docs/tooling/ai-llm) returned 503 error

The Avalanche Tooling Go SDK is experimental and can be used for creating Subnets, blockchains, and nodes on Avalanche network. For AI agent integration, you may want to explore building agents that interact with smart contracts on Avalanche.

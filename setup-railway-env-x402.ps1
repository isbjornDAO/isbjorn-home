# Railway Environment Setup for X402 (No Stripe)
# Run this script to configure Railway environment variables

Write-Host "🚂 Railway Environment Setup - X402 Donation Platform" -ForegroundColor Cyan
Write-Host "=" * 60

# Change to backend directory
Set-Location -Path "$PSScriptRoot\backend"

Write-Host "`n📍 Current directory: $(Get-Location)" -ForegroundColor Yellow

# Step 1: Link to Railway service
Write-Host "`n⚡ Step 1: Linking to Railway service..." -ForegroundColor Green
Write-Host "When prompted, select: isbjorn-home (NOT Postgres)" -ForegroundColor Yellow
railway link

Write-Host "`n⚡ Step 2: Setting environment variables..." -ForegroundColor Green

# Critical environment variables
Write-Host "`n[1/9] NODE_ENV..."
railway variables set NODE_ENV=production

Write-Host "[2/9] PORT..."
railway variables set PORT=5000

Write-Host "[3/9] FRONTEND_URL..."
railway variables set FRONTEND_URL=https://isbjorn-home.vercel.app

Write-Host "[4/9] JWT_SECRET..."
# Generate a secure JWT secret
$jwtSecret = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 32 | ForEach-Object {[char]$_})
railway variables set JWT_SECRET=$jwtSecret

Write-Host "[5/9] JWT_EXPIRES_IN..."
railway variables set JWT_EXPIRES_IN=24h

Write-Host "[6/9] JWT_REFRESH_EXPIRES_IN..."
railway variables set JWT_REFRESH_EXPIRES_IN=7d

# NZ API Keys (for company/charity verification)
Write-Host "[7/9] NZBN_API_KEY..."
railway variables set NZBN_API_KEY=fc9990cb458842ef96d05f5d012aec08

Write-Host "[8/9] NZ_COMPANIES_REGISTER_API_KEY..."
railway variables set NZ_COMPANIES_REGISTER_API_KEY=fc9990cb458842ef96d05f5d012aec08

# Email configuration (SendGrid)
Write-Host "[9/9] Email settings..."
Write-Host "`n⚠️  IMPORTANT: You need to set your SendGrid API key manually!" -ForegroundColor Yellow
Write-Host "Get your SendGrid API key from: https://app.sendgrid.com/settings/api_keys" -ForegroundColor Cyan
Write-Host "`nAfter you get your SendGrid API key, run:" -ForegroundColor Yellow
Write-Host "  railway variables set SENDGRID_API_KEY=your_sendgrid_api_key_here" -ForegroundColor White

# Set email defaults
railway variables set FROM_EMAIL=noreply@isbjorn.co.nz
railway variables set FROM_NAME="Isbjorn Foundation"

# Optional: Blockchain configuration (for future use)
Write-Host "`n📝 Optional blockchain settings (setting defaults)..." -ForegroundColor Gray
railway variables set AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc

Write-Host "`n✅ Environment variables configured!" -ForegroundColor Green
Write-Host "`n📋 Summary:" -ForegroundColor Cyan
Write-Host "  ✓ NODE_ENV = production"
Write-Host "  ✓ FRONTEND_URL = https://isbjorn-home.vercel.app"
Write-Host "  ✓ JWT_SECRET = (generated)"
Write-Host "  ✓ NZ API Keys = configured"
Write-Host "  ✓ Email FROM settings = configured"
Write-Host "  ⚠️  SendGrid API key = NEEDS MANUAL SETUP"
Write-Host "  ✓ Blockchain RPC = configured"

Write-Host "`n🔍 Checking current variables..." -ForegroundColor Cyan
railway variables

Write-Host "`n🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Get your SendGrid API key from https://app.sendgrid.com" -ForegroundColor White
Write-Host "2. Run: railway variables set SENDGRID_API_KEY=your_key_here" -ForegroundColor White
Write-Host "3. Railway will auto-redeploy (takes 2-3 minutes)" -ForegroundColor White
Write-Host "4. Test: curl https://isbjorn-backend-production.up.railway.app/health" -ForegroundColor White

Write-Host "`n✨ Done! Your Railway environment is configured for x402 donations." -ForegroundColor Green

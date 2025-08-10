#!/bin/bash

# 🐻‍❄️ Isbjorn Platform Local Setup (No Docker)
# This script sets up the platform to run locally with system services

set -e

echo "🐻‍❄️ Isbjorn Platform - Local Development Setup"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_step() {
    echo -e "${BLUE}[STEP]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check Node.js
print_step "Checking Node.js installation..."
if ! command -v node &> /dev/null; then
    print_error "Node.js not found!"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js 18+ required. Current: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm not found!"
    exit 1
fi
print_success "npm $(npm --version) ✓"

# Check Redis
if ! command -v redis-server &> /dev/null; then
    print_warning "Redis not found. Installing..."
    # Redis installation would require system permissions
    print_warning "Please install Redis manually or we'll use a mock cache"
else
    print_success "Redis available ✓"
fi

# Setup SQLite as a lightweight alternative to PostgreSQL
print_step "Setting up SQLite database (lightweight alternative to PostgreSQL)..."

# Create environment files
print_step "Creating environment configuration..."

# Root .env
cat > .env << EOL
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Database - using SQLite for simplicity
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# Redis - local
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe (test keys - replace with your own)
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_PUBLIC_KEY=pk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# SendGrid
SENDGRID_API_KEY=SG.placeholder
SENDGRID_FROM_EMAIL=dev@isbjorn.local

# Avalanche Testnet
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
AVALANCHE_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000

# Contract addresses (will be set after deployment)
DONATION_TRACKER_ADDRESS=0x0000000000000000000000000000000000000000
PROJECT_DISTRIBUTION_ADDRESS=0x0000000000000000000000000000000000000000
ADMIN_MULTISIG_ADDRESS=0x0000000000000000000000000000000000000000
EOL

# Backend .env
cat > backend/.env << EOL
NODE_ENV=development
PORT=5000

# Database
DB_TYPE=sqlite
DB_PATH=./database.sqlite

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# JWT
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d

# Stripe
STRIPE_SECRET_KEY=sk_test_placeholder
STRIPE_WEBHOOK_SECRET=whsec_placeholder

# SendGrid  
SENDGRID_API_KEY=SG.placeholder
SENDGRID_FROM_EMAIL=dev@isbjorn.local
SENDGRID_FROM_NAME=Isbjorn Dev

# Avalanche
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_CHAIN_ID=43113
AVALANCHE_PRIVATE_KEY=0x0000000000000000000000000000000000000000000000000000000000000000
AVALANCHE_TREASURY_ADDRESS=0x0000000000000000000000000000000000000000

# Contract addresses
DONATION_TRACKER_ADDRESS=0x0000000000000000000000000000000000000000
PROJECT_DISTRIBUTION_ADDRESS=0x0000000000000000000000000000000000000000
ADMIN_MULTISIG_ADDRESS=0x0000000000000000000000000000000000000000

# NZ Tax Info
NZ_GST_NUMBER=123-456-789
NZ_CHARITY_NUMBER=CC12345
CHARITY_NAME=Isbjorn Foundation (Dev)
CHARITY_ADDRESS_STREET=123 Dev Street
CHARITY_ADDRESS_CITY=Wellington
CHARITY_ADDRESS_STATE=Wellington
CHARITY_ADDRESS_POSTAL=6011
CHARITY_ADDRESS_COUNTRY=New Zealand

# Admin
ADMIN_EMAIL=admin@isbjorn.local
ADMIN_PASSWORD=admin123
ADMIN_COMPANY_NAME=Isbjorn Admin
EOL

# Frontend .env
cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder
VITE_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_AVALANCHE_CHAIN_ID=43113
VITE_TREASURY_ADDRESS=0x0000000000000000000000000000000000000000
EOL

print_success "Environment files created!"

# Install dependencies
print_step "Installing dependencies..."

print_step "Installing root dependencies..."
npm install --silent

print_step "Installing frontend dependencies..."
cd frontend
npm install --silent
cd ..

print_step "Installing backend dependencies..."
cd backend

# Add SQLite support to backend
print_step "Adding SQLite support..."
npm install --silent sqlite3 sequelize

cd ..

print_step "Installing smart contracts dependencies..."
cd smart-contracts
npm install --silent
cd ..

print_success "Dependencies installed!"

# Create directories
print_step "Creating directories..."
mkdir -p logs backend/logs uploads/receipts uploads/temp smart-contracts/deployments

# Start Redis if available
if command -v redis-server &> /dev/null; then
    print_step "Starting Redis server..."
    redis-server --daemonize yes --port 6379
    print_success "Redis started on port 6379"
else
    print_warning "Redis not available - using in-memory cache"
fi

# Build smart contracts
print_step "Building smart contracts..."
cd smart-contracts
npm run build
cd ..
print_success "Smart contracts built!"

# Create a simple startup script
cat > start-dev.sh << EOL
#!/bin/bash

echo "🐻‍❄️ Starting Isbjorn Platform..."

# Start Redis if not running
if ! pgrep -x redis-server > /dev/null; then
    if command -v redis-server &> /dev/null; then
        echo "Starting Redis..."
        redis-server --daemonize yes --port 6379
    fi
fi

# Start backend in background
echo "Starting backend..."
cd backend
npm run dev &
BACKEND_PID=\$!
cd ..

# Wait a moment for backend to start
sleep 3

# Start frontend
echo "Starting frontend..."
cd frontend
npm run dev &
FRONTEND_PID=\$!
cd ..

echo ""
echo "🚀 Isbjorn Platform is starting up..."
echo ""
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend:  http://localhost:5000"
echo "📚 API Docs: http://localhost:5000/api-docs"
echo ""
echo "Press Ctrl+C to stop all services"

# Wait for interrupt
trap 'echo ""; echo "Stopping services..."; kill \$BACKEND_PID \$FRONTEND_PID 2>/dev/null; exit' INT

wait
EOL

chmod +x start-dev.sh

print_success "Setup complete!"

echo ""
echo "🎉 Isbjorn Platform Local Setup Complete!"
echo "========================================"
echo ""
echo "🚀 To start the platform:"
echo "   ./start-dev.sh"
echo ""
echo "Or start services individually:"
echo "   Backend:  cd backend && npm run dev"
echo "   Frontend: cd frontend && npm run dev"
echo ""
echo "📱 URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo "   API Docs: http://localhost:5000/api-docs"
echo ""
echo "🔧 Next steps:"
echo "   1. Get Stripe test keys: https://dashboard.stripe.com/test/apikeys"
echo "   2. Update STRIPE_SECRET_KEY and STRIPE_PUBLIC_KEY in .env files"
echo "   3. Deploy smart contracts: cd smart-contracts && npm run deploy:testnet"
echo "   4. Update contract addresses in backend/.env"
echo ""
print_success "Ready to develop! 🐻‍❄️"
EOL
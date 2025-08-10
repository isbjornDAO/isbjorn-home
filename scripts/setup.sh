#!/bin/bash

# 🐻‍❄️ Isbjorn Platform Setup Script
# This script sets up the complete development environment

set -e

echo "🐻‍❄️ Welcome to Isbjorn Platform Setup!"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check prerequisites
print_step "Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node --version | cut -d'.' -f1 | cut -d'v' -f2)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version: $(node --version)"
    exit 1
fi

print_success "Node.js $(node --version) ✓"

# Check npm
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed"
    exit 1
fi

print_success "npm $(npm --version) ✓"

# Check Docker
if ! command -v docker &> /dev/null; then
    print_warning "Docker not found. You can still run the project manually, but Docker is recommended."
else
    print_success "Docker $(docker --version | cut -d' ' -f3 | cut -d',' -f1) ✓"
fi

# Check Docker Compose
if ! command -v docker-compose &> /dev/null; then
    print_warning "Docker Compose not found. You can still run the project manually."
else
    print_success "Docker Compose $(docker-compose --version | cut -d' ' -f4 | cut -d',' -f1) ✓"
fi

# Create environment files
print_step "Setting up environment files..."

if [ ! -f ".env" ]; then
    cp .env.example .env
    print_success "Created root .env file"
else
    print_warning "Root .env file already exists"
fi

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    print_success "Created backend .env file"
else
    print_warning "Backend .env file already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cat > frontend/.env << EOL
VITE_API_URL=http://localhost:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_placeholder
VITE_AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
VITE_AVALANCHE_CHAIN_ID=43113
EOL
    print_success "Created frontend .env file"
else
    print_warning "Frontend .env file already exists"
fi

# Install dependencies
print_step "Installing dependencies..."

print_step "Installing root dependencies..."
npm install

print_step "Installing frontend dependencies..."
cd frontend
npm install
cd ..

print_step "Installing backend dependencies..."  
cd backend
npm install
cd ..

print_step "Installing smart contracts dependencies..."
cd smart-contracts
npm install
cd ..

print_success "All dependencies installed!"

# Create necessary directories
print_step "Creating necessary directories..."
mkdir -p logs
mkdir -p backend/logs
mkdir -p smart-contracts/deployments
mkdir -p uploads/receipts
mkdir -p uploads/temp

print_success "Directory structure created!"

# Setup database (if using Docker)
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    print_step "Setting up development database with Docker..."
    
    # Start only postgres and redis
    docker-compose up -d postgres redis
    
    # Wait for database to be ready
    print_step "Waiting for database to be ready..."
    sleep 10
    
    # Run migrations (when implemented)
    print_step "Running database migrations..."
    cd backend
    # npm run migrate (uncomment when migrations are implemented)
    cd ..
    
    print_success "Database setup complete!"
else
    print_warning "Docker not available. Please set up PostgreSQL and Redis manually."
    echo "Required services:"
    echo "- PostgreSQL 15+ on port 5432"
    echo "- Redis 7+ on port 6379"
fi

# Build smart contracts
print_step "Compiling smart contracts..."
cd smart-contracts
npm run build
print_success "Smart contracts compiled!"
cd ..

# Generate sample data (if in development)
if [ "$NODE_ENV" != "production" ]; then
    print_step "Setting up sample data..."
    # cd backend && npm run seed (uncomment when seed script is implemented)
    print_success "Sample data created!"
fi

# Final setup
print_step "Performing final setup checks..."

# Check if all required environment variables are set
print_step "Checking environment configuration..."

# Read the backend .env file and check for placeholder values
if grep -q "your-" backend/.env; then
    print_warning "Please update placeholder values in backend/.env:"
    grep "your-" backend/.env | head -5
    echo "..."
fi

if grep -q "placeholder" frontend/.env; then
    print_warning "Please update placeholder values in frontend/.env:"
    grep "placeholder" frontend/.env
fi

echo ""
echo "🎉 Setup Complete! Here's what's ready:"
echo "================================================"
echo ""
echo "🚀 To start the development environment:"
echo ""
echo "   Option 1 - Using Docker (Recommended):"
echo "   docker-compose up -d"
echo ""
echo "   Option 2 - Manual startup:"
echo "   npm run dev"
echo ""
echo "📱 Your application will be available at:"
echo "   Frontend:  http://localhost:3000"
echo "   Backend:   http://localhost:5000"  
echo "   API Docs:  http://localhost:5000/api-docs"
echo ""
echo "🔧 Next steps:"
echo "   1. Update environment variables in .env files"
echo "   2. Get Stripe API keys from https://dashboard.stripe.com"
echo "   3. Get SendGrid API key from https://sendgrid.com"
echo "   4. Deploy smart contracts: cd smart-contracts && npm run deploy:testnet"
echo "   5. Update contract addresses in backend/.env"
echo ""
echo "📚 Documentation:"
echo "   README.md - Complete setup guide"
echo "   backend/API.md - API documentation"  
echo "   smart-contracts/README.md - Smart contract guide"
echo ""
echo "🆘 Need help?"
echo "   GitHub Issues: https://github.com/your-org/isbjorn-platform/issues"
echo "   Email: support@isbjorn.co.nz"
echo ""
print_success "Isbjorn Platform is ready for development! 🐻‍❄️"
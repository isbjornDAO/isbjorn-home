#!/bin/bash

# Isbjorn Platform Deployment Script
# Supports local development, staging, and production deployments

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default environment
ENVIRONMENT=${1:-development}

echo -e "${BLUE}🚀 Isbjorn Platform Deployment Script${NC}"
echo -e "${BLUE}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Validate environment
case $ENVIRONMENT in
  development|staging|production)
    echo -e "${GREEN}✅ Valid environment: $ENVIRONMENT${NC}"
    ;;
  *)
    echo -e "${RED}❌ Invalid environment: $ENVIRONMENT${NC}"
    echo "Usage: $0 [development|staging|production]"
    exit 1
    ;;
esac

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${YELLOW}📋 Checking prerequisites...${NC}"

MISSING_TOOLS=""

if ! command_exists node; then
    MISSING_TOOLS="$MISSING_TOOLS node"
fi

if ! command_exists npm; then
    MISSING_TOOLS="$MISSING_TOOLS npm"
fi

if ! command_exists docker && [ "$ENVIRONMENT" != "development" ]; then
    MISSING_TOOLS="$MISSING_TOOLS docker"
fi

if ! command_exists docker-compose && [ "$ENVIRONMENT" != "development" ]; then
    MISSING_TOOLS="$MISSING_TOOLS docker-compose"
fi

if [ ! -z "$MISSING_TOOLS" ]; then
    echo -e "${RED}❌ Missing required tools:$MISSING_TOOLS${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All prerequisites met${NC}"

# Environment-specific deployment
case $ENVIRONMENT in
  development)
    echo -e "${YELLOW}🔧 Setting up development environment...${NC}"
    
    # Backend setup
    echo "Setting up backend..."
    cd backend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing backend dependencies..."
        npm install
    fi
    
    # Copy environment file
    if [ ! -f ".env" ]; then
        cp .env.development .env
        echo -e "${YELLOW}⚠️  Please update .env with your API keys${NC}"
    fi
    
    # Setup database
    echo "Setting up database..."
    npm run setup
    
    cd ..
    
    # Frontend setup
    echo "Setting up frontend..."
    cd frontend
    
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    fi
    
    cd ..
    
    echo -e "${GREEN}✅ Development environment ready!${NC}"
    echo ""
    echo -e "${YELLOW}📋 Next steps:${NC}"
    echo "1. Update backend/.env with your API keys"
    echo "2. Run: ./run-platform.sh"
    echo "3. Open: http://localhost:3001"
    ;;
    
  staging)
    echo -e "${YELLOW}🔧 Deploying to staging...${NC}"
    
    # Build and deploy with Docker
    echo "Building Docker images..."
    docker-compose -f docker-compose.staging.yml build
    
    echo "Starting staging environment..."
    docker-compose -f docker-compose.staging.yml up -d
    
    echo -e "${GREEN}✅ Staging deployment complete!${NC}"
    echo "Staging URL: https://staging.isbjorn.co.nz"
    ;;
    
  production)
    echo -e "${YELLOW}🔧 Deploying to production...${NC}"
    
    # Backup existing data
    if [ -f "docker-compose.production.yml" ] && docker-compose -f docker-compose.production.yml ps -q > /dev/null 2>&1; then
        echo "Creating backup..."
        mkdir -p backups
        docker-compose -f docker-compose.production.yml exec -T backend npm run backup > "backups/backup-$(date +%Y%m%d_%H%M%S).sql"
    fi
    
    # Build and deploy
    echo "Building production Docker images..."
    docker-compose -f docker-compose.production.yml build --no-cache
    
    echo "Starting production environment..."
    docker-compose -f docker-compose.production.yml up -d
    
    echo "Running database migrations..."
    docker-compose -f docker-compose.production.yml exec backend npm run migrate
    
    echo -e "${GREEN}✅ Production deployment complete!${NC}"
    echo "Production URL: https://isbjorn.co.nz"
    ;;
esac

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"

case $ENVIRONMENT in
  development)
    echo "Health check URLs:"
    echo "- Frontend: http://localhost:3001"
    echo "- Backend: http://localhost:5000/api/public/health"
    echo "- API Docs: http://localhost:5000/api/docs"
    ;;
  staging)
    sleep 10
    if curl -f -s https://staging.isbjorn.co.nz/api/public/health > /dev/null; then
        echo -e "${GREEN}✅ Staging health check passed${NC}"
    else
        echo -e "${RED}❌ Staging health check failed${NC}"
    fi
    ;;
  production)
    sleep 15
    if curl -f -s https://isbjorn.co.nz/api/public/health > /dev/null; then
        echo -e "${GREEN}✅ Production health check passed${NC}"
    else
        echo -e "${RED}❌ Production health check failed${NC}"
        echo "Check logs: docker-compose -f docker-compose.production.yml logs"
    fi
    ;;
esac

echo ""
echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"

# Display relevant information
case $ENVIRONMENT in
  development)
    cat << EOF
${YELLOW}📋 Development Environment Information:${NC}

Frontend: http://localhost:3001
Backend:  http://localhost:5000
API Docs: http://localhost:5000/api/docs

Default Admin Login:
Email: admin@isbjorn.co.nz
Password: admin123

Logs:
- Backend: backend.log
- Frontend: frontend.log

To stop: ./stop-platform.sh

API Keys to configure in backend/.env:
- STRIPE_SECRET_KEY (for payments)
- SENDGRID_API_KEY (for email receipts)
- NZ_COMPANIES_REGISTER_API_KEY (for company verification)
- AVALANCHE_RPC_URL (for your L1 blockchain)
EOF
    ;;
  staging)
    echo -e "${YELLOW}📋 Staging Environment:${NC}"
    echo "URL: https://staging.isbjorn.co.nz"
    echo "Logs: docker-compose -f docker-compose.staging.yml logs"
    ;;
  production)
    echo -e "${YELLOW}📋 Production Environment:${NC}"
    echo "URL: https://isbjorn.co.nz"
    echo "Logs: docker-compose -f docker-compose.production.yml logs"
    echo "Monitor: docker-compose -f docker-compose.production.yml ps"
    ;;
esac

echo ""
echo -e "${BLUE}🐻‍❄️ Isbjorn Platform is ready to help save the Arctic!${NC}"
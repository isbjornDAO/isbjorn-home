#!/bin/bash

# Isbjorn Platform Startup Script
echo "🐻‍❄️ Starting Isbjorn Donation Platform..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check required tools
echo "🔍 Checking requirements..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Setup backend
echo -e "${BLUE}📦 Setting up backend...${NC}"
cd backend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi

# Setup database and seed data
echo "🗄️ Setting up database..."
npm run setup

# Start backend in background
echo "🚀 Starting backend server..."
npm run dev > ../backend.log 2>&1 &
BACKEND_PID=$!

# Setup frontend
cd ../frontend
echo -e "${BLUE}📦 Setting up frontend...${NC}"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Start frontend in background
echo "🚀 Starting frontend server..."
npm run dev > ../frontend.log 2>&1 &
FRONTEND_PID=$!

# Wait a moment for servers to start
sleep 5

# Check if servers are running
echo -e "${BLUE}🔍 Checking server status...${NC}"

if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend running on http://localhost:5000${NC}"
    echo -e "${GREEN}📚 API Documentation: http://localhost:5000/api/docs${NC}"
else
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check backend.log for details"
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend running on http://localhost:3001${NC}"
else
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Check frontend.log for details"
fi

echo ""
echo -e "${GREEN}🎉 Isbjorn Platform is now running!${NC}"
echo ""
echo -e "${YELLOW}📋 Quick Start Guide:${NC}"
echo "• Frontend: http://localhost:3001"
echo "• Backend API: http://localhost:5000"
echo "• API Docs: http://localhost:5000/api/docs"
echo ""
echo -e "${YELLOW}🔑 Default Admin Credentials:${NC}"
echo "• Email: admin@isbjorn.co.nz"
echo "• Password: admin123"
echo ""
echo -e "${YELLOW}📁 Log Files:${NC}"
echo "• Backend: backend.log"
echo "• Frontend: frontend.log"
echo ""
echo -e "${YELLOW}🛑 To stop the platform:${NC}"
echo "Press Ctrl+C or run: ./stop-platform.sh"
echo ""

# Create stop script
cat > ../stop-platform.sh << 'EOF'
#!/bin/bash
echo "🛑 Stopping Isbjorn Platform..."

# Kill backend
if [ -f backend.pid ]; then
    kill $(cat backend.pid) 2>/dev/null
    rm backend.pid
fi

# Kill frontend  
if [ -f frontend.pid ]; then
    kill $(cat frontend.pid) 2>/dev/null
    rm frontend.pid
fi

# Kill by process name as backup
pkill -f "npm run dev" 2>/dev/null
pkill -f "vite" 2>/dev/null
pkill -f "tsx" 2>/dev/null

echo "✅ Platform stopped"
EOF

chmod +x ../stop-platform.sh

# Save PIDs for stop script
echo $BACKEND_PID > ../backend.pid
echo $FRONTEND_PID > ../frontend.pid

# Wait for user to stop
echo "Press Ctrl+C to stop the platform..."
trap "bash ../stop-platform.sh; exit 0" INT

# Keep script running
while true; do
    sleep 1
done
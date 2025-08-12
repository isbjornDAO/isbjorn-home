#!/bin/bash

# Isbjorn Platform Development Startup Script
# This script starts both frontend and backend development servers

echo "🚀 Starting Isbjorn Platform Development Environment..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i :$1 >/dev/null 2>&1
}

# Check dependencies
echo -e "${BLUE}🔍 Checking dependencies...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js and npm are installed${NC}"

# Check if ports are available
echo -e "${BLUE}🔍 Checking ports...${NC}"

if port_in_use 3001; then
    echo -e "${RED}❌ Port 3001 is already in use. Please stop the service using this port.${NC}"
    exit 1
fi

if port_in_use 5001; then
    echo -e "${RED}❌ Port 5001 is already in use. Please stop the service using this port.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Ports 3001 and 5001 are available${NC}"

# Install dependencies if needed
echo -e "${BLUE}📦 Checking and installing dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing root dependencies...${NC}"
    npm install
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    cd frontend && npm install && cd ..
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

echo -e "${GREEN}✅ All dependencies installed${NC}"

# Setup database if needed
echo -e "${BLUE}🗃️  Setting up database...${NC}"
cd backend

if [ ! -f "database.sqlite" ]; then
    echo -e "${YELLOW}🗃️  Setting up database for first time...${NC}"
    npm run setup
else
    echo -e "${GREEN}✅ Database already exists${NC}"
fi

cd ..

# Create log directory
mkdir -p logs

echo ""
echo -e "${GREEN}🎉 Starting services...${NC}"
echo ""

# Start backend in background
echo -e "${PURPLE}🔧 Starting backend server on port 5001...${NC}"
cd backend
PORT=5001 npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait a moment for backend to start
sleep 2

# Start frontend in background
echo -e "${CYAN}🎨 Starting frontend server on port 3001...${NC}"
cd frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# Wait for services to start
echo ""
echo -e "${YELLOW}⏳ Waiting for services to start...${NC}"
sleep 5

# Check if services are running
if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Backend server is running (PID: $BACKEND_PID)${NC}"
else
    echo -e "${RED}❌ Backend server failed to start${NC}"
    exit 1
fi

if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${GREEN}✅ Frontend server is running (PID: $FRONTEND_PID)${NC}"
else
    echo -e "${RED}❌ Frontend server failed to start${NC}"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo -e "${GREEN}🎉 Isbjorn Platform is now running!${NC}"
echo ""
echo -e "${CYAN}📱 Frontend:${NC} http://localhost:3001"
echo -e "${PURPLE}🔧 Backend API:${NC} http://localhost:5001"
echo -e "${BLUE}📖 API Docs:${NC} http://localhost:5001/api-docs"
echo ""
echo -e "${YELLOW}📋 Default admin login:${NC}"
echo -e "   Email: admin@isbjorn.co.nz"
echo -e "   Password: admin123"
echo ""
echo -e "${CYAN}📝 Logs:${NC}"
echo -e "   Backend: tail -f logs/backend.log"
echo -e "   Frontend: tail -f logs/frontend.log"
echo ""
echo -e "${YELLOW}⚠️  Press Ctrl+C to stop all services${NC}"

# Save PIDs for cleanup
echo $BACKEND_PID > logs/backend.pid
echo $FRONTEND_PID > logs/frontend.pid

# Trap Ctrl+C and cleanup
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    
    if [ -f logs/backend.pid ]; then
        BACKEND_PID=$(cat logs/backend.pid)
        if kill -0 $BACKEND_PID 2>/dev/null; then
            kill $BACKEND_PID
            echo -e "${GREEN}✅ Backend server stopped${NC}"
        fi
        rm -f logs/backend.pid
    fi
    
    if [ -f logs/frontend.pid ]; then
        FRONTEND_PID=$(cat logs/frontend.pid)
        if kill -0 $FRONTEND_PID 2>/dev/null; then
            kill $FRONTEND_PID
            echo -e "${GREEN}✅ Frontend server stopped${NC}"
        fi
        rm -f logs/frontend.pid
    fi
    
    echo -e "${GREEN}👋 Goodbye!${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for user to stop
wait
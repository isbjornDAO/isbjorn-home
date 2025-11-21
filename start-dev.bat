@echo off
REM Isbjorn Platform Development Startup Script for Windows
REM This script starts both frontend and backend development servers

echo 🚀 Starting Isbjorn Platform Development Environment...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies if needed
echo 📦 Checking and installing dependencies...

if not exist "node_modules" (
    echo 📦 Installing root dependencies...
    npm install
)

if not exist "frontend\node_modules" (
    echo 📦 Installing frontend dependencies...
    cd frontend
    npm install
    cd ..
)

if not exist "backend\node_modules" (
    echo 📦 Installing backend dependencies...
    cd backend
    npm install
    cd ..
)

echo ✅ All dependencies installed

REM Setup database if needed
echo 🗃️ Setting up database...
cd backend

if not exist "database.sqlite" (
    echo 🗃️ Setting up database for first time...
    npm run setup
) else (
    echo ✅ Database already exists
)

cd ..

REM Create log directory
if not exist "logs" mkdir logs

echo.
echo 🎉 Starting services...
echo.

REM Start backend
echo 🔧 Starting backend server on port 5000...
cd backend
start "Isbjorn Backend" cmd /k "set PORT=5000 && npm run dev"
cd ..

REM Wait a moment
timeout /t 3 /nobreak >nul

REM Start frontend
echo 🎨 Starting frontend server on port 3000...
cd frontend
start "Isbjorn Frontend" cmd /k "npm run dev"
cd ..

echo.
echo 🎉 Isbjorn Platform is starting!
echo.
echo 📱 Frontend: http://localhost:3000
echo 🔧 Backend API: http://localhost:5000
echo 📖 API Docs: http://localhost:5000/api-docs
echo.
echo 📋 Default admin login:
echo    Email: admin@isbjorn.co.nz
echo    Password: admin123
echo.
echo ⚠️ Close the terminal windows to stop the services
echo.
pause
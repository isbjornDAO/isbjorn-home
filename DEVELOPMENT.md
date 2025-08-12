# Development Quick Start

This guide helps you get the Isbjorn Platform running quickly for development.

## Quick Start (Recommended)

### Linux/macOS
```bash
./start-dev.sh
```

### Windows
```cmd
start-dev.bat
```

These scripts will:
- ✅ Check dependencies (Node.js, npm)
- ✅ Install required packages
- ✅ Set up the database
- ✅ Start both frontend and backend servers
- ✅ Show you all the important URLs

## Manual Setup

If you prefer to start services manually:

### 1. Install Dependencies
```bash
# Root dependencies
npm install

# Frontend dependencies
cd frontend && npm install && cd ..

# Backend dependencies  
cd backend && npm install && cd ..
```

### 2. Setup Database
```bash
cd backend
npm run setup
cd ..
```

### 3. Start Services

**Backend (Terminal 1):**
```bash
cd backend
PORT=5001 npm run dev
```

**Frontend (Terminal 2):**
```bash
cd frontend
npm run dev
```

## Access Points

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:3001 | Main web application |
| **Backend API** | http://localhost:5001 | REST API server |
| **API Documentation** | http://localhost:5001/api-docs | Swagger/OpenAPI docs |

## Default Credentials

**Admin Account:**
- Email: `admin@isbjorn.co.nz`
- Password: `admin123`

**Test Business Account:**
- Email: `business@example.co.nz`
- Password: `business123`

## Development Notes

### Environment Configuration
- Backend uses `.env` file with development defaults
- All API keys are set to mock/test values for development
- SQLite database for easy local development
- Redis is optional (graceful degradation if not available)

### Port Configuration
- Frontend: Port 3001 (configurable in `frontend/vite.config.ts`)
- Backend: Port 5001 (configurable with `PORT` environment variable)

### API Endpoints
Some API routes have doubled paths due to route mapping:
- ✅ `/api/charities/charities/verified-dropdown`
- ✅ `/api/companies/companies/{id}/auto-populate`
- ✅ `/api/donations/streamlined`

### Logs
When using startup scripts, logs are saved to:
- `logs/backend.log`
- `logs/frontend.log`

### Stopping Services
- **Startup scripts**: Press `Ctrl+C`
- **Manual**: `Ctrl+C` in each terminal window

## Troubleshooting

### Port Already in Use
```bash
# Find and kill process using port 3001
lsof -ti:3001 | xargs kill -9

# Find and kill process using port 5001
lsof -ti:5001 | xargs kill -9
```

### Database Issues
```bash
# Reset database
cd backend
rm database.sqlite
npm run setup
```

### Dependency Issues
```bash
# Clean install
rm -rf node_modules frontend/node_modules backend/node_modules
npm install
cd frontend && npm install && cd ..
cd backend && npm install && cd ..
```

## Features Available

✅ **Working Features:**
- Database setup and migrations
- User authentication and authorization
- Company verification (mock NZ Companies Register)
- Charity management (seeded data)
- Donation processing (mock Stripe)
- Receipt generation (mock IRD compliance)
- API documentation
- Frontend-backend communication

⚠️ **Mock/Development Mode:**
- Payment processing (Stripe test mode)
- Email service (SendGrid mock)
- NZ Companies Register API (mock data)
- IRD compliance (mock validation)
- Blockchain integration (disabled, contract addresses needed)
- Redis caching (optional)

🔧 **Production Ready:**
- Replace mock API keys with real ones in `.env`
- Configure PostgreSQL database
- Set up Redis server
- Deploy smart contracts
- Configure production domains
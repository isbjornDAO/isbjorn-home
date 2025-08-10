# 🐻‍❄️ Isbjorn Business Donation Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?logo=avalanche&logoColor=white)](https://www.avax.network/)

> **Complete Avalanche-powered nonprofit donation platform for polar bear conservation** 🌍

## 🌟 Overview

Isbjorn is a production-ready business donation platform that combines familiar nonprofit interfaces with cutting-edge blockchain transparency. Businesses can donate to polar bear conservation through traditional payment methods while benefiting from Avalanche blockchain verification and real-time impact tracking.

### Key Features

- **🏢 Business-First Design**: Zero crypto interaction for donors
- **💳 Stripe Integration**: Familiar payment processing with instant tax receipts  
- **🔗 Avalanche Blockchain**: Sub-$0.01 transaction costs with full transparency
- **📊 Real-time Impact**: Track donations from payment to conservation projects
- **🧾 NZ Tax Compliance**: Automated IRD-compliant receipt generation
- **🔐 Multi-sig Security**: Enterprise-grade fund management
- **📱 Mobile Responsive**: Arctic-themed UI with Iggy the polar bear mascot

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Frontend │    │  Node.js Backend │    │ Avalanche Blockchain│
│   (TypeScript)   │◄──►│   (Express)     │◄──►│   Smart Contracts  │
│                 │    │                 │    │                 │
│ • Donation UI    │    │ • Stripe API    │    │ • DonationTracker │
│ • Impact Dash    │    │ • PostgreSQL    │    │ • ProjectDistrib. │
│ • Admin Panel    │    │ • Redis Cache   │    │ • AdminMultiSig   │
│ • Tax Receipts   │    │ • SendGrid      │    │ • USDC.e Support  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose
- Avalanche wallet with testnet AVAX

### 1. Clone and Install

```bash
git clone https://github.com/your-org/isbjorn-platform.git
cd isbjorn-platform

# Install dependencies for all services
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../smart-contracts && npm install
```

### 2. Environment Setup

```bash
# Copy environment templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Configure your environment variables
# - Database credentials
# - Stripe keys (get from stripe.com)
# - SendGrid API key
# - Avalanche wallet private key
# - Contract addresses (after deployment)
```

### 3. Deploy Smart Contracts

```bash
cd smart-contracts

# Deploy to Avalanche Fuji testnet
npm run deploy:testnet

# Copy the contract addresses to your backend .env file
```

### 4. Start Development Environment

```bash
# Start all services with Docker
docker-compose up -d

# Or start individually:
npm run dev  # Starts both frontend and backend
```

The platform will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 💰 Business Donation Flow

### For Businesses (Zero Crypto Interaction)

1. **Visit Donation Portal** → Professional Isbjorn-branded interface
2. **Select Conservation Project** → Choose Arctic ice or polar bear initiatives  
3. **Enter Company Details** → Auto-populating tax information
4. **Pay with Credit Card** → Familiar Stripe checkout experience
5. **Receive Instant Receipt** → NZ IRD-compliant PDF via email
6. **Track Real-time Impact** → Dashboard shows conservation progress

### Behind the Scenes (Blockchain Magic)

1. **Payment Confirmed** → Stripe webhook triggers backend processing
2. **Blockchain Recording** → Transaction logged on Avalanche C-Chain
3. **Fund Distribution** → Smart contracts automatically allocate to projects
4. **Impact Updates** → Real-time metrics update across all dashboards
5. **Transparent Tracking** → Every dollar traceable from source to impact

## 🏢 Production Deployment

### Railway (Recommended)

```bash
# Connect your GitHub repo to Railway
# Add environment variables in Railway dashboard
# Deploy automatically on git push

railway login
railway link
railway up
```

### Manual Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with load balancing
docker-compose -f docker-compose.prod.yml up -d
```

### Required Environment Variables

```bash
# Database
DB_HOST=your-postgres-host
DB_PASSWORD=secure-password

# Payments  
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email
SENDGRID_API_KEY=SG.your-key...

# Blockchain
AVALANCHE_PRIVATE_KEY=0x...
DONATION_TRACKER_ADDRESS=0x...
PROJECT_DISTRIBUTION_ADDRESS=0x...
```

## 🔧 Smart Contracts

### DonationTracker.sol
- Records all donations immutably
- Links off-chain donation IDs to blockchain
- Emits events for real-time updates
- Gas optimized: ~0.0025 AVAX per donation

### ProjectDistribution.sol  
- Manages fund allocation to conservation projects
- Automated milestone-based distributions
- USDC.e integration for stable value
- Multi-signature controlled releases

### AdminMultiSig.sol
- 3-of-5 signature requirement for admin actions
- Time-locked critical operations  
- Comprehensive audit trail
- Emergency pause functionality

## 📊 API Documentation

### Authentication
```typescript
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
```

### Donations
```typescript
POST /api/donations          // Create payment intent
GET  /api/donations/:id      // Get donation details  
POST /api/donations/:id/confirm // Confirm payment
```

### Projects
```typescript
GET  /api/projects           // List all projects
GET  /api/projects/:id       // Project details
GET  /api/projects/:id/impact // Real-time impact data
```

### Blockchain
```typescript
GET  /api/blockchain/tx/:hash     // Transaction status
GET  /api/blockchain/verify/:id  // Verify donation
```

Full API documentation available at `/api-docs` in development.

## 🧪 Testing

```bash
# Run all tests
npm run test

# Backend unit tests
cd backend && npm run test

# Frontend component tests  
cd frontend && npm run test

# Smart contract tests
cd smart-contracts && npm run test

# Integration tests
npm run test:e2e
```

## 🔒 Security Features

- **Input Validation**: Zod schemas for all API endpoints
- **Rate Limiting**: IP-based request throttling
- **SQL Injection Prevention**: Sequelize ORM with parameterized queries
- **XSS Protection**: Content Security Policy headers
- **HTTPS Enforcement**: SSL/TLS in production
- **Secret Management**: Environment variable encryption
- **Audit Logging**: All financial transactions logged immutably

## 📈 Monitoring

- **Health Checks**: `/health` endpoint for all services
- **Error Tracking**: Sentry integration for real-time alerts
- **Performance Monitoring**: Custom metrics dashboard
- **Blockchain Monitoring**: Transaction confirmation tracking
- **Uptime Monitoring**: Automated service availability checks

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: [docs.isbjorn.co.nz](https://docs.isbjorn.co.nz)
- **Email Support**: support@isbjorn.co.nz
- **GitHub Issues**: [Create Issue](https://github.com/your-org/isbjorn-platform/issues)
- **Discord Community**: [Join Server](https://discord.gg/isbjorn)

## 🙏 Acknowledgments

- **Avalanche Foundation**: For blockchain infrastructure
- **The Giving Block**: Inspiration for crypto-nonprofit bridges
- **Polar Bears International**: Conservation expertise and guidance
- **Stripe**: Payment processing excellence
- **Open Source Community**: The amazing tools that make this possible

---

Built with ❄️ in New Zealand for Arctic conservation worldwide.

**Ready to process your first $10,000 donation in under 60 seconds.** 🚀
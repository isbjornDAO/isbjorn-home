# 🐻‍❄️ Isbjørn — Conservation Donations, Powered by Community

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Avalanche](https://img.shields.io/badge/Avalanche-E84142?logo=avalanche&logoColor=white)](https://www.avax.network/)

Isbjørn is a global donation platform where **your contributions become votes**. Donate to verified conservation charities, earn **Donation Coins**, stake them to vote on fund allocation, and earn **$IGGY** rewards for backing impactful organizations.

---

## 🎯 How It Works

```
Donate → Earn Donation Coins → Stake → Vote → Charities Get Funded → 
NGOs Report Impact → You Earn $IGGY Rewards → Repeat 🔥
```

### The Flywheel

| Step | What Happens |
|------|--------------|
| 1. **Donate** | Any amount, any currency (fiat or crypto) |
| 2. **Earn Coins** | $1 = 1 Donation Coin |
| 3. **Stake** | Activate coins to gain voting power |
| 4. **Vote** | Direct Conservation Funds to verified NGOs |
| 5. **Impact** | NGOs receive funds, report climate metrics |
| 6. **Rewards** | Voters earn $IGGY proportional to impact |

---

## 🪙 Donation Coins & $IGGY

### Donation Coins
- **1 coin = 1 vote** — Direct where Conservation Funds go
- **Stake to vote** — Activated coins can vote, inactive can transfer
- **Earn by donating** — Every $1 donated = 1 Donation Coin
- **ERC-1155 token** — Tradeable on secondary markets

### $IGGY Token
- **Reward token** — Earned by staking and voting
- **Governance** — Propose new charities, vote on parameters
- **Conservation Fund** — 25% of supply distributed over 4 years

### Epochs
- **Monthly cycles** — Votes tallied, funds distributed
- **24-hour lock** — No changes in final day before distribution
- **Loyalty bonus** — Up to 2x rewards for consistent voters

---

## 💰 Conservation Fund Distribution

| Recipient | Share | Purpose |
|-----------|-------|---------|
| **Verified Charities** | 70% | Direct conservation impact |
| **Voter Rewards** | 20% | $IGGY to active stakers |
| **Platform** | 10% | Operations & development |

**Anti-gaming**: Max 15% per charity per epoch.

---

## 👥 Who Can Participate

| Feature | Individuals | Businesses |
|---------|-------------|------------|
| Donate | ✅ | ✅ |
| Earn Donation Coins | ✅ | ✅ |
| Vote on fund allocation | ✅ | ✅ |
| Earn $IGGY rewards | ✅ | ✅ |
| Tax receipts | On request | Automatic |
| Corporate dashboard | — | ✅ |
| Minimum donation | $1 | $100 |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Frontend (React + Vite)                   │
│  • Wallet connection (Thirdweb)                              │
│  • Donation Coins UI (stake/vote/claim)                      │
│  • Live polar bear tracking map                              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────────┐
│                  Backend (Express + TypeScript)              │
│  • Donation processing (Stripe + X402 crypto)                │
│  • $IGGY reward calculations                                 │
│  • Epoch management                                          │
└────────────┬──────────────────────────────┬──────────────────┘
             │                              │
             ▼                              ▼
┌────────────────────────┐      ┌──────────────────────────────┐
│    Avalanche L1        │      │        Smart Contracts       │
│  (Iggy Chain)          │      │  • DonationCoin.sol          │
│  On-chain transparency │      │  • DonationTracker.sol       │
└────────────────────────┘      │  • ProjectDistribution.sol   │
                                └──────────────────────────────┘
```

---

## 🚀 Quick Start

```bash
# Clone and install
git clone https://github.com/isbjornDAO/isbjorn-home.git
cd isbjorn-home
npm install

# Start development
./run-platform.sh
```

- **Frontend**: http://localhost:3005
- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api-docs

---

## 📱 Key Features

### For Donors
- **Donor Tab** — Stake, vote, claim rewards
- **Impact Dashboard** — Track your conservation contribution
- **Live Map** — Real GPS tracking of polar bears
- **NFT Collectibles** — Epoch badges, top donor awards

### For Charities
- **Verified Status** — Eligible for Conservation Fund votes
- **Impact Reporting** — Submit climate metrics
- **Transparent Funding** — On-chain fund distribution

### For Everyone
- **Live Cams** — Wildlife camera streams
- **Voting** — Community-directed fund allocation
- **Shop** — Conservation merchandise (coming soon)

---

## 🔧 Configuration

```bash
# Required
JWT_SECRET=your_secret
DATABASE_URL=postgresql://...

# Payments
STRIPE_SECRET_KEY=sk_...
X402_API_KEY=x402_...

# Blockchain
AVALANCHE_RPC_URL=https://api.avax.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=0x...
DONATION_COIN_ADDRESS=0x...
```

---

## 📊 API Reference

### Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Donations
```http
POST /api/donations/streamlined
GET  /api/donations/history
```

### Donation Coins
```http
GET  /api/coins/balance
POST /api/coins/stake
POST /api/coins/unstake
POST /api/coins/vote
GET  /api/coins/rewards
POST /api/coins/claim
```

### Charities
```http
GET  /api/public/charities
GET  /api/charities/:id/impact
```

Full docs at `/api-docs` when running locally.

---

## 🔐 Security

- Rate limiting on all endpoints
- JWT authentication with refresh tokens
- Webhook signature verification (Stripe, X402)
- Parameterized queries (Sequelize ORM)
- HTTPS enforced in production

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open Pull Request

---

## 📝 License

MIT License — see [LICENSE](LICENSE)

---

## 🙏 Acknowledgments

- **Avalanche Foundation** — Blockchain infrastructure
- **Polar Bears International** — Conservation expertise
- **The Blaze Team** — Tokenomics inspiration
- **Open Source Community** — Amazing tools

---

**Built with ❄️ for conservation worldwide.**

**Donate. Stake. Vote. Earn. Protect.** 🐻‍❄️
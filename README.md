# 🐻‍❄️ Isbjorn — NZ Business Donations, Done Right

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Stripe](https://img.shields.io/badge/Stripe-635BFF?logo=stripe&logoColor=white)](https://stripe.com/)

Isbjorn makes it simple for NZ businesses to donate to verified charities and receive IRD‑compliant tax receipts instantly. The donor experience is “just pay with card,” while the platform handles IRD rules, company verification, receipts, and optional blockchain transparency.

### What’s included

- **Business‑first UX**: Zero crypto for donors; email + password signup.
- **Stripe**: Familiar card payments; instant confirmation and receipts (dev mode supported).
- **NZ readiness**: Company auto‑lookup (mock in dev) and IRD‑compliant PDF receipts.
- **Streamlined flow**: A 2‑minute donation path with minimal fields.
- **Mobile responsive**: Works great on phones.
- **Optional Avalanche L1**: Record donations on chain when configured.

### How it’s built (high level)

```
React (Vite)  →  Express API  →  Stripe, Email, DB
                        ↘︎  (optional) Avalanche L1
```

## 🚀 Quick start (local)

The fastest way to see it working end‑to‑end (with safe dev defaults):

```bash
./run-platform.sh
```

Then open:

- Frontend (Vite): http://localhost:3005 (port may vary)
- API: http://localhost:5000
- API Docs (dev): http://localhost:5000/api-docs

Notes
- Stripe runs in dev/simulated mode unless you add real keys.
- Company lookup uses mock data in dev (no external API key required).
- SQLite is used by default for local DB; Postgres/Redis are optional.

## 💰 Donation flow (2 minutes)

1. Select a charity
2. Enter NZ company number (auto‑populate in dev)
3. Enter amount and card details
4. Done — instant IRD‑compliant receipt via email

Behind the scenes (optional): when configured, donations can be recorded to Avalanche L1 for transparency.

## 🔑 Config

```bash
# Backend (dev defaults work out of the box)
JWT_SECRET=dev-secret
JWT_REFRESH_SECRET=dev-refresh
STRIPE_SECRET_KEY=sk_test_mock_key   # dev-only; set real key in prod
STRIPE_WEBHOOK_SECRET=whsec_mock     # set real webhook secret in prod
SENDGRID_API_KEY=                    # optional in dev

# Optional Avalanche
AVALANCHE_RPC_URL=https://api.avax-test.network/ext/bc/C/rpc
AVALANCHE_PRIVATE_KEY=0x...
DONATION_TRACKER_ADDRESS=0x...
PROJECT_DISTRIBUTION_ADDRESS=0x...
```

## 🔧 Smart contracts (optional)

- `DonationTracker.sol`: record donations on chain
- `ProjectDistribution.sol`: track distributions to projects
- `AdminMultiSig.sol`: operational safety controls

## 📊 API quick reference

Authentication
```http
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Streamlined donations
```http
GET  /api/companies/:companyNumber/auto-populate
GET  /api/charities/verified-dropdown
POST /api/donations/streamlined
```

Public
```http
GET  /api/public/charities
```

Full docs in dev at `/api-docs`.

## 🧪 Testing (coming online)

Project scaffolding includes scripts for unit and component tests. We’ll expand coverage as features solidify.

## 🔒 Security

- Input validation & rate limiting on API routes
- Parameterized queries via Sequelize
- Strict CSP with Stripe allowances
- HTTPS recommended for any public deployment

## 📈 Monitoring

- Health: `/health` on the API
- Logs: `backend.log`, `frontend.log` in repo root when using `run-platform.sh`

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

- Email: support@isbjorn.co.nz
- Issues: please open a GitHub issue in this repository

## 🙏 Acknowledgments

- **Avalanche Foundation**: For blockchain infrastructure
- **The Giving Block**: Inspiration for crypto-nonprofit bridges
- **Polar Bears International**: Conservation expertise and guidance
- **Stripe**: Payment processing excellence
- **Open Source Community**: The amazing tools that make this possible

---

Built with ❄️ in New Zealand for Arctic conservation worldwide.

**Make an NZ business donation in under 2 minutes.** 🚀
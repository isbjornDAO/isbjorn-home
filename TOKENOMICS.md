# 🪙 Isbjørn Tokenomics — Donation Coins & $IGGY

This document details the economic model powering Isbjørn's community-directed conservation funding.

---

## Overview

Isbjørn uses a dual-token system:

| Token | Type | Purpose |
|-------|------|---------|
| **Donation Coin** | ERC-1155 NFT | Voting power for fund allocation |
| **$IGGY** | ERC-20 | Rewards, governance, staking |

---

## 🎟️ Donation Coins

### What They Are
Donation Coins are participation tokens that give holders voting power over the **Conservation Fund**. Modeled after [Blaze's Backstage Pass](https://help.blaze.stream/en/collections/17295924-backstage-pass-spotlight-funds) system.

### How to Earn

| Action | Coins Earned |
|--------|--------------|
| Donate $1 (any currency) | 1 Donation Coin |
| Stake 100 $IGGY | 1 Donation Coin |
| Referral (10% of referee's first donation) | Variable |

### Core Mechanics

#### Minting
- **Base price**: $1 = 1 Donation Coin
- **Price increase**: +0.5% per epoch (compounding)
- **No hard cap**: Supply constrained by donation activity

#### Activation (Staking)

| State | Voting | Rewards | Transferable | Redeemable |
|-------|--------|---------|--------------|------------|
| **Inactive** | ❌ | ❌ | ✅ | ✅ |
| **Active (Staked)** | ✅ | ✅ | ❌ | ❌ |

#### Voting
- **1 coin = 1 vote** — Linear, non-splittable
- **Vote for charities** — Only verified NGOs eligible
- **Votes lock coins** — Cannot unstake until epoch ends
- **Can only increase** — No removing votes mid-epoch

#### Redemption
- **Redeem value**: 25% of donation returned (75% already went to charity)
- **Only inactive coins** — Must unstake first

---

## 🐻‍❄️ $IGGY Token

### Token Distribution

| Allocation | % | Tokens | Vesting |
|------------|---|--------|---------|
| **Conservation Fund** | 25% | 250M | 4 years linear |
| **Community Rewards** | 20% | 200M | Ongoing emissions |
| **Team** | 15% | 150M | 2-year cliff, 4-year vest |
| **Treasury** | 20% | 200M | DAO controlled |
| **Liquidity** | 10% | 100M | Launch |
| **Ecosystem Grants** | 10% | 100M | As needed |
| **Total** | 100% | 1B $IGGY | — |

### Utility

| Use Case | Description |
|----------|-------------|
| **Voter Rewards** | Earn $IGGY for staking and voting |
| **Staking** | Stake $IGGY to earn Donation Coins |
| **Governance** | Propose/vote on platform parameters |
| **Premium Features** | Access to advanced analytics (future) |

---

## 📅 Epochs

### Schedule
- **Duration**: 1 month (first Sunday to last Saturday)
- **Lock window**: Final 24 hours — no staking/voting changes
- **Distribution**: Within 48 hours after epoch end

### Timeline Example

```
Epoch 1: Jan 1 - Jan 31
├── Jan 1-30: Stake, vote, adjust
├── Jan 31: Lock window (no changes)
└── Feb 1-2: Funds distributed, rewards claimable
```

---

## 💰 Conservation Fund

### Sources

| Source | Contribution |
|--------|--------------|
| Platform fees | 5% of all donations |
| $IGGY emissions | 25% of supply over 4 years |
| Matching sponsors | Corporate matching programs |
| AMM swap fees | From $IGGY liquidity pools (future) |

### Distribution

```
Conservation Fund (100%)
├── 70% → Verified Charities (vote-weighted)
├── 20% → Voter Rewards ($IGGY)
└── 10% → Platform Operations
```

### Anti-Gaming Rules

| Rule | Value | Rationale |
|------|-------|-----------|
| Max per charity | 15% of epoch fund | Prevent single-charity dominance |
| Min votes to qualify | 100 Donation Coins | Filter spam entries |
| Charity self-voting | Prohibited | Prevent manipulation |

---

## 🎁 Voter Rewards

### $IGGY Emissions

Voters earn $IGGY proportional to:
```
Your Reward = (Your Coins Voted for Charity / Total Coins for Charity) 
              × Charity's Fund Share 
              × Impact Multiplier
              × Loyalty Multiplier
```

### Impact Multiplier
Charities with verified impact metrics earn bonus rewards for their voters:

| Impact Score | Multiplier |
|--------------|------------|
| Bronze (verified) | 1.0x |
| Silver (measured) | 1.25x |
| Gold (audited) | 1.5x |

### Loyalty Multiplier
Consistent voters earn bonus rewards:

| Consecutive Epochs | Multiplier |
|--------------------|------------|
| 1 | 1.0x |
| 3 | 1.2x |
| 6 | 1.5x |
| 12+ | 2.0x |

*Missing an epoch resets to 1.0x*

---

## 🖼️ NFT Rewards

| NFT | Criteria | Benefit |
|-----|----------|---------|
| **Epoch Badge** | Vote in an epoch | Collector proof |
| **Top 10 Donor** | Top 10 donations in epoch | Exclusive art + 1.1x bonus |
| **Charity Champion** | Backed charity hits milestone | Special edition + governance weight |
| **OG Supporter** | First 1000 stakers | Permanent 1.25x multiplier |

---

## 📊 Example Scenario

**Alice donates $500, stakes all coins, votes for Polar Bears International (PBI)**

1. Alice earns 500 Donation Coins
2. Stakes all 500 (now active)
3. Votes 500 coins for PBI
4. Epoch ends, PBI receives 12% of fund (under 15% cap ✅)
5. Alice is 1 of 1000 voters for PBI (owns 0.5% of PBI votes)
6. PBI has Gold impact score (1.5x)
7. Alice has voted 6 consecutive epochs (1.5x loyalty)

**Alice's reward**:
```
$IGGY Reward Pool for PBI = 12% of 20% voter allocation
Alice's share = 0.5% × 12% × 1.5 (impact) × 1.5 (loyalty)
```

---

## 🔮 Future Developments

- [ ] Secondary market for Donation Coin trading
- [ ] Quadratic voting option
- [ ] Cross-chain bridging for $IGGY
- [ ] DAO governance launch
- [ ] Charity impact oracle integration

---

## 📚 References

- [Blaze Backstage Pass Documentation](https://help.blaze.stream/en/collections/17295924-backstage-pass-spotlight-funds)
- [ERC-1155 Standard](https://eips.ethereum.org/EIPS/eip-1155)
- [Avalanche L1 Documentation](https://docs.avax.network/)

---

**Questions?** Open an issue or reach out at support@isbjorn.io

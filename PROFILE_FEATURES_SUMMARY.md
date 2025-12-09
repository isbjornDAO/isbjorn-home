# Isbjorn-Home: Telescope Profile Features Integration

## Summary

Successfully ported the profile and XP features from the Telescope platform to Isbjorn-Home, customized for the donation platform. The XP system is now fully integrated and visible across the platform, with level modules, collectables, and a rewards shop.

---

## ✅ What Was Implemented

### 1. **Backend - Database Models**

#### New Models Created:
- **`Collectable.model.ts`** - Defines collectables with rarity levels (common, rare, epic, legendary)
- **`UserCollectable.model.ts`** - Junction table tracking which users own which collectables
- **`Reward.model.ts`** - Defines rewards available in the shop (costs coins)
- **`UserReward.model.ts`** - Tracks which users have claimed which rewards

#### Enhanced Models:
- **`User.model.ts`** - Added fields:
  - `lastActive` - Activity tracking
  - `currentStreak` - General activity streak
  - `longestStreak` - Longest streak achieved

### 2. **Backend - Services**

#### New Services:
- **`collectableService.ts`** - Manages collectable operations:
  - Award collectables to users
  - Check ownership
  - Auto-award achievements based on activity
  - Get user's collectable collection

- **`rewardService.ts`** - Manages rewards shop:
  - List available rewards
  - Claim rewards (deduct coins)
  - Track claimed rewards
  - Admin functions for managing rewards

#### Existing Services:
- **`xpService.ts`** - Already existed with telescope formula (Level 1: 0-10 XP, Level 2+: +30 XP per level)

### 3. **Backend - API Routes**

#### New Routes:
- **`/api/collectables`**
  - `GET /` - Get all available collectables
  - `GET /user` - Get authenticated user's collectables
  - `GET /user/:userId` - Get specific user's collectables (public)
  - `GET /showcase` - Get featured collectables
  - `POST /check-achievements` - Check and award achievements
  - `POST /` - Create new collectable (admin only)

- **`/api/rewards`**
  - `GET /` - Get all available rewards
  - `GET /user` - Get authenticated user's claimed rewards
  - `POST /claim` - Claim a reward
  - `POST /` - Create new reward (admin only)
  - `PUT /:id` - Update reward (admin only)
  - `DELETE /:id` - Delete reward (admin only)

### 4. **Frontend - Components**

#### New Components:
- **`LevelProgressBar.tsx`** - Visual progress bar showing XP progress to next level
- **`XPCard.tsx`** - Card displaying level, XP, coins, and donation streaks
- **`CollectableGrid.tsx`** - Grid layout for displaying collectables (owned and locked)

### 5. **Frontend - Pages**

#### Enhanced Pages:
- **`ProfilePage.tsx`** - Now shows:
  - XP Card with level and coins
  - Donation activity stats (total donations, amount, charities supported)
  - Collectables grid

- **`DashboardPage.tsx`** - Now shows:
  - XP progress card at the top
  - User stats alongside donation stats

#### New Pages:
- **`ShopPage.tsx`** - Rewards shop where users can:
  - View available rewards sorted by cost
  - See their current coin balance
  - Claim rewards with coins
  - View already claimed rewards
  - See reward rarity (common, rare, epic, legendary)

### 6. **Frontend - Navigation**

- Added **Shop** link in navigation header (shopping bag icon)
- Added route `/shop` for the rewards page

### 7. **Seed Data Scripts**

Created scripts to populate initial data:
- **`seedCollectables.ts`** - Seeds donation-themed collectables:
  - **Milestones**: First Steps, Generous Spirit, Champion of Change
  - **Streaks**: Streak Champion (30 days)
  - **Levels**: Rising Star (Lv10), Philanthropist (Lv25), Legend of Giving (Lv50)
  - **Special**: Early Supporter
  - **Conservation**: Kiwi Protector, Kākāpō Guardian, Tuatara Friend
  - **Impact**: Community Hero

- **`seedRewards.ts`** - Seeds shop rewards:
  - Bronze/Silver/Gold Badges
  - Conservation Hero NFT (limited edition)
  - Profile Themes (Ocean, Forest)
  - Thank You Certificate

### 8. **NPM Scripts**

Added to `backend/package.json`:
```json
"seed:collectables": "tsx src/scripts/seedCollectables.ts",
"seed:rewards": "tsx src/scripts/seedRewards.ts",
"seed:all": "npm run seed:collectables && npm run seed:rewards"
```

---

## 🚀 How to Set Up

### 1. **Database Migration**

The new tables need to be created in your database:

```bash
cd backend
npm run migrate  # Or your database migration command
```

Or if using Sequelize sync:
```bash
# Start the backend - it will auto-sync models
npm run dev
```

### 2. **Seed Initial Data**

Populate collectables and rewards:

```bash
cd backend
npm run seed:collectables  # Seed collectables
npm run seed:rewards       # Seed rewards
# OR
npm run seed:all           # Seed both at once
```

### 3. **Start the Application**

```bash
# Backend
cd backend
npm run dev

# Frontend (in another terminal)
cd frontend
npm run dev
```

---

## 📊 XP System Overview

### XP Formula (From Telescope)
- **Level 1**: 0-10 XP
- **Level 2+**: +30 XP per level
- Example:
  - Level 2: 11-40 XP
  - Level 3: 41-70 XP
  - Level 10: 281-310 XP

### How Users Earn XP & Coins

#### Donations:
- **$1-$50**: 1 XP
- **$51-$200**: 2 XP
- **$201-$500**: 3 XP
- **$501+**: 5 XP
- **Coins**: 1 coin per $10 donated

#### Activities:
- Profile Complete: 10 XP
- First Donation: 25 XP
- Wallet Connected: 5 XP
- Share Donation: 2 XP
- Monthly Recurring Setup: 15 XP

### Achievement Auto-Awards

The system automatically checks and awards collectables based on:
- **Early Adopter**: Joined before Dec 1, 2024
- **Donation Master**: 50+ donations
- **Generous Donor**: 100+ donations
- **Streak Champion**: 30-day donation streak
- **Level Milestones**: Level 10, 25, 50

---

## 🎮 User Experience

### Profile Page (`/profile`)
Users can now see:
1. Their level, XP progress, and coin balance
2. Donation activity stats
3. Their collectable collection
4. Account settings (as before)

### Dashboard (`/dashboard`)
- XP progress card prominently displayed
- Quick stats on donations
- Level and streak information

### Shop Page (`/shop`)
- Browse available rewards
- See coin balance
- Claim rewards with earned coins
- View already claimed rewards
- Rewards show rarity (visual color coding)

---

## 🎨 Donation-Themed Collectables

All collectables are themed around:
- **New Zealand Conservation** (Kiwi, Kākāpō, Tuatara)
- **Donation Milestones** (50, 100 donations)
- **Community Impact** (supporting multiple charities)
- **Dedication** (streaks, early adoption)

---

## 🔧 Admin Functions

Admins can:
- Create new collectables via API
- Create, update, delete rewards
- View all user stats
- Manage reward availability

### Example: Create a New Collectable (Admin)
```bash
POST /api/collectables
Authorization: Bearer <admin-token>

{
  "collectableId": "mega_donor",
  "name": "Mega Donor",
  "description": "Donated over $10,000",
  "rarity": "legendary",
  "category": "achievement"
}
```

### Example: Create a New Reward (Admin)
```bash
POST /api/rewards
Authorization: Bearer <admin-token>

{
  "name": "Platinum Badge",
  "description": "Exclusive platinum supporter badge",
  "coinsRequired": 500,
  "totalAvailable": 50,
  "metadata": {
    "rarity": "legendary"
  }
}
```

---

## 📁 File Structure

### Backend
```
backend/src/
├── models/
│   ├── Collectable.model.ts          ✨ NEW
│   ├── UserCollectable.model.ts      ✨ NEW
│   ├── Reward.model.ts                ✨ NEW
│   ├── UserReward.model.ts            ✨ NEW
│   └── User.model.ts                  ✏️ ENHANCED
├── services/
│   ├── collectableService.ts          ✨ NEW
│   ├── rewardService.ts               ✨ NEW
│   └── xpService.ts                   ✅ EXISTING
├── routes/
│   ├── collectables.routes.ts         ✨ NEW
│   ├── rewards.routes.ts              ✨ NEW
│   └── index.ts                       ✏️ ENHANCED
├── scripts/
│   ├── seedCollectables.ts            ✨ NEW
│   └── seedRewards.ts                 ✨ NEW
└── config/
    └── database.ts                    ✏️ ENHANCED
```

### Frontend
```
frontend/src/
├── components/
│   ├── LevelProgressBar.tsx           ✨ NEW
│   ├── XPCard.tsx                     ✨ NEW
│   ├── CollectableGrid.tsx            ✨ NEW
│   └── Layout.tsx                     ✏️ ENHANCED
├── pages/
│   ├── ProfilePage.tsx                ✏️ ENHANCED
│   ├── DashboardPage.tsx              ✏️ ENHANCED
│   └── ShopPage.tsx                   ✨ NEW
├── utils/
│   └── xp.ts                          ✅ EXISTING
└── App.tsx                            ✏️ ENHANCED
```

---

## 🎯 Next Steps / Recommendations

1. **Test the system**:
   - Make a donation and verify XP is awarded
   - Check collectables auto-award
   - Claim a reward in the shop

2. **Customize collectables**:
   - Add more NZ-specific themes
   - Create seasonal collectables
   - Add charity-specific collectables

3. **Enhance the shop**:
   - Add more reward types
   - Create limited-time offers
   - Add NFT rewards (connect to blockchain)

4. **Consider adding**:
   - Leaderboards (top donors by XP)
   - Social sharing of achievements
   - Profile badges display
   - Weekly/monthly challenges

5. **Mobile optimization**:
   - Test responsive design on mobile
   - Consider native app features

---

## 🐛 Troubleshooting

### Database tables not created:
```bash
# Sync all models manually
cd backend
npm run dev  # Should auto-sync on startup
```

### Collectables not showing:
```bash
# Re-run seed script
npm run seed:collectables
```

### XP not being awarded:
- Check that `xpService.awardDonationXP()` is called after successful donations
- Verify user stats API endpoint: `GET /api/user/stats`

---

## 📝 API Documentation

### User Stats
```
GET /api/user/stats
Returns: {
  xp: number,
  level: number,
  coins: number,
  xpForNextLevel: number,
  progress: { currentProgress, totalNeeded, percentage },
  donationStreak: number,
  longestDonationStreak: number
}
```

### Collectables
```
GET /api/collectables
GET /api/collectables/user
GET /api/collectables/showcase
POST /api/collectables/check-achievements
```

### Rewards
```
GET /api/rewards
GET /api/rewards/user
POST /api/rewards/claim { rewardId: string }
```

---

## ✨ Summary

The Telescope profile features have been successfully ported and customized for Isbjorn-Home's donation platform. Users can now:

✅ Track their XP and level up through donations
✅ Collect donation-themed achievements
✅ Spend coins on exclusive rewards
✅ View their progress on profile and dashboard
✅ See conservation-themed collectables

The system encourages continued engagement and rewards users for their generosity!

---

**Built with ❤️ for the Isbjorn Home platform**

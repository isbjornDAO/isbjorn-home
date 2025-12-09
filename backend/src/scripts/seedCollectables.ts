import { Collectable, CollectableRarity } from '../models/Collectable.model';
import sequelize from '../config/database';

const collectables = [
  // Donation Milestones
  {
    collectableId: 'first_donation',
    name: 'First Steps',
    description: 'Made your first donation to a New Zealand charity',
    imageUrl: null,
    rarity: CollectableRarity.COMMON,
    category: 'milestone',
    metadata: {
      unlockCondition: 'Make your first donation',
      special: false,
    },
  },
  {
    collectableId: 'donation_master',
    name: 'Generous Spirit',
    description: 'Completed 50 donations',
    imageUrl: null,
    rarity: CollectableRarity.RARE,
    category: 'milestone',
    metadata: {
      unlockCondition: 'Complete 50 donations',
    },
  },
  {
    collectableId: 'generous_donor',
    name: 'Champion of Change',
    description: 'Completed 100 donations',
    imageUrl: null,
    rarity: CollectableRarity.EPIC,
    category: 'milestone',
    metadata: {
      unlockCondition: 'Complete 100 donations',
    },
  },

  // Streak Achievements
  {
    collectableId: 'streak_champion',
    name: 'Streak Champion',
    description: 'Maintained a 30-day donation streak',
    imageUrl: null,
    rarity: CollectableRarity.EPIC,
    category: 'achievement',
    metadata: {
      unlockCondition: 'Maintain 30-day donation streak',
      glowColor: 'orange',
    },
  },

  // Level Achievements
  {
    collectableId: 'level_10',
    name: 'Rising Star',
    description: 'Reached level 10',
    imageUrl: null,
    rarity: CollectableRarity.RARE,
    category: 'level',
    metadata: {
      unlockCondition: 'Reach level 10',
    },
  },
  {
    collectableId: 'level_25',
    name: 'Philanthropist',
    description: 'Reached level 25',
    imageUrl: null,
    rarity: CollectableRarity.EPIC,
    category: 'level',
    metadata: {
      unlockCondition: 'Reach level 25',
    },
  },
  {
    collectableId: 'level_50',
    name: 'Legend of Giving',
    description: 'Reached level 50',
    imageUrl: null,
    rarity: CollectableRarity.LEGENDARY,
    category: 'level',
    metadata: {
      unlockCondition: 'Reach level 50',
      special: true,
      glowColor: 'gold',
    },
  },

  // Special Achievements
  {
    collectableId: 'early_adopter',
    name: 'Early Supporter',
    description: 'Joined Isbjorn Home in its early days',
    imageUrl: null,
    rarity: CollectableRarity.EPIC,
    category: 'special',
    metadata: {
      unlockCondition: 'Join before December 2024',
      special: true,
    },
  },

  // New Zealand Native Animals (Conservation Theme)
  {
    collectableId: 'kiwi_protector',
    name: 'Kiwi Protector',
    description: 'Supported 5 conservation charities',
    imageUrl: null,
    rarity: CollectableRarity.RARE,
    category: 'conservation',
    metadata: {
      unlockCondition: 'Support 5 conservation charities',
      emoji: '🥝',
    },
  },
  {
    collectableId: 'kakapo_guardian',
    name: 'Kākāpō Guardian',
    description: 'Donated over $1000 to conservation efforts',
    imageUrl: null,
    rarity: CollectableRarity.LEGENDARY,
    category: 'conservation',
    metadata: {
      unlockCondition: 'Donate $1000+ to conservation',
      emoji: '🦜',
      special: true,
    },
  },
  {
    collectableId: 'tuatara_friend',
    name: 'Tuatara Friend',
    description: 'Supported wildlife preservation',
    imageUrl: null,
    rarity: CollectableRarity.RARE,
    category: 'conservation',
    metadata: {
      unlockCondition: 'Donate to wildlife preservation',
      emoji: '🦎',
    },
  },

  // Community Impact
  {
    collectableId: 'community_hero',
    name: 'Community Hero',
    description: 'Supported 10 different charities',
    imageUrl: null,
    rarity: CollectableRarity.EPIC,
    category: 'impact',
    metadata: {
      unlockCondition: 'Support 10 different charities',
    },
  },
];

async function seedCollectables() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync the Collectable model
    await Collectable.sync();
    console.log('Collectable model synced');

    // Check if collectables already exist
    const existingCount = await Collectable.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing collectables. Skipping seed.`);
      console.log('To reseed, delete existing collectables first.');
      process.exit(0);
    }

    // Create collectables
    console.log('Seeding collectables...');
    for (const collectable of collectables) {
      await Collectable.create(collectable);
      console.log(`✓ Created: ${collectable.name}`);
    }

    console.log(`\n✅ Successfully seeded ${collectables.length} collectables!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding collectables:', error);
    process.exit(1);
  }
}

// Run the seed function
seedCollectables();

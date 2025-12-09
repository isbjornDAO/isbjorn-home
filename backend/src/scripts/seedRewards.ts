import { Reward } from '../models/Reward.model';
import { sequelize } from '../config/database';

const rewards = [
  {
    name: 'Bronze Badge',
    description: 'A commemorative bronze supporter badge for your profile',
    imageUrl: null,
    coinsRequired: 50,
    totalAvailable: null, // Unlimited
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'badge',
      rarity: 'common',
    },
  },
  {
    name: 'Silver Badge',
    description: 'A premium silver supporter badge',
    imageUrl: null,
    coinsRequired: 150,
    totalAvailable: null,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'badge',
      rarity: 'rare',
    },
  },
  {
    name: 'Gold Badge',
    description: 'An exclusive gold supporter badge',
    imageUrl: null,
    coinsRequired: 300,
    totalAvailable: null,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'badge',
      rarity: 'epic',
    },
  },
  {
    name: 'Conservation Hero NFT',
    description: 'Limited edition NFT celebrating New Zealand conservation',
    imageUrl: null,
    coinsRequired: 500,
    totalAvailable: 100,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'nft',
      rarity: 'legendary',
      special: true,
    },
  },
  {
    name: 'Profile Theme: Ocean',
    description: 'Unlock the ocean-themed profile background',
    imageUrl: null,
    coinsRequired: 100,
    totalAvailable: null,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'theme',
      rarity: 'common',
    },
  },
  {
    name: 'Profile Theme: Forest',
    description: 'Unlock the forest-themed profile background',
    imageUrl: null,
    coinsRequired: 100,
    totalAvailable: null,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'theme',
      rarity: 'common',
    },
  },
  {
    name: 'Thank You Certificate',
    description: 'Download a personalized thank you certificate',
    imageUrl: null,
    coinsRequired: 25,
    totalAvailable: null,
    claimed: 0,
    nftCollectionUrl: null,
    tokenId: null,
    limitedTime: false,
    availableUntil: null,
    active: true,
    metadata: {
      category: 'certificate',
      rarity: 'common',
    },
  },
];

async function seedRewards() {
  try {
    await sequelize.authenticate();
    console.log('Database connected successfully');

    // Sync the Reward model
    await Reward.sync();
    console.log('Reward model synced');

    // Check if rewards already exist
    const existingCount = await Reward.count();
    if (existingCount > 0) {
      console.log(`Found ${existingCount} existing rewards. Skipping seed.`);
      console.log('To reseed, delete existing rewards first.');
      process.exit(0);
    }

    // Create rewards
    console.log('Seeding rewards...');
    for (const reward of rewards) {
      await Reward.create(reward);
      console.log(`✓ Created: ${reward.name} (${reward.coinsRequired} coins)`);
    }

    console.log(`\n✅ Successfully seeded ${rewards.length} rewards!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding rewards:', error);
    process.exit(1);
  }
}

// Run the seed function
seedRewards();

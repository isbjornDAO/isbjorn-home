/**
 * XP System Utilities
 * Based on Telescope's XP system
 * Level 1: 0-10 XP
 * Level 2+: +30 XP per level
 */

export function calculateLevel(xp: number): number {
  if (xp <= 10) return 1;

  const level = Math.floor((xp - 11) / 30) + 2;
  return level;
}

export function getXpForNextLevel(currentXp: number): number {
  const currentLevel = calculateLevel(currentXp);

  if (currentLevel === 1) {
    return 11; // Total XP needed for level 2 (11 XP total)
  }

  // Calculate XP needed to reach next level
  const xpForNextLevel = (currentLevel - 1) * 30 + 11; // XP needed for next level

  return xpForNextLevel - currentXp;
}

export function getXpProgress(currentXp: number): { currentProgress: number; totalNeeded: number; percentage: number } {
  const currentLevel = calculateLevel(currentXp);

  if (currentLevel === 1) {
    return {
      currentProgress: currentXp,
      totalNeeded: 11,
      percentage: (currentXp / 11) * 100
    };
  }

  const xpForCurrentLevel = (currentLevel - 2) * 30 + 11;
  const xpForNextLevel = (currentLevel - 1) * 30 + 11;
  const currentProgress = currentXp - xpForCurrentLevel;
  const totalNeeded = xpForNextLevel - xpForCurrentLevel;

  return {
    currentProgress,
    totalNeeded,
    percentage: (currentProgress / totalNeeded) * 100
  };
}

/**
 * Calculate XP reward based on donation amount
 * Scaling: $1-$50: 1 XP, $51-$200: 2 XP, $201-$500: 3 XP, $501+: 5 XP
 */
export function calculateDonationXP(amount: number): number {
  if (amount >= 501) return 5;
  if (amount >= 201) return 3;
  if (amount >= 51) return 2;
  return 1;
}

/**
 * Calculate coins reward based on donation amount
 * 1 coin per $10 donated
 */
export function calculateDonationCoins(amount: number): number {
  return Math.floor(amount / 10);
}

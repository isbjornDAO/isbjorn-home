import React from 'react';
import { TrophyIcon, StarIcon, FireIcon } from '@heroicons/react/24/solid';
import { LevelProgressBar } from './LevelProgressBar';
import { calculateLevel } from '../utils/xp';

interface XPCardProps {
  xp: number;
  coins: number;
  level?: number;
  donationStreak?: number;
  longestStreak?: number;
  className?: string;
}

export const XPCard: React.FC<XPCardProps> = ({
  xp,
  coins,
  level: providedLevel,
  donationStreak = 0,
  longestStreak = 0,
  className = '',
}) => {
  const level = providedLevel || calculateLevel(xp);

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <TrophyIcon className="w-6 h-6 text-yellow-500" />
          Your Progress
        </h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <StarIcon className="w-5 h-5 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {coins} coins
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Level {level}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {xp} Total XP
              </div>
            </div>
          </div>
          <LevelProgressBar xp={xp} level={level} />
        </div>

        {donationStreak > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <FireIcon className="w-5 h-5 text-orange-500" />
            <span className="text-gray-700 dark:text-gray-300">
              <span className="font-semibold">{donationStreak} day</span> donation streak
            </span>
            {longestStreak > donationStreak && (
              <span className="text-gray-500 dark:text-gray-400 text-xs">
                (Best: {longestStreak})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default XPCard;

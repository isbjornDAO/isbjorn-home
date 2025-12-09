import React from 'react';
import { getXpProgress } from '../utils/xp';

interface LevelProgressBarProps {
  xp: number;
  level: number;
  showDetails?: boolean;
  className?: string;
}

export const LevelProgressBar: React.FC<LevelProgressBarProps> = ({
  xp,
  level,
  showDetails = true,
  className = '',
}) => {
  const progress = getXpProgress(xp);
  const percentage = Math.min(100, Math.max(0, progress.percentage));

  return (
    <div className={`space-y-2 ${className}`}>
      {showDetails && (
        <div className="flex justify-between items-center text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">
            Level {level}
          </span>
          <span className="text-gray-500 dark:text-gray-400">
            {progress.currentProgress} / {progress.totalNeeded} XP
          </span>
        </div>
      )}

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        >
          <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        </div>
      </div>

      {showDetails && (
        <div className="text-xs text-gray-500 dark:text-gray-400 text-right">
          {Math.round(percentage)}% to next level
        </div>
      )}
    </div>
  );
};

export default LevelProgressBar;

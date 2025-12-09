import React from 'react';
import { LockClosedIcon } from '@heroicons/react/24/solid';

interface Collectable {
  id: string;
  collectableId: string;
  name: string;
  description?: string;
  imageUrl?: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category?: string;
  acquiredAt?: Date;
}

interface CollectableGridProps {
  collectables: Collectable[];
  allCollectables?: Collectable[];
  maxDisplay?: number;
  className?: string;
}

type RarityType = 'common' | 'rare' | 'epic' | 'legendary';

const rarityColors: Record<RarityType, string> = {
  common: 'border-gray-300 bg-gray-50',
  rare: 'border-blue-400 bg-blue-50',
  epic: 'border-purple-400 bg-purple-50',
  legendary: 'border-yellow-400 bg-yellow-50',
};

const rarityGlow: Record<RarityType, string> = {
  common: '',
  rare: 'shadow-blue-300/50',
  epic: 'shadow-purple-300/50',
  legendary: 'shadow-yellow-300/50 animate-pulse',
};

export const CollectableGrid: React.FC<CollectableGridProps> = ({
  collectables,
  allCollectables,
  maxDisplay = 12,
  className = '',
}) => {
  const ownedIds = new Set(collectables.map((c) => c.collectableId));

  // Combine owned and locked collectables
  const displayItems = allCollectables
    ? allCollectables.slice(0, maxDisplay).map((ac) => {
        const owned = collectables.find((c) => c.collectableId === ac.collectableId);
        return owned || { ...ac, locked: true };
      })
    : collectables.slice(0, maxDisplay);

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 ${className}`}>
      {displayItems.map((item: any, index) => {
        const isLocked = item.locked || false;
        const rarity = (item.rarity || 'common') as RarityType;

        return (
          <div
            key={item.id || index}
            className={`
              relative aspect-square rounded-lg border-2 p-2
              ${rarityColors[rarity]}
              ${!isLocked && rarityGlow[rarity]}
              ${isLocked ? 'opacity-50 grayscale' : 'shadow-lg'}
              transition-all duration-300 hover:scale-105
            `}
          >
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                <LockClosedIcon className="w-8 h-8 text-white" />
              </div>
            )}

            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-4xl">
                  {rarity === 'legendary' ? '👑' :
                   rarity === 'epic' ? '💎' :
                   rarity === 'rare' ? '⭐' : '🎖️'}
                </div>
              </div>
            )}

            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 rounded-b-lg">
              <div className="text-white text-xs font-medium text-center truncate">
                {item.name}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CollectableGrid;

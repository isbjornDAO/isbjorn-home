import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { StarIcon, LockClosedIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

interface Reward {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  coinsRequired: number;
  totalAvailable?: number;
  claimed: number;
  remaining?: number;
  soldOut: boolean;
  nftCollectionUrl?: string;
  tokenId?: string;
  limitedTime: boolean;
  availableUntil?: Date;
  metadata?: any;
}

const ShopPage: React.FC = () => {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [userRewards, setUserRewards] = useState<any[]>([]);
  const [userCoins, setUserCoins] = useState(0);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rewardsRes, userRewardsRes, statsRes] = await Promise.all([
        api.get('/rewards'),
        api.get('/rewards/user'),
        api.get('/user/stats'),
      ]);

      setRewards(rewardsRes.data);
      setUserRewards(userRewardsRes.data);
      setUserCoins(statsRes.data.coins || 0);
    } catch (error) {
      console.error('Failed to load shop data:', error);
      toast.error('Failed to load rewards');
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (rewardId: string) => {
    if (!user) {
      toast.error('Please sign in to claim rewards');
      return;
    }

    setClaiming(rewardId);
    try {
      const response = await api.post('/rewards/claim', { rewardId });

      if (response.data.success) {
        toast.success(`Reward claimed! You have ${response.data.remainingCoins} coins left.`);
        await loadData(); // Reload data
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Failed to claim reward';
      toast.error(errorMessage);
    } finally {
      setClaiming(null);
    }
  };

  const hasClaimedReward = (rewardId: string) => {
    return userRewards.some((r) => r.rewardId === rewardId);
  };

  const canAfford = (coinsRequired: number) => {
    return userCoins >= coinsRequired;
  };

  const getRarityColor = (rarity?: string) => {
    switch (rarity) {
      case 'legendary':
        return 'from-yellow-400 to-orange-500';
      case 'epic':
        return 'from-purple-400 to-pink-500';
      case 'rare':
        return 'from-blue-400 to-cyan-500';
      default:
        return 'from-gray-400 to-gray-500';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to access the shop.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ice-900">Rewards Shop</h1>
          <p className="text-ice-600 mt-2">Spend your coins on exclusive rewards</p>
        </div>

        {/* User Coins Display */}
        <div className="card p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-ice-900">Your Coins</h3>
              <p className="text-sm text-ice-600">Earn coins by making donations</p>
            </div>
            <div className="flex items-center gap-2">
              <StarIcon className="w-8 h-8 text-yellow-500" />
              <span className="text-3xl font-bold text-ice-900">{userCoins}</span>
            </div>
          </div>
        </div>

        {/* Rewards Grid */}
        {loading ? (
          <div className="card p-6">
            <p className="text-ice-600">Loading rewards...</p>
          </div>
        ) : rewards.length === 0 ? (
          <div className="card p-6 text-center">
            <p className="text-ice-600">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const claimed = hasClaimedReward(reward.id);
              const affordable = canAfford(reward.coinsRequired);
              const soldOut = reward.soldOut;
              const rarity = reward.metadata?.rarity || 'common';

              return (
                <div
                  key={reward.id}
                  className={`card p-6 relative overflow-hidden ${
                    claimed ? 'border-2 border-green-500' : ''
                  }`}
                >
                  {/* Claimed Badge */}
                  {claimed && (
                    <div className="absolute top-4 right-4">
                      <CheckCircleIcon className="w-8 h-8 text-green-500" />
                    </div>
                  )}

                  {/* Rarity Gradient */}
                  <div
                    className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${getRarityColor(
                      rarity
                    )}`}
                  />

                  {/* Reward Image */}
                  {reward.imageUrl ? (
                    <img
                      src={reward.imageUrl}
                      alt={reward.name}
                      className="w-full h-48 object-cover rounded-lg mb-4"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-ice-100 to-ice-200 rounded-lg mb-4 flex items-center justify-center">
                      <div className="text-6xl">
                        {rarity === 'legendary'
                          ? '👑'
                          : rarity === 'epic'
                          ? '💎'
                          : rarity === 'rare'
                          ? '⭐'
                          : '🎁'}
                      </div>
                    </div>
                  )}

                  {/* Reward Info */}
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-ice-900">{reward.name}</h3>
                    {reward.description && (
                      <p className="text-sm text-ice-600">{reward.description}</p>
                    )}

                    {/* Availability */}
                    {reward.totalAvailable && (
                      <div className="text-sm text-ice-600">
                        {reward.remaining} / {reward.totalAvailable} available
                      </div>
                    )}

                    {/* Price */}
                    <div className="flex items-center gap-2 pt-2">
                      <StarIcon className="w-5 h-5 text-yellow-500" />
                      <span className="text-lg font-bold text-ice-900">
                        {reward.coinsRequired} coins
                      </span>
                    </div>

                    {/* Claim Button */}
                    <button
                      onClick={() => handleClaim(reward.id)}
                      disabled={claimed || !affordable || soldOut || claiming === reward.id}
                      className={`w-full mt-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                        claimed
                          ? 'bg-green-100 text-green-700 cursor-not-allowed'
                          : soldOut
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : !affordable
                          ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                          : 'bg-arctic-500 text-white hover:bg-arctic-600'
                      }`}
                    >
                      {claiming === reward.id ? (
                        'Claiming...'
                      ) : claimed ? (
                        <span className="flex items-center justify-center gap-2">
                          <CheckCircleIcon className="w-5 h-5" />
                          Claimed
                        </span>
                      ) : soldOut ? (
                        'Sold Out'
                      ) : !affordable ? (
                        <span className="flex items-center justify-center gap-2">
                          <LockClosedIcon className="w-5 h-5" />
                          Not Enough Coins
                        </span>
                      ) : (
                        'Claim Reward'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* My Rewards Section */}
        {userRewards.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-ice-900 mb-6">My Claimed Rewards</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userRewards.map((reward) => (
                <div key={reward.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-ice-900">{reward.name}</h4>
                      <p className="text-xs text-ice-600">
                        Claimed {new Date(reward.claimedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShopPage;

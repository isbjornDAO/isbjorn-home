import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { apiService } from '@/services/api';
import { WalletConnect } from '@/components/WalletConnect';
import { XPCard } from '@/components/XPCard';

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  charitiesSupported: number;
  lastDonationDate?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [userStats, setUserStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, userStatsData] = await Promise.all([
          apiService.get<DashboardStats>('/dashboard/stats'),
          apiService.get('/user/stats')
        ]);
        setStats(statsData);
        setUserStats(userStatsData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ice-900">Welcome back, {user.companyName}</h1>
          <p className="text-ice-600 mt-2">Here's your donation activity</p>
        </div>

        {loading ? (
          <div className="card p-6">
            <p className="text-ice-600">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* XP Progress Card */}
            {userStats && (
              <XPCard
                xp={userStats.xp || 0}
                coins={userStats.coins || 0}
                level={userStats.level || 1}
                donationStreak={userStats.donationStreak || 0}
                longestStreak={user.longestDonationStreak || 0}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.totalDonations || 0}</div>
                <div className="text-ice-600 text-sm">Total Donations</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">${stats?.totalAmount || 0}</div>
                <div className="text-ice-600 text-sm">Total Amount</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.charitiesSupported || 0}</div>
                <div className="text-ice-600 text-sm">Charities Supported</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">
                  {stats?.lastDonationDate ? new Date(stats.lastDonationDate).toLocaleDateString() : 'None'}
                </div>
                <div className="text-ice-600 text-sm">Last Donation</div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6">
                <h3 className="text-xl font-bold text-ice-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <a
                    href="/donate"
                    className="btn-primary inline-block text-center px-6 py-3"
                  >
                    Make a Donation
                  </a>
                  <div className="text-ice-600 text-sm mt-2">
                    Ready to support more charities? Start a new donation.
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-xl font-bold text-ice-900 mb-4">Wallet Management</h3>
                <p className="text-ice-600 text-sm mb-4">Connect your Core Wallet to manage your crypto donations.</p>
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
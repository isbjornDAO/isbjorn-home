import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/utils/apiUrl';
import { WalletConnect } from '@/components/WalletConnect';

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  charitiesSupported: number;
  lastDonationDate?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user?.companyName || '');

  useEffect(() => {
    if (user?.companyName) {
      setNewName(user.companyName);
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/stats`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
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

  const handleUpdateName = async () => {
    if (!newName.trim()) return;

    try {
      const response = await fetch(`${API_URL}/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ companyName: newName })
      });

      if (response.ok) {
        // Refresh the page to get updated user data
        window.location.reload();
      } else {
        alert('Failed to update name');
      }
    } catch (error) {
      console.error('Error updating name:', error);
      alert('Error updating name');
    }
  };

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

            {/* Profile Section */}
            <div className="card p-6">
              <h3 className="text-xl font-bold text-ice-900 mb-4">Profile</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ice-700 mb-2">
                    {user.walletAddress ? 'Display Name' : 'Company Name'}
                  </label>
                  {isEditingName ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                        placeholder="Enter your name"
                      />
                      <button
                        onClick={handleUpdateName}
                        className="px-4 py-2 bg-arctic-500 text-white rounded-lg hover:bg-arctic-600 transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingName(false);
                          setNewName(user.companyName || '');
                        }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <span className="text-ice-900 font-medium">{user.companyName}</span>
                      <button
                        onClick={() => setIsEditingName(true)}
                        className="text-sm text-arctic-600 hover:text-arctic-700 font-semibold"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>
                {user.email && (
                  <div>
                    <label className="block text-sm font-medium text-ice-700 mb-2">Email</label>
                    <p className="text-ice-900">{user.email}</p>
                  </div>
                )}
                {user.walletAddress && (
                  <div>
                    <label className="block text-sm font-medium text-ice-700 mb-2">Wallet Address</label>
                    <p className="text-ice-900 font-mono text-sm break-all">{user.walletAddress}</p>
                  </div>
                )}
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
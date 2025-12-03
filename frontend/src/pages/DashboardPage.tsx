import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '@/utils/apiUrl';
import { Cog6ToothIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

interface DashboardStats {
  totalDonations: number;
  totalAmount: number;
  charitiesSupported: number;
  lastDonationDate?: string;
}

interface IntegrationStatus {
  connected: boolean;
  integrations: {
    xero: boolean;
    myob: boolean;
  };
}

interface WalletBalance {
  usdc: number;
  avax: number;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
  const [wallet, setWallet] = useState<WalletBalance>({ usdc: 0, avax: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, integrationsRes] = await Promise.all([
          fetch(`${API_URL}/dashboard/stats`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          }),
          fetch(`${API_URL}/integrations/status`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
          }).catch(() => null)
        ]);

        if (statsRes.ok) {
          const data = await statsRes.json();
          setStats(data);
        }

        if (integrationsRes?.ok) {
          const data = await integrationsRes.json();
          setIntegrations(data.data);
        }

        // Mock wallet balance - replace with actual API call
        setWallet({ usdc: 0, avax: 0 });
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.totalDonations || 0}</div>
                <div className="text-ice-600 text-sm">Total Donations</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">${stats?.totalAmount?.toLocaleString() || 0}</div>
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

            {/* Second Row: Quick Actions, Wallet, Integrations */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-ice-900 mb-4">Quick Actions</h3>
                <div className="space-y-4">
                  <Link
                    to="/donate"
                    className="btn-primary inline-block text-center px-6 py-3 w-full"
                  >
                    Make a Donation
                  </Link>
                  <div className="text-ice-600 text-sm mt-2">
                    Ready to support more charities? Start a new donation.
                  </div>
                </div>
              </div>

              {/* Wallet Balance */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-ice-900 mb-4">Wallet Balance</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-ice-600 text-sm">USDC</span>
                    <span className="text-lg font-bold text-ice-900">${wallet.usdc.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-ice-600 text-sm">AVAX</span>
                    <span className="text-lg font-bold text-ice-900">{wallet.avax.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Integrations */}
              <div className="card p-6">
                <h3 className="text-xl font-bold text-ice-900 mb-4 flex items-center gap-2">
                  <Cog6ToothIcon className="w-5 h-5" />
                  Integrations
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ice-700">Xero</span>
                    </div>
                    {integrations?.integrations.xero ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ice-700">MYOB</span>
                    </div>
                    {integrations?.integrations.myob ? (
                      <CheckCircleIcon className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-5 h-5 text-gray-300" />
                    )}
                  </div>
                  {!integrations?.integrations.xero && !integrations?.integrations.myob && (
                    <p className="text-xs text-ice-500 mt-2">
                      Connect accounting software to sync receipts
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

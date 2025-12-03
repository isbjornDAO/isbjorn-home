import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { API_URL } from '@/utils/apiUrl';
import { WalletConnect } from '@/components/WalletConnect';
import {
  HeartIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  CalendarIcon,
  ArrowTrendingUpIcon,
  Cog6ToothIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  SparklesIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';

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
  autoSync: boolean;
  lastSyncDate?: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationStatus | null>(null);
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
      <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🐻‍❄️</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 font-display flex items-center gap-3">
                <span className="text-3xl">🐻‍❄️</span>
                Welcome back, {user.companyName}
              </h1>
              <p className="text-lg text-ice-600 mt-2">Making a difference, one donation at a time</p>
            </div>
            <Link
              to="/donate"
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <HeartIcon className="w-5 h-5" />
              Donate Now
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-600 mx-auto mb-4"></div>
            <p className="text-ice-600">Loading your dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Grid - Premium Design */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Total Donations */}
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <HeartIcon className="w-10 h-10 opacity-80" />
                  <SparklesIcon className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-4xl font-bold mb-1">{stats?.totalDonations || 0}</div>
                <div className="text-purple-100 text-sm font-medium">Total Donations</div>
              </div>

              {/* Total Amount */}
              <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <CurrencyDollarIcon className="w-10 h-10 opacity-80" />
                  <ArrowTrendingUpIcon className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-4xl font-bold mb-1">${stats?.totalAmount?.toLocaleString() || 0}</div>
                <div className="text-green-100 text-sm font-medium">Total Impact</div>
              </div>

              {/* Charities Supported */}
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <ChartBarIcon className="w-10 h-10 opacity-80" />
                  <BoltIcon className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-4xl font-bold mb-1">{stats?.charitiesSupported || 0}</div>
                <div className="text-blue-100 text-sm font-medium">Charities Supported</div>
              </div>

              {/* Last Donation */}
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl shadow-lg p-6 text-white transform hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <CalendarIcon className="w-10 h-10 opacity-80" />
                  <CheckCircleIcon className="w-6 h-6 opacity-60" />
                </div>
                <div className="text-2xl font-bold mb-1">
                  {stats?.lastDonationDate ? new Date(stats.lastDonationDate).toLocaleDateString() : 'No donations yet'}
                </div>
                <div className="text-orange-100 text-sm font-medium">Last Donation</div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Quick Actions - Takes 2 columns */}
              <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <BoltIcon className="w-6 h-6 text-arctic-600" />
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link
                    to="/donate"
                    className="group bg-gradient-to-r from-arctic-500 to-arctic-600 rounded-xl p-6 text-white hover:shadow-xl transition-all hover:scale-105"
                  >
                    <HeartIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-bold mb-1">Make a Donation</h4>
                    <p className="text-sm text-arctic-100">Support charities you care about</p>
                  </Link>

                  <Link
                    to="/compliance"
                    className="group bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white hover:shadow-xl transition-all hover:scale-105"
                  >
                    <CheckCircleIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-bold mb-1">View Receipts</h4>
                    <p className="text-sm text-blue-100">IRD-compliant tax receipts</p>
                  </Link>

                  <Link
                    to="/system-status"
                    className="group bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white hover:shadow-xl transition-all hover:scale-105"
                  >
                    <SparklesIcon className="w-8 h-8 mb-3 group-hover:scale-110 transition-transform" />
                    <h4 className="text-lg font-bold mb-1">System Status</h4>
                    <p className="text-sm text-purple-100">Check platform health</p>
                  </Link>

                  <div className="group bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white hover:shadow-xl transition-all">
                    <ArrowTrendingUpIcon className="w-8 h-8 mb-3" />
                    <h4 className="text-lg font-bold mb-1">Impact Report</h4>
                    <p className="text-sm text-green-100">Coming soon</p>
                  </div>
                </div>
              </div>

              {/* Wallet Management - Takes 1 column */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <CurrencyDollarIcon className="w-6 h-6 text-arctic-600" />
                  Wallet
                </h3>
                <p className="text-sm text-ice-600 mb-4">
                  Connect your Core Wallet for instant crypto payments via X402
                </p>
                <WalletConnect />
                <div className="mt-4 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-xs text-blue-700">
                    💡 X402 handles bridging to Iggy L1 automatically - no manual bridging needed!
                  </p>
                </div>
              </div>
            </div>

            {/* Accounting Integrations */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Cog6ToothIcon className="w-6 h-6 text-arctic-600" />
                Accounting Integrations
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Xero Integration */}
                <div className="border-2 border-ice-200 rounded-xl p-6 hover:border-arctic-300 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📊</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">Xero</h4>
                        <p className="text-sm text-ice-600">Accounting software</p>
                      </div>
                    </div>
                    {integrations?.integrations.xero ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {integrations?.integrations.xero ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ice-600">Status</span>
                        <span className="text-green-600 font-semibold">Connected</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ice-600">Auto-sync</span>
                        <span className="text-gray-800 font-semibold">{integrations.autoSync ? 'On' : 'Off'}</span>
                      </div>
                      {integrations.lastSyncDate && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-ice-600">Last sync</span>
                          <span className="text-gray-800 font-semibold">
                            {new Date(integrations.lastSyncDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <button className="w-full mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4" />
                        Sync Now
                      </button>
                    </div>
                  ) : (
                    <button className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                      Connect Xero
                    </button>
                  )}
                </div>

                {/* MYOB Integration */}
                <div className="border-2 border-ice-200 rounded-xl p-6 hover:border-arctic-300 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-2xl">📈</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-800">MYOB</h4>
                        <p className="text-sm text-ice-600">Accounting software</p>
                      </div>
                    </div>
                    {integrations?.integrations.myob ? (
                      <CheckCircleIcon className="w-6 h-6 text-green-500" />
                    ) : (
                      <XCircleIcon className="w-6 h-6 text-gray-300" />
                    )}
                  </div>

                  {integrations?.integrations.myob ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ice-600">Status</span>
                        <span className="text-green-600 font-semibold">Connected</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-ice-600">Auto-sync</span>
                        <span className="text-gray-800 font-semibold">{integrations.autoSync ? 'On' : 'Off'}</span>
                      </div>
                      <button className="w-full mt-3 px-4 py-2 bg-green-50 text-green-600 rounded-lg font-semibold hover:bg-green-100 transition-colors flex items-center justify-center gap-2">
                        <ArrowPathIcon className="w-4 h-4" />
                        Sync Now
                      </button>
                    </div>
                  ) : (
                    <button className="w-full mt-3 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors">
                      Connect MYOB
                    </button>
                  )}
                </div>
              </div>

              <div className="mt-6 p-4 bg-ice-50 rounded-xl border border-ice-100">
                <p className="text-sm text-ice-700">
                  <strong>💡 Pro tip:</strong> Connect your accounting software to automatically sync donation receipts and streamline tax compliance.
                </p>
              </div>
            </div>

            {/* Mobile Donate Button */}
            <Link
              to="/donate"
              className="md:hidden flex items-center justify-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-6 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <HeartIcon className="w-5 h-5" />
              Donate Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

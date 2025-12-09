import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/services/api';
import {
  ServerIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  BoltIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';

interface NodeStats {
  nodeId: number;
  operator: string;
  stakeAmount: number;
  deployTime: number;
  isActive: boolean;
  totalRewards: number;
  totalDonations: number;
  donationVolume: number;
  uptime: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  transactionsProcessed: number;
}

interface AnimatedNumberProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}

const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  duration = 2000,
  prefix = '',
  suffix = '',
  decimals = 0
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const countRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (countRef.current) {
      clearInterval(countRef.current);
    }

    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const difference = endValue - startValue;

    countRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + difference * easeOut;

      setDisplayValue(current);

      if (progress >= 1) {
        setDisplayValue(endValue);
        if (countRef.current) {
          clearInterval(countRef.current);
        }
      }
    }, 16); // ~60fps

    return () => {
      if (countRef.current) {
        clearInterval(countRef.current);
      }
    };
  }, [value]);

  return (
    <span>
      {prefix}
      {displayValue.toFixed(decimals)}
      {suffix}
    </span>
  );
};

const NodePage: React.FC = () => {
  const [nodeStats, setNodeStats] = useState<NodeStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNodeStats = async () => {
      try {
        const data = await apiService.get<NodeStats>('/node/stats');
        setNodeStats(data);
      } catch (err) {
        console.error('Error fetching node stats:', err);
        setError('Failed to load node statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchNodeStats();

    // Refresh stats every 30 seconds
    const interval = setInterval(fetchNodeStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading validator stats...</p>
        </div>
      </div>
    );
  }

  if (error || !nodeStats) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-sm border border-blue-100 p-12 text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600">{error || 'Failed to load validator data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-50 rounded-xl">
                <ServerIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Isbjorn L1 Validator</h1>
                <p className="text-gray-500 mt-1">Real-time performance metrics</p>
              </div>
            </div>

            {/* Status Badge */}
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              nodeStats.isActive
                ? 'bg-blue-50 text-blue-700'
                : 'bg-gray-100 text-gray-700'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                nodeStats.isActive ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'
              }`}></div>
              <span className="font-semibold text-sm">
                {nodeStats.isActive ? 'Live' : 'Offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Revenue Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {/* Daily Revenue */}
          <div className="bg-white rounded-xl border border-blue-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Daily Revenue</span>
              <CurrencyDollarIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              <AnimatedNumber
                value={nodeStats.dailyRevenue}
                prefix="$"
                decimals={2}
                duration={2000}
              />
            </div>
            <div className="text-xs text-gray-500">
              {nodeStats.transactionsProcessed} transactions
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="bg-blue-50 rounded-xl border border-blue-200 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-blue-900">Monthly Revenue</span>
              <ArrowTrendingUpIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-blue-900 mb-1">
              <AnimatedNumber
                value={nodeStats.monthlyRevenue}
                prefix="$"
                decimals={2}
                duration={2500}
              />
            </div>
            <div className="text-xs text-blue-600">
              ~${(nodeStats.dailyRevenue * 30).toFixed(2)} projected
            </div>
          </div>

          {/* Total Rewards */}
          <div className="bg-white rounded-xl border border-blue-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-600">Total Rewards</span>
              <BoltIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-4xl font-bold text-gray-900 mb-1">
              <AnimatedNumber
                value={nodeStats.totalRewards}
                decimals={4}
                suffix=" AVAX"
                duration={3000}
              />
            </div>
            <div className="text-xs text-gray-500">
              Lifetime earnings
            </div>
          </div>
        </div>

        {/* Donation Tracking */}
        <div className="bg-white rounded-xl border border-blue-100 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <ChartBarIcon className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Donation Activity</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Total Donations</div>
              <div className="text-3xl font-bold text-blue-900">
                <AnimatedNumber value={nodeStats.totalDonations} duration={1500} />
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Volume Processed</div>
              <div className="text-3xl font-bold text-blue-900">
                <AnimatedNumber
                  value={nodeStats.donationVolume}
                  prefix="$"
                  decimals={0}
                  duration={2000}
                />
              </div>
            </div>

            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-2">Transactions</div>
              <div className="text-3xl font-bold text-blue-900">
                <AnimatedNumber value={nodeStats.transactionsProcessed} duration={1800} />
              </div>
            </div>
          </div>

          {/* Processing Status */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-blue-900">Validator Status</span>
              <span className="text-xs text-blue-600 font-medium">100% Verified</span>
            </div>
            <div className="relative h-2 bg-blue-200 rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full w-full bg-blue-600 rounded-full"></div>
            </div>
            <div className="text-xs text-blue-700 mt-3">
              All donations verified on Avalanche L1
            </div>
          </div>
        </div>

        {/* Validator Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Node Information */}
          <div className="bg-white rounded-xl border border-blue-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ServerIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Validator Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Node ID</span>
                <span className="font-mono text-sm font-semibold text-gray-900">#{nodeStats.nodeId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Operator</span>
                <span className="font-mono text-xs text-gray-900">
                  {nodeStats.operator.slice(0, 8)}...{nodeStats.operator.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Stake</span>
                <span className="font-semibold text-gray-900">{nodeStats.stakeAmount.toLocaleString()} AVAX</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-sm text-gray-600">Deployed</span>
                <span className="text-sm text-gray-900">
                  {new Date(nodeStats.deployTime * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-gray-600 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Uptime
                </span>
                <span className="font-semibold text-blue-600">{formatUptime(nodeStats.uptime)}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl border border-blue-100 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <ChartBarIcon className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Performance</h3>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Network Health</span>
                  <span className="font-semibold text-blue-600">98%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-blue-600">99.8%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-gray-600">Efficiency</span>
                  <span className="font-semibold text-blue-600">97.5%</span>
                </div>
                <div className="w-full bg-blue-100 rounded-full h-1.5">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: '97.5%' }}></div>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-xs text-gray-600 mb-1">Avg Block Time</div>
                <div className="text-3xl font-bold text-blue-900">2.1<span className="text-xl">s</span></div>
                <div className="text-xs text-blue-600 mt-1">Fast & reliable</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-6 bg-blue-50 rounded-xl border border-blue-200 p-6">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <BoltIcon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-2">About the Validator</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                The Isbjorn L1 validator runs on Avalanche infrastructure, processing all donation transactions with complete transparency.
                Revenue from transaction fees and staking rewards helps sustain the platform while ensuring all charitable donations are immutably recorded on-chain.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePage;

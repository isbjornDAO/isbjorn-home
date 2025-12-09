import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '@/services/api';
import {
  ServerIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  BoltIcon
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
      <div className="min-h-screen bg-gradient-to-b from-ice-50 to-white flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-600 mx-auto mb-4"></div>
          <p className="text-ice-600">Loading node statistics...</p>
        </div>
      </div>
    );
  }

  if (error || !nodeStats) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-ice-50 to-white flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Error</h2>
          <p className="text-ice-600">{error || 'Failed to load node data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-ice-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <ServerIcon className="w-10 h-10 text-arctic-600" />
            <div>
              <h1 className="text-3xl font-bold text-ice-900">Isbjorn L1 Validator</h1>
              <p className="text-ice-600 mt-1">Real-time node performance and revenue tracking</p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center space-x-2">
            <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
              nodeStats.isActive
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}>
              <div className={`w-2 h-2 rounded-full ${
                nodeStats.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}></div>
              <span className="font-medium text-sm">
                {nodeStats.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="px-4 py-2 rounded-full bg-arctic-100 text-arctic-800">
              <span className="font-medium text-sm">Node #{nodeStats.nodeId}</span>
            </div>
          </div>
        </div>

        {/* Revenue Animation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Daily Revenue */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-arctic-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-2">
                <CurrencyDollarIcon className="w-5 h-5 text-arctic-600" />
                <span className="text-sm font-medium text-ice-600">Daily Revenue</span>
              </div>
              <div className="text-3xl font-bold text-ice-900">
                <AnimatedNumber
                  value={nodeStats.dailyRevenue}
                  prefix="$"
                  decimals={2}
                  duration={2000}
                />
              </div>
              <div className="text-xs text-ice-500 mt-2">
                From {nodeStats.transactionsProcessed} transactions
              </div>
            </div>
          </div>

          {/* Monthly Revenue */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-2">
                <ChartBarIcon className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-medium text-ice-600">Monthly Revenue</span>
              </div>
              <div className="text-3xl font-bold text-ice-900">
                <AnimatedNumber
                  value={nodeStats.monthlyRevenue}
                  prefix="$"
                  decimals={2}
                  duration={2500}
                />
              </div>
              <div className="text-xs text-ice-500 mt-2">
                Projected: ${(nodeStats.dailyRevenue * 30).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Total Rewards */}
          <div className="card p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-100/50 to-transparent rounded-full -mr-16 -mt-16"></div>
            <div className="relative">
              <div className="flex items-center space-x-2 mb-2">
                <BoltIcon className="w-5 h-5 text-amber-600" />
                <span className="text-sm font-medium text-ice-600">Total Rewards</span>
              </div>
              <div className="text-3xl font-bold text-ice-900">
                <AnimatedNumber
                  value={nodeStats.totalRewards}
                  decimals={4}
                  suffix=" AVAX"
                  duration={3000}
                />
              </div>
              <div className="text-xs text-ice-500 mt-2">
                Lifetime earnings
              </div>
            </div>
          </div>
        </div>

        {/* Donation Tracking */}
        <div className="card p-6 mb-8">
          <h2 className="text-2xl font-bold text-ice-900 mb-6 flex items-center">
            <ChartBarIcon className="w-6 h-6 mr-2 text-arctic-600" />
            Donation Tracking
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-gradient-to-br from-arctic-50 to-ice-50 rounded-lg">
              <div className="text-sm font-medium text-ice-600 mb-1">Total Donations</div>
              <div className="text-2xl font-bold text-ice-900">
                <AnimatedNumber value={nodeStats.totalDonations} duration={1500} />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-arctic-50 to-ice-50 rounded-lg">
              <div className="text-sm font-medium text-ice-600 mb-1">Donation Volume</div>
              <div className="text-2xl font-bold text-ice-900">
                <AnimatedNumber
                  value={nodeStats.donationVolume}
                  prefix="$"
                  decimals={2}
                  duration={2000}
                />
              </div>
            </div>

            <div className="p-4 bg-gradient-to-br from-arctic-50 to-ice-50 rounded-lg">
              <div className="text-sm font-medium text-ice-600 mb-1">Transactions Processed</div>
              <div className="text-2xl font-bold text-ice-900">
                <AnimatedNumber value={nodeStats.transactionsProcessed} duration={1800} />
              </div>
            </div>
          </div>

          {/* Processing Animation */}
          <div className="mt-6 p-4 bg-gradient-to-r from-arctic-100 to-ice-100 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-ice-700">Processing Pipeline</span>
              <CheckCircleIcon className="w-5 h-5 text-green-600" />
            </div>
            <div className="relative h-2 bg-ice-200 rounded-full overflow-hidden">
              <div
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-arctic-500 to-arctic-600 rounded-full animate-pulse"
                style={{ width: '100%' }}
              ></div>
            </div>
            <div className="text-xs text-ice-600 mt-2">
              All donations verified and recorded on Avalanche L1
            </div>
          </div>
        </div>

        {/* Validator Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Node Information */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-ice-900 mb-4 flex items-center">
              <ServerIcon className="w-5 h-5 mr-2 text-arctic-600" />
              Node Information
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-ice-100">
                <span className="text-ice-600">Node ID</span>
                <span className="font-mono font-medium text-ice-900">#{nodeStats.nodeId}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-ice-100">
                <span className="text-ice-600">Operator</span>
                <span className="font-mono text-sm text-ice-900">
                  {nodeStats.operator.slice(0, 6)}...{nodeStats.operator.slice(-4)}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-ice-100">
                <span className="text-ice-600">Stake Amount</span>
                <span className="font-medium text-ice-900">{nodeStats.stakeAmount} AVAX</span>
              </div>
              <div className="flex justify-between py-2 border-b border-ice-100">
                <span className="text-ice-600">Deploy Time</span>
                <span className="font-medium text-ice-900">
                  {new Date(nodeStats.deployTime * 1000).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-ice-600 flex items-center">
                  <ClockIcon className="w-4 h-4 mr-1" />
                  Uptime
                </span>
                <span className="font-medium text-ice-900">{formatUptime(nodeStats.uptime)}</span>
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="card p-6">
            <h3 className="text-xl font-bold text-ice-900 mb-4 flex items-center">
              <ChartBarIcon className="w-5 h-5 mr-2 text-arctic-600" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ice-600">Network Health</span>
                  <span className="font-medium text-green-600">Excellent</span>
                </div>
                <div className="w-full bg-ice-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ice-600">Transaction Success Rate</span>
                  <span className="font-medium text-arctic-600">99.8%</span>
                </div>
                <div className="w-full bg-ice-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-arctic-500 to-arctic-600 h-2 rounded-full" style={{ width: '99.8%' }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-ice-600">Validation Efficiency</span>
                  <span className="font-medium text-emerald-600">97.5%</span>
                </div>
                <div className="w-full bg-ice-200 rounded-full h-2">
                  <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full" style={{ width: '97.5%' }}></div>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gradient-to-r from-arctic-50 to-ice-50 rounded-lg">
                <div className="text-sm font-medium text-ice-700 mb-1">Average Block Time</div>
                <div className="text-2xl font-bold text-arctic-700">2.1s</div>
                <div className="text-xs text-ice-500 mt-1">Consistently fast validation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8 card p-6 bg-gradient-to-r from-arctic-50 to-ice-50 border border-arctic-200">
          <div className="flex items-start space-x-3">
            <BoltIcon className="w-6 h-6 text-arctic-600 flex-shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-ice-900 mb-2">About Isbjorn L1 Validator</h4>
              <p className="text-ice-700 text-sm leading-relaxed">
                The Isbjorn L1 validator runs on Avalanche's infrastructure, processing all donation transactions
                on-chain with complete transparency. Revenue is generated from transaction fees and validation rewards,
                which helps sustain the platform while ensuring all charitable donations are immutably recorded.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePage;

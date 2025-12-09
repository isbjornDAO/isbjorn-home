import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import {
  ServerIcon,
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

interface Transaction {
  id: number;
  delay: number;
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

  useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;
    const difference = endValue - startValue;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out animation
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + difference * easeOut;

      setDisplayValue(current);

      if (progress >= 1) {
        setDisplayValue(endValue);
        clearInterval(interval);
      }
    }, 16); // ~60fps

    return () => clearInterval(interval);
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);

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

  // Transaction animation
  useEffect(() => {
    let id = 0;
    const addTransaction = () => {
      const newTx: Transaction = {
        id: id++,
        delay: Math.random() * 2000
      };
      setTransactions(prev => [...prev, newTx]);

      // Remove transaction after animation completes
      setTimeout(() => {
        setTransactions(prev => prev.filter(tx => tx.id !== newTx.id));
      }, 4000);
    };

    // Add transactions at random intervals
    const interval = setInterval(addTransaction, 800 + Math.random() * 1200);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-arctic-500 mx-auto mb-4"></div>
          <p className="text-ice-700 font-semibold text-lg">Loading validator...</p>
        </div>
      </div>
    );
  }

  if (error || !nodeStats) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-ice-900 mb-3">Connection Error</h2>
          <p className="text-ice-600">{error || 'Failed to load validator data'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ice-900 mb-3">Iggy L1 Validator</h1>
          <p className="text-ice-600 text-lg">Processing donations through blockchain validators</p>
        </div>

        {/* Main Visual Animation */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <div className="flex items-center justify-center space-x-2 mb-8">
            <div className="w-3 h-3 bg-arctic-500 rounded-full animate-pulse"></div>
            <h2 className="text-2xl font-bold text-ice-900">Live Processing</h2>
          </div>

          {/* Large Transaction Animation */}
          <div className="relative h-48 bg-gradient-to-r from-arctic-50 via-ice-50 to-arctic-50 rounded-xl border-2 border-arctic-200 overflow-hidden mb-6">
            {/* Input zone */}
            <div className="absolute left-0 top-0 h-full w-32 bg-arctic-100/50 border-r-2 border-arctic-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-arctic-700 mb-1">DONATIONS</div>
                <div className="text-xs text-arctic-600">Input</div>
              </div>
            </div>

            {/* Animation lane */}
            <div className="absolute left-32 right-32 top-0 h-full flex items-center justify-center">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="absolute w-12 h-12 bg-arctic-500 rounded-lg shadow-xl animate-slide-through"
                  style={{
                    left: '-48px',
                    animationDelay: `${tx.delay}ms`,
                    animationDuration: '4s'
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-arctic-300 rounded"></div>
                  </div>
                </div>
              ))}

              {/* Validator */}
              <div className="relative z-10 p-6 bg-white rounded-xl border-4 border-arctic-500 shadow-2xl">
                <ServerIcon className="w-12 h-12 text-arctic-600" />
                <div className="absolute -top-3 -right-3 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full border-2 border-white">
                  ACTIVE
                </div>
              </div>
            </div>

            {/* Output zone */}
            <div className="absolute right-0 top-0 h-full w-32 bg-arctic-100/50 border-l-2 border-arctic-300 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-bold text-arctic-700 mb-1">VERIFIED</div>
                <div className="text-xs text-arctic-600">Blockchain</div>
              </div>
            </div>
          </div>

          <div className="text-center text-sm text-ice-600">
            Each square represents a donation being processed and verified on-chain
          </div>
        </div>

        {/* Unlock Progress - Big and Visual */}
        <div className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="text-center mb-6">
            <div className="text-6xl font-bold mb-2">{nodeStats?.nodeId || 1}/5</div>
            <div className="text-xl text-arctic-100">Active Validators</div>
          </div>

          {/* Big Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between mb-3">
              <span className="text-lg font-semibold">Next Validator Unlock</span>
              <span className="text-lg font-bold">{nodeStats ? Math.min(100, Math.round((nodeStats.totalRewards / 500) * 100)) : 0}%</span>
            </div>
            <div className="w-full bg-arctic-700 rounded-full h-6 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-white to-arctic-100 h-6 rounded-full transition-all duration-1000 ease-out shadow-lg"
                style={{ width: `${nodeStats ? Math.min(100, (nodeStats.totalRewards / 500) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-arctic-700/50 rounded-xl p-4 text-center">
              <div className="text-arctic-200 text-sm mb-1">Current</div>
              <div className="text-3xl font-bold">{nodeStats?.totalRewards.toFixed(0) || '0'}</div>
              <div className="text-arctic-200 text-xs">AVAX</div>
            </div>
            <div className="bg-arctic-700/50 rounded-xl p-4 text-center">
              <div className="text-arctic-200 text-sm mb-1">Needed</div>
              <div className="text-3xl font-bold">500</div>
              <div className="text-arctic-200 text-xs">AVAX</div>
            </div>
          </div>

          <div className="text-center p-4 bg-arctic-700/30 rounded-xl border border-arctic-400/30">
            <div className="flex items-center justify-center space-x-2">
              <BoltIcon className="w-6 h-6 text-arctic-200" />
              <span className="text-lg">+40% revenue with next validator</span>
            </div>
          </div>
        </div>

        {/* Simple Key Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-ice-600 text-sm mb-2">Monthly Revenue</div>
            <div className="text-4xl font-bold text-arctic-600 mb-2">
              <AnimatedNumber
                value={nodeStats?.monthlyRevenue || 0}
                prefix="$"
                decimals={0}
                duration={2000}
              />
            </div>
            <div className="text-xs text-ice-500">From validation rewards</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-ice-600 text-sm mb-2">Total Donations</div>
            <div className="text-4xl font-bold text-arctic-600 mb-2">
              <AnimatedNumber value={nodeStats?.totalDonations || 0} duration={1500} />
            </div>
            <div className="text-xs text-ice-500">Processed on-chain</div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-ice-600 text-sm mb-2">Uptime</div>
            <div className="text-4xl font-bold text-arctic-600 mb-2">
              {formatUptime(nodeStats?.uptime || 0)}
            </div>
            <div className="text-xs text-ice-500">Always validating</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NodePage;

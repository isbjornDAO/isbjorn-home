import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CircleStackIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  ServerIcon,
  CpuChipIcon,
  SignalIcon,
  FireIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

interface Contribution {
  id: string;
  donor: string;
  amount: number;
  timestamp: number;
}

const NodesPage: React.FC = () => {
  // Current donation progress toward node activation
  const currentDonations = 450; // AVAX
  const nodeThreshold = 2000; // AVAX
  const progressPercentage = (currentDonations / nodeThreshold) * 100;
  const remaining = nodeThreshold - currentDonations;

  const [displayDonations, setDisplayDonations] = useState(0);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [networkPulse, setNetworkPulse] = useState(0);

  // Animate counter on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = currentDonations / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      if (currentStep <= steps) {
        setDisplayDonations(Math.floor(increment * currentStep));
      } else {
        setDisplayDonations(currentDonations);
        clearInterval(timer);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  // Network pulse animation
  useEffect(() => {
    const interval = setInterval(() => {
      setNetworkPulse(prev => (prev + 1) % 3);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  // Generate mock recent contributions
  useEffect(() => {
    const donors = [
      'Tech Innovations NZ',
      'Green Energy Co',
      'Local Business',
      'Anonymous Donor',
      'Pacific Group',
      'Auckland Software'
    ];

    const generateContribution = () => {
      const contribution: Contribution = {
        id: Date.now().toString(),
        donor: donors[Math.floor(Math.random() * donors.length)],
        amount: Math.floor(Math.random() * 50) + 5,
        timestamp: Date.now()
      };
      setRecentContributions(prev => [contribution, ...prev].slice(0, 5));
    };

    // Generate initial contributions
    for (let i = 0; i < 3; i++) {
      setTimeout(generateContribution, i * 1000);
    }

    // Continue generating
    const interval = setInterval(generateContribution, 8000);
    return () => clearInterval(interval);
  }, []);

  const benefits = [
    {
      icon: BoltIcon,
      title: 'Instant Processing',
      description: 'Sub-second transaction finality',
      stat: '< 2s',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Verified Security',
      description: 'Direct blockchain validation',
      stat: '100%',
    },
    {
      icon: ChartBarIcon,
      title: 'Lower Costs',
      description: 'Reduced transaction fees',
      stat: '-70%',
    },
  ];

  const milestones = [
    { amount: 500, label: 'Early Supporter', reached: currentDonations >= 500, reward: '🌟' },
    { amount: 1000, label: 'Node Foundation', reached: currentDonations >= 1000, reward: '⚡' },
    { amount: 1500, label: 'Almost There', reached: currentDonations >= 1500, reward: '🔥' },
    { amount: 2000, label: 'Node Activated', reached: currentDonations >= 2000, reward: '🎉' },
  ];

  const nodeSpecs = [
    { label: 'Staking Requirement', value: '2,000 AVAX', icon: CircleStackIcon },
    { label: 'Validation Speed', value: '< 2 seconds', icon: BoltIcon },
    { label: 'Network Uptime', value: '99.9%', icon: ServerIcon },
    { label: 'Daily Capacity', value: '10,000+ txs', icon: CpuChipIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-ice-50 to-arctic-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-3xl mb-4 shadow-xl relative">
            <CircleStackIcon className="w-10 h-10 text-white relative z-10" />
            <motion.div
              className="absolute inset-0 rounded-3xl bg-arctic-400"
              animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">Donation Node Tracker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help activate Isbjorn's first Avalanche validator node
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Main Progress Card */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-6"
            >
              {/* Animated Counter */}
              <div className="text-center mb-6">
                <motion.div
                  className="text-7xl font-bold bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent mb-2"
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {displayDonations.toLocaleString()} AVAX
                </motion.div>
                <div className="text-gray-600 text-lg">
                  of {nodeThreshold.toLocaleString()} AVAX needed
                </div>
                <div className="text-arctic-600 font-bold text-xl mt-2">
                  {remaining.toLocaleString()} AVAX to go!
                </div>
              </div>

              {/* Enhanced Progress Bar */}
              <div className="relative h-10 bg-gradient-to-r from-ice-100 to-ice-200 rounded-full overflow-hidden mb-8 shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 2, ease: 'easeOut' }}
                  className="absolute h-full bg-gradient-to-r from-arctic-400 via-arctic-500 to-arctic-600 rounded-full relative overflow-hidden"
                >
                  {/* Animated shine effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{ x: ['-100%', '200%'] }}
                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                  />
                </motion.div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-700 drop-shadow-sm">
                    {progressPercentage.toFixed(1)}% Complete
                  </span>
                </div>
              </div>

              {/* Milestones Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {milestones.map((milestone, index) => (
                  <motion.div
                    key={milestone.amount}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className={`
                      relative p-4 rounded-xl border-2 transition-all cursor-pointer hover:scale-105
                      ${milestone.reached
                        ? 'bg-gradient-to-br from-arctic-50 to-ice-50 border-arctic-500 shadow-lg'
                        : 'bg-gray-50 border-gray-200'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-lg font-bold text-gray-900">
                        {milestone.amount.toLocaleString()}
                      </span>
                      {milestone.reached ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="text-xl"
                        >
                          {milestone.reward}
                        </motion.div>
                      ) : (
                        <ClockIcon className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div className="text-xs text-gray-600 font-medium">{milestone.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Node Visualization */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <ServerIcon className="w-7 h-7 text-arctic-600" />
                Node Architecture
              </h2>

              {/* Visual Node Representation */}
              <div className="relative bg-gradient-to-br from-arctic-50 to-ice-100 rounded-2xl p-8 mb-6 overflow-hidden">
                {/* Central Node */}
                <div className="flex items-center justify-center mb-8">
                  <motion.div
                    className="relative"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  >
                    <div className="w-32 h-32 bg-gradient-to-br from-arctic-500 to-arctic-700 rounded-3xl flex items-center justify-center shadow-2xl">
                      <ServerIcon className="w-16 h-16 text-white" />
                    </div>
                    {/* Orbiting connection indicators */}
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute w-4 h-4 bg-green-500 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                        }}
                        animate={{
                          x: [0, Math.cos((i * 2 * Math.PI) / 3) * 80, 0],
                          y: [0, Math.sin((i * 2 * Math.PI) / 3) * 80, 0],
                          scale: networkPulse === i ? 1.5 : 1,
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          delay: i * 1,
                        }}
                      />
                    ))}
                  </motion.div>
                </div>

                {/* Connection Status */}
                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-gray-700 font-medium">Network Connected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <SignalIcon className="w-4 h-4 text-arctic-600" />
                    <span className="text-gray-700 font-medium">Ready to Stake</span>
                  </div>
                </div>
              </div>

              {/* Node Specs */}
              <div className="grid grid-cols-2 gap-4">
                {nodeSpecs.map((spec, index) => {
                  const Icon = spec.icon;
                  return (
                    <motion.div
                      key={spec.label}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="p-4 bg-gradient-to-br from-ice-50 to-white rounded-xl border border-ice-200"
                    >
                      <Icon className="w-6 h-6 text-arctic-600 mb-2" />
                      <div className="text-xs text-gray-600 mb-1">{spec.label}</div>
                      <div className="text-lg font-bold text-gray-900">{spec.value}</div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Contributions */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <h3 className="text-lg font-bold text-gray-900">Recent Contributions</h3>
              </div>
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                  {recentContributions.map((contribution) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="p-3 bg-gradient-to-r from-ice-50 to-white rounded-lg border border-ice-200">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold text-gray-900 truncate">
                              {contribution.donor}
                            </div>
                            <div className="text-xs text-gray-500">Just now</div>
                          </div>
                          <div className="text-sm font-bold text-arctic-600">
                            +{contribution.amount} AVAX
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>

            {/* Benefits Cards */}
            <div className="space-y-4">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-5 hover:shadow-xl transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-bold text-gray-900">{benefit.title}</h3>
                          <span className="text-xl font-bold text-arctic-600">{benefit.stat}</span>
                        </div>
                        <p className="text-sm text-gray-600">{benefit.description}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Impact Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-arctic-500 to-arctic-700 rounded-2xl shadow-xl p-6 text-white"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <FireIcon className="w-5 h-5" />
                Once Node is Active
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100 text-sm">Daily Transactions</span>
                  <span className="font-bold text-xl">10,000+</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100 text-sm">Fee Savings</span>
                  <span className="font-bold text-xl">70%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100 text-sm">Processing Time</span>
                  <span className="font-bold text-xl">&lt; 2s</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100 text-sm">Network Uptime</span>
                  <span className="font-bold text-xl">99.9%</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-3xl shadow-2xl p-8 md:p-12 text-center text-white relative overflow-hidden"
        >
          {/* Animated background particles */}
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-32 h-32 bg-white/5 rounded-full"
              style={{
                left: `${20 * i}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -40, -20],
                opacity: [0.1, 0.3, 0.1],
              }}
              transition={{
                duration: 3 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}

          <div className="relative z-10">
            <h2 className="text-4xl font-bold mb-4">Help Us Reach 2,000 AVAX</h2>
            <p className="text-arctic-50 mb-8 max-w-2xl mx-auto text-lg">
              Every donation brings us closer to activating our validator node. Be part of the infrastructure
              that powers transparent charitable giving in New Zealand.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/donate"
                className="inline-flex items-center gap-2 bg-white text-arctic-600 font-bold px-8 py-4 rounded-xl hover:bg-arctic-50 transition-all hover:scale-105 shadow-lg"
              >
                <BanknotesIcon className="w-5 h-5" />
                Donate Now
              </a>
              <a
                href="/map"
                className="inline-flex items-center gap-2 bg-arctic-400/20 backdrop-blur-sm border-2 border-white/30 text-white font-bold px-8 py-4 rounded-xl hover:bg-arctic-400/30 transition-all"
              >
                <ArrowTrendingUpIcon className="w-5 h-5" />
                View DAO Activity
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default NodesPage;

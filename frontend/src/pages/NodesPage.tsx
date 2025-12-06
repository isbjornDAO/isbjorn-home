import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ServerIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const NodesPage: React.FC = () => {
  const currentDonations = 450; // AVAX
  const nodeThreshold = 2000; // AVAX
  const progressPercentage = (currentDonations / nodeThreshold) * 100;
  const remaining = nodeThreshold - currentDonations;

  const [displayDonations, setDisplayDonations] = useState(0);

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

  const milestones = [
    { amount: 500, label: 'Early Supporter', reached: currentDonations >= 500 },
    { amount: 1000, label: 'Node Foundation', reached: currentDonations >= 1000 },
    { amount: 1500, label: 'Almost There', reached: currentDonations >= 1500 },
    { amount: 2000, label: 'Node Activated', reached: currentDonations >= 2000 },
  ];

  const benefits = [
    {
      icon: BoltIcon,
      title: 'Instant Processing',
      description: 'Sub-second transaction finality for all donations',
      stat: '< 2s',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enhanced Security',
      description: 'Direct blockchain validation ensures transparency',
      stat: '100%',
    },
    {
      icon: ChartBarIcon,
      title: 'Lower Costs',
      description: 'Reduced fees mean more funds reach charities',
      stat: '-70%',
    },
  ];

  const specs = [
    { label: 'Staking Requirement', value: '2,000 AVAX' },
    { label: 'Validation Speed', value: '< 2 seconds' },
    { label: 'Network Uptime', value: '99.9%' },
    { label: 'Daily Capacity', value: '10,000+ transactions' },
  ];

  return (
    <div className="min-h-screen bg-ice-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/src/assets/polar-bear-donate-bg.jpg')",
            backgroundPosition: "center 40%"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-xl">
            <CircleStackIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4">
            Donation Node Tracker
          </h1>
          <p className="text-lg sm:text-xl text-ice-100 max-w-3xl mx-auto px-4">
            Track progress toward activating Isbjorn's first Avalanche validator node
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6 sm:p-8 mb-8"
        >
          {/* Counter */}
          <div className="text-center mb-6">
            <motion.div
              className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent mb-2"
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {displayDonations.toLocaleString()} AVAX
            </motion.div>
            <div className="text-gray-600 text-base sm:text-lg mb-1">
              of {nodeThreshold.toLocaleString()} AVAX needed
            </div>
            <div className="text-arctic-600 font-bold text-lg sm:text-xl">
              {remaining.toLocaleString()} AVAX to go
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-10 bg-gradient-to-r from-ice-100 to-ice-200 rounded-full overflow-hidden mb-8 shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute h-full bg-gradient-to-r from-arctic-400 via-arctic-500 to-arctic-600 rounded-full relative overflow-hidden"
            >
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

          {/* Milestones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.amount}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className={`
                  p-4 rounded-xl border-2 text-center transition-all
                  ${milestone.reached
                    ? 'bg-gradient-to-br from-arctic-50 to-ice-50 border-arctic-500'
                    : 'bg-gray-50 border-gray-200'
                  }
                `}
              >
                <div className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                  {milestone.amount.toLocaleString()}
                </div>
                <div className="text-xs text-gray-600 font-medium">{milestone.label}</div>
                {milestone.reached && (
                  <CheckCircleIcon className="w-5 h-5 text-arctic-600 mx-auto mt-2" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What is a Node? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6 sm:p-8 mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <ServerIcon className="w-8 h-8 text-arctic-600" />
            <h2 className="text-2xl font-bold text-gray-900">What is a Donation Node?</h2>
          </div>
          <p className="text-gray-600 leading-relaxed mb-4">
            A donation node is an Avalanche validator that Isbjorn operates to process charity donations
            directly on the blockchain. By running our own node, we can offer faster transactions, lower fees,
            and complete transparency for all donations flowing through the platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Once we reach <strong className="text-arctic-700">2,000 AVAX</strong> in cumulative donations, we'll activate our first
            validator node. This means every donation after that point will be processed through our
            own infrastructure, giving donors and charities the best possible experience.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Node Benefits</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="bg-white rounded-2xl shadow-lg border border-ice-100 p-6 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-xl flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold text-arctic-600">{benefit.stat}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Technical Specifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6 sm:p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {specs.map((spec) => (
              <div
                key={spec.label}
                className="p-4 bg-gradient-to-br from-ice-50 to-white rounded-xl border border-ice-200"
              >
                <div className="text-sm text-gray-600 mb-1">{spec.label}</div>
                <div className="text-xl font-bold text-gray-900">{spec.value}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-arctic-500 to-polar-500 rounded-2xl shadow-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Help Activate Our Node</h2>
          <p className="text-ice-100 mb-6 max-w-2xl mx-auto">
            Every donation brings us closer to activating our validator node and improving the donation experience for all New Zealand charities.
          </p>
          <a
            href="/donate"
            className="inline-block bg-white text-arctic-600 font-bold px-8 py-4 rounded-xl hover:bg-ice-50 transition-all hover:scale-105 shadow-lg"
          >
            Donate Now
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default NodesPage;

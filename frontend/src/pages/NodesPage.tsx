import React from 'react';
import { motion } from 'framer-motion';
import {
  CircleStackIcon,
  BoltIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

const NodesPage: React.FC = () => {
  // Current donation progress toward node activation
  const currentDonations = 450; // AVAX
  const nodeThreshold = 2000; // AVAX
  const progressPercentage = (currentDonations / nodeThreshold) * 100;

  const benefits = [
    {
      icon: BoltIcon,
      title: 'Faster Transactions',
      description: 'Process donations instantly with our own validator node',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Enhanced Security',
      description: 'Direct blockchain validation ensures maximum transparency',
    },
    {
      icon: ChartBarIcon,
      title: 'Lower Fees',
      description: 'Reduced transaction costs mean more funds reach charities',
    },
  ];

  const milestones = [
    { amount: 500, label: 'Early Supporter', reached: false },
    { amount: 1000, label: 'Node Foundation', reached: false },
    { amount: 1500, label: 'Almost There', reached: false },
    { amount: 2000, label: 'Node Activated', reached: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-ice-50 to-arctic-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-3xl mb-6 shadow-xl">
            <CircleStackIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Donation Node Tracker</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track our progress toward activating Isbjorn's first donation node on the Avalanche network
          </p>
        </motion.div>

        {/* Progress Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-8 mb-8"
        >
          <div className="text-center mb-8">
            <div className="text-6xl font-bold text-arctic-600 mb-2">
              {currentDonations.toLocaleString()} AVAX
            </div>
            <div className="text-gray-600">
              of {nodeThreshold.toLocaleString()} AVAX needed
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative h-8 bg-ice-100 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              className="absolute h-full bg-gradient-to-r from-arctic-400 via-arctic-500 to-arctic-600 rounded-full"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-700">
                {progressPercentage.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Milestones */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {milestones.map((milestone, index) => {
              const reached = currentDonations >= milestone.amount;
              return (
                <motion.div
                  key={milestone.amount}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className={`
                    relative p-4 rounded-xl border-2 transition-all
                    ${reached
                      ? 'bg-arctic-50 border-arctic-500'
                      : 'bg-gray-50 border-gray-200'
                    }
                  `}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-gray-900">
                      {milestone.amount.toLocaleString()}
                    </span>
                    {reached ? (
                      <CheckCircleIcon className="w-5 h-5 text-arctic-600" />
                    ) : (
                      <ClockIcon className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-xs text-gray-600">{milestone.label}</div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* What is a Donation Node? */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is a Donation Node?</h2>
          <p className="text-gray-600 mb-6 leading-relaxed">
            A donation node is an Avalanche validator that Isbjorn operates to process charity donations
            directly on the blockchain. By running our own node, we can offer faster transactions, lower fees,
            and complete transparency for all donations flowing through the platform.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Once we reach <strong>2,000 AVAX</strong> in cumulative donations, we'll activate our first
            validator node. This means every donation after that point will be processed through our
            own infrastructure, giving donors and charities the best possible experience.
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-3 gap-6 mb-8"
        >
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{benefit.description}</p>
              </div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-3xl shadow-2xl p-8 text-center text-white"
        >
          <h2 className="text-3xl font-bold mb-4">Help Us Reach Our Goal</h2>
          <p className="text-arctic-50 mb-6 max-w-2xl mx-auto">
            Every donation brings us closer to activating our first node. Join the movement and help
            build a more transparent, efficient donation platform for New Zealand charities.
          </p>
          <a
            href="/donate"
            className="inline-block bg-white text-arctic-600 font-bold px-8 py-3 rounded-xl hover:bg-arctic-50 transition-all hover:scale-105 shadow-lg"
          >
            Donate Now
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default NodesPage;

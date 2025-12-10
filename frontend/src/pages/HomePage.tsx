import React from 'react';
import { motion } from 'framer-motion';
import {
  LockClosedIcon,
  HeartIcon,
  UserGroupIcon,
  ChartBarIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

// Snowflake component for arctic animation
const Snowflake: React.FC<{ delay: number }> = ({ delay }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 8 + Math.random() * 4;

  return (
    <motion.div
      className="absolute text-arctic-200 opacity-60"
      style={{ left: `${randomX}%`, top: '-20px' }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, Math.sin(delay) * 50, 0],
        rotate: [0, 360]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: delay,
        ease: 'linear'
      }}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L10 10L2 12L10 14L12 22L14 14L22 12L14 10L12 2Z" />
      </svg>
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Arctic Snowfall Animation */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <Snowflake key={i} delay={i * 0.3} />
        ))}
      </div>

      {/* Gradient Orbs for depth */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-20 left-10 w-96 h-96 bg-arctic-200/30 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-ice-200/40 rounded-full blur-3xl"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is Isbjörn Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-arctic-900 mb-4">
            What is Isbjörn?
          </h2>
          <p className="text-center text-ice-600 text-lg max-w-3xl mx-auto mb-12">
            A blockchain-powered platform that brings complete transparency to charitable giving.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1: Blockchain Verified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <LockClosedIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Blockchain Verified</h3>
              <p className="text-ice-700">
                Every donation is recorded on the Avalanche blockchain, creating an immutable record of giving.
              </p>
            </motion.div>

            {/* Feature 2: IRD Compliant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">IRD Compliant</h3>
              <p className="text-ice-700">
                Automatic tax receipts for all donations, fully compliant with tax regulations.
              </p>
            </motion.div>

            {/* Feature 3: Community Governance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Community Governance</h3>
              <p className="text-ice-700">
                Donors earn XP and voting power to influence how foundation funds are distributed.
              </p>
            </motion.div>

            {/* Feature 4: Validator Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Validator Network</h3>
              <p className="text-ice-700">
                Donations are staked to validators, generating revenue that communities vote to distribute.
              </p>
            </motion.div>

            {/* Feature 5: Global Impact Map */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Global Impact Map</h3>
              <p className="text-ice-700">
                Track your donations in real-time across the globe with our interactive impact visualization.
              </p>
            </motion.div>

            {/* Feature 6: Zero Hidden Fees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow"
            >
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Zero Hidden Fees</h3>
              <p className="text-ice-700">
                100% of your donation goes to verified charities. All operational costs are covered by validator revenue.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

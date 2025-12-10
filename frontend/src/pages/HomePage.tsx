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

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-arctic-600 via-arctic-500 to-ice-600 bg-clip-text text-transparent mb-6 leading-tight">
            It's time to save the world
          </h1>
          <p className="text-xl md:text-2xl text-ice-700 max-w-4xl mx-auto font-light leading-relaxed">
            Safe transparent donations from the 1%, our world's climate mission decided by you.
          </p>
        </motion.div>

        {/* What is Isbjörn Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center text-arctic-900 mb-8">
            What is Isbjörn?
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Feature 1: Blockchain Verified */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <LockClosedIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">Blockchain Verified</h3>
            </motion.div>

            {/* Feature 2: IRD Compliant */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <HeartIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">IRD Compliant</h3>
            </motion.div>

            {/* Feature 3: Community Governance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <UserGroupIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">Community Governance</h3>
            </motion.div>

            {/* Feature 4: Validator Network */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChartBarIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">Validator Network</h3>
            </motion.div>

            {/* Feature 5: Global Climate Service */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <GlobeAltIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">Global Climate Service</h3>
            </motion.div>

            {/* Feature 6: Zero Hidden Fees */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-4 shadow border border-ice-200 hover:shadow-lg transition-shadow flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-arctic-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <ShieldCheckIcon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-arctic-900">Zero Hidden Fees</h3>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HomePage;

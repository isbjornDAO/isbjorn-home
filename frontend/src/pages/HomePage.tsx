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
      className="absolute text-blue-200 opacity-40"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 relative">
      {/* Arctic Snowfall Animation - subtle overlay */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {Array.from({ length: 20 }).map((_, i) => (
          <Snowflake key={i} delay={i * 0.4} />
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* Hero Title */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="text-center mb-12"
        >
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-blue-600 mb-6 leading-tight"
          >
            It's time to save the polar bears
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
            className="text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto font-light leading-relaxed mb-8"
          >
            Safe transparent donations from the 1%, our world's climate mission decided by you.
          </motion.p>

          {/* Video in Rounded Box */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="max-w-5xl mx-auto mb-12"
          >
            <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-blue-200">
              <div className="relative" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  className="absolute top-0 left-0 w-full h-full"
                  src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=1&mute=1&loop=1&playlist=64ZaC04ppLQ&controls=1&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
                  title="Polar Bears Video"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                />
              </div>
            </div>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <a
              href="/donate"
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-xl shadow-2xl hover:shadow-blue-500/50 hover:scale-105 transition-all duration-300"
            >
              Start Donating
            </a>
            <a
              href="/vote"
              className="px-8 py-4 bg-white text-blue-600 font-bold text-lg rounded-xl border-2 border-blue-200 hover:bg-blue-50 hover:scale-105 transition-all duration-300 shadow-lg"
            >
              Join the Mission
            </a>
          </motion.div>
        </motion.div>

        {/* What is Isbjörn Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mb-20"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-3xl md:text-5xl font-bold text-center text-blue-600 mb-12"
          >
            What is Isbjörn?
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1: Blockchain Verified */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.3 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <LockClosedIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Blockchain Verified</h3>
              <p className="text-gray-600 text-sm">Every donation tracked on-chain with complete transparency</p>
            </motion.div>

            {/* Feature 2: IRD Compliant */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.4 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <HeartIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">IRD Compliant</h3>
              <p className="text-gray-600 text-sm">Get instant tax receipts for all your donations</p>
            </motion.div>

            {/* Feature 3: Community Governance */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.5 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <UserGroupIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Community Governance</h3>
              <p className="text-gray-600 text-sm">You decide where the funds go through voting</p>
            </motion.div>

            {/* Feature 4: Validator Network */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.6 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <ChartBarIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Validator Network</h3>
              <p className="text-gray-600 text-sm">Decentralized validation ensures integrity</p>
            </motion.div>

            {/* Feature 5: Global Climate Service */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.7 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <GlobeAltIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Global Climate Service</h3>
              <p className="text-gray-600 text-sm">Supporting climate initiatives worldwide</p>
            </motion.div>

            {/* Feature 6: Zero Hidden Fees */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.8 }}
              className="bg-white rounded-2xl p-6 shadow-xl border-2 border-blue-100 hover:border-blue-300 hover:scale-105 transition-all duration-300 group"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0 mb-4 group-hover:scale-110 transition-transform">
                <ShieldCheckIcon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Zero Hidden Fees</h3>
              <p className="text-gray-600 text-sm">100% of your donation goes to the cause</p>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HomePage;

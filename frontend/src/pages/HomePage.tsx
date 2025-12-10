import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowRightIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  HeartIcon,
  CheckBadgeIcon,
  MapIcon,
  LockClosedIcon,
  UserGroupIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';

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
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'donate' | 'vote' | 'explore'>('donate');

  return (
    <div className="h-screen bg-white relative overflow-hidden flex flex-col">
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

      {/* Main Content - Fits in viewport */}
      <div className="relative z-10 flex-1 flex flex-col max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">

        {/* Hero Title - Compact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-6"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-arctic-600 via-arctic-500 to-ice-600 bg-clip-text text-transparent">
            Transparent Giving
          </h1>
        </motion.div>

        {/* 3 Benefit Cards - Data Only (No Labels) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="grid grid-cols-3 gap-4 mb-6"
        >
          {/* Card 1: Just the number and icon */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-arctic-100">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-2">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent">
                12
              </div>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-arctic-100">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-2">
                <CurrencyDollarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent">
                $247K
              </div>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-arctic-100">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-2">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-4xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent">
                100%
              </div>
            </div>
          </div>
        </motion.div>

        {/* What is Isbjörn - Compact Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-6"
        >
          <h2 className="text-2xl font-bold text-center text-arctic-900 mb-3">What is Isbjörn?</h2>
          <p className="text-center text-ice-600 text-sm mb-4 max-w-2xl mx-auto">
            Blockchain-powered transparency for charitable giving in New Zealand
          </p>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            {[
              { icon: LockClosedIcon, label: 'Blockchain Verified' },
              { icon: HeartIcon, label: 'IRD Compliant' },
              { icon: UserGroupIcon, label: 'Community Governance' },
              { icon: ChartBarIcon, label: 'Validator Network' },
              { icon: GlobeAltIcon, label: 'Global Impact Map' },
              { icon: ShieldCheckIcon, label: 'Zero Hidden Fees' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-gradient-to-br from-white to-ice-50 rounded-lg p-3 shadow border border-ice-200 text-center">
                <feature.icon className="w-6 h-6 text-arctic-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-arctic-900">{feature.label}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Interactive Tabs - Compact */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {/* Tab Buttons */}
          <div className="flex justify-center gap-3 mb-4">
            <button
              onClick={() => setActiveTab('donate')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'donate'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg'
                  : 'bg-white text-arctic-700 border border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <HeartIcon className="w-4 h-4" />
              Donate
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'vote'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg'
                  : 'bg-white text-arctic-700 border border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <CheckBadgeIcon className="w-4 h-4" />
              Vote
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all text-sm ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg'
                  : 'bg-white text-arctic-700 border border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <MapIcon className="w-4 h-4" />
              Explore
            </button>
          </div>

          {/* Tab Content - Compact with fixed height */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-arctic-100 flex-1 overflow-auto">
            {activeTab === 'donate' && (
              <motion.div
                key="donate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-arctic-900 mb-2">Make a Difference</h3>
                <p className="text-sm text-ice-700 mb-4">
                  Choose from verified NZ charities. Every dollar tracked on-chain with IRD-compliant receipts.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-arctic-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold text-xs">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Select Charity</h4>
                      <p className="text-ice-600 text-xs">Browse verified organizations</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-arctic-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold text-xs">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Donate Securely</h4>
                      <p className="text-ice-600 text-xs">Via X402 payments</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-arctic-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold text-xs">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Track Impact</h4>
                      <p className="text-ice-600 text-xs">See on-chain confirmation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-6 h-6 bg-arctic-100 rounded flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold text-xs">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Earn XP</h4>
                      <p className="text-ice-600 text-xs">Get voting power</p>
                    </div>
                  </div>
                </div>

                <Link
                  to={isAuthenticated ? '/donate' : '/signup'}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all text-sm"
                >
                  <span>Start Donating</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            {activeTab === 'vote' && (
              <motion.div
                key="vote"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-arctic-900 mb-2">Shape the Future</h3>
                <p className="text-sm text-ice-700 mb-4">
                  Earn voting power to influence how validator revenue is distributed to nonprofits.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Treasury</h4>
                      <p className="text-ice-600 text-xs">Real-time fund tracking</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Proposals</h4>
                      <p className="text-ice-600 text-xs">Vote on funding</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Earn XP</h4>
                      <p className="text-ice-600 text-xs">10 XP per vote</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckBadgeIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">History</h4>
                      <p className="text-ice-600 text-xs">Review decisions</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/vote"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all text-sm"
                >
                  <span>Join Governance</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-xl font-bold text-arctic-900 mb-2">Track Global Impact</h3>
                <p className="text-sm text-ice-700 mb-4">
                  Visualize donations flowing globally with real-time blockchain data on Iggy L1 and P-Chain.
                </p>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-start gap-2">
                    <MapIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Live Transactions</h4>
                      <p className="text-ice-600 text-xs">Watch donations flow</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Validators</h4>
                      <p className="text-ice-600 text-xs">View network nodes</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Climate Zones</h4>
                      <p className="text-ice-600 text-xs">Conservation impact</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapIcon className="w-5 h-5 text-arctic-600 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-arctic-900 text-sm">Events</h4>
                      <p className="text-ice-600 text-xs">Upvote activities</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-6 py-3 rounded-lg font-bold hover:shadow-lg transition-all text-sm"
                >
                  <span>View Impact Map</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

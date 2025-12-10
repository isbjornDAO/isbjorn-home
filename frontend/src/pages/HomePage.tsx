import React, { useEffect, useState } from 'react';
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
  GlobeAltIcon,
  UserGroupIcon,
  LockClosedIcon
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
          <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold bg-gradient-to-r from-arctic-600 via-arctic-500 to-ice-600 bg-clip-text text-transparent mb-4">
            Transparent Giving
          </h1>
          <p className="text-xl md:text-2xl text-ice-700 max-w-3xl mx-auto font-light">
            Every donation tracked on-chain. Every dollar accounted for. Every impact verified.
          </p>
        </motion.div>

        {/* 3 Benefit Cards - Data Only */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-20"
        >
          {/* Card 1: Verified Charities */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-arctic-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent mb-2">
                12
              </div>
              <div className="text-ice-600 text-sm uppercase tracking-wider font-semibold">
                Verified Charities
              </div>
            </div>
          </div>

          {/* Card 2: Total Donated */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-arctic-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-4">
                <CurrencyDollarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent mb-2">
                $247K
              </div>
              <div className="text-ice-600 text-sm uppercase tracking-wider font-semibold">
                Total Donated
              </div>
            </div>
          </div>

          {/* Card 3: On-Chain Transparency */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl border-2 border-arctic-100 hover:shadow-2xl transition-all duration-300 hover:scale-105">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mb-4">
                <ChartBarIcon className="w-8 h-8 text-white" />
              </div>
              <div className="text-5xl font-bold bg-gradient-to-r from-arctic-600 to-arctic-500 bg-clip-text text-transparent mb-2">
                100%
              </div>
              <div className="text-ice-600 text-sm uppercase tracking-wider font-semibold">
                On-Chain Transparency
              </div>
            </div>
          </div>
        </motion.div>

        {/* What is Isbjörn Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-arctic-900 mb-4">
            What is Isbjörn?
          </h2>
          <p className="text-center text-ice-600 text-lg max-w-3xl mx-auto mb-12">
            A blockchain-powered platform that brings complete transparency to charitable giving in New Zealand.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <LockClosedIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Blockchain Verified</h3>
              <p className="text-ice-700">
                Every donation is recorded on the Avalanche blockchain, creating an immutable record of giving.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <HeartIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">IRD Compliant</h3>
              <p className="text-ice-700">
                Automatic tax receipts for all donations, fully compliant with New Zealand tax regulations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Community Governance</h3>
              <p className="text-ice-700">
                Donors earn XP and voting power to influence how foundation funds are distributed.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <ChartBarIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Validator Network</h3>
              <p className="text-ice-700">
                Donations are staked to validators, generating revenue that communities vote to distribute.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <GlobeAltIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Global Impact Map</h3>
              <p className="text-ice-700">
                Track your donations in real-time across the globe with our interactive impact visualization.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gradient-to-br from-white to-ice-50 rounded-xl p-6 shadow-lg border border-ice-200 hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-arctic-500 rounded-lg flex items-center justify-center mb-4">
                <ShieldCheckIcon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-arctic-900 mb-2">Zero Hidden Fees</h3>
              <p className="text-ice-700">
                100% of your donation goes to verified charities. All operational costs are covered by validator revenue.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Interactive Tabs - What to Do */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center text-arctic-900 mb-12">
            How It Works
          </h2>

          {/* Tab Buttons */}
          <div className="flex justify-center gap-4 mb-8">
            <button
              onClick={() => setActiveTab('donate')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'donate'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg scale-105'
                  : 'bg-white text-arctic-700 border-2 border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <HeartIcon className="w-5 h-5" />
              Donate
            </button>
            <button
              onClick={() => setActiveTab('vote')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'vote'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg scale-105'
                  : 'bg-white text-arctic-700 border-2 border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <CheckBadgeIcon className="w-5 h-5" />
              Vote
            </button>
            <button
              onClick={() => setActiveTab('explore')}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${
                activeTab === 'explore'
                  ? 'bg-gradient-to-r from-arctic-500 to-arctic-600 text-white shadow-lg scale-105'
                  : 'bg-white text-arctic-700 border-2 border-arctic-200 hover:border-arctic-400'
              }`}
            >
              <MapIcon className="w-5 h-5" />
              Explore
            </button>
          </div>

          {/* Tab Content */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-xl border-2 border-arctic-100 min-h-[400px]">
            {activeTab === 'donate' && (
              <motion.div
                key="donate"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-arctic-900 mb-4">Make a Difference</h3>
                <p className="text-lg text-ice-700 mb-6 leading-relaxed">
                  Choose from our verified New Zealand charities and make a donation with complete transparency.
                  Every dollar is tracked on the blockchain, and you'll receive an IRD-compliant tax receipt instantly.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold">1</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Select a Charity</h4>
                      <p className="text-ice-600 text-sm">Browse verified organizations and choose one that aligns with your values.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold">2</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Choose Your Amount</h4>
                      <p className="text-ice-600 text-sm">Donate any amount via secure X402 payment processing.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold">3</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Track Your Impact</h4>
                      <p className="text-ice-600 text-sm">Watch your donation appear on-chain and see exactly how it's being used.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-arctic-600 font-bold">4</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Earn XP & Influence</h4>
                      <p className="text-ice-600 text-sm">Gain experience points and voting power in our governance system.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to={isAuthenticated ? '/donate' : '/signup'}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
                >
                  <span>Start Donating</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            )}

            {activeTab === 'vote' && (
              <motion.div
                key="vote"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-arctic-900 mb-4">Shape the Future</h3>
                <p className="text-lg text-ice-700 mb-6 leading-relaxed">
                  As a donor, you earn voting power to influence how Isbjörn Foundation distributes validator revenue.
                  Participate in community governance and decide which nonprofits receive funding from our staking operations.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckBadgeIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Community Treasury</h4>
                      <p className="text-ice-600 text-sm">View total funds, staked amounts, and available grants in real-time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckBadgeIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Active Proposals</h4>
                      <p className="text-ice-600 text-sm">Vote on nonprofit funding requests and network infrastructure changes.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckBadgeIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Earn XP</h4>
                      <p className="text-ice-600 text-sm">Gain 10 XP for every vote cast and level up to unlock special badges.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <CheckBadgeIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Decision History</h4>
                      <p className="text-ice-600 text-sm">Review past proposals and see how community votes shaped distributions.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/vote"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
                >
                  <span>Join Governance</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            )}

            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <h3 className="text-3xl font-bold text-arctic-900 mb-4">Track Global Impact</h3>
                <p className="text-lg text-ice-700 mb-6 leading-relaxed">
                  Visualize the flow of charitable giving across the globe. Our interactive map shows real-time transactions,
                  active validators on both Iggy L1 and Avalanche P-Chain, and the geographic reach of every donation.
                </p>

                <div className="grid md:grid-cols-2 gap-6 mb-8">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Live Transactions</h4>
                      <p className="text-ice-600 text-sm">Watch donations flow from New Zealand to charities around the world.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Validator Networks</h4>
                      <p className="text-ice-600 text-sm">See active validators on Iggy L1 and P-Chain maintaining the network.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Climate Zones</h4>
                      <p className="text-ice-600 text-sm">Explore how donations support conservation across different climate regions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapIcon className="w-5 h-5 text-arctic-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-arctic-900 mb-1">Upvote Events</h4>
                      <p className="text-ice-600 text-sm">Discover and support conservation events happening around the world.</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/map"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-arctic-500 to-arctic-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all hover:scale-105"
                >
                  <span>View Impact Map</span>
                  <ArrowRightIcon className="w-5 h-5" />
                </Link>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-arctic-500 to-arctic-600 rounded-3xl p-12 shadow-2xl"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Make an Impact?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join New Zealand's first blockchain-powered charitable giving platform
          </p>
          <Link
            to={isAuthenticated ? '/donate' : '/signup'}
            className="inline-flex items-center gap-2 bg-white text-arctic-600 px-10 py-5 rounded-xl font-bold text-lg hover:shadow-xl transition-all hover:scale-105"
          >
            <span>Get Started Today</span>
            <ArrowRightIcon className="w-6 h-6" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default HomePage;

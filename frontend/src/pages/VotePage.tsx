import React, { useState, useEffect } from 'react';
import { apiService } from '@/services/api';
import { motion } from 'framer-motion';
import {
  ServerIcon,
  BanknotesIcon,
  UserGroupIcon,
  TrophyIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import NetworkMap from '@/components/NetworkMap';

interface TreasuryStats {
  totalFunds: number;
  stakedToValidators: number;
  availableForGrants: number;
  monthlyRevenue: number;
  totalDistributed: number;
}

interface Proposal {
  id: string;
  type: 'node-network' | 'nonprofit-funding' | 'governance';
  title: string;
  description: string;
  proposer: string;
  createdAt: Date;
  votingEnds: Date;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  requiredVotes: number;
  category: string;
}

interface UserVoteStats {
  votingPower: number;
  totalVotes: number;
  xpEarned: number;
  level: number;
  nextLevelXp: number;
}

const VotePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [treasury, setTreasury] = useState<TreasuryStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [userStats, setUserStats] = useState<UserVoteStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'active' | 'history' | 'treasury'>('active');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Mock data - replace with actual API calls
        setTreasury({
          totalFunds: 125000,
          stakedToValidators: 85000,
          availableForGrants: 40000,
          monthlyRevenue: 8500,
          totalDistributed: 52000
        });

        setProposals([
          {
            id: '1',
            type: 'nonprofit-funding',
            title: 'Fund Marine Conservation Project',
            description: 'Allocate $15,000 to support coral reef restoration in the Pacific',
            proposer: 'Community Member',
            createdAt: new Date('2024-01-15'),
            votingEnds: new Date('2024-01-22'),
            votesFor: 450,
            votesAgainst: 120,
            status: 'active',
            requiredVotes: 500,
            category: 'Environment'
          },
          {
            id: '2',
            type: 'node-network',
            title: 'Add New Validator in EU Region',
            description: 'Deploy additional validator node in Europe for improved network resilience',
            proposer: 'Network Team',
            createdAt: new Date('2024-01-14'),
            votingEnds: new Date('2024-01-21'),
            votesFor: 380,
            votesAgainst: 90,
            status: 'active',
            requiredVotes: 500,
            category: 'Infrastructure'
          }
        ]);

        if (isAuthenticated) {
          setUserStats({
            votingPower: 150,
            totalVotes: 23,
            xpEarned: 2300,
            level: 5,
            nextLevelXp: 3000
          });
        }
      } catch (err) {
        console.error('Error fetching vote data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  const handleVote = (proposalId: string, support: boolean) => {
    if (!isAuthenticated) {
      alert('Please login to vote');
      return;
    }
    // Implement voting logic
    console.log(`Voting ${support ? 'for' : 'against'} proposal ${proposalId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-arctic-500 mx-auto mb-4"></div>
          <p className="text-ice-700 font-semibold text-lg">Loading governance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-ice-900 mb-3">Community Governance</h1>
          <p className="text-ice-600 text-lg max-w-3xl mx-auto">
            Vote on nonprofit funding, node network changes, and earn XP by participating in community decisions
          </p>
        </div>

        {/* Treasury Overview */}
        <div className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-2xl shadow-lg p-8 mb-8 text-white">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Isbjörn Foundation Treasury</h2>
              <p className="text-arctic-100">Where the money is and how it's being used</p>
            </div>
            <BanknotesIcon className="w-12 h-12 text-arctic-200" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-arctic-700/50 rounded-xl p-4">
              <div className="text-arctic-200 text-sm mb-1">Total Funds</div>
              <div className="text-3xl font-bold">${treasury?.totalFunds.toLocaleString()}</div>
              <div className="text-arctic-200 text-xs">Community assets</div>
            </div>
            <div className="bg-arctic-700/50 rounded-xl p-4">
              <div className="text-arctic-200 text-sm mb-1">Staked to Validators</div>
              <div className="text-3xl font-bold">${treasury?.stakedToValidators.toLocaleString()}</div>
              <div className="text-arctic-200 text-xs">Generating revenue</div>
            </div>
            <div className="bg-arctic-700/50 rounded-xl p-4">
              <div className="text-arctic-200 text-sm mb-1">Available for Grants</div>
              <div className="text-3xl font-bold">${treasury?.availableForGrants.toLocaleString()}</div>
              <div className="text-arctic-200 text-xs">Ready to deploy</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-arctic-700/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-arctic-200 text-sm">Monthly Revenue</div>
                <div className="text-2xl font-bold">${treasury?.monthlyRevenue.toLocaleString()}</div>
              </div>
              <ArrowTrendingUpIcon className="w-8 h-8 text-green-400" />
            </div>
            <div className="bg-arctic-700/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-arctic-200 text-sm">Total Distributed</div>
                <div className="text-2xl font-bold">${treasury?.totalDistributed.toLocaleString()}</div>
              </div>
              <CheckCircleIcon className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        {/* User Stats (if authenticated) */}
        {isAuthenticated && userStats && (
          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-ice-100">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <TrophyIcon className="w-8 h-8 text-yellow-500" />
                <div>
                  <h3 className="text-xl font-bold text-ice-900">Level {userStats.level} Voter</h3>
                  <p className="text-sm text-ice-600">Earn XP by participating in governance</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-arctic-600">{userStats.xpEarned} XP</div>
                <div className="text-xs text-ice-600">{userStats.nextLevelXp - userStats.xpEarned} to Level {userStats.level + 1}</div>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-ice-600">Progress to next level</span>
                <span className="font-semibold text-ice-900">{Math.round((userStats.xpEarned / userStats.nextLevelXp) * 100)}%</span>
              </div>
              <div className="w-full bg-ice-200 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-arctic-500 to-arctic-600 h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${(userStats.xpEarned / userStats.nextLevelXp) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-ice-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-arctic-600">{userStats.votingPower}</div>
                <div className="text-xs text-ice-600">Voting Power</div>
              </div>
              <div className="bg-ice-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-arctic-600">{userStats.totalVotes}</div>
                <div className="text-xs text-ice-600">Votes Cast</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-2 mb-6 border-b border-ice-200">
          <button
            onClick={() => setSelectedTab('active')}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === 'active'
                ? 'text-arctic-600 border-b-2 border-arctic-600'
                : 'text-ice-600 hover:text-ice-900'
            }`}
          >
            Active Proposals
          </button>
          <button
            onClick={() => setSelectedTab('history')}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === 'history'
                ? 'text-arctic-600 border-b-2 border-arctic-600'
                : 'text-ice-600 hover:text-ice-900'
            }`}
          >
            Decision History
          </button>
          <button
            onClick={() => setSelectedTab('treasury')}
            className={`px-6 py-3 font-semibold transition-all ${
              selectedTab === 'treasury'
                ? 'text-arctic-600 border-b-2 border-arctic-600'
                : 'text-ice-600 hover:text-ice-900'
            }`}
          >
            Network Infrastructure
          </button>
        </div>

        {/* Active Proposals */}
        {selectedTab === 'active' && (
          <div className="space-y-6">
            {proposals.filter(p => p.status === 'active').map((proposal) => (
              <motion.div
                key={proposal.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6 border border-ice-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        proposal.type === 'nonprofit-funding'
                          ? 'bg-green-100 text-green-800'
                          : proposal.type === 'node-network'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {proposal.category}
                      </span>
                      <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold flex items-center space-x-1">
                        <ClockIcon className="w-3 h-3" />
                        <span>Ends {new Date(proposal.votingEnds).toLocaleDateString()}</span>
                      </span>
                    </div>
                    <h3 className="text-2xl font-bold text-ice-900 mb-2">{proposal.title}</h3>
                    <p className="text-ice-600 mb-4">{proposal.description}</p>
                    <div className="text-sm text-ice-500">
                      Proposed by {proposal.proposer} on {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Voting Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-green-600 font-semibold">For: {proposal.votesFor}</span>
                    <span className="text-red-600 font-semibold">Against: {proposal.votesAgainst}</span>
                  </div>
                  <div className="w-full bg-ice-200 rounded-full h-4 overflow-hidden flex">
                    <div
                      className="bg-green-500 h-4"
                      style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                    ></div>
                    <div
                      className="bg-red-500 h-4"
                      style={{ width: `${(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-ice-600 mt-1 text-center">
                    {proposal.votesFor + proposal.votesAgainst} / {proposal.requiredVotes} votes required
                  </div>
                </div>

                {/* Vote Buttons */}
                {isAuthenticated ? (
                  <div className="flex space-x-4">
                    <button
                      onClick={() => handleVote(proposal.id, true)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      <span>Vote For</span>
                      <span className="text-xs opacity-80">(+10 XP)</span>
                    </button>
                    <button
                      onClick={() => handleVote(proposal.id, false)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      <span>Vote Against</span>
                      <span className="text-xs opacity-80">(+10 XP)</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center bg-ice-50 rounded-lg p-4">
                    <p className="text-ice-600">
                      <a href="/login" className="text-arctic-600 font-semibold hover:underline">Login</a> to vote and earn XP
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}

        {/* Network Infrastructure Tab */}
        {selectedTab === 'treasury' && (
          <div className="space-y-8">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-ice-100">
              <h2 className="text-2xl font-bold text-ice-900 mb-4">Network Infrastructure</h2>
              <p className="text-ice-600 mb-6">
                Our validators secure the Iggy L1 blockchain and Avalanche P-Chain. Revenue from validation
                rewards funds nonprofit support as decided by community voting.
              </p>
            </div>
            <NetworkMap network="iggy-l1" />
            <NetworkMap network="p-chain" />
          </div>
        )}

        {/* History Tab */}
        {selectedTab === 'history' && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-ice-100">
            <h2 className="text-2xl font-bold text-ice-900 mb-6">Recent Community Decisions</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-ice-900">Fund Wildlife Rescue Center - PASSED</span>
                </div>
                <p className="text-sm text-ice-600">$12,000 allocated • Voted Jan 10, 2024</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="font-semibold text-ice-900">Deploy Asia-Pacific Validator - PASSED</span>
                </div>
                <p className="text-sm text-ice-600">Network expansion approved • Voted Jan 8, 2024</p>
              </div>
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <div className="flex items-center space-x-2 mb-1">
                  <XCircleIcon className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-ice-900">Increase Admin Fees - REJECTED</span>
                </div>
                <p className="text-sm text-ice-600">Community voted to maintain current fees • Voted Jan 5, 2024</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VotePage;

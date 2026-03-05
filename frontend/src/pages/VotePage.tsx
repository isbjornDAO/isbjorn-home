import React, { useState, useEffect } from 'react';
import {
  ServerIcon,
  BanknotesIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import image0 from '@/assets/image0.jpg';
// Local logo imports
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import rainforestLogo from '@/assets/logos/rainforest.jpg';
import sierraClubLogo from '@/assets/logos/sierra-club.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

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

interface CharityDAO {
  id: string;
  name: string;
  activeProposals: number;
  totalProposals: number;
  followers: number;
  logoUrl?: string;
}

const VotePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [treasury, setTreasury] = useState<TreasuryStats | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [charityDAOs, setCharityDAOs] = useState<CharityDAO[]>([]);
  const [selectedDAO, setSelectedDAO] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

        setCharityDAOs([
          { id: 'pbi', name: 'Polar Bears International', activeProposals: 2, totalProposals: 16, followers: 42000, logoUrl: pbiLogo },
          { id: 'wwf-uk', name: 'WWF UK', activeProposals: 1, totalProposals: 12, followers: 157000, logoUrl: wwfLogo },
          { id: 'wwf-japan', name: 'WWF Japan', activeProposals: 1, totalProposals: 10, followers: 890, logoUrl: wwfLogo },
          { id: 'greenpeace', name: 'Greenpeace', activeProposals: 2, totalProposals: 15, followers: 35000, logoUrl: greenpeaceLogo },
          { id: 'ocean-conservancy', name: 'Ocean Conservancy', activeProposals: 2, totalProposals: 12, followers: 28000, logoUrl: oceanConservancyLogo },
          { id: 'the-nature-conservancy', name: 'The Nature Conservancy', activeProposals: 3, totalProposals: 20, followers: 5600, logoUrl: natureConservancyLogo },
          { id: 'conservation-intl', name: 'Conservation International', activeProposals: 4, totalProposals: 18, followers: 32000, logoUrl: conservationIntlLogo },
          { id: 'sierra-club', name: 'Sierra Club', activeProposals: 1, totalProposals: 9, followers: 14000, logoUrl: sierraClubLogo },
          { id: 'rainforest-alliance', name: 'Rainforest Alliance', activeProposals: 1, totalProposals: 7, followers: 1200, logoUrl: rainforestLogo },
        ]);

        setProposals([
          {
            id: '1',
            type: 'nonprofit-funding',
            title: 'Fund Marine Conservation Project',
            description: 'Allocate $15,000 to support coral reef restoration in the Pacific',
            proposer: 'WWF UK',
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
            title: 'Expand Arctic Research Stations',
            description: 'Deploy additional monitoring equipment in Svalbard for climate research',
            proposer: 'NRDC',
            createdAt: new Date('2024-01-14'),
            votingEnds: new Date('2024-01-21'),
            votesFor: 380,
            votesAgainst: 90,
            status: 'active',
            requiredVotes: 500,
            category: 'Climate'
          },
          {
            id: '3',
            type: 'nonprofit-funding',
            title: 'Rainforest Protection Initiative',
            description: 'Fund protection of 1000 acres in Amazon rainforest',
            proposer: 'Greenpeace',
            createdAt: new Date('2024-01-13'),
            votingEnds: new Date('2024-01-20'),
            votesFor: 520,
            votesAgainst: 80,
            status: 'active',
            requiredVotes: 500,
            category: 'Forest'
          }
        ]);
      } catch (err) {
        console.error('Error fetching vote data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-ice-900 mb-1">Decide on the next mission</h1>
          <p className="text-ice-600">Climate mission proposals funded by locked donation nodes</p>
        </div>

        {/* Governance Flow Illustration */}
        <div className="w-full max-w-2xl mx-auto mb-10 overflow-hidden rounded-xl border border-ice-200 shadow-lg">
          <img
            src={image0}
            alt="Governance flow: Discussion, Proposals, Voting, Execution, Review"
            className="w-full h-auto object-cover"
          />
        </div>

        {/* Node Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {/* Validator Nodes */}
          <div className="bg-white rounded-lg shadow-sm border border-ice-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-arctic-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ServerIcon className="w-6 h-6 text-arctic-600" />
              </div>
              <div>
                <div className="text-sm text-ice-600">Validator Nodes</div>
                <div className="text-2xl font-bold text-ice-900">8</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-ice-600">New Locked Validator</span>
                <span className="font-semibold text-ice-900">1,450 / 2,000 AVAX</span>
              </div>
              <div className="w-full bg-ice-200 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-arctic-500 to-arctic-600 h-2 rounded-full" style={{ width: '72.5%' }}></div>
              </div>
              <div className="text-xs text-ice-500 text-right">550 AVAX remaining</div>
            </div>
          </div>

          {/* Total Revenue */}
          <div className="bg-white rounded-lg shadow-sm border border-ice-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <BanknotesIcon className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-ice-600">Total Revenue</div>
                <div className="text-2xl font-bold text-ice-900">$102,000</div>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-ice-600">From validator revenue</span>
              </div>
              <div className="pt-2 border-t border-ice-100 flex justify-between items-center">
                <span className="text-xs text-ice-600">Total Transactions</span>
                <span className="text-base font-bold text-ice-900">24,582</span>
              </div>
            </div>
          </div>

          {/* ROI */}
          <div className="bg-white rounded-lg shadow-sm border border-ice-100 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <ChartBarIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-ice-600">ROI per Node/Year</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-ice-50 rounded-lg p-2 border border-ice-100">
                <div className="text-xs text-ice-600 mb-1">P-Chain</div>
                <div className="text-xl font-bold text-green-600">7.2%</div>
              </div>
              <div className="bg-ice-50 rounded-lg p-2 border border-ice-100">
                <div className="text-xs text-ice-600 mb-1">Iggy L1</div>
                <div className="text-xl font-bold text-green-600">8.5%</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Non-Profit DAOs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-ice-100">
              <div className="border-b border-ice-100 p-4">
                <h2 className="text-lg font-bold text-ice-900">Non-Profit DAOs</h2>
              </div>

              {/* Table Header */}
              <div className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ice-100 text-xs font-semibold text-ice-600">
                <div className="col-span-6">Name</div>
                <div className="col-span-2 text-center">Active</div>
                <div className="col-span-2 text-center">Proposals</div>
                <div className="col-span-2 text-center">Followers</div>
              </div>

              {/* DAO List */}
              <div>
                {charityDAOs.map((dao) => (
                  <div
                    key={dao.id}
                    onClick={() => setSelectedDAO(dao.id)}
                    className="grid grid-cols-12 gap-4 px-4 py-3 border-b border-ice-50 hover:bg-ice-50 cursor-pointer transition-colors"
                  >
                    <div className="col-span-6 flex items-center gap-3">
                      {dao.logoUrl ? (
                        <img src={dao.logoUrl} alt={dao.name} className="w-8 h-8 rounded-full object-contain bg-white border border-ice-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-arctic-100 flex items-center justify-center">
                          <span className="text-xs font-bold text-arctic-600">{dao.name.charAt(0)}</span>
                        </div>
                      )}
                      <span className="font-semibold text-ice-900">{dao.name}</span>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center">
                      <span className="text-sm font-bold text-ice-900">{dao.activeProposals}</span>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center">
                      <span className="text-sm text-ice-600">{dao.totalProposals}</span>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center">
                      <span className="text-sm text-ice-600">{formatNumber(dao.followers)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Latest Proposals */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-ice-100">
              <div className="border-b border-ice-100 p-4">
                <h2 className="text-lg font-bold text-ice-900">Latest Proposals</h2>
              </div>
              <div className="p-4 space-y-3">
                {proposals.slice(0, 5).map((proposal) => (
                  <div key={proposal.id} className="pb-3 border-b border-ice-50 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${proposal.type === 'nonprofit-funding'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                        }`}>
                        {proposal.category}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-ice-900 mb-1">{proposal.title}</h3>
                    <div className="text-xs text-ice-500">by {proposal.proposer}</div>
                    <div className="flex items-center gap-2 mt-2 text-xs">
                      <span className="text-green-600 font-semibold">{proposal.votesFor}</span>
                      <div className="flex-1 bg-ice-200 rounded-full h-1 overflow-hidden flex">
                        <div
                          className="bg-green-500 h-1"
                          style={{ width: `${(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-red-600 font-semibold">{proposal.votesAgainst}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VotePage;

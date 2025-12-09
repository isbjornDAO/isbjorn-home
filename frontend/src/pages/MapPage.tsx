import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface Proposal {
  id: string;
  nonprofitId: string;
  nonprofitName: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  votes: number;
  location: { lat: number; lng: number };
  deadline: Date;
  category: string;
  image: string;
}

interface Activity {
  id: string;
  nonprofitName: string;
  action: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  amount?: number;
}

interface Transaction {
  id: string;
  nonprofitName: string;
  from: string;
  to: string;
  amount: number;
  purpose: string;
  timestamp: Date;
  txHash: string;
  verified: boolean;
}

interface DAOAllocation {
  nonprofitName: string;
  totalFunds: number;
  allocations: {
    category: string;
    amount: number;
    percentage: number;
    spent: number;
    transactions: number;
  }[];
}

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [daoAllocations, setDaoAllocations] = useState<DAOAllocation[]>([]);
  const [userVotingPower, setUserVotingPower] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'activity' | 'transparency' | 'dao'>('map');

  // Mock data initialization
  useEffect(() => {
    // Calculate user voting power (1 vote per day active, mock calculation)
    const daysActive = user ? Math.floor(Math.random() * 90) + 1 : 0;
    setUserVotingPower(daysActive);

    // Mock proposals
    const mockProposals: Proposal[] = [
      {
        id: '1',
        nonprofitId: 'wv',
        nonprofitName: 'World Vision',
        title: 'Clean Water Project - Tanzania',
        description: 'Install 50 water wells in rural Tanzania to provide clean drinking water to 10,000 families',
        goal: 250000,
        raised: 180000,
        votes: 1247,
        location: { lat: -6.369028, lng: 34.888822 },
        deadline: new Date('2025-03-15'),
        category: 'Water & Sanitation',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
      },
      {
        id: '2',
        nonprofitId: 'rc',
        nonprofitName: 'Red Cross NZ',
        title: 'Disaster Relief - Pacific Islands',
        description: 'Emergency response fund for cyclone victims in Fiji and Tonga',
        goal: 500000,
        raised: 320000,
        votes: 892,
        location: { lat: -18.1416, lng: 178.4419 },
        deadline: new Date('2025-02-28'),
        category: 'Disaster Relief',
        image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400'
      },
      {
        id: '3',
        nonprofitId: 'sf',
        nonprofitName: 'Starship Foundation',
        title: 'Pediatric Cancer Research',
        description: 'Fund groundbreaking research into childhood leukemia treatments',
        goal: 1000000,
        raised: 450000,
        votes: 2103,
        location: { lat: -36.8485, lng: 174.7633 },
        deadline: new Date('2025-06-30'),
        category: 'Healthcare',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400'
      },
      {
        id: '4',
        nonprofitId: 'fb',
        nonprofitName: 'Forest & Bird',
        title: 'Kakapo Conservation Program',
        description: 'Protect and expand habitats for NZ\'s endangered kakapo population',
        goal: 300000,
        raised: 195000,
        votes: 1567,
        location: { lat: -45.0312, lng: 168.6626 },
        deadline: new Date('2025-05-20'),
        category: 'Wildlife Conservation',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400'
      },
      {
        id: '5',
        nonprofitId: 'uc',
        nonprofitName: 'UNICEF',
        title: 'Education Access - Southeast Asia',
        description: 'Build 20 schools in rural Vietnam and Cambodia to educate 5,000 children',
        goal: 750000,
        raised: 420000,
        votes: 1834,
        location: { lat: 14.0583, lng: 108.2772 },
        deadline: new Date('2025-08-15'),
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
      }
    ];

    // Mock recent activities
    const mockActivities: Activity[] = [
      {
        id: 'a1',
        nonprofitName: 'World Vision',
        action: 'Completed well installation in Dodoma village',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        location: { lat: -6.369028, lng: 34.888822 }
      },
      {
        id: 'a2',
        nonprofitName: 'Red Cross NZ',
        action: 'Distributed 500 emergency kits in Fiji',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        location: { lat: -18.1416, lng: 178.4419 },
        amount: 45000
      },
      {
        id: 'a3',
        nonprofitName: 'Starship Foundation',
        action: 'Published new research findings on treatment protocol',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        location: { lat: -36.8485, lng: 174.7633 }
      },
      {
        id: 'a4',
        nonprofitName: 'Forest & Bird',
        action: 'Released 3 kakapo chicks into protected habitat',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        location: { lat: -45.0312, lng: 168.6626 }
      },
      {
        id: 'a5',
        nonprofitName: 'UNICEF',
        action: 'Opened new school in Mekong Delta region',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        location: { lat: 14.0583, lng: 108.2772 },
        amount: 85000
      }
    ];

    // Mock transparent transactions
    const mockTransactions: Transaction[] = [
      {
        id: 't1',
        nonprofitName: 'World Vision',
        from: 'Donation Pool',
        to: 'Tanzania Water Project',
        amount: 25000,
        purpose: 'Well drilling equipment',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        txHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
        verified: true
      },
      {
        id: 't2',
        nonprofitName: 'Red Cross NZ',
        from: 'Emergency Fund',
        to: 'Fiji Relief Operations',
        amount: 50000,
        purpose: 'Medical supplies and temporary shelter',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        txHash: '0x8a1bc2e3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        verified: true
      },
      {
        id: 't3',
        nonprofitName: 'Starship Foundation',
        from: 'Research Fund',
        to: 'Clinical Trial Phase 2',
        amount: 120000,
        purpose: 'Drug development and patient trials',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
        verified: true
      },
      {
        id: 't4',
        nonprofitName: 'Forest & Bird',
        from: 'Conservation Fund',
        to: 'Kakapo Habitat Expansion',
        amount: 35000,
        purpose: 'Land acquisition and habitat restoration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
        verified: true
      }
    ];

    // Mock DAO allocations
    const mockDAOAllocations: DAOAllocation[] = [
      {
        nonprofitName: 'World Vision',
        totalFunds: 180000,
        allocations: [
          { category: 'Infrastructure', amount: 90000, percentage: 50, spent: 65000, transactions: 12 },
          { category: 'Community Training', amount: 36000, percentage: 20, spent: 28000, transactions: 8 },
          { category: 'Maintenance', amount: 27000, percentage: 15, spent: 12000, transactions: 5 },
          { category: 'Administration', amount: 18000, percentage: 10, spent: 15000, transactions: 15 },
          { category: 'Emergency Reserve', amount: 9000, percentage: 5, spent: 0, transactions: 0 }
        ]
      },
      {
        nonprofitName: 'Red Cross NZ',
        totalFunds: 320000,
        allocations: [
          { category: 'Emergency Supplies', amount: 128000, percentage: 40, spent: 95000, transactions: 25 },
          { category: 'Medical Aid', amount: 96000, percentage: 30, spent: 78000, transactions: 18 },
          { category: 'Logistics', amount: 64000, percentage: 20, spent: 52000, transactions: 12 },
          { category: 'Staff & Training', amount: 32000, percentage: 10, spent: 28000, transactions: 8 }
        ]
      },
      {
        nonprofitName: 'Starship Foundation',
        totalFunds: 450000,
        allocations: [
          { category: 'Research & Development', amount: 270000, percentage: 60, spent: 185000, transactions: 6 },
          { category: 'Clinical Trials', amount: 90000, percentage: 20, spent: 45000, transactions: 4 },
          { category: 'Equipment', amount: 54000, percentage: 12, spent: 38000, transactions: 7 },
          { category: 'Patient Support', amount: 36000, percentage: 8, spent: 29000, transactions: 22 }
        ]
      }
    ];

    setProposals(mockProposals);
    setActivities(mockActivities);
    setTransactions(mockTransactions);
    setDaoAllocations(mockDAOAllocations);

    // Simulate real-time activity updates
    const interval = setInterval(() => {
      const randomActivity: Activity = {
        id: `a${Date.now()}`,
        nonprofitName: mockProposals[Math.floor(Math.random() * mockProposals.length)].nonprofitName,
        action: [
          'Updated project milestone',
          'Received new donation',
          'Completed distribution',
          'Shared impact report',
          'Posted community update'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(),
        location: mockProposals[Math.floor(Math.random() * mockProposals.length)].location,
        amount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 1000 : undefined
      };

      setActivities(prev => [randomActivity, ...prev.slice(0, 9)]);
    }, 15000); // New activity every 15 seconds

    return () => clearInterval(interval);
  }, [user]);

  const handleVote = (proposalId: string) => {
    if (userVotingPower <= 0) {
      alert('You have no voting power left! Stay active to earn more votes.');
      return;
    }

    setProposals(prev =>
      prev.map(p =>
        p.id === proposalId ? { ...p, votes: p.votes + 1 } : p
      )
    );
    setUserVotingPower(prev => prev - 1);
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="text-4xl">🗺️</span>
                Map
              </h1>
              <p className="text-gray-600 mt-1">Track missions, vote on proposals, and see transparent fund allocation</p>
            </div>
            <div className="bg-arctic-50 px-6 py-3 rounded-xl border-2 border-arctic-200">
              <div className="text-sm text-gray-600">Your Voting Power</div>
              <div className="text-3xl font-bold text-arctic-600">{userVotingPower}</div>
              <div className="text-xs text-gray-500 mt-1">
                {user ? `${Math.floor(Math.random() * 90) + 1} days active` : 'Login to vote'}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden" style={{ height: '600px' }}>
              <MapContainer
                center={[0, 20]}
                zoom={2}
                style={{ height: '100%', width: '100%' }}
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {proposals.map(proposal => (
                  <React.Fragment key={proposal.id}>
                    <Marker
                      position={[proposal.location.lat, proposal.location.lng]}
                      eventHandlers={{
                        click: () => setSelectedProposal(proposal)
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h3 className="font-bold text-sm">{proposal.nonprofitName}</h3>
                          <p className="text-xs text-gray-600 mt-1">{proposal.title}</p>
                          <p className="text-xs text-arctic-600 font-semibold mt-2">
                            {proposal.votes} votes
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                    <Circle
                      center={[proposal.location.lat, proposal.location.lng]}
                      radius={100000 * (proposal.votes / 1000)}
                      pathOptions={{
                        color: '#3b82f6',
                        fillColor: '#60a5fa',
                        fillOpacity: 0.2
                      }}
                    />
                  </React.Fragment>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="space-y-4">
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="flex border-b border-gray-200">
                {(['map', 'activity', 'transparency', 'dao'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 px-3 py-3 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === tab
                        ? 'border-arctic-500 text-arctic-600 bg-arctic-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {tab === 'map' && '🗺️ Map'}
                    {tab === 'activity' && '📡 Activity'}
                    {tab === 'transparency' && '🔍 Transparency'}
                    {tab === 'dao' && '⚖️ DAO'}
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* Map Tab - Shows Proposals */}
              {activeTab === 'map' && (
                <motion.div
                  key="map"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {proposals.map(proposal => (
                    <motion.div
                      key={proposal.id}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={proposal.image}
                        alt={proposal.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-arctic-600 bg-arctic-50 px-2 py-1 rounded">
                            {proposal.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.ceil((proposal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900">{proposal.nonprofitName}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{proposal.title}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{formatCurrency(proposal.raised)}</span>
                            <span>{formatCurrency(proposal.goal)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-arctic-500 to-arctic-600 h-2 rounded-full"
                              style={{ width: `${(proposal.raised / proposal.goal) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-600">
                            🗳️ {proposal.votes.toLocaleString()} votes
                          </div>
                          <button
                            onClick={() => handleVote(proposal.id)}
                            disabled={userVotingPower <= 0}
                            className="bg-arctic-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-arctic-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Vote
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <motion.div
                  key="activity"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-lg p-4"
                >
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                    <span className="animate-pulse mr-2">🔴</span> Live Activity Feed
                  </h3>
                  <div className="space-y-3 max-h-[520px] overflow-y-auto">
                    {activities.map(activity => (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border-l-4 border-arctic-500 pl-3 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-gray-900">{activity.nonprofitName}</p>
                            <p className="text-xs text-gray-600 mt-1">{activity.action}</p>
                            {activity.amount && (
                              <p className="text-xs text-green-600 font-semibold mt-1">
                                💰 {formatCurrency(activity.amount)}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Transparency Tab */}
              {activeTab === 'transparency' && (
                <motion.div
                  key="transparency"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-white rounded-xl shadow-lg p-4"
                >
                  <h3 className="font-bold text-gray-900 mb-4">🔍 Verified Transactions</h3>
                  <div className="space-y-4 max-h-[520px] overflow-y-auto">
                    {transactions.map(tx => (
                      <div key={tx.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-arctic-600">{tx.nonprofitName}</span>
                          {tx.verified && (
                            <span className="text-xs text-green-600 flex items-center">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-gray-500">From:</span>
                            <span className="font-mono text-gray-700">{tx.from}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">To:</span>
                            <span className="font-mono text-gray-700">{tx.to}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-500">Amount:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(tx.amount)}</span>
                          </div>
                          <div className="mt-2">
                            <span className="text-gray-500">Purpose:</span>
                            <p className="text-gray-700 mt-1">{tx.purpose}</p>
                          </div>
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <span className="text-gray-400">TX Hash:</span>
                            <p className="font-mono text-xs text-gray-600 break-all mt-1">
                              {tx.txHash}
                            </p>
                          </div>
                          <div className="text-gray-400 text-right">{formatTimeAgo(tx.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* DAO Tab */}
              {activeTab === 'dao' && (
                <motion.div
                  key="dao"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  {daoAllocations.map(dao => (
                    <div key={dao.nonprofitName} className="bg-white rounded-xl shadow-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900">{dao.nonprofitName}</h3>
                        <span className="text-sm font-semibold text-arctic-600">
                          {formatCurrency(dao.totalFunds)}
                        </span>
                      </div>
                      <div className="space-y-3">
                        {dao.allocations.map(alloc => (
                          <div key={alloc.category}>
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="font-semibold text-gray-700">{alloc.category}</span>
                              <span className="text-gray-500">
                                {alloc.percentage}% • {alloc.transactions} txns
                              </span>
                            </div>
                            <div className="relative w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-arctic-400 to-arctic-500"
                                style={{ width: `${alloc.percentage}%` }}
                              />
                              <div
                                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600"
                                style={{ width: `${(alloc.spent / alloc.amount) * alloc.percentage}%` }}
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-600 mt-1">
                              <span>Spent: {formatCurrency(alloc.spent)}</span>
                              <span>Allocated: {formatCurrency(alloc.amount)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  ChartBarIcon,
  UserGroupIcon,
  BanknotesIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline';

interface CharityLocation {
  id: string;
  name: string;
  location: string;
  position: { x: number; y: number };
  impact: string;
  donations: number;
  votingPower: number;
}

interface TopContributor {
  id: string;
  name: string;
  totalDonated: number;
  votingPower: number;
  impact: string;
}

const MapPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<CharityLocation | null>(null);

  // Mock charity locations across New Zealand
  const charityLocations: CharityLocation[] = [
    {
      id: '1',
      name: 'Red Cross NZ - Auckland',
      location: 'Auckland',
      position: { x: 65, y: 20 },
      impact: '500 families housed',
      donations: 125000,
      votingPower: 30
    },
    {
      id: '2',
      name: 'Forest & Bird - Wellington',
      location: 'Wellington',
      position: { x: 70, y: 60 },
      impact: 'Kakapo population +15%',
      donations: 85000,
      votingPower: 20
    },
    {
      id: '3',
      name: 'UNICEF NZ - Christchurch',
      location: 'Christchurch',
      position: { x: 75, y: 80 },
      impact: '10,000 homes with clean water',
      donations: 95000,
      votingPower: 25
    },
    {
      id: '4',
      name: 'Salvation Army - Hamilton',
      location: 'Hamilton',
      position: { x: 62, y: 30 },
      impact: '200 meals daily',
      donations: 45000,
      votingPower: 12
    },
    {
      id: '5',
      name: 'WWF NZ - Dunedin',
      location: 'Dunedin',
      position: { x: 68, y: 88 },
      impact: '50 hectares restored',
      donations: 38000,
      votingPower: 13
    }
  ];

  // Top contributors with voting power
  const topContributors: TopContributor[] = [
    {
      id: '1',
      name: 'Tech Innovations NZ Ltd',
      totalDonated: 185000,
      votingPower: 35,
      impact: '3 charities supported'
    },
    {
      id: '2',
      name: 'Green Energy Solutions',
      totalDonated: 142000,
      votingPower: 28,
      impact: '5 charities supported'
    },
    {
      id: '3',
      name: 'Pacific Consulting Group',
      totalDonated: 98000,
      votingPower: 19,
      impact: '2 charities supported'
    },
    {
      id: '4',
      name: 'Auckland Software Dev',
      totalDonated: 76000,
      votingPower: 15,
      impact: '4 charities supported'
    },
    {
      id: '5',
      name: 'Individual Contributors',
      totalDonated: 45000,
      votingPower: 3,
      impact: '8 charities supported'
    }
  ];

  const totalDonations = charityLocations.reduce((sum, loc) => sum + loc.donations, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-2xl mb-4 shadow-lg">
            <MapPinIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Impact Map</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Track charitable impact across New Zealand. Voting power is allocated based on contributions to the DAO.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Charity Locations</h2>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BanknotesIcon className="w-5 h-5" />
                  <span className="font-semibold">${(totalDonations / 1000).toFixed(0)}K Total Impact</span>
                </div>
              </div>

              {/* Simple NZ Map Visualization */}
              <div className="relative bg-gradient-to-br from-arctic-50 to-ice-100 rounded-xl overflow-hidden" style={{ height: '500px' }}>
                {/* NZ Map Shape (simplified) */}
                <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M 60,15 L 68,12 L 72,15 L 70,25 L 65,35 L 68,45 L 70,55 L 72,65 L 75,75 L 72,85 L 68,92 L 62,90 L 58,82 L 60,72 L 58,62 L 62,52 L 60,42 L 58,32 L 62,22 Z"
                    fill="currentColor"
                    className="text-arctic-200"
                  />
                </svg>

                {/* Charity Markers */}
                {charityLocations.map((location, index) => (
                  <motion.button
                    key={location.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setSelectedLocation(location)}
                    className={`absolute group cursor-pointer transform -translate-x-1/2 -translate-y-1/2 ${
                      selectedLocation?.id === location.id ? 'z-30' : 'z-20'
                    }`}
                    style={{
                      left: `${location.position.x}%`,
                      top: `${location.position.y}%`
                    }}
                  >
                    {/* Pulse Effect */}
                    <span className="absolute inset-0 w-8 h-8 -m-1 bg-arctic-500 rounded-full opacity-30 animate-ping"></span>

                    {/* Marker */}
                    <div
                      className={`relative w-6 h-6 rounded-full transition-all ${
                        selectedLocation?.id === location.id
                          ? 'bg-arctic-600 scale-150 shadow-lg'
                          : 'bg-arctic-500 group-hover:scale-125 group-hover:bg-arctic-600'
                      }`}
                    >
                      <MapPinIcon className="w-4 h-4 text-white absolute inset-1" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute left-8 top-0 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl z-50">
                      <div className="font-semibold">{location.name}</div>
                      <div className="text-gray-300">${(location.donations / 1000).toFixed(0)}K donated</div>
                      <div className="absolute left-0 top-1/2 -ml-1 w-2 h-2 bg-gray-900 transform -translate-y-1/2 rotate-45"></div>
                    </div>
                  </motion.button>
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Impact Scale</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <div className="w-3 h-3 rounded-full bg-arctic-500"></div>
                    <span>Active Charity</span>
                  </div>
                </div>
              </div>

              {/* Selected Location Details */}
              {selectedLocation && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-gradient-to-br from-arctic-50 to-ice-50 rounded-xl border border-arctic-200"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 mb-1">{selectedLocation.name}</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MapPinIcon className="w-4 h-4" />
                          {selectedLocation.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <BanknotesIcon className="w-4 h-4" />
                          ${(selectedLocation.donations / 1000).toFixed(0)}K donated
                        </div>
                        <div className="flex items-center gap-1">
                          <ChartBarIcon className="w-4 h-4" />
                          {selectedLocation.votingPower}% voting power
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-gray-700">
                        <strong>Impact:</strong> {selectedLocation.impact}
                      </p>
                    </div>
                    <button
                      onClick={() => setSelectedLocation(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Voting Power Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* How Voting Works */}
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">How Voting Works</h3>
              </div>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Contribution-Based:</strong> Your voting power is proportional to your donations to the DAO</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Democratic:</strong> Community votes on fund allocation to verified NZ charities</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckBadgeIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Transparent:</strong> All votes and distributions tracked on-chain</p>
                </div>
              </div>
            </div>

            {/* Top Contributors */}
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Top Contributors</h3>
              </div>
              <div className="space-y-3">
                {topContributors.map((contributor, index) => (
                  <motion.div
                    key={contributor.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-3 bg-gradient-to-r from-ice-50 to-arctic-50 rounded-lg border border-ice-200"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-arctic-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{contributor.name}</span>
                      </div>
                      <span className="text-xs font-bold text-arctic-600">{contributor.votingPower}%</span>
                    </div>
                    <div className="ml-8 text-xs text-gray-600">
                      ${(contributor.totalDonated / 1000).toFixed(0)}K • {contributor.impact}
                    </div>
                    {/* Voting Power Bar */}
                    <div className="ml-8 mt-2 h-1.5 bg-ice-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${contributor.votingPower}%` }}
                        transition={{ delay: index * 0.05 + 0.2, duration: 0.5 }}
                        className="h-full bg-gradient-to-r from-arctic-500 to-arctic-600"
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats Summary */}
            <div className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4">DAO Impact</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100">Total Donations</span>
                  <span className="font-bold text-xl">${(totalDonations / 1000).toFixed(0)}K</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100">Active Charities</span>
                  <span className="font-bold text-xl">{charityLocations.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-arctic-100">DAO Members</span>
                  <span className="font-bold text-xl">{topContributors.length}</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;

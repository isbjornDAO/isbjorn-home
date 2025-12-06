import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  BanknotesIcon,
  HandThumbUpIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'donation' | 'vote' | 'proposal' | 'ranking';
  message: string;
  location: string;
  timestamp: number;
}

interface Node {
  id: string;
  name: string;
  region: string;
  x: number;
  y: number;
  type: 'donor' | 'charity';
}

interface Connection {
  from: Node;
  to: Node;
  amount: number;
}

const MapPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);

  // Regional nodes on NZ map
  const nodes: Node[] = [
    // Charities
    { id: 'c1', name: 'Red Cross', region: 'Auckland', x: 65, y: 22, type: 'charity' },
    { id: 'c2', name: 'Forest & Bird', region: 'Wellington', x: 70, y: 60, type: 'charity' },
    { id: 'c3', name: 'UNICEF NZ', region: 'Christchurch', x: 75, y: 78, type: 'charity' },
    { id: 'c4', name: 'WWF NZ', region: 'Dunedin', x: 68, y: 88, type: 'charity' },
    // Donors
    { id: 'd1', name: 'Tech Co', region: 'Auckland', x: 60, y: 18, type: 'donor' },
    { id: 'd2', name: 'Green Energy', region: 'Wellington', x: 75, y: 56, type: 'donor' },
    { id: 'd3', name: 'Local Business', region: 'Christchurch', x: 80, y: 74, type: 'donor' },
    { id: 'd4', name: 'Individual', region: 'Hamilton', x: 62, y: 28, type: 'donor' },
  ];

  const charities = nodes.filter(n => n.type === 'charity');
  const donors = nodes.filter(n => n.type === 'donor');

  // Mock activity generator
  const activityTemplates = [
    { type: 'donation' as const, template: (donor: string, charity: string, amount: number) =>
      `${donor} donated $${amount.toLocaleString()} to ${charity}` },
    { type: 'vote' as const, template: (voter: string, proposal: string) =>
      `${voter} voted on "${proposal}"` },
    { type: 'proposal' as const, template: (proposer: string, title: string) =>
      `${proposer} proposed "${title}"` },
    { type: 'ranking' as const, template: (charity: string, rank: number) =>
      `${charity} ranked #${rank} this month` },
  ];

  const proposalTitles = [
    'Increase Emergency Relief Funding',
    'Support Wildlife Conservation',
    'Fund Clean Water Initiative',
    'Expand Food Bank Network',
    'Climate Action Project'
  ];

  // Generate random activity
  useEffect(() => {
    const generateActivity = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      let message = '';
      let location = '';

      if (template.type === 'donation') {
        const donor = donors[Math.floor(Math.random() * donors.length)];
        const charity = charities[Math.floor(Math.random() * charities.length)];
        const amount = Math.floor(Math.random() * 50000) + 5000;
        message = template.template(donor.name, charity.name, amount);
        location = donor.region;

        // Add connection animation
        setConnections(prev => [...prev, { from: donor, to: charity, amount }]);
        setTimeout(() => {
          setConnections(prev => prev.slice(1));
        }, 3000);
      } else if (template.type === 'vote') {
        const voter = donors[Math.floor(Math.random() * donors.length)];
        const proposal = proposalTitles[Math.floor(Math.random() * proposalTitles.length)];
        message = template.template(voter.name, proposal);
        location = voter.region;
      } else if (template.type === 'proposal') {
        const proposer = donors[Math.floor(Math.random() * donors.length)];
        const title = proposalTitles[Math.floor(Math.random() * proposalTitles.length)];
        message = template.template(proposer.name, title);
        location = proposer.region;
      } else {
        const charity = charities[Math.floor(Math.random() * charities.length)];
        const rank = Math.floor(Math.random() * 10) + 1;
        message = template.template(charity.name, rank);
        location = charity.region;
      }

      const newActivity: Activity = {
        id: Date.now().toString(),
        type: template.type,
        message,
        location,
        timestamp: Date.now()
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 6));
    };

    // Generate initial activities
    for (let i = 0; i < 3; i++) {
      setTimeout(generateActivity, i * 1000);
    }

    // Continue generating activities
    const interval = setInterval(generateActivity, 4000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'donation': return BanknotesIcon;
      case 'vote': return HandThumbUpIcon;
      case 'proposal': return DocumentTextIcon;
      case 'ranking': return ChartBarIcon;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'donation': return 'from-green-400 to-green-600';
      case 'vote': return 'from-blue-400 to-blue-600';
      case 'proposal': return 'from-purple-400 to-purple-600';
      case 'ranking': return 'from-yellow-400 to-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-2xl mb-4 shadow-lg">
            <MapPinIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">DAO Activity Map</h1>
          <p className="text-lg text-gray-600">
            Live view of donations, voting, proposals, and rankings across New Zealand
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Visualization */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6 lg:p-8">
              <div className="relative bg-gradient-to-br from-arctic-50 to-ice-100 rounded-xl overflow-hidden" style={{ height: '600px' }}>
                {/* Flat NZ Map Shape */}
                <svg className="absolute inset-0 w-full h-full opacity-15" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
                  {/* Simplified flat NZ silhouette */}
                  <path
                    d="M 58,10 L 68,8 L 72,12 L 70,22 L 65,32 L 68,42 L 70,52 L 72,62 L 75,72 L 72,82 L 68,90 L 62,88 L 58,80 L 60,70 L 58,60 L 62,50 L 60,40 L 58,30 L 62,20 Z"
                    fill="currentColor"
                    className="text-arctic-300"
                    stroke="currentColor"
                    strokeWidth="0.5"
                  />
                </svg>

                {/* Animated Connection Lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  <AnimatePresence>
                    {connections.map((conn, idx) => (
                      <motion.line
                        key={`${conn.from.id}-${conn.to.id}-${idx}`}
                        x1={`${conn.from.x}%`}
                        y1={`${conn.from.y}%`}
                        x2={`${conn.to.x}%`}
                        y2={`${conn.to.y}%`}
                        stroke="url(#gradient)"
                        strokeWidth="2"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                      />
                    ))}
                  </AnimatePresence>
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
                    </linearGradient>
                  </defs>
                </svg>

                {/* Nodes */}
                {nodes.map((node, index) => (
                  <motion.div
                    key={node.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                  >
                    {/* Pulse effect */}
                    <motion.span
                      className={`absolute inset-0 w-8 h-8 -m-2 rounded-full ${
                        node.type === 'charity' ? 'bg-green-500' : 'bg-blue-500'
                      } opacity-20`}
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />

                    {/* Node circle */}
                    <div
                      className={`relative w-4 h-4 rounded-full shadow-lg ${
                        node.type === 'charity'
                          ? 'bg-gradient-to-br from-green-400 to-green-600'
                          : 'bg-gradient-to-br from-blue-400 to-blue-600'
                      }`}
                    >
                      {/* Tooltip */}
                      <div className="absolute left-6 top-0 hidden group-hover:block bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl z-50">
                        <div className="font-semibold">{node.name}</div>
                        <div className="text-gray-300">{node.region}</div>
                        <div className="text-gray-400 text-[10px]">{node.type === 'charity' ? 'Charity' : 'Donor'}</div>
                      </div>
                    </div>

                    {/* Label */}
                    <div className="absolute top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-gray-700 whitespace-nowrap pointer-events-none">
                      {node.region}
                    </div>
                  </motion.div>
                ))}

                {/* Floating particles (work indicators) */}
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1.5 h-1.5 bg-arctic-400 rounded-full opacity-40"
                    style={{
                      left: `${20 + Math.random() * 60}%`,
                      top: `${10 + Math.random() * 80}%`
                    }}
                    animate={{
                      y: [-10, -30, -10],
                      x: [0, Math.random() * 20 - 10, 0],
                      opacity: [0, 0.6, 0]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: i * 0.5
                    }}
                  />
                ))}

                {/* Legend */}
                <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Legend</div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-blue-400 to-blue-600"></div>
                      <span className="text-gray-600">Donors</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-400 to-green-600"></div>
                      <span className="text-gray-600">Charities</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="space-y-6">
            {/* Activity Stream */}
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <h3 className="text-lg font-bold text-gray-900">Live Activity</h3>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                <AnimatePresence initial={false}>
                  {activities.map((activity) => {
                    const Icon = getActivityIcon(activity.type);
                    const colorClass = getActivityColor(activity.type);

                    return (
                      <motion.div
                        key={activity.id}
                        initial={{ opacity: 0, x: 20, height: 0 }}
                        animate={{ opacity: 1, x: 0, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-3 bg-gradient-to-r from-ice-50 to-white rounded-lg border border-ice-200">
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-4 h-4 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-gray-700 leading-snug">{activity.message}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <MapPinIcon className="w-3 h-3 text-gray-400" />
                                <span className="text-xs text-gray-500">{activity.location}</span>
                                <span className="text-xs text-gray-400">•</span>
                                <span className="text-xs text-gray-400">Just now</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-2xl shadow-xl p-6 text-white">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ArrowTrendingUpIcon className="w-5 h-5" />
                Today's Activity
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BanknotesIcon className="w-5 h-5 text-arctic-100" />
                    <span className="text-arctic-100 text-sm">Donations</span>
                  </div>
                  <span className="font-bold text-xl">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HandThumbUpIcon className="w-5 h-5 text-arctic-100" />
                    <span className="text-arctic-100 text-sm">Votes Cast</span>
                  </div>
                  <span className="font-bold text-xl">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-arctic-100" />
                    <span className="text-arctic-100 text-sm">Proposals</span>
                  </div>
                  <span className="font-bold text-xl">7</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-5 h-5 text-arctic-100" />
                    <span className="text-arctic-100 text-sm">Active Members</span>
                  </div>
                  <span className="font-bold text-xl">89</span>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Donate:</strong> Contribute to verified charities</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Vote:</strong> Your voting power grows with contributions</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Propose:</strong> Suggest new funding initiatives</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircleIcon className="w-5 h-5 text-arctic-500 flex-shrink-0 mt-0.5" />
                  <p><strong>Track:</strong> All activity is transparent on-chain</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;

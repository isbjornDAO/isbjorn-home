import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPinIcon,
  BanknotesIcon,
  HandThumbUpIcon,
  DocumentTextIcon,
  ClockIcon,
  CheckCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';

interface Activity {
  id: string;
  type: 'donation' | 'vote' | 'proposal';
  message: string;
  location: string;
  timestamp: number;
}

interface Proposal {
  id: string;
  title: string;
  description: string;
  votesFor: number;
  votesAgainst: number;
  endTime: string;
  status: 'active' | 'passed' | 'rejected';
}

const MapPage: React.FC = () => {
  const [activities, setActivities] = useState<Activity[]>([]);

  const proposals: Proposal[] = [
    {
      id: '1',
      title: 'Increase Emergency Relief Funding',
      description: 'Allocate additional funds to disaster relief efforts',
      votesFor: 156,
      votesAgainst: 23,
      endTime: '2 days',
      status: 'active'
    },
    {
      id: '2',
      title: 'Support Wildlife Conservation',
      description: 'Fund native species protection programs',
      votesFor: 89,
      votesAgainst: 12,
      endTime: '5 days',
      status: 'active'
    },
    {
      id: '3',
      title: 'Expand Food Bank Network',
      description: 'Establish new food distribution centers',
      votesFor: 134,
      votesAgainst: 45,
      endTime: '1 day',
      status: 'active'
    },
  ];

  // Generate activity (slower - every 12 seconds)
  useEffect(() => {
    const activityTemplates = [
      { type: 'donation' as const, messages: [
        'Tech Innovations NZ donated $15,000 to Red Cross',
        'Green Energy Co donated $8,500 to Forest & Bird',
        'Local Business donated $5,200 to UNICEF NZ',
        'Anonymous donor contributed $12,000 to WWF NZ'
      ]},
      { type: 'vote' as const, messages: [
        'Pacific Group voted on "Increase Emergency Relief Funding"',
        'Auckland Software voted on "Support Wildlife Conservation"',
        'Individual member voted on "Expand Food Bank Network"'
      ]},
      { type: 'proposal' as const, messages: [
        'New proposal: "Fund Clean Water Initiative"',
        'New proposal: "Climate Action Project"',
        'New proposal: "Education Support Program"'
      ]},
    ];

    const locations = ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin'];

    const generateActivity = () => {
      const template = activityTemplates[Math.floor(Math.random() * activityTemplates.length)];
      const message = template.messages[Math.floor(Math.random() * template.messages.length)];
      const location = locations[Math.floor(Math.random() * locations.length)];

      const newActivity: Activity = {
        id: Date.now().toString(),
        type: template.type,
        message,
        location,
        timestamp: Date.now()
      };

      setActivities(prev => [newActivity, ...prev].slice(0, 5));
    };

    // Initial activities
    for (let i = 0; i < 3; i++) {
      setTimeout(generateActivity, i * 2000);
    }

    // Slower updates - every 12 seconds
    const interval = setInterval(generateActivity, 12000);
    return () => clearInterval(interval);
  }, []);

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'donation': return BanknotesIcon;
      case 'vote': return HandThumbUpIcon;
      case 'proposal': return DocumentTextIcon;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'donation': return 'from-green-400 to-green-600';
      case 'vote': return 'from-blue-400 to-blue-600';
      case 'proposal': return 'from-purple-400 to-purple-600';
    }
  };

  return (
    <div className="min-h-screen bg-ice-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/src/assets/polar-bear-donate-bg.jpg')",
            backgroundPosition: "center 40%"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mb-6 shadow-xl">
            <MapPinIcon className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4">
            DAO Activity Map
          </h1>
          <p className="text-lg sm:text-xl text-ice-100 max-w-3xl mx-auto px-4">
            Live view of donations, voting, and proposals across New Zealand
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Map Visualization - Full Width, Not in Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative mb-8"
          style={{ height: '500px' }}
        >
          {/* Large NZ Map - using SVG silhouette */}
          <div className="absolute inset-0 bg-gradient-to-br from-arctic-50 to-ice-100 rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
            <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* More detailed NZ map shape */}
              <path
                d="M 55,8 L 60,6 L 65,5 L 68,7 L 70,10 L 72,15 L 70,20 L 68,25 L 65,30 L 62,35 L 65,38 L 68,42 L 70,48 L 72,55 L 73,62 L 74,68 L 75,74 L 74,80 L 72,85 L 68,90 L 64,92 L 60,90 L 58,85 L 57,80 L 58,75 L 59,70 L 58,65 L 60,60 L 62,55 L 60,50 L 58,45 L 60,40 L 58,35 L 56,30 L 58,25 L 60,20 L 58,15 Z"
                fill="currentColor"
                className="text-arctic-400"
                stroke="currentColor"
                strokeWidth="1"
              />
            </svg>

            {/* Regional indicators */}
            {[
              { name: 'Auckland', x: 64, y: 22 },
              { name: 'Wellington', x: 70, y: 60 },
              { name: 'Christchurch', x: 75, y: 78 },
              { name: 'Hamilton', x: 62, y: 30 },
              { name: 'Dunedin', x: 68, y: 88 },
            ].map((region, index) => (
              <motion.div
                key={region.name}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
                style={{ left: `${region.x}%`, top: `${region.y}%` }}
              >
                {/* Pulse */}
                <motion.span
                  className="absolute inset-0 w-6 h-6 -m-1 rounded-full bg-arctic-500 opacity-30"
                  animate={{ scale: [1, 1.8, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: index * 0.5 }}
                />
                {/* Dot */}
                <div className="relative w-4 h-4 rounded-full bg-gradient-to-br from-arctic-500 to-arctic-700 shadow-lg border-2 border-white" />
                {/* Label */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-arctic-700 whitespace-nowrap bg-white/90 px-2 py-1 rounded-full shadow-md">
                  {region.name}
                </div>
              </motion.div>
            ))}

            {/* Floating activity particles */}
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-arctic-500 rounded-full opacity-40"
                style={{
                  left: `${15 + Math.random() * 70}%`,
                  top: `${10 + Math.random() * 80}%`
                }}
                animate={{
                  y: [-15, -35, -15],
                  x: [0, Math.random() * 15 - 7.5, 0],
                  opacity: [0, 0.5, 0]
                }}
                transition={{
                  duration: 4 + Math.random() * 3,
                  repeat: Infinity,
                  delay: i * 0.8
                }}
              />
            ))}
          </div>
        </motion.div>

        {/* Content Grid Below Map */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pending Proposals */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <DocumentTextIcon className="w-6 h-6 text-arctic-600" />
              <h2 className="text-2xl font-bold text-gray-900">Pending Proposals</h2>
            </div>
            <div className="space-y-4">
              {proposals.map((proposal) => {
                const totalVotes = proposal.votesFor + proposal.votesAgainst;
                const supportPercentage = (proposal.votesFor / totalVotes) * 100;

                return (
                  <div
                    key={proposal.id}
                    className="p-4 bg-gradient-to-r from-ice-50 to-white rounded-xl border border-ice-200 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-bold text-gray-900 flex-1">{proposal.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <ClockIcon className="w-4 h-4" />
                        {proposal.endTime}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{proposal.description}</p>

                    {/* Vote Progress */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-green-600 font-semibold">{proposal.votesFor} For</span>
                        <span className="text-gray-500">{supportPercentage.toFixed(0)}% Support</span>
                        <span className="text-red-600 font-semibold">{proposal.votesAgainst} Against</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-green-400 to-green-600"
                          style={{ width: `${supportPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Vote Buttons */}
                    <div className="flex gap-2 mt-3">
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-semibold">
                        <CheckCircleIcon className="w-4 h-4" />
                        Vote For
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
                        <XMarkIcon className="w-4 h-4" />
                        Vote Against
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl border border-ice-100 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <h2 className="text-2xl font-bold text-gray-900">Live Activity</h2>
            </div>
            <div className="space-y-3">
              <AnimatePresence initial={false}>
                {activities.map((activity) => {
                  const Icon = getActivityIcon(activity.type);
                  const colorClass = getActivityColor(activity.type);

                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, x: 20, height: 0 }}
                      animate={{ opacity: 1, x: 0, height: 'auto' }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="p-4 bg-gradient-to-r from-ice-50 to-white rounded-xl border border-ice-200">
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center flex-shrink-0`}>
                            <Icon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 leading-snug mb-1">{activity.message}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                              <MapPinIcon className="w-3 h-3" />
                              <span>{activity.location}</span>
                              <span>•</span>
                              <span>Just now</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Stats Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8"
        >
          {[
            { label: 'Total Donations', value: '$388K', icon: BanknotesIcon },
            { label: 'Active Proposals', value: '3', icon: DocumentTextIcon },
            { label: 'Votes Cast Today', value: '156', icon: HandThumbUpIcon },
            { label: 'DAO Members', value: '89', icon: MapPinIcon },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-white rounded-xl shadow-lg border border-ice-100 p-4 sm:p-6 text-center hover:shadow-xl transition-shadow"
              >
                <Icon className="w-8 h-8 text-arctic-600 mx-auto mb-2" />
                <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-xs text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

export default MapPage;

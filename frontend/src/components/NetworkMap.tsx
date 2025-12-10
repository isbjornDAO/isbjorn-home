import React, { useEffect, useState } from 'react';
import { ServerIcon, GlobeAltIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface NetworkNode {
  id: string;
  name: string;
  location: string;
  status: 'active' | 'inactive';
  stake: number;
  uptime: number;
}

interface NetworkMapProps {
  network: 'iggy-l1' | 'p-chain';
}

const NetworkMap: React.FC<NetworkMapProps> = ({ network }) => {
  const [nodes, setNodes] = useState<NetworkNode[]>([]);
  const [activeConnections, setActiveConnections] = useState<number[]>([]);

  useEffect(() => {
    // Mock data - replace with actual API calls
    const mockNodes: NetworkNode[] = network === 'iggy-l1'
      ? [
          { id: '1', name: 'Iggy Validator 1', location: 'US-East', status: 'active', stake: 2000, uptime: 99.9 },
          { id: '2', name: 'Iggy Validator 2', location: 'EU-West', status: 'active', stake: 2000, uptime: 99.8 },
          { id: '3', name: 'Iggy Validator 3', location: 'Asia-Pacific', status: 'active', stake: 2000, uptime: 99.7 },
        ]
      : [
          { id: 'p1', name: 'P-Chain Node 1', location: 'Global', status: 'active', stake: 2000, uptime: 99.95 },
          { id: 'p2', name: 'P-Chain Node 2', location: 'Global', status: 'active', stake: 2000, uptime: 99.93 },
        ];

    setNodes(mockNodes);

    // Animate connections
    const interval = setInterval(() => {
      setActiveConnections(prev => {
        const next = [...prev];
        const randomIndex = Math.floor(Math.random() * mockNodes.length);
        if (!next.includes(randomIndex)) {
          next.push(randomIndex);
          if (next.length > 3) next.shift();
        }
        return next;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [network]);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-ice-100">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-ice-900 mb-2">
            {network === 'iggy-l1' ? 'Iggy L1 Network' : 'Avalanche P-Chain'}
          </h2>
          <p className="text-ice-600 text-sm max-w-md">
            {network === 'iggy-l1'
              ? 'Our custom L1 blockchain for donation tracking and governance. Built on Avalanche for speed and security.'
              : 'Primary Avalanche network securing our validators and enabling cross-chain interoperability.'}
          </p>
        </div>
        <div className="hidden md:block">
          <GlobeAltIcon className="w-12 h-12 text-arctic-500" />
        </div>
      </div>

      {/* Network Visualization */}
      <div className="relative bg-gradient-to-br from-arctic-50 to-ice-50 rounded-xl p-8 mb-6 min-h-[300px]">
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          {/* Connection lines */}
          {nodes.map((node, i) => {
            const centerX = 50;
            const centerY = 50;
            const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
            const radius = 35;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);

            return (
              <line
                key={`line-${node.id}`}
                x1={`${centerX}%`}
                y1={`${centerY}%`}
                x2={`${x}%`}
                y2={`${y}%`}
                stroke={activeConnections.includes(i) ? '#3b82f6' : '#cbd5e1'}
                strokeWidth="2"
                className="transition-all duration-500"
                opacity={activeConnections.includes(i) ? '0.8' : '0.2'}
              />
            );
          })}
        </svg>

        {/* Central Hub */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="w-20 h-20 bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-full shadow-xl flex items-center justify-center border-4 border-white">
            <GlobeAltIcon className="w-10 h-10 text-white" />
          </div>
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
            <span className="text-xs font-bold text-arctic-700 bg-white px-2 py-1 rounded-full shadow">
              Network Core
            </span>
          </div>
        </div>

        {/* Validator Nodes */}
        {nodes.map((node, i) => {
          const centerX = 50;
          const centerY = 50;
          const angle = (i / nodes.length) * 2 * Math.PI - Math.PI / 2;
          const radius = 35;
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);

          return (
            <div
              key={node.id}
              className="absolute z-20 transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className={`
                w-16 h-16 rounded-full shadow-lg flex items-center justify-center border-4 border-white
                ${activeConnections.includes(i) ? 'bg-gradient-to-br from-blue-400 to-blue-600 scale-110' : 'bg-gradient-to-br from-arctic-400 to-arctic-500'}
                transition-all duration-500
              `}>
                <ServerIcon className="w-8 h-8 text-white" />
                {node.status === 'active' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                )}
              </div>
              <div className="absolute top-full mt-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                <div className="text-xs font-semibold text-ice-900 bg-white px-2 py-1 rounded shadow text-center">
                  {node.location}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => (
          <div key={node.id} className="bg-ice-50 rounded-xl p-4 border border-ice-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ServerIcon className="w-5 h-5 text-arctic-600" />
                <span className="font-semibold text-ice-900 text-sm">{node.name}</span>
              </div>
              {node.status === 'active' && (
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              )}
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-ice-600">Location:</span>
                <span className="font-semibold text-ice-900">{node.location}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ice-600">Stake:</span>
                <span className="font-semibold text-ice-900">{node.stake} AVAX</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ice-600">Uptime:</span>
                <span className="font-semibold text-green-600">{node.uptime}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Network Stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="text-center p-4 bg-arctic-50 rounded-xl">
          <div className="text-2xl font-bold text-arctic-600">{nodes.length}</div>
          <div className="text-xs text-ice-600">Active Validators</div>
        </div>
        <div className="text-center p-4 bg-arctic-50 rounded-xl">
          <div className="text-2xl font-bold text-arctic-600">
            {nodes.reduce((sum, n) => sum + n.stake, 0)}
          </div>
          <div className="text-xs text-ice-600">Total Staked (AVAX)</div>
        </div>
        <div className="text-center p-4 bg-arctic-50 rounded-xl">
          <div className="text-2xl font-bold text-green-600">
            {(nodes.reduce((sum, n) => sum + n.uptime, 0) / nodes.length).toFixed(1)}%
          </div>
          <div className="text-xs text-ice-600">Avg Uptime</div>
        </div>
      </div>
    </div>
  );
};

export default NetworkMap;

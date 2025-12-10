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
      <div className="bg-gradient-to-br from-arctic-50 to-ice-50 rounded-xl p-8 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {nodes.map((node) => (
            <div
              key={node.id}
              className="bg-white rounded-xl shadow-md p-6 border-2 border-arctic-200 hover:border-arctic-400"
            >
              {/* Pin Header with Icon */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-lg shadow-md flex items-center justify-center flex-shrink-0">
                    <ServerIcon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-ice-900 text-sm truncate">{node.name}</h3>
                    <p className="text-xs text-ice-600 flex items-center space-x-1 mt-1">
                      <GlobeAltIcon className="w-3 h-3" />
                      <span>{node.location}</span>
                    </p>
                  </div>
                </div>
                {node.status === 'active' && (
                  <div className="flex items-center space-x-1 bg-green-100 px-2 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-xs font-semibold text-green-700">Active</span>
                  </div>
                )}
              </div>

              {/* Node Details */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-t border-ice-100">
                  <span className="text-xs text-ice-600 font-medium">Stake</span>
                  <span className="text-sm font-bold text-ice-900">{node.stake} AVAX</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-ice-100">
                  <span className="text-xs text-ice-600 font-medium">Uptime</span>
                  <span className="text-sm font-bold text-green-600">{node.uptime}%</span>
                </div>
                <div className="flex items-center justify-between py-2 border-t border-ice-100">
                  <span className="text-xs text-ice-600 font-medium">Status</span>
                  <div className="flex items-center space-x-1">
                    <CheckCircleIcon className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-semibold text-ice-900">Validating</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
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

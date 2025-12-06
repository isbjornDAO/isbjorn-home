import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, UserGroupIcon } from '@heroicons/react/24/outline';

interface LiveStream {
  id: string;
  charity: string;
  title: string;
  location: string;
  viewers: number;
  thumbnail: string;
  position: { x: number; y: number }; // Position on map (percentage)
}

const LiveStreamsPage: React.FC = () => {
  const [hoveredStream, setHoveredStream] = useState<LiveStream | null>(null);

  // Mock live streams from charities
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      charity: 'Red Cross NZ',
      title: 'Disaster Relief - Cyclone Recovery',
      location: 'Auckland',
      viewers: 1240,
      thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      position: { x: 75, y: 25 }
    },
    {
      id: '2',
      charity: 'Forest & Bird',
      title: 'Kakapo Conservation Update',
      location: 'Fiordland',
      viewers: 856,
      thumbnail: 'https://images.unsplash.com/photo-1551135049-83f3419ef8bb?w=400',
      position: { x: 20, y: 75 }
    },
    {
      id: '3',
      charity: 'Whale Rescue NZ',
      title: 'Marine Rescue Training',
      location: 'Wellington',
      viewers: 523,
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      position: { x: 65, y: 60 }
    },
    {
      id: '4',
      charity: 'UNICEF NZ',
      title: 'Clean Water Project Visit',
      location: 'Christchurch',
      viewers: 342,
      thumbnail: 'https://images.unsplash.com/photo-1541632066244-46c6f9c79219?w=400',
      position: { x: 55, y: 80 }
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-arctic-50 to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-ice-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold text-gray-900">Live Streams</h1>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                {liveStreams.length} LIVE
              </span>
            </div>
            <div className="text-sm text-gray-600">
              Verified nonprofits streaming live
            </div>
          </div>
        </div>
      </header>

      {/* Map Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-arctic-200"
          style={{ height: '600px' }}
        >
          {/* Arctic Map Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-ice-100 via-arctic-50 to-ice-200">
            {/* Stylized NZ Map Outline */}
            <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
              {/* North Island */}
              <path
                d="M 65 20 Q 70 25 72 30 L 75 35 Q 73 40 70 42 L 68 45 Q 65 47 62 46 L 58 44 Q 55 42 55 38 L 53 33 Q 52 28 55 25 L 60 22 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-arctic-400"
              />
              {/* South Island */}
              <path
                d="M 50 50 Q 55 52 58 55 L 62 62 Q 63 68 60 72 L 55 78 Q 50 82 45 83 L 38 82 Q 32 80 28 76 L 25 70 Q 23 65 25 60 L 30 55 Q 35 52 40 51 Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-arctic-400"
              />
              {/* Decorative Arctic Elements */}
              <circle cx="15" cy="15" r="8" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-ice-300" opacity="0.5" />
              <circle cx="85" cy="20" r="6" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-ice-300" opacity="0.5" />
              <circle cx="90" cy="85" r="10" fill="none" stroke="currentColor" strokeWidth="0.3" className="text-ice-300" opacity="0.5" />
            </svg>

            {/* Polar Bear Watermark */}
            <div className="absolute bottom-4 right-4 text-6xl opacity-10">
              🐻‍❄️
            </div>
          </div>

          {/* Live Stream Dots */}
          {liveStreams.map((stream, index) => (
            <motion.div
              key={stream.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.15, type: 'spring' }}
              className="absolute cursor-pointer"
              style={{
                left: `${stream.position.x}%`,
                top: `${stream.position.y}%`,
                transform: 'translate(-50%, -50%)'
              }}
              onMouseEnter={() => setHoveredStream(stream)}
              onMouseLeave={() => setHoveredStream(null)}
            >
              {/* Pulsing Ring */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-red-500 rounded-full opacity-20 animate-ping"></div>
              </div>

              {/* Dot */}
              <div className="relative w-12 h-12 bg-red-500 rounded-full shadow-lg border-4 border-white flex items-center justify-center hover:scale-125 transition-transform">
                <MapPinIcon className="w-6 h-6 text-white" />
                {/* Live Indicator */}
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                </div>
              </div>

              {/* Tooltip on Hover */}
              {hoveredStream?.id === stream.id && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-50"
                  style={{ width: '280px' }}
                >
                  <div className="bg-white rounded-xl shadow-2xl border border-arctic-200 overflow-hidden">
                    {/* Thumbnail */}
                    <div className="relative h-32">
                      <img
                        src={stream.thumbnail}
                        alt={stream.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center space-x-1">
                        <UserGroupIcon className="w-3 h-3" />
                        <span>{stream.viewers.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <div className="text-xs text-arctic-600 font-semibold mb-1">{stream.charity}</div>
                      <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2">{stream.title}</h3>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPinIcon className="w-3 h-3 mr-1" />
                        <span>{stream.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* Tooltip Arrow */}
                  <div className="absolute left-1/2 -translate-x-1/2 -top-2 w-4 h-4 bg-white border-l border-t border-arctic-200 transform rotate-45"></div>
                </motion.div>
              )}
            </motion.div>
          ))}

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-4 border border-arctic-200">
            <h3 className="font-bold text-gray-900 text-sm mb-2">Map Legend</h3>
            <div className="space-y-2 text-xs">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-600">Live Stream Active</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 bg-red-500 rounded-full opacity-20 animate-ping"></div>
                <span className="text-gray-600">Broadcasting</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Text */}
        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            🐻‍❄️ Hover over dots to see live stream details • Click to watch (coming soon)
          </p>
        </div>
      </div>
    </div>
  );
};

export default LiveStreamsPage;

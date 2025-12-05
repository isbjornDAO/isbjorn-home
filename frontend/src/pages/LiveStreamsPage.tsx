import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MapPinIcon,
  UserGroupIcon,
  PlayCircleIcon,
  GlobeAltIcon,
  ListBulletIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface LiveStream {
  id: string;
  charity: string;
  charityLogo: string;
  title: string;
  description: string;
  location: string;
  coordinates: { lat: number; lng: number };
  viewers: number;
  thumbnail: string;
  streamUrl: string;
  isLive: boolean;
  category: string;
}

const LiveStreamsPage: React.FC = () => {
  const [viewMode, setViewMode] = useState<'map' | 'grid'>('map');
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [playingStream, setPlayingStream] = useState<LiveStream | null>(null);

  // Mock data - replace with API calls
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      charity: 'Red Cross NZ',
      charityLogo: '🏥',
      title: 'Disaster Relief Operations - Cyclone Recovery',
      description: 'Join us live as we coordinate disaster relief efforts in cyclone-affected areas.',
      location: 'Auckland, New Zealand',
      coordinates: { lat: -36.8485, lng: 174.7633 },
      viewers: 1240,
      thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
      streamUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk', // Example
      isLive: true,
      category: 'Disaster Relief'
    },
    {
      id: '2',
      charity: 'Forest & Bird',
      charityLogo: '🦜',
      title: 'Kakapo Conservation Live Update',
      description: 'Rare footage from our kakapo sanctuary in Fiordland. Watch endangered birds in their habitat.',
      location: 'Fiordland, New Zealand',
      coordinates: { lat: -45.4167, lng: 167.7167 },
      viewers: 856,
      thumbnail: 'https://images.unsplash.com/photo-1551135049-83f3419ef8bb?w=800',
      streamUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      isLive: true,
      category: 'Wildlife Conservation'
    },
    {
      id: '3',
      charity: 'Whale Rescue NZ',
      charityLogo: '🐋',
      title: 'Marine Rescue Training Session',
      description: 'Live training session on marine mammal rescue techniques with our expert team.',
      location: 'Wellington, New Zealand',
      coordinates: { lat: -41.2865, lng: 174.7762 },
      viewers: 523,
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      streamUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      isLive: true,
      category: 'Marine Conservation'
    },
    {
      id: '4',
      charity: 'UNICEF NZ',
      charityLogo: '💧',
      title: 'Clean Water Project Site Visit',
      description: 'Tour of our clean water initiative in Pacific communities.',
      location: 'Christchurch, New Zealand',
      coordinates: { lat: -43.5321, lng: 172.6362 },
      viewers: 342,
      thumbnail: 'https://images.unsplash.com/photo-1541632066244-46c6f9c79219?w=800',
      streamUrl: 'https://www.youtube.com/embed/jfKfPfyJRdk',
      isLive: true,
      category: 'Water & Sanitation'
    }
  ];

  const handleStreamClick = (stream: LiveStream) => {
    setPlayingStream(stream);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ice-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <h1 className="text-2xl font-bold text-gray-900">Live Streams</h1>
              <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                {liveStreams.filter(s => s.isLive).length} LIVE
              </span>
            </div>

            <div className="flex items-center space-x-2 bg-ice-50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('map')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white shadow text-arctic-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <GlobeAltIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white shadow text-arctic-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {viewMode === 'map' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map View - Simplified for now */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="aspect-video bg-gradient-to-br from-arctic-100 to-ice-200 relative">
                  {/* Simplified map representation - integrate Google Maps/Mapbox here */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <GlobeAltIcon className="w-16 h-16 text-arctic-500 mx-auto mb-2" />
                      <p className="text-gray-600 font-medium">Interactive Map</p>
                      <p className="text-sm text-gray-500">Showing {liveStreams.length} active streams</p>
                    </div>
                  </div>

                  {/* Stream Markers */}
                  {liveStreams.map((stream, index) => (
                    <motion.button
                      key={stream.id}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => setSelectedStream(stream)}
                      className="absolute w-10 h-10 bg-red-500 rounded-full shadow-lg hover:scale-110 transition-transform border-2 border-white flex items-center justify-center"
                      style={{
                        left: `${20 + index * 20}%`,
                        top: `${30 + (index % 2) * 20}%`
                      }}
                    >
                      <span className="text-white text-lg">{stream.charityLogo}</span>
                      {stream.isLive && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full animate-ping"></span>
                      )}
                    </motion.button>
                  ))}
                </div>

                {/* Selected Stream Preview */}
                {selectedStream && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border-t border-ice-200"
                  >
                    <div className="flex items-start space-x-4">
                      <img
                        src={selectedStream.thumbnail}
                        alt={selectedStream.title}
                        className="w-24 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm text-arctic-600 font-semibold">
                              {selectedStream.charity}
                            </div>
                            <h3 className="font-bold text-gray-900">{selectedStream.title}</h3>
                          </div>
                          <button
                            onClick={() => handleStreamClick(selectedStream)}
                            className="px-4 py-2 bg-arctic-500 text-white rounded-lg hover:bg-arctic-600 transition-colors flex items-center space-x-2"
                          >
                            <PlayCircleIcon className="w-5 h-5" />
                            <span>Watch</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Stream List Sidebar */}
            <div className="space-y-4">
              {liveStreams.map((stream) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={() => setSelectedStream(stream)}
                  className={`bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer ${
                    selectedStream?.id === stream.id ? 'ring-2 ring-arctic-500' : ''
                  }`}
                >
                  <div className="relative aspect-video">
                    <img
                      src={stream.thumbnail}
                      alt={stream.title}
                      className="w-full h-full object-cover"
                    />
                    {stream.isLive && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center space-x-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        <span>LIVE</span>
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center space-x-1">
                      <UserGroupIcon className="w-3 h-3" />
                      <span>{stream.viewers.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs text-arctic-600 font-semibold mb-1">{stream.charity}</div>
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2">{stream.title}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveStreams.map((stream) => (
              <motion.div
                key={stream.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => handleStreamClick(stream)}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all cursor-pointer"
              >
                <div className="relative aspect-video">
                  <img
                    src={stream.thumbnail}
                    alt={stream.title}
                    className="w-full h-full object-cover"
                  />
                  {stream.isLive && (
                    <div className="absolute top-3 left-3 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded flex items-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                      <span>LIVE</span>
                    </div>
                  )}
                  <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded flex items-center space-x-1">
                    <UserGroupIcon className="w-3 h-3" />
                    <span>{stream.viewers.toLocaleString()}</span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <PlayCircleIcon className="w-16 h-16 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-2xl">{stream.charityLogo}</span>
                    <div className="text-sm text-arctic-600 font-semibold">{stream.charity}</div>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>
                  <p className="text-sm text-gray-600 mb-2 line-clamp-2">{stream.description}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      <span>{stream.location}</span>
                    </div>
                    <span className="px-2 py-1 bg-arctic-50 text-arctic-700 rounded">
                      {stream.category}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {playingStream && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-6xl"
          >
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                  <div className="text-sm text-arctic-600 font-semibold">{playingStream.charity}</div>
                  <h2 className="text-xl font-bold text-gray-900">{playingStream.title}</h2>
                </div>
                <button
                  onClick={() => setPlayingStream(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              {/* Video Player */}
              <div className="aspect-video bg-black">
                <iframe
                  src={playingStream.streamUrl}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="font-semibold text-red-500">LIVE</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <UserGroupIcon className="w-5 h-5" />
                      <span className="font-semibold">{playingStream.viewers.toLocaleString()} watching</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <MapPinIcon className="w-5 h-5" />
                    <span>{playingStream.location}</span>
                  </div>
                </div>
                <p className="text-gray-600">{playingStream.description}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LiveStreamsPage;

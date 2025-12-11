import React, { useState } from 'react';
import { VideoCameraIcon, UserGroupIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface LiveCam {
  id: string;
  title: string;
  description: string;
  embedUrl: string;
  viewers?: number;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: Date;
  avatar?: string;
}

// Polar Bears International live cams from YouTube
const liveCams: LiveCam[] = [
  {
    id: '1',
    title: 'Polar Bear Cam - Hudson Bay',
    description: 'Watch wild polar bears on the shores of Hudson Bay, Canada',
    embedUrl: 'https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=1&mute=0&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1',
    viewers: 1247
  },
  {
    id: '2',
    title: 'Wapusk National Park',
    description: 'Live from Wapusk National Park in Churchill',
    embedUrl: 'https://www.youtube.com/embed/ZGCCMkurNGc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1',
    viewers: 823
  },
  {
    id: '3',
    title: 'Tundra Buggy Lodge',
    description: 'Polar bears near the Tundra Buggy Lodge',
    embedUrl: 'https://www.youtube.com/embed/4XzYvaDCv7s?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1',
    viewers: 654
  },
  {
    id: '4',
    title: 'Northern Lights Habitat',
    description: 'Aurora Borealis and polar bear habitat',
    embedUrl: 'https://www.youtube.com/embed/lyX7ZxWU64A?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1',
    viewers: 432
  }
];

const LiveCamsPage: React.FC = () => {
  const [featuredCam, setFeaturedCam] = useState(liveCams[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'PolarFan92',
      message: 'Amazing shot! Look at that bear!',
      timestamp: new Date(Date.now() - 120000),
      avatar: '🐻'
    },
    {
      id: '2',
      user: 'ArcticExplorer',
      message: 'This stream is so peaceful',
      timestamp: new Date(Date.now() - 60000),
      avatar: '❄️'
    },
    {
      id: '3',
      user: 'ConservationistJane',
      message: 'Thanks for supporting polar bear conservation!',
      timestamp: new Date(Date.now() - 30000),
      avatar: '🌍'
    }
  ]);

  const otherCams = liveCams.filter(cam => cam.id !== featuredCam.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date(),
      avatar: '👤'
    };

    setChatMessages([...chatMessages, newMessage]);
    setChatMessage('');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="bg-gray-900">
      {/* Main Content - Twitch Layout */}
      <div className="flex flex-col lg:flex-row h-screen lg:h-auto" style={{ minHeight: '800px' }}>
        {/* Left Sidebar - Other Streams (hidden on mobile) */}
        <div className="hidden lg:block lg:w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0">
          <div className="p-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
              Other Streams ({otherCams.length})
            </h2>
            <div className="space-y-3">
              {otherCams.map((cam) => (
                <button
                  key={cam.id}
                  onClick={() => setFeaturedCam(cam)}
                  className="w-full bg-gray-700 hover:bg-gray-600 rounded-lg overflow-hidden transition-colors text-left group"
                >
                  {/* Thumbnail Placeholder */}
                  <div className="relative bg-gray-900 flex items-center justify-center" style={{ paddingBottom: '56.25%' }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <VideoCameraIcon className="h-12 w-12 text-gray-600" />
                    </div>
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-1 z-10">
                      <div className="h-2 w-2 bg-white rounded-full animate-pulse"></div>
                      LIVE
                    </div>
                  </div>
                  {/* Stream Info */}
                  <div className="p-3">
                    <h3 className="text-sm font-semibold text-white group-hover:text-purple-400 transition-colors line-clamp-2">
                      {cam.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{cam.description}</p>
                    {cam.viewers && (
                      <div className="flex items-center gap-1 mt-2">
                        <UserGroupIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{cam.viewers.toLocaleString()} viewers</span>
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center - Featured Stream */}
        <div className="flex-1 bg-black overflow-y-auto">
          {/* Video Player */}
          <div className="w-full bg-black" style={{ paddingTop: '56.25%', position: 'relative' }}>
            <iframe
              src={featuredCam.embedUrl}
              title={featuredCam.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>

          {/* Stream Info */}
          <div className="bg-gray-800 p-4 border-b border-gray-700">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="relative">
                    <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
                  </div>
                  <span className="text-red-500 font-bold text-sm">LIVE</span>
                  {featuredCam.viewers && (
                    <>
                      <span className="text-gray-500">•</span>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-300 text-sm">{featuredCam.viewers.toLocaleString()} viewers</span>
                      </div>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white mb-1">{featuredCam.title}</h2>
                <p className="text-gray-400 text-sm">{featuredCam.description}</p>
              </div>
              <a
                href="/donate"
                className="flex-shrink-0 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-md font-semibold transition-colors"
              >
                Support Conservation
              </a>
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gray-800 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">
              About the Polar Bear Cams
            </h3>
            <div className="text-gray-300 space-y-2 text-sm">
              <p>
                These live cameras are located in Churchill, Manitoba, and Wapusk National Park along the shores of Hudson Bay, Canada—known as the "Polar Bear Capital of the World."
              </p>
              <p>
                The best time to view polar bears is during their migration season (October-November) when they gather along the coast waiting for sea ice to form. During off-season, you may see archived footage or other Arctic wildlife.
              </p>
              <p>
                Stream provided by{' '}
                <a
                  href="https://polarbearsinternational.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  Polar Bears International
                </a>
                {' '}and{' '}
                <a
                  href="https://explore.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 font-medium"
                >
                  explore.org
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Chat (hidden on mobile) */}
        <div className="hidden lg:flex lg:w-80 bg-gray-800 border-l border-gray-700 flex-col flex-shrink-0">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Live Chat
            </h2>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="flex gap-2">
                <div className="flex-shrink-0 text-2xl">{msg.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-semibold text-purple-400 text-sm">{msg.user}</span>
                    <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className="text-gray-200 text-sm mt-0.5 break-words">{msg.message}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-700 flex-shrink-0">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Send a message..."
                className="flex-1 bg-gray-700 text-white placeholder-gray-400 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
              />
              <button
                type="submit"
                disabled={!chatMessage.trim()}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-2 rounded-md transition-colors"
              >
                <PaperAirplaneIcon className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCamsPage;

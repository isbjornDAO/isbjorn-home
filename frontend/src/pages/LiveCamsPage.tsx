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
    embedUrl: 'https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=1&mute=0',
    viewers: 1247
  },
  {
    id: '2',
    title: 'Wapusk National Park',
    description: 'Live from Wapusk National Park in Churchill',
    embedUrl: 'https://www.youtube.com/embed/ZGCCMkurNGc?autoplay=0&mute=1',
    viewers: 823
  },
  {
    id: '3',
    title: 'Tundra Buggy Lodge',
    description: 'Polar bears near the Tundra Buggy Lodge',
    embedUrl: 'https://www.youtube.com/embed/4XzYvaDCv7s?autoplay=0&mute=1',
    viewers: 654
  },
  {
    id: '4',
    title: 'Northern Lights Habitat',
    description: 'Aurora Borealis and polar bear habitat',
    embedUrl: 'https://www.youtube.com/embed/lyX7ZxWU64A?autoplay=0&mute=1',
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center gap-3">
            <VideoCameraIcon className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Polar Bear Live Cams
              </h1>
              <p className="mt-2 text-gray-600">
                Watch polar bears in their natural habitat through live cameras in partnership with{' '}
                <a
                  href="https://polarbearsinternational.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Polar Bears International
                </a>
                {' '}and{' '}
                <a
                  href="https://explore.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  explore.org
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Live Cams Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {liveCams.map((cam) => (
            <div
              key={cam.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200"
            >
              {/* Cam Title */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 h-3 w-3 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <span>LIVE</span>
                  </div>
                  <span className="mx-2">•</span>
                  {cam.title}
                </h2>
                <p className="text-blue-100 text-sm mt-1">{cam.description}</p>
              </div>

              {/* Video Player */}
              <div className="relative bg-gray-900" style={{ paddingBottom: '56.25%' }}>
                <iframe
                  src={cam.embedUrl}
                  title={cam.title}
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                  allowFullScreen
                  loading="lazy"
                />
                {/* Fallback link if iframe is blocked */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <a
                    href={cam.embedUrl.split('?')[0].replace('/live-cams/player/', '/livecams/polar-bears/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pointer-events-auto hidden bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    id={`fallback-${cam.id}`}
                  >
                    Open Camera in New Tab
                  </a>
                </div>
              </div>

              {/* Info Footer */}
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Stream provided by explore.org
                  </p>
                  <a
                    href={cam.embedUrl.split('?')[0].replace('/live-cams/player/', '/livecams/polar-bears/')}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                  >
                    Watch on Explore.org
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            About the Polar Bear Cams
          </h3>
          <div className="text-gray-700 space-y-2">
            <p>
              These live cameras are located in Churchill, Manitoba, and Wapusk National Park along the shores of Hudson Bay, Canada—known as the "Polar Bear Capital of the World."
            </p>
            <p>
              The best time to view polar bears is during their migration season (October-November) when they gather along the coast waiting for sea ice to form. During off-season, you may see archived footage or other Arctic wildlife.
            </p>
            <p>
              This initiative is made possible through partnerships with Polar Bears International, explore.org, and Frontiers North Adventures, bringing you up-close views of these magnificent animals in their natural habitat.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-6 text-center">
          <p className="text-gray-600 mb-4">
            Help protect polar bears and their habitat
          </p>
          <a
            href="/donate"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
          >
            Support Polar Bear Conservation
          </a>
        </div>
      </div>
    </div>
  );
};

export default LiveCamsPage;

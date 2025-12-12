import React, { useState } from 'react';
import { VideoCameraIcon, UserGroupIcon, PaperAirplaneIcon, HeartIcon, GiftIcon } from '@heroicons/react/24/outline';

import { thirdwebClient } from '@/lib/thirdwebClient';
import { API_URL } from '@/utils/apiUrl';
import CryptoDonationButton from '../components/CryptoDonationButton';

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
  type?: 'message' | 'donation';
  amount?: number;
}

// Polar Bears International live cams from YouTube
const liveCams: LiveCam[] = [
  {
    id: '1',
    title: 'Polar Bear Cam - Hudson Bay',
    description: 'Watch wild polar bears on the shores of Hudson Bay, Canada',
    embedUrl: 'https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0',
    viewers: 1247
  },
  {
    id: '2',
    title: 'Wapusk National Park',
    description: 'Live from Wapusk National Park in Churchill',
    embedUrl: 'https://www.youtube.com/embed/ZGCCMkurNGc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0',
    viewers: 823
  },
  {
    id: '3',
    title: 'Tundra Buggy Lodge',
    description: 'Polar bears near the Tundra Buggy Lodge',
    embedUrl: 'https://www.youtube.com/embed/4XzYvaDCv7s?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0',
    viewers: 654
  },
  {
    id: '4',
    title: 'Northern Lights Habitat',
    description: 'Aurora Borealis and polar bear habitat',
    embedUrl: 'https://www.youtube.com/embed/lyX7ZxWU64A?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0',
    viewers: 432
  }
];

const LiveCamsPage: React.FC = () => {
  const [featuredCam, setFeaturedCam] = useState(liveCams[0]);
  const [chatMessage, setChatMessage] = useState('');
  const [donationAmount, setDonationAmount] = useState('');
  const [donationError, setDonationError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'Marcus',
      message: 'Amazing shot! Look at that bear!',
      timestamp: new Date(Date.now() - 180000),
      avatar: '🐻‍❄️',
      type: 'message'
    },
    {
      id: '2',
      user: 'Sarah_Chen',
      message: 'donated to support this stream',
      timestamp: new Date(Date.now() - 120000),
      avatar: '🦊',
      type: 'donation',
      amount: 25
    },
    {
      id: '3',
      user: 'Alex',
      message: 'This stream is so peaceful',
      timestamp: new Date(Date.now() - 60000),
      avatar: '🐆',
      type: 'message'
    },
    {
      id: '4',
      user: 'Emma',
      message: 'love that bear! what\'s his name?',
      timestamp: new Date(Date.now() - 30000),
      avatar: '🦭',
      type: 'message'
    }
  ]);

  // Crypto donation component handles the payment logic directly

  const otherCams = liveCams.filter(cam => cam.id !== featuredCam.id);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: 'You',
      message: chatMessage,
      timestamp: new Date(),
      avatar: '🐺',
      type: 'message'
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
      <div className="flex flex-col lg:flex-row" style={{ minHeight: '800px' }}>
        {/* Left Sidebar - Other Streams (hidden on mobile) */}
        <div className="hidden lg:block lg:w-80 bg-gray-800 border-r border-gray-700 overflow-y-auto flex-shrink-0 [&::-webkit-scrollbar]:hidden">
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
        <div className="flex-1 bg-black overflow-y-auto [&::-webkit-scrollbar]:hidden">
          {/* Video Player */}
          <div className="w-full bg-black" style={{ paddingTop: '56.25%', position: 'relative' }}>
            <iframe
              src={featuredCam.embedUrl}
              title={featuredCam.title}
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
            />
            {/* Overlays to block YouTube logo and title */}
            {/* Block YouTube logo in top-right */}
            <div className="absolute top-0 right-0 w-24 h-16 bg-black opacity-0 pointer-events-auto z-50"></div>
            {/* Block YouTube title at bottom */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent pointer-events-auto z-50"></div>
            {/* Block watch on YouTube button */}
            <div className="absolute bottom-2 right-2 w-32 h-10 bg-black opacity-0 pointer-events-auto z-50"></div>
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
            </div>
          </div>

          {/* About Section */}
          <div className="bg-gray-800 p-6">
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
        <div className="hidden lg:flex lg:w-80 bg-gray-800 border-l border-gray-700 flex-col flex-shrink-0 [&::-webkit-scrollbar]:hidden">
          {/* Chat Header */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Live Chat
            </h2>
          </div>

          {/* Donation Box */}
          <div className="p-4 bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-b border-purple-700/50 flex-shrink-0">
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <HeartIcon className="h-5 w-5 text-pink-400" />
                <h3 className="text-sm font-bold text-white">Support This Stream</h3>
              </div>
              <p className="text-xs text-gray-300">Help protect polar bears and their habitat</p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 bg-gray-700/50 p-1 rounded-lg">
                {[5, 10, 25, 50].map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setDonationAmount(amount.toString())}
                    className={`flex-1 py-1.5 rounded-md text-xs font-semibold transition-all ${donationAmount === amount.toString()
                      ? 'bg-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-600 hover:text-white'
                      }`}
                  >
                    {amount} USDC
                  </button>
                ))}
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400 text-sm">USDC</span>
                </div>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={donationAmount}
                  onChange={(e) => setDonationAmount(e.target.value)}
                  placeholder="Custom amount"
                  className="block w-full pl-14 pr-3 py-2 border border-gray-600 rounded-md leading-5 bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
                />
              </div>

              <CryptoDonationButton
                amount={donationAmount}
                onSuccess={(txHash) => {
                  const donationMessage: ChatMessage = {
                    id: Date.now().toString(),
                    user: 'You',
                    message: 'donated to support this stream',
                    timestamp: new Date(),
                    avatar: '🪧',
                    type: 'donation',
                    amount: parseFloat(donationAmount)
                  };
                  setChatMessages([...chatMessages, donationMessage]);
                  setDonationAmount('');
                }}
              />
            </div>
          </div>

          {/* Chat Input - positioned at top for visibility */}
          <div className="p-4 border-b border-gray-700 flex-shrink-0">
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

          {/* Chat Messages - fills remaining space */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 [&::-webkit-scrollbar]:hidden">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.type === 'donation' ? 'bg-gradient-to-r from-purple-900/20 to-pink-900/20 -mx-4 px-4 py-2 border-l-4 border-pink-500' : ''}`}>
                {/* Avatar as profile picture */}
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-xl border-2 border-gray-600">
                    {msg.avatar}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-semibold text-sm ${msg.type === 'donation' ? 'text-pink-400' : 'text-purple-400'}`}>
                      {msg.user}
                    </span>
                    {msg.type === 'donation' && msg.amount && (
                      <span className="bg-pink-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        ${msg.amount}
                      </span>
                    )}
                    <span className="text-gray-500 text-xs">{formatTime(msg.timestamp)}</span>
                  </div>
                  <p className={`text-sm mt-0.5 break-words ${msg.type === 'donation' ? 'text-pink-200 font-medium' : 'text-gray-200'}`}>
                    {msg.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCamsPage;

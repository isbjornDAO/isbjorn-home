import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  MapPinIcon,
  ClockIcon,
  UserGroupIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface LiveStream {
  id: string;
  charity: string;
  title: string;
  location: string;
  viewers: number;
  thumbnail: string;
  isLive: boolean;
}

interface NewsUpdate {
  id: string;
  charity: string;
  title: string;
  excerpt: string;
  image: string;
  timestamp: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Mock data - replace with API calls
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      charity: 'Red Cross NZ',
      title: 'Disaster Relief Operations - Cyclone Recovery',
      location: 'Auckland, NZ',
      viewers: 1240,
      thumbnail: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400',
      isLive: true
    },
    {
      id: '2',
      charity: 'Forest & Bird',
      title: 'Kakapo Conservation Live Update',
      location: 'Fiordland, NZ',
      viewers: 856,
      thumbnail: 'https://images.unsplash.com/photo-1551135049-83f3419ef8bb?w=400',
      isLive: true
    },
    {
      id: '3',
      charity: 'Whale Rescue NZ',
      title: 'Marine Rescue Training Session',
      location: 'Wellington, NZ',
      viewers: 523,
      thumbnail: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      isLive: false
    }
  ];

  const newsUpdates: NewsUpdate[] = [
    {
      id: '1',
      charity: 'UNICEF NZ',
      title: 'Clean Water Initiative Reaches 50,000 Families',
      excerpt: 'Our latest project has successfully provided clean water access to communities across the Pacific.',
      image: 'https://images.unsplash.com/photo-1541632066244-46c6f9c79219?w=400',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      charity: 'WWF New Zealand',
      title: 'Hector\'s Dolphin Population Showing Recovery',
      excerpt: 'Conservation efforts are paying off as we observe positive trends in dolphin populations.',
      image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400',
      timestamp: '5 hours ago'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      setShowLoginModal(false);
    } catch (error) {
      // Error handled in AuthContext
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-ice-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🐻‍❄️</span>
              <span className="font-bold text-xl text-arctic-700">Isbjorn</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/live" className="flex items-center space-x-2 text-arctic-600 hover:text-arctic-700 font-medium">
                <PlayCircleIcon className="w-5 h-5" />
                <span>Live Streams</span>
              </Link>
              <button
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-2 bg-arctic-500 text-white rounded-lg hover:bg-arctic-600 transition-colors"
              >
                Sign In
              </button>
              <Link
                to="/register"
                className="px-4 py-2 border border-arctic-500 text-arctic-600 rounded-lg hover:bg-arctic-50 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              See <span className="text-arctic-600">Impact</span> in Real-Time
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Watch verified nonprofits making a difference. Live streams, updates, and stories from the field.
            </p>
          </motion.div>

          {/* Live Streams Section */}
          <div className="mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                <h2 className="text-2xl font-bold text-gray-900">Live Now</h2>
              </div>
              <Link to="/live" className="text-arctic-600 hover:text-arctic-700 font-medium flex items-center space-x-1">
                <span>View All</span>
                <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {liveStreams.map((stream) => (
                <motion.div
                  key={stream.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer"
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
                    <div className="text-sm text-arctic-600 font-semibold mb-1">{stream.charity}</div>
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{stream.title}</h3>
                    <div className="flex items-center text-sm text-gray-500">
                      <MapPinIcon className="w-4 h-4 mr-1" />
                      <span>{stream.location}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* News Updates Section */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Latest Updates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {newsUpdates.map((news) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-32 h-32 object-cover flex-shrink-0"
                    />
                    <div className="p-4 flex-1">
                      <div className="text-xs text-arctic-600 font-semibold mb-1">{news.charity}</div>
                      <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{news.title}</h3>
                      <p className="text-sm text-gray-600 mb-2 line-clamp-2">{news.excerpt}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <ClockIcon className="w-3 h-3 mr-1" />
                        <span>{news.timestamp}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
          >
            <button
              onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full mb-3 shadow-lg">
                <span className="text-2xl">🐻‍❄️</span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-ice-200 focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                  placeholder="you@company.co.nz"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <LockClosedIcon className="w-4 h-4 inline mr-1" />
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl border border-ice-200 focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-arctic-600 hover:text-arctic-700 font-semibold">
                Create one
              </Link>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

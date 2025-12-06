import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

import polarBearBg from '@/assets/login-bg.avif';

interface NewsUpdate {
  id: string;
  charity: string;
  title: string;
  excerpt: string;
  timestamp: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Recent news from nonprofits
  const newsUpdates: NewsUpdate[] = [
    {
      id: '1',
      charity: 'Red Cross NZ',
      title: 'Cyclone Recovery: 500 Families Housed',
      excerpt: 'Emergency relief operations continue in Auckland region.',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      charity: 'Forest & Bird',
      title: 'Kakapo Population Hits Record High',
      excerpt: 'Conservation efforts show significant progress.',
      timestamp: '5 hours ago'
    },
    {
      id: '3',
      charity: 'UNICEF NZ',
      title: 'Clean Water Reaches 10,000 Homes',
      excerpt: 'Pacific communities gain access to safe drinking water.',
      timestamp: '1 day ago'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      // Error is handled in AuthContext with toast
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleForgotPassword = () => {
    toast('Please contact support at icemira@pm.me to reset your password.', {
      icon: '📧',
      duration: 5000,
    });
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-white">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${polarBearBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.08
        }}
      />
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[2px] z-0" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl relative z-10"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Card */}
          <div>
            <div className="text-center mb-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full mb-2 shadow-lg"
              >
                <span className="text-2xl">🐻‍❄️</span>
              </motion.div>
              <h1 className="text-xl font-bold text-gray-800 font-display mb-1">Welcome Back</h1>
              <p className="text-sm text-ice-600">Sign in to your account</p>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-ice-100 overflow-hidden p-5">
              <form onSubmit={handleSubmit} className="space-y-3">
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
                    className="w-full px-3 py-2 rounded-xl border border-ice-200 focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm"
                    placeholder="you@company.co.nz"
                    required
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700">
                      <LockClosedIcon className="w-4 h-4 inline mr-1" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-arctic-600 hover:text-arctic-700 font-medium"
                    >
                      Forgot?
                    </button>
                  </div>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3 py-2 rounded-xl border border-ice-200 focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 text-white py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                >
                  {isLoading ? 'Signing In...' : (
                    <span className="flex items-center justify-center">
                      Sign In
                      <ArrowRightIcon className="w-5 h-5 ml-2" />
                    </span>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-3 text-center">
              <p className="text-sm text-ice-600">
                New to Isbjorn?{' '}
                <Link to="/register" className="text-arctic-600 hover:text-arctic-700 font-semibold">
                  Create an account
                </Link>
              </p>
            </div>
          </div>

          {/* Recent News */}
          <div>
            <h2 className="text-lg font-bold text-gray-800 mb-4">Recent Updates</h2>
            <div className="space-y-3">
              {newsUpdates.map((news) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-white rounded-xl p-4 shadow-md border border-ice-100"
                >
                  <div className="text-xs text-arctic-600 font-semibold mb-1">{news.charity}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{news.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{news.excerpt}</p>
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="w-3 h-3 mr-1" />
                    <span>{news.timestamp}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

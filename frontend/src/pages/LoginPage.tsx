import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ClockIcon } from '@heroicons/react/24/outline';
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

  const handleSocialLogin = (provider: string) => {
    toast(`${provider} login coming soon`, {
      icon: '🔜',
      duration: 3000,
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Login Card */}
          <div>
            <div className="text-center mb-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-2xl mb-3 shadow-lg"
              >
                <span className="text-3xl">🐻‍❄️</span>
              </motion.div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
              <p className="text-gray-600">Sign in to continue making an impact</p>
            </div>

            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8">
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleSocialLogin('Google')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Microsoft')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z"/>
                    <path fill="#f35325" d="M1 1h10v10H1z"/>
                    <path fill="#81bc06" d="M12 1h10v10H12z"/>
                    <path fill="#05a6f0" d="M1 12h10v10H1z"/>
                    <path fill="#ffba08" d="M12 12h10v10H12z"/>
                  </svg>
                  Continue with Microsoft
                </button>

                <button
                  type="button"
                  onClick={() => handleSocialLogin('Apple')}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-200 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all font-medium text-gray-700"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Continue with Apple
                </button>
              </div>

              {/* Divider */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or continue with email</span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all"
                      placeholder="you@company.co.nz"
                      required
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-arctic-600 hover:text-arctic-700 font-semibold"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </button>
              </form>
            </div>

            <p className="mt-6 text-center text-gray-600">
              New to Isbjorn?{' '}
              <Link to="/register" className="text-arctic-600 hover:text-arctic-700 font-bold">
                Create an account
              </Link>
            </p>
          </div>

          {/* Recent News */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Recent Updates</h2>
              <p className="text-gray-600">See the latest impact from verified charities</p>
            </div>

            <div className="space-y-4">
              {newsUpdates.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-bold text-arctic-600">{news.charity}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      {news.timestamp}
                    </div>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{news.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{news.excerpt}</p>
                </motion.div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-arctic-50 to-ice-50 rounded-2xl p-6 border border-arctic-100">
              <div className="text-center">
                <div className="text-3xl mb-2">🌍</div>
                <h3 className="font-bold text-gray-900 mb-2">Join the Impact</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Over <span className="font-bold text-arctic-600">$2.4M</span> donated to NZ charities through transparent blockchain technology
                </p>
                <Link
                  to="/register"
                  className="inline-block bg-arctic-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-arctic-700 transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;

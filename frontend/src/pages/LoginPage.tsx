import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ClockIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { apiService } from '@/services/api';

import polarBearBg from '@/assets/login-bg.jpg';
import bearrrGif from '@/assets/bearrr.gif';

interface NewsUpdate {
  id: string;
  charity: string;
  title: string;
  excerpt: string;
  timestamp: string;
}

const LoginPage: React.FC = () => {
  const { login, isLoading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [walletAuthAttempted, setWalletAuthAttempted] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Reset wallet auth state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setWalletAuthAttempted(false);
    }
  }, [isConnected]);

  // Wallet authentication handler (MANUAL - not auto)
  const authenticateWallet = async () => {
    if (!isConnected || !address) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (walletAuthAttempted) {
      return; // Prevent double attempts
    }

    setWalletAuthAttempted(true);
    try {
      // Create message to sign
      const message = `Sign this message to authenticate with Isbjorn.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

      // Request signature
      const signature = await signMessageAsync({ message });

      // Send to backend for verification and authentication
      const response = await apiService.post<{
        user: any;
        token: string;
        refreshToken: string;
      }>('/auth/wallet-login', {
        address,
        message,
        signature,
      });

      // Store token and user data
      localStorage.setItem('authToken', response.token);
      if (response.refreshToken) {
        localStorage.setItem('refreshToken', response.refreshToken);
      }

      toast.success('Wallet authenticated successfully!');
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      setWalletAuthAttempted(false); // Allow retry
      if (error.message?.includes('User rejected')) {
        toast.error('Signature rejected. Please sign the message to authenticate.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to authenticate with wallet');
      }
    }
  };

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

  const handleGoogleLogin = () => {
    toast('Google login coming soon', {
      icon: '🔜',
      duration: 3000,
    });
  };

  const handleWalletLogin = async () => {
    if (isConnected && address) {
      // If already connected, authenticate immediately
      await authenticateWallet();
    } else if (openConnectModal) {
      // If not connected, open wallet connect modal
      openConnectModal();
      toast('Please connect your wallet, then click the button again to sign in', {
        icon: '👛',
        duration: 4000,
      });
    }
  };

  const handleSignUpClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (isAuthenticated) {
      e.preventDefault();
      toast('You are already logged in!', {
        icon: 'ℹ️',
        duration: 3000,
      });
      navigate('/dashboard');
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-ice-50 to-arctic-50">
      {/* Curved Banner at Top */}
      <div
        className="relative w-full h-48"
        style={{
          zIndex: 0,
          borderBottomLeftRadius: '50% 8%',
          borderBottomRightRadius: '50% 8%',
          overflow: 'visible',
        }}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={{
            backgroundImage: `url(${polarBearBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 30%',
            borderBottomLeftRadius: '50% 8%',
            borderBottomRightRadius: '50% 8%',
          }}
        />
        <div className="absolute inset-0 bg-white/75" style={{
          borderBottomLeftRadius: '50% 8%',
          borderBottomRightRadius: '50% 8%',
        }} />
      </div>

      {/* Main Content Container */}
      <div className="relative flex items-center justify-center px-4">

      {/* Main Login Card - Centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative -mt-40"
        style={{ zIndex: 99999, position: 'relative' }}
      >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center mb-6 relative"
              style={{ zIndex: 100001, position: 'relative' }}
            >
              <img
                src={bearrrGif}
                alt="Bearrr mascot"
                className="w-64 h-64 object-contain drop-shadow-2xl"
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-600">Sign in to make an impact</p>
          </div>

          {/* Login Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">
              {/* Quick Sign In */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 text-center mb-4">Choose your preferred sign-in method</p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-arctic-600">Continue with Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleWalletLogin}
                    disabled={walletAuthAttempted && isConnected}
                    className="flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                    </svg>
                    <span className="text-sm font-semibold text-gray-700 group-hover:text-arctic-600">
                      {walletAuthAttempted && isConnected ? 'Authenticating...' : isConnected ? `Sign in as ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Continue with Wallet'}
                    </span>
                  </button>
                </div>
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

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              New to Isbjorn?{' '}
              <Link
                to="/signup"
                onClick={handleSignUpClick}
                className="text-arctic-600 hover:text-arctic-700 font-bold transition-colors"
              >
                Create an account →
              </Link>
            </p>
          </div>

          {/* Bottom Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 text-center"
          >
            <div className="flex items-center justify-center gap-6 text-sm">
              <div>
                <div className="font-bold text-arctic-600 text-lg">$2.4M+</div>
                <div className="text-gray-600 text-xs">Donated</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <div className="font-bold text-arctic-600 text-lg">500+</div>
                <div className="text-gray-600 text-xs">Charities</div>
              </div>
              <div className="w-px h-8 bg-gray-300"></div>
              <div>
                <div className="font-bold text-arctic-600 text-lg">100%</div>
                <div className="text-gray-600 text-xs">Transparent</div>
              </div>
            </div>
          </motion.div>
      </motion.div>

      {/* Mascot moved into the main card below so it scrolls with the page and can overlay the header */}

      {/* News Sidebar - Left */}
      <div className="hidden lg:block absolute left-8 top-24 w-72 space-y-3 z-10">
        <div className="mb-4">
          <h3 className="text-sm font-bold text-gray-700 mb-2">Recent Updates</h3>
          <p className="text-xs text-gray-600">See the latest from verified charities</p>
        </div>
        {newsUpdates.map((news, index) => (
          <motion.div
            key={news.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.2 }}
            className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-100"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-arctic-600">{news.charity}</span>
            </div>
            <h3 className="font-bold text-gray-900 text-sm mb-1">{news.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed">{news.excerpt}</p>
            <div className="flex items-center text-xs text-gray-500 mt-2">
              <ClockIcon className="w-3 h-3 mr-1" />
              {news.timestamp}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Info Sidebar - Right */}
      <div className="hidden lg:block absolute right-8 top-24 w-72 z-10">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4">How Isbjorn Works</h2>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-arctic-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Business Donations</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Businesses donate to verified NZ charities with instant IRD-compliant tax receipts.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-arctic-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Donation Nodes</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Funds distributed through transparent blockchain nodes ensuring full traceability.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-arctic-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Community Voting</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  DAO members vote on fund allocation, ensuring democratic distribution.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-7 h-7 bg-arctic-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm mb-1">Live Impact Tracking</h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Watch charities in action through live streams and real-time updates.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 p-3 bg-gradient-to-br from-arctic-50 to-ice-50 rounded-lg border border-arctic-200">
            <p className="text-xs text-gray-600 text-center">
              🐻‍❄️ <strong>Powered by Avalanche</strong><br />
              Transparent, secure, climate-positive
            </p>
          </div>
        </motion.div>
      </div>
      </div>
    </div>
  );
};

export default LoginPage;

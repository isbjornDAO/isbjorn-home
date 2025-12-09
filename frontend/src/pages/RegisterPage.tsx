import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  IdentificationIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount, useSignMessage } from 'wagmi';
import { apiService } from '@/services/api';
import polarBearBg from '@/assets/polar-bears-swimming.jpg';
import bearrrGif from '@/assets/bearrr.gif';

type AccountType = 'individual' | 'business';

interface NZBNResult {
  nzbn: string;
  name: string;
  status: string;
}

interface NewsUpdate {
  id: string;
  charity: string;
  title: string;
  excerpt: string;
  timestamp: string;
}

const RegisterPage: React.FC = () => {
  const { register, isLoading, isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { openConnectModal } = useConnectModal();
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const [walletAuthAttempted, setWalletAuthAttempted] = useState(false);
  const [walletSignupInitiated, setWalletSignupInitiated] = useState(false);
  const [accountType, setAccountType] = useState<AccountType>('individual');
  const [formData, setFormData] = useState({
    name: '', // Maps to companyName
    nzbn: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NZBNResult[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<NZBNResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

  // Real NZBN search using the API
  const searchNZBN = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await apiService.get<{
        success: boolean;
        data: Array<{ nzbn: string; name: string; status: string }>;
      }>(`/public/nzbn/search?query=${encodeURIComponent(query)}`);

      if (response.success) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('NZBN search error:', error);
      setSearchResults([]);
      toast.error('Failed to search companies');
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (accountType === 'business' && !selectedCompany) {
        searchNZBN(searchQuery);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, accountType, selectedCompany]);

  // Click outside to close results
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Clear selection when switching account types
  useEffect(() => {
    if (accountType === 'individual') {
      handleClearSelection();
    }
  }, [accountType]);

  const handleSelectCompany = (company: NZBNResult) => {
    setSelectedCompany(company);
    setFormData(prev => ({
      ...prev,
      name: company.name,
      nzbn: company.nzbn
    }));
    setSearchQuery('');
    setShowResults(false);
    setSearchResults([]);
  };

  const handleClearSelection = () => {
    setSelectedCompany(null);
    setFormData(prev => ({
      ...prev,
      name: '',
      nzbn: ''
    }));
    setSearchQuery('');
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = accountType === 'business' ? 'Company name is required' : 'Username is required';
    }

    if (accountType === 'business' && !formData.nzbn) {
      if (!formData.nzbn) newErrors.nzbn = 'Business number is required';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await register({
        companyName: formData.name, // Mapping Full Name to Company Name field
        nzbn: accountType === 'business' ? formData.nzbn : undefined,
        email: formData.email,
        password: formData.password,
      });
    } catch (error) {
      // Error is handled in AuthContext with toast
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSocialLogin = (provider: string) => {
    toast(`${provider} sign up coming soon`, {
      icon: '🔜',
      duration: 3000,
    });
  };

  // Reset wallet auth state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setWalletAuthAttempted(false);
      setWalletSignupInitiated(false);
    }
  }, [isConnected]);

  // Auto-trigger authentication when wallet connects after user initiated signup
  useEffect(() => {
    if (isConnected && address && walletSignupInitiated && !walletAuthAttempted) {
      authenticateWallet();
    }
  }, [isConnected, address, walletSignupInitiated, walletAuthAttempted]);

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
      const message = `Sign this message to register with Isbjorn.\n\nWallet: ${address}\nTimestamp: ${new Date().toISOString()}`;

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

      // Refresh auth state to update context and trigger navigation
      await checkAuthStatus();
      toast.success('Wallet registered successfully!');
    } catch (error: any) {
      console.error('Wallet authentication error:', error);
      setWalletAuthAttempted(false); // Allow retry
      if (error.message?.includes('User rejected')) {
        toast.error('Signature rejected. Please sign the message to register.');
      } else {
        toast.error(error.response?.data?.message || 'Failed to register with wallet');
      }
    }
  };

  const handleWalletSignup = () => {
    if (isConnected && address) {
      // If already connected, authenticate immediately
      authenticateWallet();
    } else if (openConnectModal) {
      // If not connected, open wallet connect modal and mark signup as initiated
      setWalletSignupInitiated(true);
      openConnectModal();
      toast('Please connect your wallet to continue', {
        icon: '👛',
        duration: 3000,
      });
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

      {/* Main Registration Card - Centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative -mt-40 z-10"
      >
          {/* Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center mb-6 relative z-20"
            >
              <img
                src={bearrrGif}
                alt="Bearrr mascot"
                className="w-64 h-64 object-contain drop-shadow-2xl"
              />
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-600">Join Isbjorn to make an impact</p>
          </div>

          {/* Registration Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">

          {/* Quick Sign Up */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 text-center mb-4">Choose your preferred sign-up method</p>
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
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
                onClick={() => handleSocialLogin('Proton Mail')}
                className="flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 24c-5.5 0-10-4.5-10-10S10.5 6 16 6s10 4.5 10 10-4.5 10-10 10z" fill="#6D4AFF"/>
                  <path d="M16 8c-4.4 0-8 3.6-8 8v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-4.4-3.6-8-8-8zm4 12h-8v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4z" fill="#6D4AFF"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-arctic-600">Continue with Proton</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('X')}
                className="flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-arctic-600">Continue with X</span>
              </button>

              <button
                type="button"
                onClick={handleWalletSignup}
                disabled={walletAuthAttempted && isConnected}
                className="flex items-center justify-center gap-3 p-3 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/>
                  <path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/>
                  <path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>
                </svg>
                <span className="text-sm font-semibold text-gray-700 group-hover:text-arctic-600">
                  {walletAuthAttempted && isConnected ? 'Authenticating...' : isConnected ? `Sign up as ${address?.slice(0, 6)}...${address?.slice(-4)}` : 'Continue with Wallet'}
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

          {/* Account Type Slider */}
          <div className="bg-ice-50 p-1 rounded-xl flex items-center mb-6 relative">
            <div
              className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-sm transition-all duration-300 ease-spring ${accountType === 'individual' ? 'left-1' : 'left-[calc(50%+2px)]'
                }`}
            />
            <button
              type="button"
              onClick={() => setAccountType('individual')}
              className={`flex-1 relative z-10 flex items-center justify-center text-sm font-medium py-2 transition-colors duration-300 ${accountType === 'individual' ? 'text-arctic-700' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Individual
            </button>
            <button
              type="button"
              onClick={() => setAccountType('business')}
              className={`flex-1 relative z-10 flex items-center justify-center text-sm font-medium py-2 transition-colors duration-300 ${accountType === 'business' ? 'text-arctic-700' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <BuildingOfficeIcon className="w-4 h-4 mr-2" />
              Business
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Name Field (Dynamic Label) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {accountType === 'individual' ? (
                  <>
                    <UserIcon className="w-4 h-4 inline mr-1" />
                    Username
                  </>
                ) : (
                  <>
                    <BuildingOfficeIcon className="w-4 h-4 inline mr-1" />
                    Company Name
                  </>
                )}
              </label>

              {accountType === 'business' && selectedCompany ? (
                <div className="relative">
                  <div className="flex items-center justify-between p-3 bg-arctic-50 border-2 border-arctic-500 rounded-xl">
                    <div className="flex-1">
                      <div className="font-semibold text-arctic-900">{selectedCompany.name}</div>
                      <div className="text-xs text-arctic-600 mt-1">NZBN: {selectedCompany.nzbn}</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelection}
                      className="ml-2 p-1 hover:bg-arctic-100 rounded-full transition-colors"
                    >
                      <XMarkIcon className="w-5 h-5 text-arctic-600" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative" ref={searchRef}>
                  <div className="relative">
                    {accountType === 'business' && (
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-400" />
                    )}
                    <input
                      type="text"
                      name="name"
                      value={accountType === 'business' ? searchQuery : formData.name}
                      onChange={(e) => {
                        if (accountType === 'business') {
                          setSearchQuery(e.target.value);
                          setShowResults(true);
                        } else {
                          handleChange(e);
                        }
                      }}
                      onFocus={() => {
                        if (accountType === 'business') {
                          setShowResults(true);
                        }
                      }}
                      className={`w-full ${accountType === 'business' ? 'pl-11' : 'pl-4'} pr-4 py-3 rounded-xl border-2 ${errors.name ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all`}
                      placeholder={accountType === 'individual' ? "johndoe" : "Search by company name or NZBN..."}
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {accountType === 'business' && showResults && (searchResults.length > 0 || isSearching) && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-ice-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-ice-600">
                          <div className="animate-spin w-5 h-5 border-2 border-arctic-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                          Searching...
                        </div>
                      ) : (
                        searchResults.map((company) => (
                          <button
                            key={company.nzbn}
                            type="button"
                            onClick={() => handleSelectCompany(company)}
                            className="w-full text-left px-4 py-3 hover:bg-arctic-50 transition-colors border-b border-ice-100 last:border-b-0"
                          >
                            <div className="font-medium text-ice-900">{company.name}</div>
                            <div className="text-xs text-ice-600 mt-1">
                              NZBN: {company.nzbn} • {company.status}
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}

                  {accountType === 'business' && showResults && searchQuery.length >= 2 && !isSearching && searchResults.length === 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-ice-200 rounded-xl shadow-lg p-4 text-center text-ice-600">
                      No companies found. Try a different search term.
                    </div>
                  )}
                </div>
              )}

              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>


            {/* Email */}
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
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${errors.email ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all`}
                  placeholder="you@company.co.nz"
                  required
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${errors.password ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-200'} focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 transition-all`}
                  placeholder="••••••••"
                  required
                />
              </div>
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating account...' : 'Sign up'}
            </button>
          </form>
        </div>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-arctic-600 hover:text-arctic-700 font-bold transition-colors">
                Sign in →
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

export default RegisterPage;

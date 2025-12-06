import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BuildingOfficeIcon,
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
  ArrowRightIcon,
  IdentificationIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import polarBearBg from '@/assets/polar-bears-swimming.jpg';

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
  const { register, isLoading } = useAuth();
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

  // Mock NZBN search - replace with real API call
  const searchNZBN = async (query: string) => {
    if (!query || query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));

    // Mock data - replace with real NZBN API
    const mockCompanies: NZBNResult[] = [
      { nzbn: '9429000000001', name: 'Test Company', status: 'Registered' },
      { nzbn: '9429000000002', name: 'Acme Corporation Limited', status: 'Registered' },
      { nzbn: '9429000000003', name: 'Tech Innovations NZ Ltd', status: 'Registered' },
      { nzbn: '9429000000004', name: 'Green Energy Solutions', status: 'Registered' },
      { nzbn: '9429000000005', name: 'Pacific Consulting Group', status: 'Registered' },
      { nzbn: '9429000000006', name: 'Auckland Software Development', status: 'Registered' },
    ];

    const filtered = mockCompanies.filter(company =>
      company.name.toLowerCase().includes(query.toLowerCase()) ||
      company.nzbn.includes(query)
    );

    setSearchResults(filtered);
    setIsSearching(false);
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

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-white via-ice-50 to-arctic-50">
      {/* Background Image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `url(${polarBearBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.15
        }}
      />

      {/* Inverse White Vignette - lighter in center, darker at edges */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: 'radial-gradient(circle at center, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.3) 100%)'
        }}
      />

      {/* Main Registration Card - Centered */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-3xl mb-4 shadow-xl"
            >
              <span className="text-4xl">🐻‍❄️</span>
            </motion.div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Create an account</h1>
            <p className="text-gray-600">Join Isbjorn today</p>
          </div>

          {/* Registration Card */}
          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 p-8">

          {/* Quick Sign Up */}
          <div className="mb-6">
            <p className="text-sm text-gray-600 text-center mb-4">Choose your preferred sign-up method</p>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleSocialLogin('Google')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
              >
                <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-arctic-600">Google</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('Proton Mail')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
              >
                <svg className="w-8 h-8 mb-2" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14 14-6.3 14-14S23.7 2 16 2zm0 24c-5.5 0-10-4.5-10-10S10.5 6 16 6s10 4.5 10 10-4.5 10-10 10z" fill="#6D4AFF"/>
                  <path d="M16 8c-4.4 0-8 3.6-8 8v4c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-4c0-4.4-3.6-8-8-8zm4 12h-8v-4c0-2.2 1.8-4 4-4s4 1.8 4 4v4z" fill="#6D4AFF"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-arctic-600">Proton</span>
              </button>

              <button
                type="button"
                onClick={() => handleSocialLogin('X')}
                className="flex flex-col items-center justify-center p-4 border-2 border-gray-200 rounded-xl hover:border-arctic-400 hover:bg-arctic-50 transition-all group"
              >
                <svg className="w-8 h-8 mb-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="text-xs font-semibold text-gray-700 group-hover:text-arctic-600">X</span>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className={`w-full ${accountType === 'business' ? 'pl-9' : ''} px-3 py-2 rounded-xl border ${errors.name ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <EnvelopeIcon className="w-4 h-4 inline mr-1" />
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.email ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
            </div>

            {/* Password */}
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
                className={`w-full px-3 py-2 rounded-xl border ${errors.password ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <LockClosedIcon className="w-4 h-4 inline mr-1" />
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-3 py-2 rounded-xl border ${errors.confirmPassword ? 'border-red-300' : 'border-ice-200'} focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all text-sm`}
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white py-2.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

              <span className="relative flex items-center justify-center">
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    Sign Up
                    <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
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
      </motion.div>

      {/* Info Sidebar - Right */}
      <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 w-72">
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

      {/* News Sidebar - Left */}
      <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 w-72 space-y-3">
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
    </div>
  );
};

export default RegisterPage;

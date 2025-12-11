import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  XMarkIcon,
  ShareIcon,
  HeartIcon,
  BellIcon,
  CheckCircleIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import LoadingSpinner from '../components/LoadingSpinner';
import SocialFeed from '../components/SocialFeed';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/utils/apiUrl';

const CharityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [charity, setCharity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [amount, setAmount] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'donations'>('posts');

  // Mock data for GoFundMe-style display
  const [campaignData] = useState({
    raised: 247000,
    goal: 500000,
    donorCount: 1248,
    recentDonations: [
      { name: 'Sarah M.', amount: 100, time: '2 hours ago', message: 'Amazing work! Keep it up!' },
      { name: 'John D.', amount: 50, time: '5 hours ago', message: 'Happy to support this cause' },
      { name: 'Emma W.', amount: 250, time: '1 day ago', message: 'Love what you\'re doing!' },
      { name: 'Anonymous', amount: 500, time: '2 days ago', message: '' },
      { name: 'Michael R.', amount: 75, time: '3 days ago', message: 'Every bit helps!' }
    ]
  });

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/public/charities`);
        const data = await res.json();
        if (data?.success) {
          const found = data.data.find((c: any) => String(c.id) === String(id));
          setCharity(found || data.data[0]);
        }
      } catch (e) {
        setCharity({
          id,
          name: 'Selected Charity',
          description: 'Thank you for your support.',
          category: 'Charity',
          location: 'New Zealand',
          verified: true,
          logoUrl: 'https://via.placeholder.com/150',
          heroImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Pre-fill email from user if authenticated
  useEffect(() => {
    if (user?.email && !receiptEmail) {
      setReceiptEmail(user.email);
    }
  }, [user, receiptEmail]);

  const handleDonate = async () => {
    if (!isAuthenticated) {
      setShowAuthPrompt(true);
      return;
    }

    if (!amount || !receiptEmail || !charity) {
      return;
    }

    const donationAmount = parseFloat(amount);
    if (donationAmount < 1) {
      alert('Minimum donation amount is $1.00');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/x402-checkout/create-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: JSON.stringify({
          amount: donationAmount,
          currency: 'NZD',
          charityId: charity.id,
          charityName: charity.name,
          companyEmail: receiptEmail,
          companyName: user?.companyName
        })
      });

      const data = await response.json();

      if (response.status === 401 || response.status === 403) {
        const errorCode = data.code || '';
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'TOKEN_ERROR') {
          localStorage.removeItem('authToken');
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
      }

      if (data.success && data.sessionUrl) {
        window.location.href = data.sessionUrl;
      } else {
        const errorMessage = data.message || data.error || 'Failed to create checkout session. Please try again.';
        alert(errorMessage);
      }
    } catch (error: any) {
      const message = error.message || 'An error occurred. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: charity.name,
          text: `Support ${charity.name} on Isbjörn`,
          url: window.location.href
        });
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      setShareSuccess(true);
      setTimeout(() => setShareSuccess(false), 2000);
    }
  };

  const progressPercentage = Math.min((campaignData.raised / campaignData.goal) * 100, 100);

  if (loading || !charity) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <>
      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowAuthPrompt(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🐻‍❄️</span>
              </div>

              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                Sign in to donate
              </h2>
              <p className="text-ice-600 mb-6">
                Create an account to donate and receive tax receipts.
              </p>

              <div className="space-y-3">
                <Link
                  to="/register"
                  state={{ from: `/charity/${id}` }}
                  className="block w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-3 rounded-xl font-bold hover:from-arctic-600 hover:to-arctic-700 transition-all"
                >
                  Create Account
                </Link>
                <Link
                  to="/login"
                  state={{ from: `/charity/${id}` }}
                  className="block w-full border-2 border-arctic-500 text-arctic-600 py-3 rounded-xl font-bold hover:bg-arctic-50 transition-all"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation Bar */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <Link
              to="/donate"
              className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Charities
            </Link>
          </div>
        </div>

        {/* Cover Photo - Full Width like Facebook/Twitter */}
        <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
          <img
            src={charity.heroImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200'}
            alt={charity.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200';
            }}
          />
          {/* Share Button Overlay */}
          <button
            onClick={handleShare}
            className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white transition-all"
          >
            <ShareIcon className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Profile Header - Like Social Media */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative">
              {/* Profile Picture - Overlapping cover photo */}
              <div className="absolute -top-16 left-0">
                <img
                  src={charity.logoUrl || 'https://via.placeholder.com/150'}
                  alt={`${charity.name} logo`}
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/150';
                  }}
                />
              </div>

              {/* Header Info */}
              <div className="pt-20 pb-4">
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {charity.name}
                      </h1>
                      {charity.verified && (
                        <CheckCircleIcon className="w-7 h-7 text-blue-500" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{charity.category} • {charity.location}</p>

                    {/* Stats Row - Like Instagram */}
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="font-bold text-gray-900">{campaignData.donorCount.toLocaleString()}</span>
                        <span className="text-gray-600 ml-1">supporters</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">${(campaignData.raised / 1000).toFixed(0)}K</span>
                        <span className="text-gray-600 ml-1">raised</span>
                      </div>
                      <div>
                        <span className="font-bold text-gray-900">{Math.round(progressPercentage)}%</span>
                        <span className="text-gray-600 ml-1">of goal</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
                        isFollowing
                          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <BellSolidIcon className="w-5 h-5" />
                          Following
                        </>
                      ) : (
                        <>
                          <BellIcon className="w-5 h-5" />
                          Follow
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        // Scroll to donation card or open modal
                        setActiveTab('donations');
                      }}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all"
                    >
                      💙 Donate
                    </button>
                  </div>
                </div>

                {/* Bio */}
                <p className="mt-4 text-gray-700 max-w-3xl">
                  {charity.description}
                </p>
              </div>

              {/* Tabs - Like Facebook/Twitter */}
              <div className="flex gap-8 border-t border-gray-200 mt-4">
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`py-4 px-2 font-semibold relative transition-colors ${
                    activeTab === 'posts'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Posts
                  {activeTab === 'posts' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`py-4 px-2 font-semibold relative transition-colors ${
                    activeTab === 'about'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  About
                  {activeTab === 'about' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('donations')}
                  className={`py-4 px-2 font-semibold relative transition-colors ${
                    activeTab === 'donations'
                      ? 'text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Donations
                  {activeTab === 'donations' && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column - Main Content (Posts Focus) */}
            <div className="lg:col-span-2 space-y-6">

              {/* Posts Tab */}
              {activeTab === 'posts' && (
                <div className="space-y-6">
                  {/* Social Feed - Main Focus */}
                  <SocialFeed nonprofitName={charity.name} nonprofitId={charity.id} />
                </div>
              )}

              {/* About Tab */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  {/* Progress Section */}
                  <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Campaign Progress</h2>
                    <div className="mb-4">
                      <div className="flex items-baseline gap-2 mb-2">
                        <span className="text-4xl font-bold text-gray-900">
                          ${(campaignData.raised / 1000).toFixed(0)}K
                        </span>
                        <span className="text-gray-500">
                          raised of ${(campaignData.goal / 1000).toFixed(0)}K goal
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercentage}%` }}
                        ></div>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {campaignData.donorCount.toLocaleString()} donors
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-4 h-4" />
                          {Math.round(progressPercentage)}% funded
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Story Section */}
                  <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Story</h2>
                    <div className="prose prose-lg max-w-none text-gray-700 space-y-4">
                      <p>
                        Every donation to {charity.name} makes a real, measurable difference in the lives of those we serve.
                        Your support helps us continue our mission of creating positive change in communities around the world.
                      </p>
                      <p>
                        With complete blockchain transparency, you can track exactly where your donation goes and see the
                        impact it makes. Every dollar is accounted for, and you'll receive regular updates on the projects
                        your contribution supports.
                      </p>
                      <p>
                        Join thousands of supporters who have already made a difference. Together, we can achieve our goal
                        and create lasting change.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Donations Tab */}
              {activeTab === 'donations' && (
                <div className="space-y-6">
                  {/* Recent Donations */}
                  <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-sm">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Donations</h2>
                    <div className="space-y-4">
                      {campaignData.recentDonations.map((donation, idx) => (
                        <div key={idx} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {donation.name.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-semibold text-gray-900">{donation.name}</span>
                              <span className="font-bold text-gray-900">${donation.amount}</span>
                            </div>
                            {donation.message && (
                              <p className="text-sm text-gray-600 mb-1">{donation.message}</p>
                            )}
                            <p className="text-xs text-gray-500">{donation.time}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Donation Card (Sticky) */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border-2 border-blue-100 rounded-xl p-6 shadow-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Make a donation</h3>

                  {/* Quick Amount Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[10, 25, 50, 100, 250, 500].map((suggestedAmount) => (
                      <button
                        key={suggestedAmount}
                        type="button"
                        onClick={() => setAmount(suggestedAmount.toString())}
                        className={`py-3 px-2 border-2 rounded-lg font-bold transition-all ${
                          amount === suggestedAmount.toString()
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-blue-400 hover:bg-gray-50'
                        }`}
                      >
                        ${suggestedAmount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Or enter custom amount
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg font-semibold">$</span>
                      <input
                        type="number"
                        min="1"
                        step="0.01"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-8 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                      />
                    </div>
                  </div>

                  {/* Email Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email for tax receipt
                    </label>
                    <input
                      type="email"
                      value={receiptEmail}
                      onChange={(e) => setReceiptEmail(e.target.value)}
                      placeholder="you@company.co.nz"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Total Display */}
                  {amount && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-700">Your donation</span>
                        <span className="font-bold text-gray-900 text-xl">${amount} NZD</span>
                      </div>
                    </div>
                  )}

                  {/* Donate Button */}
                  <button
                    type="button"
                    onClick={handleDonate}
                    disabled={!amount || !receiptEmail || loading}
                    className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Processing...' : 'Donate now'}
                  </button>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-6 border-t border-gray-200 space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      <span>100% blockchain verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      <span>IRD-compliant tax receipt</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircleIcon className="w-5 h-5 text-blue-500" />
                      <span>Secure X402 payments</span>
                    </div>
                  </div>
                </div>

                {/* Share Section */}
                <div className="mt-6 bg-blue-50 border-2 border-blue-100 rounded-xl p-6">
                  <h4 className="font-bold text-gray-900 mb-3">Share this campaign</h4>
                  <button
                    onClick={handleShare}
                    className="w-full flex items-center justify-center gap-2 bg-white border-2 border-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                  >
                    <ShareIcon className="w-5 h-5" />
                    {shareSuccess ? 'Link copied!' : 'Share'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharityDetailsPage;

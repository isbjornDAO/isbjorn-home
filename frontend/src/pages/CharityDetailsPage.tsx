import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';
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
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

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
        setCharity({ id, name: 'Selected Charity', description: 'Thank you for your support.', category: 'Charity', location: 'New Zealand', verified: true });
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
    console.log('handleDonate called');
    console.log('isAuthenticated:', isAuthenticated);
    console.log('API_URL:', API_URL);

    // If not authenticated, show auth prompt
    if (!isAuthenticated) {
      console.log('User not authenticated, showing prompt');
      setShowAuthPrompt(true);
      return;
    }

    if (!amount || !receiptEmail || !charity) {
      console.log('Missing required fields:', { amount, receiptEmail, charity });
      return;
    }

    const donationAmount = parseFloat(amount);
    if (donationAmount < 1) {
      alert('Minimum donation amount is $1.00');
      return;
    }

    setLoading(true);
    try {
      console.log('Sending request to:', `${API_URL}/x402-checkout/create-session`);
      console.log('Auth Token:', localStorage.getItem('authToken'));
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

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      // Handle authentication errors
      if (response.status === 401 || response.status === 403) {
        const errorCode = data.code || '';
        if (errorCode === 'TOKEN_EXPIRED' || errorCode === 'TOKEN_INVALID' || errorCode === 'TOKEN_ERROR') {
          console.error('Token error:', data);
          // Clear invalid token and redirect to login
          localStorage.removeItem('authToken');
          alert('Your session has expired. Please log in again.');
          window.location.href = '/login';
          return;
        }
      }

      if (data.success && data.sessionUrl) {
        console.log('Redirecting to:', data.sessionUrl);
        window.location.href = data.sessionUrl;
      } else {
        console.error('Session creation failed:', data);
        const errorMessage = data.message || data.error || 'Failed to create checkout session. Please try again.';
        alert(errorMessage);
      }
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      const message = error.message || 'An error occurred. Please try again.';
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !charity) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
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

      <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link
            to="/donate"
            className="inline-flex items-center text-arctic-600 hover:text-arctic-800 mb-8 transition-colors duration-200 font-medium"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Charities
          </Link>

          {/* Charity Header Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
            <div className="relative">
              <div className="h-48 bg-gradient-to-r from-arctic-400 to-arctic-600 flex items-center justify-center">
                <div className="text-6xl">{charity.icon || '🐻‍❄️'}</div>
              </div>
              <div className="absolute -bottom-12 left-8">
                <img
                  src={charity.logoUrl}
                  alt={`${charity.name} logo`}
                  className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                />
              </div>
            </div>
            <div className="pt-16 pb-6 px-8">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-3xl font-bold text-arctic-900 font-display">
                  {charity.name}
                </h1>
                {charity.verified && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
              <p className="text-base text-arctic-600 mb-2 flex items-center">
                <span className="mr-2">📍</span>
                {charity.location}
              </p>
              <p className="text-arctic-600">{charity.description}</p>
            </div>
          </div>

          {/* 3-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column - Featured Video */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-ice-100 lg:sticky lg:top-8">
                <h2 className="text-xl font-bold text-ice-900 mb-4">Featured Video</h2>

                {/* Video Placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-arctic-100 to-ice-100 rounded-xl overflow-hidden mb-4">
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-arctic-500 rounded-full flex items-center justify-center mb-4">
                      <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <p className="text-ice-600 font-medium">Brand Video Coming Soon</p>
                    <p className="text-ice-500 text-sm mt-1">Placeholder for {charity.name}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-ice-900">About This Video</h3>
                  <p className="text-sm text-ice-600 leading-relaxed">
                    Watch how {charity.name} is making a difference in communities around the world.
                    This video showcases our latest projects and the impact of your donations.
                  </p>
                  <div className="pt-3 border-t border-ice-200">
                    <div className="flex items-center justify-between text-sm text-ice-600">
                      <span>Duration: 2:30</span>
                      <span>Published: Jan 2024</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Center Column - Donation Form */}
            <div className="lg:col-span-4">
              <div className="lg:sticky lg:top-8">
                <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6 border border-ice-100">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-arctic-900 mb-2">Make a Donation</h2>
                  <p className="text-arctic-600">Support {charity.name}</p>
                </div>

                {/* Amount Selection */}
                <div>
                  <label className="block text-sm font-semibold text-arctic-800 mb-3">Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[10, 25, 50, 100, 250, 500].map((suggestedAmount) => (
                      <button
                        key={suggestedAmount}
                        type="button"
                        onClick={() => setAmount(suggestedAmount.toString())}
                        className={`py-3 px-4 border-2 rounded-lg font-semibold transition-all duration-200 ${amount === suggestedAmount.toString()
                          ? 'border-arctic-500 bg-arctic-50 text-arctic-700'
                          : 'border-ice-300 text-arctic-600 hover:border-arctic-300 hover:bg-ice-50'
                          }`}
                      >
                        ${suggestedAmount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-arctic-500 text-lg font-semibold">$</span>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="Enter amount"
                      className="w-full pl-8 pr-4 py-4 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Email for Tax Receipt */}
                <div>
                  <label className="block text-sm font-semibold text-arctic-800 mb-2">
                    Email for Tax Receipt
                  </label>
                  <input
                    type="email"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                    placeholder="you@company.co.nz"
                    className="w-full px-4 py-4 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                    required
                  />
                </div>

                {/* Summary */}
                {amount && (
                  <div className="bg-ice-50 rounded-lg p-4 border border-ice-200">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-arctic-700">Total:</span>
                      <span className="font-bold text-arctic-900 text-xl">${amount} NZD</span>
                    </div>
                  </div>
                )}

                {/* Donate Button */}
                <button
                  type="button"
                  onClick={handleDonate}
                  disabled={!amount || !receiptEmail || loading}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="mr-2">🐻‍❄️</span>
                  <span className="relative">
                    {loading ? 'Processing...' : `Donate ${amount ? `$${amount}` : ''}`}
                  </span>
                </button>

                  <p className="text-center text-sm text-arctic-500">
                    Powered by X402 Payments
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column - Latest Posts */}
            <div className="lg:col-span-4">
              <SocialFeed nonprofitName={charity.name} nonprofitId={charity.id} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CharityDetailsPage;

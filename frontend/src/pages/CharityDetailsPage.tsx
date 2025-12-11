import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
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

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/public/charities/${id}`);
        const data = await res.json();
        if (data?.success && data.data) {
          setCharity(data.data);
        } else {
          const listRes = await fetch(`${API_URL}/public/charities`);
          const listData = await listRes.json();
          if (listData?.success) {
            const found = listData.data.find((c: any) => String(c.id) === String(id));
            setCharity(found || listData.data[0]);
          }
        }
      } catch (e) {
        setCharity({
          id,
          name: 'Selected Charity',
          description: 'Thank you for your support.',
          category: 'Charity',
          location: 'New Zealand',
          logoUrl: 'https://via.placeholder.com/150',
          heroImage: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

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

  if (loading || !charity) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Sign in to donate</h2>
              <button
                onClick={() => setShowAuthPrompt(false)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-600 mb-6">
              Create an account or sign in to make a donation and get your tax receipt.
            </p>
            <div className="space-y-3">
              <Link
                to="/register"
                state={{ from: `/charity/${id}` }}
                className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-bold hover:from-blue-600 hover:to-blue-700 transition-all text-center"
              >
                Create Account
              </Link>
              <Link
                to="/login"
                state={{ from: `/charity/${id}` }}
                className="block w-full border-2 border-blue-500 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all text-center"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

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

      {/* Cover Photo */}
      <div className="relative h-64 md:h-80 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
        <img
          src={charity.heroImage || 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200'}
          alt={charity.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200';
          }}
        />
      </div>

      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative">
            {/* Profile Picture */}
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
            <div className="pt-20 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {charity.name}
                  </h1>
                  <p className="text-gray-600 mb-4">{charity.category} • {charity.location}</p>
                  <p className="text-gray-700 max-w-3xl">
                    {charity.description}
                  </p>
                </div>

                {/* Donate Button */}
                <div className="flex-shrink-0">
                  <a
                    href="#donate-section"
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:shadow-lg transition-all text-lg"
                  >
                    💙 Donate Now
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Column - Community Posts */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Community</h2>
              <p className="text-gray-600 text-sm mb-4">See updates and join the conversation with other supporters</p>
            </div>

            <SocialFeed nonprofitName={charity.name} nonprofitId={charity.id} />
          </div>

          {/* Right Column - Donation Card (Sticky) */}
          <div className="lg:col-span-1">
            <div id="donate-section" className="sticky top-24">
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
                  <div className="bg-blue-50 rounded-lg p-4 mb-4 border-2 border-blue-100">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Your donation</span>
                      <span className="font-bold text-blue-600 text-2xl">${amount}</span>
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

                {/* Simple trust info */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    💙 100% blockchain verified • IRD-compliant receipt • Secure payment
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CharityDetailsPage;

import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import EmbeddedStripeCheckout from '../components/EmbeddedStripeCheckout';
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
    if (!amount || !receiptEmail || !charity) return;

    const donationAmount = parseFloat(amount);
    if (donationAmount < 1) {
      alert('Minimum donation amount is $1.00');
      return;
    }

    setShowEmbeddedCheckout(true);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    setShowEmbeddedCheckout(false);
    navigate('/donation-success', {
      state: {
        amount,
        charity: charity?.name,
        paymentIntentId: paymentIntent.id
      }
    });
  };

  const handlePaymentError = (error: string) => {
    alert(`Payment failed: ${error}`);
  };

  const handlePaymentCancel = () => {
    setShowEmbeddedCheckout(false);
  };

  if (loading || !charity) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">{charity.icon || '🐻‍❄️'}</span>
            </div>

            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Donate to {charity.name}
            </h2>
            <p className="text-ice-600 mb-8">
              Please sign in or create an account to continue with your donation.
            </p>

            <div className="space-y-4">
              <Link
                to="/login"
                state={{ from: `/charity/${id}` }}
                className="block w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-4 rounded-xl font-bold text-lg hover:from-arctic-600 hover:to-arctic-700 transition-all"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                state={{ from: `/charity/${id}` }}
                className="block w-full border-2 border-arctic-500 text-arctic-600 py-4 rounded-xl font-bold text-lg hover:bg-arctic-50 transition-all"
              >
                Create Account
              </Link>
            </div>

            <Link
              to="/donate"
              className="inline-flex items-center text-arctic-600 hover:text-arctic-800 mt-6 text-sm"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back to Charities
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/donate"
          className="inline-flex items-center text-arctic-600 hover:text-arctic-800 mb-8 transition-colors duration-200 font-medium"
        >
          <ArrowLeftIcon className="w-5 h-5 mr-2" />
          Back to Charities
        </Link>

        {showEmbeddedCheckout ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-arctic-900 mb-2">
                Complete Your Donation
              </h2>
              <p className="text-arctic-600">
                You're donating ${amount} to {charity.name}
              </p>
            </div>

            <EmbeddedStripeCheckout
              amount={parseFloat(amount)}
              currency="NZD"
              charityName={charity.name}
              onSuccess={handlePaymentSuccess}
              onError={handlePaymentError}
              onCancel={handlePaymentCancel}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start">
            {/* Left Side - Charity Information */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                <div className="relative">
                  <div className="h-64 bg-gradient-to-r from-arctic-400 to-arctic-600 flex items-center justify-center">
                    <div className="text-6xl">{charity.icon || '🐻‍❄️'}</div>
                  </div>
                  <div className="absolute -bottom-16 left-8">
                    <img
                      src={charity.logoUrl}
                      alt={`${charity.name} logo`}
                      className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  </div>
                </div>
                <div className="pt-20 pb-8 px-8">
                  <div className="flex items-center justify-between mb-4">
                    <h1 className="text-4xl font-bold text-arctic-900 font-display">
                      {charity.name}
                    </h1>
                    {charity.verified && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        Verified
                      </span>
                    )}
                  </div>
                  <p className="text-lg text-arctic-600 mb-4 flex items-center">
                    <span className="mr-2">📍</span>
                    {charity.location}
                  </p>
                  <p className="text-arctic-600">{charity.description}</p>
                </div>
              </div>
            </div>

            {/* Right Side - Simple Donation Form */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
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
                        className={`py-3 px-4 border-2 rounded-lg font-semibold transition-all duration-200 ${
                          amount === suggestedAmount.toString()
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
                  disabled={!amount || !receiptEmail}
                  className="w-full group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <span className="mr-2">🐻‍❄️</span>
                  <span className="relative">Donate{amount && ` $${amount}`}</span>
                </button>

                <p className="text-center text-sm text-arctic-500">
                  Your payment is processed securely by Stripe
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityDetailsPage;

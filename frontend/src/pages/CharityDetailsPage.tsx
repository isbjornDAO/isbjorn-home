import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import EmbeddedStripeCheckout from '../components/EmbeddedStripeCheckout';

const CharityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [charity, setCharity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [companyNumber, setCompanyNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showEmbeddedCheckout, setShowEmbeddedCheckout] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/public/charities');
        const data = await res.json();
        if (data?.success) {
          const found = data.data.find((c: any) => String(c.id) === String(id));
          setCharity(found || data.data[0]);
        }
      } catch (e) {
        // fallback: minimal mock
        setCharity({ id, name: 'Selected Charity', description: 'Thank you for your support.', category: 'Charity', location: 'New Zealand', verified: true });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  // Create Stripe Checkout session
  const handleDonate = async () => {
    if (!amount || !contactEmail || !charity) return;
    
    // Validate minimum amount
    const donationAmount = parseFloat(amount);
    if (donationAmount < 1) {
      alert('Minimum donation amount is $1.00');
      return;
    }
    
    // Show embedded checkout instead of redirecting
    setShowEmbeddedCheckout(true);
  };

  const handlePaymentSuccess = (paymentIntent: any) => {
    // Handle successful payment
    alert('Payment successful! Thank you for your donation.');
    setShowEmbeddedCheckout(false);
    // Optionally redirect to success page
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:items-start lg:min-h-screen">
            {/* Left Side - Charity Information */}
            <div className="space-y-8">
              {/* Hero Section */}
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
                        ✓ Verified
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

            {/* Right Side - Payment Form */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-arctic-900 mb-2">Make a Donation</h2>
                  <p className="text-arctic-600">Support {charity.name} and receive an instant IRD-compliant tax receipt</p>
                </div>

                {/* Quick Amount Selection */}
                <div>
                  <label className="block text-sm font-semibold text-arctic-800 mb-3">Choose Amount</label>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[1, 50, 100, 250, 500, 1000].map((suggestedAmount) => (
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
                      placeholder="100.00"
                      className="w-full pl-8 pr-4 py-4 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500 text-lg font-semibold"
                      required
                    />
                  </div>
                </div>

                {/* Company Details */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-arctic-800 mb-4">Company Details</h3>
                  <div>
                    <label className="block text-sm font-medium text-arctic-700 mb-2">NZ Company Number</label>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 px-4 py-3 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                        value={companyNumber}
                        onChange={(e) => setCompanyNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234567"
                        required
                      />
                      {import.meta.env.DEV && (
                        <button
                          type="button"
                          onClick={() => setCompanyNumber('1234567')}
                          className="px-4 py-3 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 text-sm font-medium"
                        >
                          Test
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-arctic-500 mt-1">We'll automatically lookup your company details</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-arctic-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="finance@yourcompany.co.nz"
                      className="w-full px-4 py-3 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-arctic-700 mb-2">Accountant Email (Optional)</label>
                    <input
                      type="email"
                      value={accountantEmail}
                      onChange={(e) => setAccountantEmail(e.target.value)}
                      placeholder="accountant@yourcompany.co.nz"
                      className="w-full px-4 py-3 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-arctic-700 mb-2">Message (Optional)</label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Thank you for your amazing work!"
                      className="w-full px-4 py-3 border-2 border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                    />
                  </div>
                </div>

                {/* Summary */}
                {amount && (
                  <div className="bg-ice-50 rounded-lg p-4 border border-ice-200">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-medium text-arctic-700">Total Donation:</span>
                      <span className="font-bold text-arctic-900 text-xl">${amount} NZD</span>
                    </div>
                    <p className="text-sm text-arctic-600 mt-2">
                      IRD-compliant receipt will be emailed immediately
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleDonate}
                  disabled={submitting || !amount || !contactEmail}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-4 px-6 rounded-lg font-bold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="small" />
                      <span className="ml-2">Creating Checkout...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">💳</span>
                      Donate with Stripe Checkout {amount && `($${amount})`}
                    </>
                  )}
                </button>

                <div className="text-center text-sm text-arctic-500">
                  <p>🔒 Secure payment powered by Stripe Checkout</p>
                  <p>💳 Your payment is processed securely by Stripe</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CharityDetailsPage;
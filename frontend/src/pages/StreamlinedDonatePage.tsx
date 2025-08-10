import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import LoadingSpinner from '@/components/LoadingSpinner';
import CharityCard from '@/components/CharityCard';

// Load Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || '');

// Step indicators
const steps = [
  { id: 1, name: 'Company', description: 'Enter NZ company number' },
  { id: 2, name: 'Charity', description: 'Select from verified charities' },
  { id: 3, name: 'Amount', description: 'Enter donation amount' },
  { id: 4, name: 'Payment', description: 'Complete payment' },
];

interface CompanyData {
  legalName: string;
  registeredAddress: string;
  directors: string[];
  isCompliant: boolean;
  canDonate: boolean;
  issues: string[];
}

interface Charity {
  id: string;
  name: string;
  legalName: string;
  category: string;
  logoUrl?: string;
  description: string;
  totalDonations: number;
  location?: string;
  verified?: boolean;
  totalReceived: number;
  donationCount: number;
  website?: string;
  causes?: string[];
}

const StreamlinedDonationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();

  // Form state
  const [companyNumber, setCompanyNumber] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [selectedCharity, setSelectedCharity] = useState<Charity | null>(null);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [amount, setAmount] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');
  const [message, setMessage] = useState('');
  
  // Auto-populate company on number change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (companyNumber && companyNumber.length >= 6) {
        await autoPopulateCompany();
      }
    }, 1000); // Debounce by 1 second

    return () => clearTimeout(timer);
  }, [companyNumber]);

  // Load verified charities on mount
  useEffect(() => {
    loadVerifiedCharities();
  }, []);

  const autoPopulateCompany = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/donations/companies/${companyNumber}/auto-populate`);
      const result = await response.json();
      
      if (result.success) {
        setCompanyData(result.data);
        if (result.data.canDonate) {
          setCurrentStep(2); // Auto-advance to charity selection
        }
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('Company lookup failed:', error);
      alert('Failed to lookup company. Please check the company number.');
    } finally {
      setLoading(false);
    }
  };

  const loadVerifiedCharities = async () => {
    try {
      const response = await fetch('/api/donations/charities/verified-dropdown');
      const result = await response.json();
      
      if (result.success) {
        setCharities(result.data);
      }
    } catch (error) {
      console.error('Failed to load charities:', error);
    }
  };

  const handleCharitySelect = (charity: Charity) => {
    setSelectedCharity(charity);
    setCurrentStep(3);
  };

  const handleAmountNext = () => {
    if (!amount || parseFloat(amount) < 1) {
      alert('Please enter a valid donation amount');
      return;
    }
    setCurrentStep(4);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !selectedCharity || !companyData) {
      return;
    }

    setLoading(true);
    const startTime = Date.now();

    try {
      // Create payment method
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        throw new Error('Card element not found');
      }

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: companyData.legalName,
          email: contactEmail,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      // Process donation
      const donationRequest = {
        nzCompanyNumber: companyNumber,
        charityId: selectedCharity.id,
        amount: parseFloat(amount),
        stripePaymentMethodId: paymentMethod.id,
        companyContactEmail: contactEmail,
        accountantEmail: accountantEmail || undefined,
        message: message || undefined,
      };

      const response = await fetch('/api/donations/streamlined', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(donationRequest),
      });

      const result = await response.json();
      const endTime = Date.now();
      
      setProcessingTime(endTime - startTime);

      if (result.success) {
        // Navigate to success page with results
        navigate('/donation/success', { 
          state: { 
            donation: result,
            processingTime: endTime - startTime
          } 
        });
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      console.error('Donation failed:', error);
      alert(`Donation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 to-arctic-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b border-ice-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-arctic-900">
                🚀 2-Minute NZ Business Donation
              </h1>
              <p className="text-arctic-600 mt-1">
                Ultra-streamlined • IRD Compliant • Xero Ready
              </p>
            </div>
            {processingTime > 0 && (
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  ⚡ {(processingTime / 1000).toFixed(1)}s
                </div>
                <p className="text-sm text-arctic-600">Processing time</p>
              </div>
            )}
          </div>

          {/* Progress Steps */}
          <div className="mt-8">
            <div className="flex items-center">
              {steps.map((step, stepIdx) => (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-semibold ${
                        currentStep >= step.id
                          ? 'bg-arctic-500 border-arctic-500 text-white'
                          : 'border-arctic-200 text-arctic-400'
                      }`}
                    >
                      {currentStep > step.id ? '✓' : step.id}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-arctic-900">{step.name}</p>
                      <p className="text-xs text-arctic-500">{step.description}</p>
                    </div>
                  </div>
                  {stepIdx < steps.length - 1 && (
                    <div
                      className={`flex-1 h-0.5 mx-4 ${
                        currentStep > step.id ? 'bg-arctic-500' : 'bg-arctic-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Company Number */}
          {currentStep >= 1 && (
            <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-arctic-100 flex items-center justify-center mr-4">
                  <span className="text-arctic-600 text-lg">🏢</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-arctic-900">Company Details</h2>
                  <p className="text-arctic-600">Enter your NZ company number for auto-population</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    NZ Company Number
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={companyNumber}
                      onChange={(e) => setCompanyNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="1234567"
                      className="flex-1 px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent text-lg"
                      maxLength={10}
                    />
                    {/* Development helper button */}
                    {import.meta.env.DEV && (
                      <button
                        type="button"
                        onClick={() => setCompanyNumber('1234567')}
                        className="px-4 py-3 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 text-sm font-medium"
                      >
                        Use Test #
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-arctic-500 mt-1">
                    We'll automatically lookup your company details from the NZ Companies Register
                  </p>
                </div>

                {loading && companyNumber && (
                  <div className="flex items-center text-arctic-600">
                    <LoadingSpinner size="sm" />
                    <span className="ml-2">Looking up company...</span>
                  </div>
                )}

                {companyData && (
                  <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-green-800">
                          ✅ Company Verified: {companyData.legalName}
                        </h3>
                        <p className="text-sm text-green-700 mt-1">
                          {companyData.registeredAddress}
                        </p>
                        <p className="text-sm text-green-700 mt-1">
                          Directors: {companyData.directors.join(', ')}
                        </p>
                        {!companyData.canDonate && companyData.issues.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium text-red-800">Issues found:</p>
                            <ul className="text-sm text-red-700 list-disc list-inside">
                              {companyData.issues.map((issue, idx) => (
                                <li key={idx}>{issue}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Charity Selection */}
          {currentStep >= 2 && companyData && (
            <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
                  <span className="text-green-600 text-lg">💚</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-arctic-900">Select Charity</h2>
                  <p className="text-arctic-600">Choose from pre-verified donee organisations</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-96 overflow-y-auto">
                {charities.map((charity) => {
                  // Transform charity data to match CharityCard interface
                  const cardCharity = {
                    ...charity,
                    location: charity.location || 'New Zealand',
                    verified: charity.verified ?? true,
                    totalReceived: charity.totalReceived || charity.totalDonations * 50, // Estimate
                    donationCount: charity.donationCount || charity.totalDonations,
                    causes: charity.causes || [charity.category.toLowerCase()]
                  };
                  
                  return (
                    <CharityCard
                      key={charity.id}
                      charity={cardCharity}
                      className={selectedCharity?.id === charity.id ? 'ring-2 ring-arctic-500 border-arctic-500' : ''}
                      onClick={() => handleCharitySelect(charity)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Amount */}
          {currentStep >= 3 && selectedCharity && (
            <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center mr-4">
                  <span className="text-yellow-600 text-lg">💰</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-arctic-900">Donation Amount</h2>
                  <p className="text-arctic-600">Enter the amount you'd like to donate</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    Amount (NZD)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-arctic-500 text-lg">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      min="1"
                      step="0.01"
                      className="w-full pl-8 pr-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent text-lg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 250, 500].map((suggestedAmount) => (
                    <button
                      key={suggestedAmount}
                      type="button"
                      onClick={() => setAmount(suggestedAmount.toString())}
                      className="py-2 px-4 border border-ice-300 rounded-lg text-sm font-medium text-arctic-700 hover:bg-ice-50 hover:border-ice-400 transition-colors"
                    >
                      ${suggestedAmount}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="finance@yourcompany.co.nz"
                    className="w-full px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    Accountant Email (Optional)
                  </label>
                  <input
                    type="email"
                    value={accountantEmail}
                    onChange={(e) => setAccountantEmail(e.target.value)}
                    placeholder="accountant@yourcompany.co.nz"
                    className="w-full px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                  />
                  <p className="text-xs text-arctic-500 mt-1">
                    Receipt will be automatically sent to both emails
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Thank you for your amazing work!"
                    rows={3}
                    className="w-full px-4 py-3 border border-ice-300 rounded-lg focus:ring-2 focus:ring-arctic-500 focus:border-transparent"
                  />
                </div>

                {currentStep === 3 && (
                  <button
                    type="button"
                    onClick={handleAmountNext}
                    className="w-full bg-arctic-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-arctic-700 transition-colors"
                  >
                    Continue to Payment →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 4: Payment */}
          {currentStep >= 4 && (
            <div className="bg-white rounded-xl shadow-sm border border-ice-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                  <span className="text-blue-600 text-lg">💳</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-arctic-900">Payment Details</h2>
                  <p className="text-arctic-600">Secure payment with instant IRD receipt</p>
                </div>
              </div>

              {/* Donation Summary */}
              <div className="mb-6 p-4 bg-ice-50 rounded-lg">
                <h3 className="font-semibold text-arctic-900 mb-2">Donation Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Company:</span>
                  <span className="font-medium">{companyData?.legalName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Charity:</span>
                  <span className="font-medium">{selectedCharity?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount:</span>
                  <span className="font-medium text-lg">${amount} NZD</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-arctic-700 mb-2">
                    Card Details
                  </label>
                  <div className="p-4 border border-ice-300 rounded-lg">
                    <CardElement
                      options={{
                        style: {
                          base: {
                            fontSize: '16px',
                            color: '#374151',
                            '::placeholder': {
                              color: '#9CA3AF',
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">What happens next:</h3>
                      <ul className="text-sm text-green-700 mt-1 space-y-1">
                        <li>• Payment processed securely via Stripe</li>
                        <li>• IRD-compliant receipt generated instantly</li>
                        <li>• Receipt emailed to you and your accountant</li>
                        <li>• Transaction auto-exported to Xero/MYOB</li>
                        <li>• Receipt archived for 7 years (IRD requirement)</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!stripe || loading}
                  className="w-full bg-green-600 text-white py-4 px-4 rounded-lg font-semibold text-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <LoadingSpinner size="sm" />
                      <span className="ml-2">Processing Donation...</span>
                    </>
                  ) : (
                    <>
                      🚀 Complete Donation (${amount})
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

const StreamlinedDonatePage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <StreamlinedDonationForm />
    </Elements>
  );
};

export default StreamlinedDonatePage;
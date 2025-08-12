import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, useStripe, useElements, CardElement } from '@stripe/react-stripe-js';
import { HeartIcon, CurrencyDollarIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import LoadingSpinner from '@/components/LoadingSpinner';

// Load Stripe (fallback dev key to enable demo)
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51_placeholder');

interface CompanyData {
  legalName: string;
  registeredAddress: string;
  directors: string[];
  isCompliant: boolean;
  canDonate: boolean;
  issues: string[];
}

const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  
  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  // Donation flow state
  const [selectedCharity, setSelectedCharity] = useState<any | null>(null);
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [companyNumber, setCompanyNumber] = useState('');
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);
  const [amount, setAmount] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [accountantEmail, setAccountantEmail] = useState('');
  const [message, setMessage] = useState('');
  const [processingDonation, setProcessingDonation] = useState(false);

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`/api/public/charities`);
        const result = await response.json();
        
        if (result.success) {
          setCharities(result.data);
        } else {
          throw new Error(result.message || 'Failed to load charities');
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
        setError('Failed to load charities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    // Try API first, fallback to mock data
    fetchCharities();
  }, []);

  const mockCharities = [
    {
      id: '1',
      name: 'Isbjorn Arctic Conservation',
      description: 'Leading the fight to protect Arctic ice and polar bear habitats through scientific research and direct conservation action.',
      category: 'Environment',
      location: 'Auckland, NZ',
      verified: true,
      totalReceived: 125000,
      donationCount: 847,
      logoUrl: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
      charityPhoto: 'https://images.unsplash.com/photo-1551446591-142875a901a1?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '🐻‍❄️',
      website: 'https://isbjorn.co.nz'
    },
    {
      id: '2',
      name: 'The Salvation Army New Zealand',
      description: 'Fighting poverty and social distress since 1883. Providing budgeting advice, food assistance, and support to 120,000+ families annually.',
      category: 'Social Services',
      location: 'National, NZ',
      verified: true,
      totalReceived: 2450000,
      donationCount: 15600,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTEwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+U2FsdmF0aW9uPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjEzMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkFybXk8L3RleHQ+Cjwvc3ZnPgo=',
      charityPhoto: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '🛡️',
      website: 'https://salvationarmy.org.nz'
    },
    {
      id: '3',
      name: 'Starship Foundation',
      description: 'Supporting NZ\'s national children\'s hospital. $160M+ raised since 1992 for world-class pediatric healthcare and research.',
      category: 'Health',
      location: 'Auckland, NZ',
      verified: true,
      totalReceived: 1850000,
      donationCount: 12400,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDA3N0JFIi8+Cjxwb2x5Z29uIHBvaW50cz0iMTAwLDQwIDEyMCw4MCA4MCw4MCIgZmlsbD0iI0ZGRDcwMCIvPgo8dGV4dCB4PSIxMDAiIHk9IjEyMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPlN0YXJzaGlwPC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkZvdW5kYXRpb248L3RleHQ+Cjwvc3ZnPgo=',
      charityPhoto: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '⭐',
      website: 'https://starship.org.nz'
    },
    {
      id: '4',
      name: 'Forest & Bird',
      description: 'NZ\'s leading independent conservation organisation since 1923. Protecting indigenous flora, fauna and natural ecosystems.',
      category: 'Environment',
      location: 'National, NZ',
      verified: true,
      totalReceived: 890000,
      donationCount: 5600,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMkU3RDMyIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjcwIiByPSIxNSIgZmlsbD0iIzQ2QTA0RSIvPgo8cGF0aCBkPSJNODUgODVMOTUgOTVMOTAgMTAwTDEwMCAxMTBMMTEwIDEwMEwxMDUgOTVMMTE1IDg1Wk04NSA4NUw5MCA5MEw4NSA5NVoiIGZpbGw9IiM0NkEwNEUiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTQwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+Rm9yZXN0ICZhbXA7PC90ZXh0Pgo8dGV4dCB4PSIxMDAiIHk9IjE2MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMTQiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC13ZWlnaHQ9ImJvbGQiPkJpcmQ8L3RleHQ+Cjwvc3ZnPgo=',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '🦜',
      website: 'https://forestandbird.org.nz'
    },
    {
      id: '5',
      name: 'KidsCan',
      description: 'NZ\'s leading children\'s charity. Providing food, clothing and health items to 60,000+ Kiwi kids daily since 2005.',
      category: 'Education',
      location: 'Auckland, NZ',
      verified: true,
      totalReceived: 675000,
      donationCount: 4200,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkY2QjM1Ii8+CjxjaXJjbGUgY3g9IjkwIiBjeT0iNzAiIHI9IjEwIiBmaWxsPSIjRkZEOTAwIi8+CjxjaXJjbGUgY3g9IjExMCIgY3k9IjcwIiByPSIxMCIgZmlsbD0iI0ZGRDkwMCIvPgo8cGF0aCBkPSJNODAgODVIODVWOTBIODBaIiBmaWxsPSIjRkZEOTAwIi8+CjxwYXRoIGQ9Ik0xMTUgODVIMTIwVjkwSDExNVoiIGZpbGw9IiNGRkQ5MDAiLz4KPHR1ZXh0IHg9IjEwMCIgeT0iMTMwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXdlaWdodD0iYm9sZCI+S2lkc0NhbjwvdGV4dD4KPC9zdmc+Cg==',
      charityPhoto: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '👶',
      website: 'https://kidscan.org.nz'
    },
    {
      id: '6',
      name: 'Red Cross New Zealand',
      description: 'Part of the world\'s largest humanitarian network. Disaster relief, refugee support, first aid training, and community services.',
      category: 'Emergency Relief',
      location: 'National, NZ',
      verified: true,
      totalReceived: 1200000,
      donationCount: 8900,
      logoUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSJ3aGl0ZSIvPgo8cGF0aCBkPSJNOTAgNjBIMTEwVjgwSDEyMFYxMDBIMTEwVjEyMEg5MFYxMDBIODBWODBIOTBWNjBaIiBmaWxsPSIjREMyNjI2Ii8+Cjx0ZXh0IHg9IjEwMCIgeT0iMTUwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5SZWQgQ3Jvc3M8L3RleHQ+Cjx0ZXh0IHg9IjEwMCIgeT0iMTcwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjREMyNjI2IiBmb250LXNpemU9IjE0IiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtd2VpZ2h0PSJib2xkIj5OZXcgWmVhbGFuZDwvdGV4dD4KPC9zdmc+Cg==',
      charityPhoto: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?q=80&w=1000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      icon: '➕',
      website: 'https://redcross.org.nz'
    }
  ];


  const handleDonate = (charityId: string) => {
    const charity = charities.find(c => c.id === charityId);
    setSelectedCharity(charity);
    setShowDonationForm(true);
  };

  const handleLearnMore = (charityId: string) => {
    navigate(`/charity/${charityId}`);
  };

  // Auto-populate company on number change
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (companyNumber && companyNumber.length >= 6) {
        await autoPopulateCompany();
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [companyNumber]);

  const autoPopulateCompany = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/donations/companies/${companyNumber}/auto-populate`);
      const result = await response.json();
      
      if (result.success) {
        setCompanyData(result.data);
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

  const handleSubmitDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!stripe || !elements || !selectedCharity || !companyData) {
      return;
    }

    setProcessingDonation(true);

    try {
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error('Card element not found');

      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: companyData.legalName,
          email: contactEmail,
        },
      });

      if (error) throw new Error(error.message);

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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(donationRequest),
      });

      const result = await response.json();

      if (result.success) {
        navigate('/donation/success', { 
          state: { donation: result }
        });
      } else {
        throw new Error(result.message);
      }

    } catch (error: any) {
      console.error('Donation failed:', error);
      alert(`Donation failed: ${error.message}`);
    } finally {
      setProcessingDonation(false);
    }
  };

  // Filter charities based on selected category
  const filteredCharities = selectedCategory === 'All' 
    ? charities 
    : charities.filter(charity => charity.category === selectedCategory);

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('/src/assets/polar-bear-donate-bg.jpg')",
            backgroundPosition: "center 40%"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4">
            Choose a Charity
          </h1>
          <p className="text-lg sm:text-xl text-ice-100 max-w-3xl mx-auto px-4">
            Pick any verified NZ charity to support.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter Categories */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-8 sm:mb-12">
          {['All', 'Environment', 'Health', 'Social Services', 'Education', 'Emergency Relief'].map((category) => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`px-3 sm:px-6 py-2 sm:py-3 border-2 rounded-full font-semibold transition-all duration-200 shadow-sm text-sm sm:text-base ${
                selectedCategory === category
                  ? 'bg-arctic-500 border-arctic-500 text-white shadow-md'
                  : 'bg-white border-ice-200 text-arctic-700 hover:border-arctic-500 hover:bg-arctic-50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-600"></div>
            <span className="ml-3 text-ice-600">Loading charities...</span>
          </div>
        )}


        {/* Icon-Focused Charity Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredCharities.map((charity) => (
            <div
              key={charity.id}
              onClick={() => handleLearnMore(charity.id)}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-ice-100 hover:border-arctic-200 flex flex-col h-full cursor-pointer"
            >
              {/* Hero Image */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                <img
                  src={charity.charityPhoto}
                  alt={`${charity.name} charitable work`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Icon Overlay */}
                <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-16 h-16 sm:w-24 sm:h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl sm:text-6xl">{charity.icon}</span>
                </div>
                {/* Verification Badge */}
                {charity.verified && (
                  <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-green-500 text-white px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-semibold flex items-center">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Verified</span>
                    <span className="sm:hidden">✓</span>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between mb-3 sm:mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg sm:text-xl font-bold text-arctic-900 mb-2 group-hover:text-arctic-600 transition-colors leading-tight">
                      {charity.name}
                    </h3>
                    <div className="flex items-center text-xs sm:text-sm text-arctic-500 mb-2 sm:mb-3">
                      <span className="inline-block w-2 h-2 bg-arctic-400 rounded-full mr-2"></span>
                      <span className="truncate">{charity.category} • {charity.location}</span>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-arctic-700 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                  {charity.description}
                </p>

                {/* Spacer to push stats and buttons to bottom */}
                <div className="flex-1"></div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4">
                  <div className="text-center p-2 sm:p-3 bg-ice-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-arctic-900">
                      ${(charity.totalReceived / 1000).toFixed(0)}k
                    </div>
                    <div className="text-xs text-arctic-500">Total Raised</div>
                  </div>
                  <div className="text-center p-2 sm:p-3 bg-ice-50 rounded-lg">
                    <div className="text-lg sm:text-xl font-bold text-arctic-900">
                      {charity.donationCount.toLocaleString()}
                    </div>
                    <div className="text-xs text-arctic-500">Donations</div>
                  </div>
                </div>

                {/* Click hint */}
                <div className="mt-2 text-center text-sm text-arctic-600">Click to learn more & donate</div>
              </div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Donation modal removed: click a card to open details with payment */}
    </div>
  );
};

const DonatePage: React.FC = () => {
  return (
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  );
};

export default DonatePage;
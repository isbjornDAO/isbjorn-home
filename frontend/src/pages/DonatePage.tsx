import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/utils/apiUrl';

const DonationForm: React.FC = () => {
  const navigate = useNavigate();


  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`${API_URL}/public/charities`);
        const result = await response.json();
        
        if (result.success) {
          setCharities(result.data);
        } else {
          throw new Error(result.message || 'Failed to load charities');
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
        console.error('Failed to load charities');
      } finally {
        setLoading(false);
      }
    };

    // Try API first, fallback to mock data
    fetchCharities();
  }, []);



  const handleLearnMore = (charityId: string) => {
    navigate(`/charity/${charityId}`);
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
  return <DonationForm />;
};

export default DonatePage;
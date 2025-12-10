import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '@/utils/apiUrl';
import polarBearDonateBg from '@/assets/polar-bear-donate-bg.jpg';

const DonationForm: React.FC = () => {
  const navigate = useNavigate();


  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All');

  // Famous NGOs with logos
  const famousNGOs = [
    {
      id: 'greenpeace',
      name: 'Greenpeace',
      category: 'Climate',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'Global environmental organization campaigning against climate change, deforestation, overfishing, and nuclear power.',
      charityPhoto: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
      icon: 'https://logo.clearbit.com/greenpeace.org',
      verified: true,
      totalReceived: 3500000,
      donationCount: 45200
    },
    {
      id: 'wwf',
      name: 'World Wide Fund for Nature',
      category: 'Wildlife',
      country: 'Switzerland',
      location: 'Gland',
      description: 'Leading organization in wildlife conservation and endangered species, working to reduce humanity\'s footprint on the environment.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://logo.clearbit.com/worldwildlife.org',
      verified: true,
      totalReceived: 4200000,
      donationCount: 52800
    },
    {
      id: 'nrdc',
      name: 'Natural Resources Defense Council',
      category: 'Environment',
      country: 'United States',
      location: 'New York',
      description: 'International environmental advocacy group working to safeguard the earth, its people, its plants and animals.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/nrdc.org',
      verified: true,
      totalReceived: 2800000,
      donationCount: 38500
    },
    {
      id: '350org',
      name: '350.org',
      category: 'Climate',
      country: 'United States',
      location: 'Oakland',
      description: 'Building a global grassroots movement to solve the climate crisis through online campaigns, grassroots organizing, and mass public actions.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/350.org',
      verified: true,
      totalReceived: 1950000,
      donationCount: 28900
    },
    {
      id: 'rainforest-alliance',
      name: 'Rainforest Alliance',
      category: 'Forest',
      country: 'United States',
      location: 'New York',
      description: 'Working to conserve biodiversity and ensure sustainable livelihoods by transforming land-use practices, business practices and consumer behavior.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/rainforest-alliance.org',
      verified: true,
      totalReceived: 2100000,
      donationCount: 31200
    },
    {
      id: 'conservation-international',
      name: 'Conservation International',
      category: 'Conservation',
      country: 'United States',
      location: 'Arlington',
      description: 'Protecting nature for the benefit of humanity through science, policy, and partnerships with communities and countries.',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      icon: 'https://logo.clearbit.com/conservation.org',
      verified: true,
      totalReceived: 3100000,
      donationCount: 41800
    },
    {
      id: 'edf',
      name: 'Environmental Defense Fund',
      category: 'Environment',
      country: 'United States',
      location: 'New York',
      description: 'Finding practical solutions to environmental problems through science, economics, law and innovative private-sector partnerships.',
      charityPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      icon: 'https://logo.clearbit.com/edf.org',
      verified: true,
      totalReceived: 2650000,
      donationCount: 35700
    },
    {
      id: 'nature-conservancy',
      name: 'The Nature Conservancy',
      category: 'Conservation',
      country: 'United States',
      location: 'Arlington',
      description: 'Working to protect ecologically important lands and waters around the world for nature and people.',
      charityPhoto: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
      icon: 'https://logo.clearbit.com/nature.org',
      verified: true,
      totalReceived: 4800000,
      donationCount: 58200
    },
    {
      id: 'ocean-conservancy',
      name: 'Ocean Conservancy',
      category: 'Water',
      country: 'United States',
      location: 'Washington DC',
      description: 'Working to protect the ocean from today\'s greatest global challenges through science-based solutions.',
      charityPhoto: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800',
      icon: 'https://logo.clearbit.com/oceanconservancy.org',
      verified: true,
      totalReceived: 1850000,
      donationCount: 24600
    },
    {
      id: 'sierra-club',
      name: 'Sierra Club',
      category: 'Environment',
      country: 'United States',
      location: 'Oakland',
      description: 'Grassroots environmental organization exploring, enjoying, and protecting the planet through advocacy, community engagement, and outdoor activities.',
      charityPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      icon: 'https://logo.clearbit.com/sierraclub.org',
      verified: true,
      totalReceived: 2200000,
      donationCount: 32400
    },
    {
      id: 'friends-of-earth',
      name: 'Friends of the Earth International',
      category: 'Environment',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'Grassroots environmental network campaigning on urgent environmental and social issues.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/foei.org',
      verified: true,
      totalReceived: 1680000,
      donationCount: 22100
    },
    {
      id: 'generation-zero',
      name: 'Generation Zero',
      category: 'Climate',
      country: 'New Zealand',
      location: 'Auckland',
      description: 'Youth-led climate action organization working for meaningful climate action in Aotearoa New Zealand.',
      charityPhoto: 'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?w=800',
      icon: 'https://logo.clearbit.com/generationzero.org.nz',
      verified: true,
      totalReceived: 450000,
      donationCount: 8900
    },
  ];

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`${API_URL}/public/charities`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          setCharities(result.data);
        } else {
          // Fallback to famous NGOs
          setCharities(famousNGOs);
        }
      } catch (err) {
        console.error('Failed to fetch charities:', err);
        // Fallback to famous NGOs
        setCharities(famousNGOs);
      } finally {
        setLoading(false);
      }
    };

    fetchCharities();
  }, []);



  const handleLearnMore = (charityId: string) => {
    navigate(`/charity/${charityId}`);
  };

  // Filter charities based on selected category and country
  const filteredCharities = charities.filter(charity => {
    const categoryMatch = selectedCategory === 'All' || charity.category === selectedCategory;
    const countryMatch = selectedCountry === 'All' || charity.country === selectedCountry;
    return categoryMatch && countryMatch;
  });

  // Get unique countries from charities
  const countries = ['All', ...Array.from(new Set(charities.map(c => c.country || 'New Zealand')))];

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  // Handle country selection
  const handleCountrySelect = (country: string) => {
    setSelectedCountry(country);
  };

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(${polarBearDonateBg})`,
            backgroundPosition: "center 40%"
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4">
            Choose a Charity
          </h1>
          <p className="text-lg sm:text-xl text-ice-100 max-w-3xl mx-auto px-4">
            Support verified charities worldwide
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {/* Filter Countries */}
        <div className="mb-6">
          <h3 className="text-center text-sm font-semibold text-arctic-700 mb-3">Filter by Country</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
            {countries.map((country) => (
              <button
                key={country}
                onClick={() => handleCountrySelect(country)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 border-2 rounded-full font-semibold transition-all duration-200 shadow-sm text-xs sm:text-sm ${selectedCountry === country
                  ? 'border-arctic-500 text-white shadow-md'
                  : 'bg-white border-ice-200 text-arctic-700 hover:border-arctic-500 hover:bg-arctic-50'
                  }`}
                style={selectedCountry === country ? { backgroundColor: '#3b82f6' } : {}}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Categories */}
        <div className="mb-8 sm:mb-12">
          <h3 className="text-center text-sm font-semibold text-arctic-700 mb-3">Filter by Category</h3>
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4">
            {['All', 'Environment', 'Climate', 'Conservation', 'Wildlife', 'Water', 'Forest', 'Health', 'Social Services', 'Education', 'Emergency Relief'].map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`px-3 sm:px-6 py-2 sm:py-3 border-2 rounded-full font-semibold transition-all duration-200 shadow-sm text-sm sm:text-base ${selectedCategory === category
                  ? 'text-white shadow-md'
                  : 'bg-white border-ice-200 text-arctic-700 hover:border-arctic-500 hover:bg-arctic-50'
                  }`}
                style={selectedCategory === category ? { backgroundColor: '#3b82f6', borderColor: '#3b82f6' } : {}}
              >
                {category}
              </button>
            ))}
          </div>
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
                  {/* Logo Overlay */}
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-16 h-16 sm:w-20 sm:h-20 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg p-2 sm:p-3">
                    <img
                      src={charity.icon}
                      alt={`${charity.name} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback to first letter if logo fails to load
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `<span class="text-2xl sm:text-3xl font-bold" style="color: #3b82f6">${charity.name.charAt(0)}</span>`;
                        }
                      }}
                    />
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
                        <span className="truncate">{charity.category} • {charity.country || charity.location || 'New Zealand'}</span>
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
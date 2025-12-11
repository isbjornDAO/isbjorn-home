import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { API_URL } from '@/utils/apiUrl';
import { useAuth } from '@/contexts/AuthContext';

const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Top Climate-Focused Charities
  const famousNGOs = [
    // Core charities to keep
    {
      id: 'isbjorn',
      name: 'Isbjorn',
      category: 'Climate',
      country: 'Global',
      location: 'Worldwide',
      description: 'Leading the fight against climate change through innovative blockchain-based climate action and transparency.',
      charityPhoto: 'https://images.unsplash.com/photo-1483794344563-d27a8d18014e?w=800',
      icon: 'https://logo.clearbit.com/isbjorn.io',
      verified: true,
      totalReceived: 5200000,
      donationCount: 68400,
      followerCount: 0,
      trending: true,
      followerIncrease: 2400
    },
    {
      id: 'forest-and-bird',
      name: 'Forest & Bird',
      category: 'Climate & Conservation',
      country: 'New Zealand',
      location: 'Wellington',
      description: 'New Zealand\'s leading independent conservation organization protecting native wildlife, forests, and oceans from climate change.',
      charityPhoto: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800',
      icon: 'https://logo.clearbit.com/forestandbird.org.nz',
      verified: true,
      totalReceived: 2800000,
      donationCount: 42100,
      followerCount: 0,
      trending: true,
      followerIncrease: 890
    },

    // Major Global Climate Charities
    {
      id: 'wwf',
      name: 'World Wide Fund for Nature (WWF)',
      category: 'Climate & Wildlife',
      country: 'Switzerland',
      location: 'Gland',
      description: 'Leading conservation organization working to protect wildlife, halt deforestation, and combat climate change globally through science-based solutions.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://logo.clearbit.com/worldwildlife.org',
      verified: true,
      totalReceived: 6500000,
      donationCount: 89200,
      followerCount: 0,
      trending: true,
      followerIncrease: 3200
    },
    {
      id: 'greenpeace',
      name: 'Greenpeace International',
      category: 'Climate Action',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'Global environmental organization campaigning against climate change, deforestation, overfishing, and pollution through peaceful direct action.',
      charityPhoto: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=800',
      icon: 'https://logo.clearbit.com/greenpeace.org',
      verified: true,
      totalReceived: 5800000,
      donationCount: 76300,
      followerCount: 0,
      trending: true,
      followerIncrease: 1800
    },
    {
      id: 'nature-conservancy',
      name: 'The Nature Conservancy',
      category: 'Climate Solutions',
      country: 'United States',
      location: 'Arlington, VA',
      description: 'Protecting ecologically important lands and waters to combat climate change through nature-based solutions and carbon sequestration.',
      charityPhoto: 'https://images.unsplash.com/photo-1511497584788-876760111969?w=800',
      icon: 'https://logo.clearbit.com/nature.org',
      verified: true,
      totalReceived: 6200000,
      donationCount: 82400,
      followerCount: 0,
    },
    {
      id: 'conservation-international',
      name: 'Conservation International',
      category: 'Climate & Nature',
      country: 'United States',
      location: 'Arlington, VA',
      description: 'Protecting nature as a solution to climate change through science, partnerships, and field demonstration in biodiversity hotspots.',
      charityPhoto: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
      icon: 'https://logo.clearbit.com/conservation.org',
      verified: true,
      totalReceived: 4900000,
      donationCount: 64800,
      followerCount: 0,
    },
    {
      id: 'edf',
      name: 'Environmental Defense Fund',
      category: 'Climate',
      country: 'United States',
      location: 'New York, NY',
      description: 'Creating transformational solutions to the most serious environmental problems using science, economics, and law.',
      charityPhoto: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800',
      icon: 'https://logo.clearbit.com/edf.org',
      verified: true,
      totalReceived: 4600000,
      donationCount: 61200,
      followerCount: 0,
    },
    {
      id: 'nrdc',
      name: 'Natural Resources Defense Council',
      category: 'Climate Law',
      country: 'United States',
      location: 'New York, NY',
      description: 'Using law and science to combat climate change, protect public health, and preserve natural systems.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/nrdc.org',
      verified: true,
      totalReceived: 4300000,
      donationCount: 58900,
      followerCount: 0,
    },
    {
      id: 'sierra-club',
      name: 'Sierra Club',
      category: 'Climate & Clean Energy',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Fighting climate change by transitioning to clean energy, protecting wild places, and building a healthy planet for all.',
      charityPhoto: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
      icon: 'https://logo.clearbit.com/sierraclub.org',
      verified: true,
      totalReceived: 3800000,
      donationCount: 52400,
      followerCount: 0,
    },
    {
      id: 'rainforest-alliance',
      name: 'Rainforest Alliance',
      category: 'Climate & Forests',
      country: 'United States',
      location: 'New York, NY',
      description: 'Protecting forests to fight climate change, conserve biodiversity, and ensure sustainable livelihoods.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/rainforest-alliance.org',
      verified: true,
      totalReceived: 3600000,
      donationCount: 49800,
      followerCount: 0,
    },
    {
      id: '350org',
      name: '350.org',
      category: 'Climate Justice',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Building a global grassroots climate movement to end fossil fuels and build a world of climate justice and equity.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/350.org',
      verified: true,
      totalReceived: 2900000,
      donationCount: 41800,
      followerCount: 0,
      trending: true,
      followerIncrease: 1200
    },
    {
      id: 'earthjustice',
      name: 'Earthjustice',
      category: 'Climate Law',
      country: 'United States',
      location: 'San Francisco, CA',
      description: 'Using the power of law to combat climate change, protect clean air and water, and preserve wild places.',
      charityPhoto: 'https://images.unsplash.com/photo-1589802829985-817e51171b92?w=800',
      icon: 'https://logo.clearbit.com/earthjustice.org',
      verified: true,
      totalReceived: 3100000,
      donationCount: 43200,
      followerCount: 0,
    },
    {
      id: 'friends-of-earth',
      name: 'Friends of the Earth International',
      category: 'Climate & Environment',
      country: 'Netherlands',
      location: 'Amsterdam',
      description: 'International network fighting for climate justice, protecting biodiversity, and challenging corporate power.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/foei.org',
      verified: true,
      totalReceived: 2700000,
      donationCount: 38900,
      followerCount: 0,
    },
    {
      id: 'rainforest-foundation',
      name: 'Rainforest Foundation',
      category: 'Climate & Forests',
      country: 'United States',
      location: 'New York, NY',
      description: 'Protecting rainforests as critical carbon sinks while supporting indigenous rights and climate resilience.',
      charityPhoto: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
      icon: 'https://logo.clearbit.com/rainforestfoundation.org',
      verified: true,
      totalReceived: 2100000,
      donationCount: 32600,
      followerCount: 0,
    },
    {
      id: 'amazon-watch',
      name: 'Amazon Watch',
      category: 'Climate & Forests',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Protecting the Amazon rainforest as a critical climate solution while defending indigenous rights and territories.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/amazonwatch.org',
      verified: true,
      totalReceived: 2200000,
      donationCount: 34100,
      followerCount: 0,
      trending: true,
      followerIncrease: 890
    },
    {
      id: 'world-resources-institute',
      name: 'World Resources Institute',
      category: 'Climate Research',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Leading climate research organization developing solutions for climate change, renewable energy, and sustainable development.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/wri.org',
      verified: true,
      totalReceived: 4200000,
      donationCount: 57600,
      followerCount: 0,
    },
    {
      id: 'climate-reality',
      name: 'The Climate Reality Project',
      category: 'Climate Education',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Founded by Al Gore, mobilizing grassroots activists worldwide to demand climate action and accelerate the transition to clean energy.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/climaterealityproject.org',
      verified: true,
      totalReceived: 2300000,
      donationCount: 34800,
      followerCount: 0,
      trending: true,
      followerIncrease: 1450
    },
    {
      id: 'clean-air-task-force',
      name: 'Clean Air Task Force',
      category: 'Climate Technology',
      country: 'United States',
      location: 'Boston, MA',
      description: 'Driving innovation in zero-emissions technologies and policies to achieve a safe climate and clean energy future.',
      charityPhoto: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
      icon: 'https://logo.clearbit.com/catf.us',
      verified: true,
      totalReceived: 2000000,
      donationCount: 31200,
      followerCount: 0,
    },
    {
      id: 'rainforest-trust',
      name: 'Rainforest Trust',
      category: 'Climate & Forests',
      country: 'United States',
      location: 'Warrenton, VA',
      description: 'Protecting rainforests as vital carbon sinks and biodiversity hotspots through land conservation partnerships.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://logo.clearbit.com/rainforesttrust.org',
      verified: true,
      totalReceived: 2700000,
      donationCount: 38600,
      followerCount: 0,
    },
    {
      id: 'plant-for-the-planet',
      name: 'Plant-for-the-Planet',
      category: 'Climate & Reforestation',
      country: 'Germany',
      location: 'Munich',
      description: 'Youth-led global movement planting trees and restoring forests to fight climate change and capture carbon.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/plant-for-the-planet.org',
      verified: true,
      totalReceived: 1400000,
      donationCount: 22700,
      followerCount: 0,
      trending: true,
      followerIncrease: 750
    },
    {
      id: 'polar-bears-international',
      name: 'Polar Bears International',
      category: 'Climate & Wildlife',
      country: 'United States',
      location: 'Bozeman, MT',
      description: 'Conserving polar bears and Arctic sea ice threatened by climate change through research, education, and climate action.',
      charityPhoto: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=800',
      icon: 'https://logo.clearbit.com/polarbearsinternational.org',
      verified: true,
      totalReceived: 1600000,
      donationCount: 25300,
      followerCount: 0,
    },
    {
      id: 'ocean-cleanup',
      name: 'The Ocean Cleanup',
      category: 'Climate & Ocean',
      country: 'Netherlands',
      location: 'Rotterdam',
      description: 'Removing plastic pollution from oceans to protect marine ecosystems critical for climate regulation.',
      charityPhoto: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800',
      icon: 'https://logo.clearbit.com/theoceancleanup.com',
      verified: true,
      totalReceived: 4500000,
      donationCount: 62300,
      followerCount: 0,
      trending: true,
      followerIncrease: 4100
    },
    {
      id: 'carbon-180',
      name: 'Carbon180',
      category: 'Carbon Removal',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Leading carbon removal innovation to reverse climate change by removing CO2 from the atmosphere at scale.',
      charityPhoto: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800',
      icon: 'https://logo.clearbit.com/carbon180.org',
      verified: true,
      totalReceived: 1100000,
      donationCount: 19800,
      followerCount: 0,
      trending: true,
      followerIncrease: 650
    },
    {
      id: 'tree-sisters',
      name: 'TreeSisters',
      category: 'Climate & Reforestation',
      country: 'United Kingdom',
      location: 'Bristol',
      description: 'Women-led network funding tropical forest restoration to combat climate change through natural carbon capture.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://logo.clearbit.com/treesisters.org',
      verified: true,
      totalReceived: 1350000,
      donationCount: 22100,
      followerCount: 0,
    },
    {
      id: 'extinction-rebellion',
      name: 'Extinction Rebellion',
      category: 'Climate Justice',
      country: 'United Kingdom',
      location: 'London',
      description: 'Global environmental movement using non-violent civil disobedience to compel urgent climate action.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/rebellion.global',
      verified: true,
      totalReceived: 1850000,
      donationCount: 28900,
      followerCount: 0,
      trending: true,
      followerIncrease: 1340
    },
    {
      id: 'sunrise-movement',
      name: 'Sunrise Movement',
      category: 'Climate Justice',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Youth-led movement fighting for a Green New Deal and climate justice through grassroots organizing.',
      charityPhoto: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=800',
      icon: 'https://logo.clearbit.com/sunrisemovement.org',
      verified: true,
      totalReceived: 2100000,
      donationCount: 32400,
      followerCount: 0,
      trending: true,
      followerIncrease: 1850
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

  const handleLearnMore = (charityId: string, e: React.MouseEvent) => {
    // Don't navigate if clicking the follow button
    if ((e.target as HTMLElement).closest('.follow-button')) {
      return;
    }
    navigate(`/charity/${charityId}`);
  };

  const handleFollowToggle = (charityId: string, e: React.MouseEvent) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      alert('Please sign in to follow charities');
      return;
    }

    setFollowingIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(charityId)) {
        newSet.delete(charityId);
        // Update follower count
        setCharities(charities.map(c =>
          c.id === charityId
            ? { ...c, followerCount: (c.followerCount || 0) - 1 }
            : c
        ));
      } else {
        newSet.add(charityId);
        // Update follower count
        setCharities(charities.map(c =>
          c.id === charityId
            ? { ...c, followerCount: (c.followerCount || 0) + 1 }
            : c
        ));
      }
      return newSet;
    });
  };


  return (
    <div className="min-h-screen bg-ice-50">
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-12 sm:py-16 md:py-20 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: `url(https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200)`,
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
        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-arctic-600"></div>
            <span className="ml-3 text-ice-600">Loading charities...</span>
          </div>
        )}

        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {charities.map((charity) => {
              const isFollowing = followingIds.has(charity.id);

              return (
                <div
                  key={charity.id}
                  onClick={(e) => handleLearnMore(charity.id, e)}
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
                  </div>

                  {/* Content */}
                  <div className="p-4 sm:p-6 flex flex-col flex-1">
                    {/* Header with Logo and Follow Button */}
                    <div className="flex items-start justify-between mb-3 sm:mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        {/* Logo next to name */}
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100 p-2">
                          <img
                            src={charity.icon}
                            alt={`${charity.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-lg sm:text-xl font-bold" style="color: #3b82f6">${charity.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-bold mb-1" style={{ color: '#3b82f6' }}>
                            {charity.name}
                          </h3>
                          <div className="flex items-center text-xs sm:text-sm text-gray-600 mb-2">
                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span className="truncate">{charity.category} • {charity.country || charity.location || 'New Zealand'}</span>
                          </div>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={(e) => handleFollowToggle(charity.id, e)}
                        className={`follow-button flex-shrink-0 ml-2 p-2 rounded-full transition-all ${
                          isFollowing
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={isFollowing ? { backgroundColor: '#3b82f6' } : {}}
                        title={isFollowing ? 'Following' : 'Follow for updates'}
                      >
                        {isFollowing ? (
                          <BellSolidIcon className="w-5 h-5" />
                        ) : (
                          <BellIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-arctic-700 text-sm mb-3 sm:mb-4 leading-relaxed line-clamp-3">
                      {charity.description}
                    </p>

                    {/* Spacer to push stats and buttons to bottom */}
                    <div className="flex-1"></div>

                    {/* Stats Grid - 3 columns */}
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      <div className="text-center p-2 bg-ice-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900">
                          ${(charity.totalReceived / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-arctic-500">Raised</div>
                      </div>
                      <div className="text-center p-2 bg-ice-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900">
                          {(charity.donationCount / 1000).toFixed(1)}k
                        </div>
                        <div className="text-xs text-arctic-500">Donations</div>
                      </div>
                      <div className="text-center p-2 bg-arctic-50 rounded-lg">
                        <div className="text-base sm:text-lg font-bold text-arctic-900 flex items-center justify-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {charity.followerCount ? (charity.followerCount / 1000).toFixed(1) + 'k' : '0'}
                        </div>
                        <div className="text-xs text-arctic-500">Followers</div>
                      </div>
                    </div>

                    {/* Click hint */}
                    <div className="mt-2 text-center text-sm text-arctic-600">Click to learn more & donate</div>
                  </div>
                </div>
              );
            })}
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

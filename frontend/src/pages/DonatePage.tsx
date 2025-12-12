import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { API_URL } from '@/utils/apiUrl';
import { useAuth } from '@/contexts/AuthContext';
import polarBearMapBg from '@/assets/polar-bear-donate-bg.jpg';
import isbjornLogo from '@/assets/isbjorn-logo.png.jpg';

const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Top Climate-Focused Charities
  const famousNGOs = [
    {
      id: 'isbjorn',
      name: 'Isbjorn',
      category: 'Climate',
      country: 'Global',
      location: 'Worldwide',
      description: 'Leading the fight against climate change through innovative blockchain-based climate action and transparency.',
      charityPhoto: polarBearMapBg,
      icon: isbjornLogo,
      verified: true,
      totalReceived: 5200000,
      donationCount: 68400,
      followerCount: 0,
      trending: true,
      followerIncrease: 2400
    },
    {
      id: 'nrdc',
      name: 'Natural Resources Defense Council',
      category: 'Climate Law',
      country: 'United States',
      location: 'New York, NY',
      description: 'Using law and science to combat climate change, protect public health, and preserve natural systems.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/NRDC_Logo.svg/200px-NRDC_Logo.svg.png',
      verified: true,
      totalReceived: 4300000,
      donationCount: 58900,
      followerCount: 0,
      trending: true,
      followerIncrease: 2100
    },
    {
      id: 'wwf-uk',
      name: 'WWF UK',
      category: 'Conservation',
      country: 'United Kingdom',
      location: 'London',
      description: 'Leading conservation organization working to protect wildlife and halt deforestation in Europe and beyond.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/WWF_logo.svg/200px-WWF_logo.svg.png',
      verified: true,
      totalReceived: 1800000,
      donationCount: 38000,
      followerCount: 0,
      trending: true,
      followerIncrease: 1500
    },
    {
      id: 'wwf-japan',
      name: 'WWF Japan',
      category: 'Climate',
      country: 'Japan',
      location: 'Tokyo',
      description: 'Protecting nature and combating climate change through conservation efforts across Asia-Pacific.',
      charityPhoto: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/WWF_logo.svg/200px-WWF_logo.svg.png',
      verified: true,
      totalReceived: 3200000,
      donationCount: 52000,
      followerCount: 0,
      trending: true,
      followerIncrease: 1800
    },
    {
      id: 'african-regional',
      name: 'African Regional Conservation',
      category: 'Water',
      country: 'Kenya',
      location: 'Nairobi',
      description: 'Regional conservation efforts focused on water conservation and wildlife protection across Africa.',
      charityPhoto: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/The_Nature_Conservancy_logo.svg/200px-The_Nature_Conservancy_logo.svg.png',
      verified: true,
      totalReceived: 950000,
      donationCount: 28000,
      followerCount: 0,
      trending: false,
      followerIncrease: 800
    },
    {
      id: 'south-america',
      name: 'South America Conservation Alliance',
      category: 'Forest',
      country: 'Brazil',
      location: 'S\u00e3o Paulo',
      description: 'Protecting rainforests and biodiversity across South America through sustainable practices.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Rainforest_Alliance_logo.svg/200px-Rainforest_Alliance_logo.svg.png',
      verified: true,
      totalReceived: 1200000,
      donationCount: 31000,
      followerCount: 0,
      trending: true,
      followerIncrease: 1200
    },
    {
      id: 'middle-east',
      name: 'Middle East Environmental Initiative',
      category: 'Climate',
      country: 'UAE',
      location: 'Dubai',
      description: 'Climate action and environmental protection across the Middle East region.',
      charityPhoto: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/WRI_Logo.svg/200px-WRI_Logo.svg.png',
      verified: true,
      totalReceived: 780000,
      donationCount: 22000,
      followerCount: 0,
      trending: false,
      followerIncrease: 450
    },
    {
      id: 'arctic-research',
      name: 'Arctic Research Foundation',
      category: 'Climate',
      country: 'Iceland',
      location: 'Reykjavik',
      description: 'Leading Arctic climate research and monitoring ice melt in northern regions.',
      charityPhoto: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/WRI_Logo.svg/200px-WRI_Logo.svg.png',
      verified: true,
      totalReceived: 450000,
      donationCount: 8000,
      followerCount: 0,
      trending: true,
      followerIncrease: 950
    },
    {
      id: 'amazon-station',
      name: 'Amazon Research Station',
      category: 'Forest',
      country: 'Brazil',
      location: 'Amazon Basin',
      description: 'Field research and conservation in the heart of the Amazon rainforest.',
      charityPhoto: 'https://images.unsplash.com/photo-1425913397330-cf8af2ff40a1?w=800',
      icon: 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d4/Rainforest_Alliance_logo.svg/200px-Rainforest_Alliance_logo.svg.png',
      verified: true,
      totalReceived: 620000,
      donationCount: 12000,
      followerCount: 0,
      trending: false,
      followerIncrease: 650
    },
  ];

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`${API_URL}/public/charities`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Update Isbjorn charity to use polar bear map image and logo
          const updatedCharities = result.data.map((charity: any) =>
            charity.id === 'isbjorn' || charity.name === 'Isbjorn'
              ? { ...charity, charityPhoto: polarBearMapBg, icon: isbjornLogo }
              : charity
          );
          setCharities(updatedCharities);
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
          <h1 className="text-3xl sm:text-4xl font-bold font-display mb-3 sm:mb-4 text-white">
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
          <div className="grid grid-cols-3 gap-4 sm:gap-6">
            {charities.map((charity) => {
              const isFollowing = followingIds.has(charity.id);

              return (
                <div
                  key={charity.id}
                  onClick={(e) => handleLearnMore(charity.id, e)}
                  className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-ice-100 hover:border-arctic-200 flex flex-col cursor-pointer"
                >
                  {/* Hero Image */}
                  <div className="relative h-32 overflow-hidden">
                    <img
                      src={charity.charityPhoto}
                      alt={`${charity.name} charitable work`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </div>

                  {/* Content */}
                  <div className="p-4 flex flex-col">
                    {/* Header with Logo and Follow Button */}
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-start gap-2 flex-1">
                        {/* Logo next to name */}
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-blue-100 p-1.5">
                          <img
                            src={charity.icon}
                            alt={`${charity.name} logo`}
                            className="w-full h-full object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent) {
                                parent.innerHTML = `<span class="text-sm font-bold" style="color: #3b82f6">${charity.name.charAt(0)}</span>`;
                              }
                            }}
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-bold mb-0.5 truncate" style={{ color: '#3b82f6' }}>
                            {charity.name}
                          </h3>
                          <div className="flex items-center text-xs text-gray-600">
                            <span className="inline-block w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: '#3b82f6' }}></span>
                            <span className="truncate">{charity.category}</span>
                          </div>
                        </div>
                      </div>

                      {/* Follow Button */}
                      <button
                        onClick={(e) => handleFollowToggle(charity.id, e)}
                        className={`follow-button flex-shrink-0 ml-2 p-1.5 rounded-full transition-all ${
                          isFollowing
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        style={isFollowing ? { backgroundColor: '#3b82f6' } : {}}
                        title={isFollowing ? 'Following' : 'Follow for updates'}
                      >
                        {isFollowing ? (
                          <BellSolidIcon className="w-4 h-4" />
                        ) : (
                          <BellIcon className="w-4 h-4" />
                        )}
                      </button>
                    </div>

                    {/* Description */}
                    <p className="text-arctic-700 text-xs mb-3 leading-relaxed line-clamp-2">
                      {charity.description}
                    </p>

                    {/* Stats Grid - 3 columns */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2">
                      <div className="text-center p-1.5 bg-ice-50 rounded-lg">
                        <div className="text-sm font-bold text-arctic-900">
                          ${(charity.totalReceived / 1000).toFixed(0)}k
                        </div>
                        <div className="text-xs text-arctic-500">Raised</div>
                      </div>
                      <div className="text-center p-1.5 bg-ice-50 rounded-lg">
                        <div className="text-sm font-bold text-arctic-900">
                          {(charity.donationCount / 1000).toFixed(1)}k
                        </div>
                        <div className="text-xs text-arctic-500">Donations</div>
                      </div>
                      <div className="text-center p-1.5 bg-arctic-50 rounded-lg">
                        <div className="text-sm font-bold text-arctic-900 flex items-center justify-center gap-1">
                          <UserGroupIcon className="w-3 h-3" />
                          {charity.followerCount ? (charity.followerCount / 1000).toFixed(1) + 'k' : '0'}
                        </div>
                        <div className="text-xs text-arctic-500">Followers</div>
                      </div>
                    </div>

                    {/* Click hint */}
                    <div className="text-center text-xs text-arctic-600">Click to learn more & donate</div>
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

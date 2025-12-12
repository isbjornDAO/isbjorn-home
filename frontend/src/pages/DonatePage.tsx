import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BellIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { API_URL } from '@/utils/apiUrl';
import { useAuth } from '@/contexts/AuthContext';
import polarBearMapBg from '@/assets/polar-bear-donate-bg.jpg';
import isbjornLogo from '@/assets/isbjorn-logo.png.jpg';

// Local logo imports
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import rainforestLogo from '@/assets/logos/rainforest.jpg';
import sierraClubLogo from '@/assets/logos/sierra-club.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// Logo mapping for all charity IDs
const LOGO_MAP: Record<string, string> = {
  'pbi': pbiLogo,
  'isbjorn': pbiLogo,
  'wwf': wwfLogo,
  'wwf-uk': wwfLogo,
  'wwf-japan': wwfLogo,
  'greenpeace': greenpeaceLogo,
  'ocean-conservancy': oceanConservancyLogo,
  'the-nature-conservancy': natureConservancyLogo,
  'nature-conservancy': natureConservancyLogo,
  'rainforest-alliance': rainforestLogo,
  'rainforest': rainforestLogo,
  'conservation-intl': conservationIntlLogo,
  'conservation-international': conservationIntlLogo,
  'sierra-club': sierraClubLogo,
};

// Helper function to get logo for a charity
const getCharityLogo = (charityId: string, charityName?: string): string | undefined => {
  const normalizedId = charityId?.toLowerCase().replace(/\s+/g, '-');
  if (LOGO_MAP[normalizedId]) return LOGO_MAP[normalizedId];

  // Try to match by name patterns
  const lowerName = charityName?.toLowerCase() || '';
  if (lowerName.includes('polar bear') || lowerName.includes('isbjorn')) return pbiLogo;
  if (lowerName.includes('wwf')) return wwfLogo;
  if (lowerName.includes('greenpeace')) return greenpeaceLogo;
  if (lowerName.includes('ocean conservancy')) return oceanConservancyLogo;
  if (lowerName.includes('nature conservancy')) return natureConservancyLogo;
  if (lowerName.includes('rainforest')) return rainforestLogo;
  if (lowerName.includes('conservation international')) return conservationIntlLogo;
  if (lowerName.includes('sierra club')) return sierraClubLogo;

  return undefined;
};

const DonationForm: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [charities, setCharities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set());

  // Top Climate-Focused Charities
  // Top Climate-Focused Charities
  const famousNGOs = [
    {
      id: 'pbi',
      name: 'Polar Bears International',
      category: 'Climate',
      country: 'Global',
      location: 'Worldwide',
      description: 'Working to conserve polar bears and the sea ice they depend on through research, education, and action on climate change.',
      charityPhoto: 'https://images.ctfassets.net/i04syw39vv9p/nirpXYfzlXen2Hk3rbfqB/3d572604afeb59fe9c634e9fe1178fd7/social-share.jpg',
      icon: pbiLogo,
      verified: true,
      totalReceived: 15420,
      donationCount: 842,
      followerCount: 42000,
      trending: true,
      followerIncrease: 142
    },
    {
      id: 'wwf-uk',
      name: 'WWF UK',
      category: 'Conservation',
      country: 'United Kingdom',
      location: 'London',
      description: 'Leading conservation organization working to protect wildlife and halt deforestation in Europe and beyond.',
      charityPhoto: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
      icon: wwfLogo,
      verified: true,
      totalReceived: 12500,
      donationCount: 624,
      followerCount: 157000,
      trending: true,
      followerIncrease: 98
    },
    {
      id: 'wwf-japan',
      name: 'WWF Japan',
      category: 'Climate',
      country: 'Japan',
      location: 'Tokyo',
      description: 'Protecting nature and combating climate change through conservation efforts across Asia-Pacific.',
      charityPhoto: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800',
      icon: wwfLogo,
      verified: true,
      totalReceived: 8900,
      donationCount: 450,
      followerCount: 890,
      trending: true,
      followerIncrease: 76
    },
    {
      id: 'greenpeace',
      name: 'Greenpeace',
      category: 'Environment',
      country: 'Global',
      location: 'Worldwide',
      description: 'Global environmental organization campaigning to end climate change and protect biodiversity.',
      charityPhoto: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
      icon: greenpeaceLogo,
      verified: true,
      totalReceived: 14100,
      donationCount: 780,
      followerCount: 35000,
      trending: true,
      followerIncrease: 128
    },
    {
      id: 'ocean-conservancy',
      name: 'Ocean Conservancy',
      category: 'Ocean',
      country: 'United States',
      location: 'Washington, DC',
      description: 'Working to protect the ocean from today\'s greatest global challenges through science-based solutions.',
      charityPhoto: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
      icon: oceanConservancyLogo,
      verified: true,
      totalReceived: 11200,
      donationCount: 590,
      followerCount: 28000,
      trending: true,
      followerIncrease: 95
    },
    {
      id: 'the-nature-conservancy',
      name: 'The Nature Conservancy',
      category: 'Conservation',
      country: 'Global',
      location: 'Worldwide',
      description: 'Protecting ecologically important lands and waters for nature and people.',
      charityPhoto: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
      icon: natureConservancyLogo,
      verified: true,
      totalReceived: 9500,
      donationCount: 340,
      followerCount: 5600,
      trending: false,
      followerIncrease: 45
    },
    {
      id: 'rainforest-alliance',
      name: 'Rainforest Alliance',
      category: 'Forest',
      country: 'Global',
      location: 'Worldwide',
      description: 'Protecting rainforests and biodiversity through sustainable practices.',
      charityPhoto: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
      icon: rainforestLogo,
      verified: true,
      totalReceived: 8200,
      donationCount: 290,
      followerCount: 1200,
      trending: true,
      followerIncrease: 52
    },
    {
      id: 'conservation-intl',
      name: 'Conservation International',
      category: 'Conservation',
      country: 'Global',
      location: 'Worldwide',
      description: 'Building a healthier and more prosperous world by protecting nature.',
      charityPhoto: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
      icon: conservationIntlLogo,
      verified: true,
      totalReceived: 7800,
      donationCount: 210,
      followerCount: 32000,
      trending: false,
      followerIncrease: 32
    },
    {
      id: 'sierra-club',
      name: 'Sierra Club',
      category: 'Environment',
      country: 'United States',
      location: 'Oakland, CA',
      description: 'Exploring, enjoying, and protecting the wild places of the earth.',
      charityPhoto: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800',
      icon: sierraClubLogo,
      verified: true,
      totalReceived: 6500,
      donationCount: 180,
      followerCount: 14000,
      trending: true,
      followerIncrease: 28
    },
  ];

  // Load charities from API
  useEffect(() => {
    const fetchCharities = async () => {
      try {
        const response = await fetch(`${API_URL}/public/charities`);
        const result = await response.json();

        if (result.success && result.data && result.data.length > 0) {
          // Map all charities to include local logo icons
          const updatedCharities = result.data.map((charity: any) => {
            const logo = getCharityLogo(charity.id, charity.name);
            return {
              ...charity,
              icon: logo || charity.icon,
              // Special handling for Isbjorn -> PBI branding
              ...(charity.id === 'isbjorn' || charity.name === 'Isbjorn' ? {
                id: 'pbi',
                name: 'Polar Bears International',
                description: 'Working to conserve polar bears and the sea ice they depend on through research, education, and action on climate change.',
                charityPhoto: 'https://images.ctfassets.net/i04syw39vv9p/nirpXYfzlXen2Hk3rbfqB/3d572604afeb59fe9c634e9fe1178fd7/social-share.jpg',
              } : {})
            };
          });
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
                        <div className="flex-shrink-0 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md overflow-hidden">
                          <img
                            src={charity.icon}
                            alt={`${charity.name} logo`}
                            className="w-full h-full object-cover scale-125"
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
                        className={`follow-button flex-shrink-0 ml-2 p-1.5 rounded-full transition-all ${isFollowing
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

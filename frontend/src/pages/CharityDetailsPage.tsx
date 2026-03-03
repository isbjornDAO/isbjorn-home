import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  FireIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import CryptoDonationButton from '../components/CryptoDonationButton';

import SocialFeed from '../components/SocialFeed';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';
import { API_URL } from '@/utils/apiUrl';
import { thirdwebClient } from '@/lib/thirdwebClient';
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

// Charity data with logos
const CHARITY_DATA: Record<string, { name: string; description: string; logoUrl: string; heroImage: string; category: string; location: string }> = {
  'pbi': {
    name: 'Polar Bears International',
    description: 'Working to conserve polar bears and the sea ice they depend on through research, education, and action on climate change.',
    logoUrl: pbiLogo,
    heroImage: 'https://images.ctfassets.net/i04syw39vv9p/nirpXYfzlXen2Hk3rbfqB/3d572604afeb59fe9c634e9fe1178fd7/social-share.jpg',
    category: 'Climate',
    location: 'Worldwide'
  },
  'isbjorn': {
    name: 'Polar Bears International',
    description: 'Working to conserve polar bears and the sea ice they depend on through research, education, and action on climate change.',
    logoUrl: pbiLogo,
    heroImage: 'https://images.ctfassets.net/i04syw39vv9p/nirpXYfzlXen2Hk3rbfqB/3d572604afeb59fe9c634e9fe1178fd7/social-share.jpg',
    category: 'Climate',
    location: 'Worldwide'
  },
  'wwf-uk': {
    name: 'WWF UK',
    description: 'Leading conservation organization working to protect wildlife and halt deforestation in Europe and beyond.',
    logoUrl: wwfLogo,
    heroImage: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
    category: 'Conservation',
    location: 'London, UK'
  },
  'wwf-japan': {
    name: 'WWF Japan',
    description: 'Protecting nature and combating climate change through conservation efforts across Asia-Pacific.',
    logoUrl: wwfLogo,
    heroImage: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=800',
    category: 'Conservation',
    location: 'Tokyo, Japan'
  },
  'greenpeace': {
    name: 'Greenpeace',
    description: 'Global environmental organization campaigning to end climate change and protect biodiversity.',
    logoUrl: greenpeaceLogo,
    heroImage: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
    category: 'Environment',
    location: 'Worldwide'
  },
  'ocean-conservancy': {
    name: 'Ocean Conservancy',
    description: 'Working to protect the ocean from today\'s greatest global challenges through science-based solutions.',
    logoUrl: oceanConservancyLogo,
    heroImage: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800',
    category: 'Ocean',
    location: 'Washington, DC'
  },
  'the-nature-conservancy': {
    name: 'The Nature Conservancy',
    description: 'Protecting ecologically important lands and waters for nature and people.',
    logoUrl: natureConservancyLogo,
    heroImage: 'https://images.unsplash.com/photo-1549366021-9f761d450615?w=800',
    category: 'Conservation',
    location: 'Worldwide'
  },
  'rainforest-alliance': {
    name: 'Rainforest Alliance',
    description: 'Protecting rainforests and biodiversity through sustainable practices.',
    logoUrl: rainforestLogo,
    heroImage: 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800',
    category: 'Forest',
    location: 'Worldwide'
  },
  'conservation-intl': {
    name: 'Conservation International',
    description: 'Building a healthier and more prosperous world by protecting nature.',
    logoUrl: conservationIntlLogo,
    heroImage: 'https://images.unsplash.com/photo-1451337516015-6b6e9a44a8a3?w=800',
    category: 'Conservation',
    location: 'Worldwide'
  },
  'sierra-club': {
    name: 'Sierra Club',
    description: 'Exploring, enjoying, and protecting the wild places of the earth.',
    logoUrl: sierraClubLogo,
    heroImage: 'https://images.unsplash.com/photo-1483664852095-d6cc6870702d?w=800',
    category: 'Environment',
    location: 'Oakland, CA'
  },
};

// Helper function to get charity data by ID
const getCharityData = (charityId: string) => {
  const normalizedId = charityId === 'isbjorn' ? 'pbi' : charityId;
  return CHARITY_DATA[normalizedId] || CHARITY_DATA[charityId] || null;
};

import { useActiveAccount } from 'thirdweb/react';

const CharityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const activeAccount = useActiveAccount();

  const [charity, setCharity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'community'>('overview');
  // Donation state
  const [amount, setAmount] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');
  const [donationStatus, setDonationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [donationError, setDonationError] = useState<string | null>(null);
  const currentDonationId = React.useRef<string | null>(null);

  const handleBeforeDonation = async () => {
    try {
      setDonationError(null);
      const response = await api.post<{ success: boolean; donationId: string }>('/x402/create', {
        amount: parseFloat(amount),
        currency: 'USD', // Fixed to USD for now as per button
        businessId: user?.id, // Optional linkage
      });

      if (response && response.donationId) {
        currentDonationId.current = response.donationId;
      } else {
        throw new Error('Failed to create donation record');
      }
    } catch (err: any) {
      console.error('Donation setup failed:', err);
      setDonationError('Failed to initialize donation. Please try again.');
      throw err; // Re-throw to stop transaction
    }
  };

  const handleDonationSuccess = async (txHash: string) => {
    try {
      if (!currentDonationId.current) {
        console.warn('No donation ID found for settlement');
        return;
      }

      await api.post('/x402/settle', {
        donationId: currentDonationId.current,
        transactionHash: txHash
      });

      setDonationStatus('success');
      setDonationError(null);
      setAmount('');
      currentDonationId.current = null;
    } catch (err) {
      console.error('Settlement failed:', err);
      // We still show success for the transaction, but maybe warn about receipt
      setDonationStatus('success');
      setDonationError('Donation sent but receipt generation failed. Please contact support.');
    }
  };


  useEffect(() => {
    const fetchCharityData = async () => {
      setLoading(true);
      try {
        if (!id) return;

        // 1. Try fetching from API
        try {
          // The backend is mounted at /api/public, so we request /public/charities/:id via api service
          // api.get automatically handles the /api prefix if configured, or we pass the relative path
          // In api.ts, it likely prepends API_BASE_URL. 
          // Let's assume api.get('/public/charities/' + id) works.
          const response = await api.get<{ success: boolean; data: any }>(`/public/charities/${id}`, { skipToast: true });

          if (response && response.data) {
            setCharity(response.data);
          } else if (response && (response as any).id) {
            // Handle case where api returns data directly
            setCharity(response);
          } else {
            throw new Error('No data from API');
          }
        } catch (apiError) {
          console.warn('API fetch failed, using local fallback:', apiError);
          throw apiError; // Trigger fallback
        }
      } catch (error) {
        // 2. Fallback to local static data
        console.log('Using local fallback data for', id);
        const localData = getCharityData(id || '');
        if (localData) {
          // Construct a full charity object from the partial local data
          setCharity({
            id: id || 'temp',
            name: localData.name,
            description: localData.description,
            logoUrl: localData.logoUrl,
            charityPhoto: localData.heroImage,
            category: localData.category,
            location: localData.location,
            // Add defaults for missing fields
            website: '#',
            subscribers: 42000, // Matched PBI stat
            totalDonated: 154200 // Matched PBI stat
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCharityData();
  }, [id]);

  const moderators = [
    {
      id: 1,
      name: 'Dr. James Anderson',
      role: 'Community Moderator',
      avatar: 'https://i.pravatar.cc/150?img=15',
      specialty: 'Climate Science',
      verified: true,
    },
    {
      id: 2,
      name: 'Lisa Martinez',
      role: 'Community Moderator',
      avatar: 'https://i.pravatar.cc/150?img=27',
      specialty: 'Environmental Policy',
      verified: true,
    },
  ];

  // Updated stats
  const thoughtLeaders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=5',
      totalDonated: 45200,
      posts: 127,
      percentageChange: 12.5,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=12',
      totalDonated: 28500,
      posts: 98,
      percentageChange: 8.3,
    },
    {
      id: 3,
      name: 'Emma Williams',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=9',
      totalDonated: 21200,
      posts: 85,
      percentageChange: -3.2,
    },
  ];

  // Dynamic team members based on charity
  const getTeamMembers = (charityId: string) => {
    const teams: Record<string, any[]> = {
      'isbjorn': [
        {
          id: 1,
          name: 'Dr. Steven Amstrup',
          role: 'Chief Scientist',
          avatar: 'https://www.arcus.org/civicrm/contact/imagefile?photo=steve1_a8d04f7259d817fda6b86ea2ba0977b6.jpg',
          specialty: 'Polar Bear Research',
        },
        {
          id: 2,
          name: 'Dr. BJ Kirschhoffer',
          role: 'Director of Field Operations',
          avatar: 'https://blog.explore.org/wp-content/uploads/2014/12/BJ-Kirschhoffer.jpg',
          specialty: 'Arctic Conservation',
        },
        {
          id: 3,
          name: 'Alysa McCall',
          role: 'Director of Conservation',
          avatar: 'https://imgs.mongabay.com/wp-content/uploads/sites/20/2025/07/24113616/Alysa-McCall.jpg',
          specialty: 'Wildlife Protection',
        },
      ],
      'nrdc': [
        {
          id: 1,
          name: 'Manish Bapna',
          role: 'President & CEO',
          avatar: 'https://i.pravatar.cc/150?img=33',
          specialty: 'Environmental Law',
        },
        {
          id: 2,
          name: 'David Goldston',
          role: 'Director of Government Affairs',
          avatar: 'https://i.pravatar.cc/150?img=14',
          specialty: 'Climate Policy',
        },
        {
          id: 3,
          name: 'Michelle Mehta',
          role: 'Chief of Staff',
          avatar: 'https://i.pravatar.cc/150?img=47',
          specialty: 'Strategic Planning',
        },
      ],
      'wwf-uk': [
        {
          id: 1,
          name: 'Tanya Steele',
          role: 'Chief Executive',
          avatar: 'https://i.pravatar.cc/150?img=48',
          specialty: 'Conservation Strategy',
        },
        {
          id: 2,
          name: 'Dr. Mark Wright',
          role: 'Director of Science',
          avatar: 'https://i.pravatar.cc/150?img=51',
          specialty: 'Wildlife Conservation',
        },
        {
          id: 3,
          name: 'John Sauven',
          role: 'Senior Policy Advisor',
          avatar: 'https://i.pravatar.cc/150?img=52',
          specialty: 'Environmental Policy',
        },
      ],
      'wwf-japan': [
        {
          id: 1,
          name: 'Yuki Tanaka',
          role: 'Executive Director',
          avatar: 'https://i.pravatar.cc/150?img=32',
          specialty: 'Asian Conservation',
        },
        {
          id: 2,
          name: 'Dr. Hiroshi Sato',
          role: 'Chief Scientist',
          avatar: 'https://i.pravatar.cc/150?img=60',
          specialty: 'Marine Biology',
        },
        {
          id: 3,
          name: 'Akiko Yamamoto',
          role: 'Program Director',
          avatar: 'https://i.pravatar.cc/150?img=44',
          specialty: 'Climate Action',
        },
      ],
      'african-regional': [
        {
          id: 1,
          name: 'Dr. Amina Okonkwo',
          role: 'Regional Director',
          avatar: 'https://i.pravatar.cc/150?img=45',
          specialty: 'Water Conservation',
        },
        {
          id: 2,
          name: 'Joseph Kamau',
          role: 'Field Coordinator',
          avatar: 'https://i.pravatar.cc/150?img=59',
          specialty: 'Wildlife Protection',
        },
        {
          id: 3,
          name: 'Fatima Hassan',
          role: 'Community Outreach',
          avatar: 'https://i.pravatar.cc/150?img=38',
          specialty: 'Local Engagement',
        },
      ],
      'south-america': [
        {
          id: 1,
          name: 'Dr. Carlos Rodriguez',
          role: 'Director',
          avatar: 'https://i.pravatar.cc/150?img=56',
          specialty: 'Rainforest Ecology',
        },
        {
          id: 2,
          name: 'Maria Santos',
          role: 'Conservation Lead',
          avatar: 'https://i.pravatar.cc/150?img=26',
          specialty: 'Indigenous Relations',
        },
        {
          id: 3,
          name: 'Pablo Mendez',
          role: 'Research Coordinator',
          avatar: 'https://i.pravatar.cc/150?img=68',
          specialty: 'Biodiversity',
        },
      ],
      'middle-east': [
        {
          id: 1,
          name: 'Dr. Ahmed Al-Rashid',
          role: 'Executive Director',
          avatar: 'https://i.pravatar.cc/150?img=53',
          specialty: 'Climate Science',
        },
        {
          id: 2,
          name: 'Layla Hassan',
          role: 'Program Manager',
          avatar: 'https://i.pravatar.cc/150?img=29',
          specialty: 'Renewable Energy',
        },
        {
          id: 3,
          name: 'Omar Khalil',
          role: 'Field Operations',
          avatar: 'https://i.pravatar.cc/150?img=57',
          specialty: 'Desert Conservation',
        },
      ],
      'arctic-research': [
        {
          id: 1,
          name: 'Dr. Lars Eriksson',
          role: 'Lead Scientist',
          avatar: 'https://i.pravatar.cc/150?img=58',
          specialty: 'Arctic Climate',
        },
        {
          id: 2,
          name: 'Dr. Ingrid Johansen',
          role: 'Research Director',
          avatar: 'https://i.pravatar.cc/150?img=20',
          specialty: 'Ice Core Analysis',
        },
        {
          id: 3,
          name: 'Erik Hansen',
          role: 'Field Coordinator',
          avatar: 'https://i.pravatar.cc/150?img=61',
          specialty: 'Data Collection',
        },
      ],
      'amazon-station': [
        {
          id: 1,
          name: 'Dr. Isabella Silva',
          role: 'Station Director',
          avatar: 'https://i.pravatar.cc/150?img=23',
          specialty: 'Forest Ecology',
        },
        {
          id: 2,
          name: 'Rafael Costa',
          role: 'Wildlife Biologist',
          avatar: 'https://i.pravatar.cc/150?img=54',
          specialty: 'Species Monitoring',
        },
        {
          id: 3,
          name: 'Ana Ferreira',
          role: 'Community Liaison',
          avatar: 'https://i.pravatar.cc/150?img=31',
          specialty: 'Local Partnerships',
        },
      ],
    };
    return teams[charityId] || teams['isbjorn'];
  };

  const teamMembers = getTeamMembers(id || 'isbjorn');

  // Get team section title based on charity
  const getTeamSectionTitle = (charityId: string) => {
    if (charityId === 'isbjorn') return 'Polar Bears International';
    return 'Our Team';
  };

  // Get charity-specific video URL
  const getVideoUrl = (charityId: string) => {
    const videos: Record<string, string> = {
      'isbjorn': 'gKN2760r-r8',
      'nrdc': 'Kz6sBi55h1E',
      'wwf-uk': 'lPs3KPJWn1Q',
      'wwf-japan': '4S8OypOXQlM',
      'african-regional': 'SFW0rKFIRx8',
      'south-america': 'eHp3MbsCbMg',
      'middle-east': 'XI5frPV58tY',
      'arctic-research': '19yXHgHX8vU',
      'amazon-station': 'eHp3MbsCbMg',
    };
    return `https://www.youtube.com/embed/${videos[charityId] || videos['isbjorn']}?autoplay=0&mute=0&loop=0&controls=1&modestbranding=1`;
  };

  // Get charity-specific featured post
  const getFeaturedPost = (charityId: string) => {
    const posts: Record<string, any> = {
      'isbjorn': {
        author: 'Dr. Steven Amstrup',
        authorPhoto: 'https://www.arcus.org/civicrm/contact/imagefile?photo=steve1_a8d04f7259d817fda6b86ea2ba0977b6.jpg',
        time: '2h ago',
        title: 'Arctic Research Breakthrough',
        content: 'New findings show accelerated ice melt in northern regions. Our team is deploying additional monitoring stations to track these changes in real-time.',
        mainPhoto: 'https://th-thumbnailer.cdn-si-edu.com/ffHWvpvKTntgyR6aXuEPM6pDb34=/fit-in/1072x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/b2/7f/b27ff5d9-a07b-400d-8a9d-1e1d63109de1/mar2021_h06_polarbears.jpg',
        mapLink: '/map?lat=78.22&lng=15.65&zoom=6',
        mapLabel: 'Arctic monitoring station location',
      },
      'pbi': {
        author: 'Dr. Steven Amstrup',
        authorPhoto: 'https://www.arcus.org/civicrm/contact/imagefile?photo=steve1_a8d04f7259d817fda6b86ea2ba0977b6.jpg',
        time: '2h ago',
        title: 'Arctic Research Breakthrough',
        content: 'New findings show accelerated ice melt in northern regions. Our team is deploying additional monitoring stations to track these changes in real-time.',
        mainPhoto: 'https://th-thumbnailer.cdn-si-edu.com/ffHWvpvKTntgyR6aXuEPM6pDb34=/fit-in/1072x0/https://tf-cmsv2-smithsonianmag-media.s3.amazonaws.com/filer/b2/7f/b27ff5d9-a07b-400d-8a9d-1e1d63109de1/mar2021_h06_polarbears.jpg',
        mapLink: '/map?lat=78.22&lng=15.65&zoom=6',
        mapLabel: 'Arctic monitoring station location',
      },
      'nrdc': {
        author: 'Manish Bapna',
        authorPhoto: 'https://i.pravatar.cc/150?img=33',
        time: '4h ago',
        title: 'Climate Litigation Victory',
        content: 'Major legal win in protecting clean air standards. Our legal team successfully defended EPA regulations against industry challenges.',
        mapLink: '/map?lat=40.7128&lng=-74.0060&zoom=6',
        mapLabel: 'NRDC Headquarters, New York',
      },
      'wwf-uk': {
        author: 'Tanya Steele',
        authorPhoto: 'https://i.pravatar.cc/150?img=48',
        time: '1h ago',
        title: 'UK Wildlife Recovery Program',
        content: 'Exciting progress in our species reintroduction program. Native populations showing strong recovery across protected areas.',
        mapLink: '/map?lat=51.5074&lng=-0.1278&zoom=6',
        mapLabel: 'Conservation sites across UK',
      },
      'wwf-japan': {
        author: 'Yuki Tanaka',
        authorPhoto: 'https://i.pravatar.cc/150?img=32',
        time: '3h ago',
        title: 'Marine Conservation Milestone',
        content: 'Our ocean protection initiative has secured new marine protected areas. Working with local communities to ensure sustainable fishing practices.',
        mapLink: '/map?lat=35.6762&lng=139.6503&zoom=6',
        mapLabel: 'Marine conservation zones',
      },
      'african-regional': {
        author: 'Dr. Amina Okonkwo',
        authorPhoto: 'https://i.pravatar.cc/150?img=45',
        time: '5h ago',
        title: 'Water Conservation Success',
        content: 'Community-led water conservation projects showing remarkable results. Clean water access improved for over 10,000 families.',
        mapLink: '/map?lat=-1.2921&lng=36.8219&zoom=6',
        mapLabel: 'Regional water projects',
      },
      'south-america': {
        author: 'Dr. Carlos Rodriguez',
        authorPhoto: 'https://i.pravatar.cc/150?img=56',
        time: '6h ago',
        title: 'Rainforest Protection Expansion',
        content: 'New partnerships with indigenous communities protecting critical rainforest corridors. Biodiversity surveys reveal thriving ecosystems.',
        mapLink: '/map?lat=-23.5505&lng=-46.6333&zoom=6',
        mapLabel: 'Protected forest areas',
      },
      'middle-east': {
        author: 'Dr. Ahmed Al-Rashid',
        authorPhoto: 'https://i.pravatar.cc/150?img=53',
        time: '7h ago',
        title: 'Renewable Energy Initiative',
        content: 'Solar energy project surpasses expectations. Regional collaboration advancing clean energy adoption across the Middle East.',
        mapLink: '/map?lat=25.2048&lng=55.2708&zoom=6',
        mapLabel: 'Renewable energy sites',
      },
      'arctic-research': {
        author: 'Dr. Lars Eriksson',
        authorPhoto: 'https://i.pravatar.cc/150?img=58',
        time: '8h ago',
        title: 'Ice Core Analysis Reveals Trends',
        content: 'Latest ice core samples provide crucial data on historical climate patterns. Research team making breakthrough discoveries in Arctic climate science.',
        mapLink: '/map?lat=64.1466&lng=-21.9426&zoom=6',
        mapLabel: 'Arctic research stations',
      },
      'amazon-station': {
        author: 'Dr. Isabella Silva',
        authorPhoto: 'https://i.pravatar.cc/150?img=23',
        time: '9h ago',
        title: 'Species Discovery in Amazon',
        content: 'Field research team documents rare species in pristine rainforest area. Conservation efforts protecting critical habitat corridors.',
        mapLink: '/map?lat=-3.4653&lng=-62.2159&zoom=6',
        mapLabel: 'Amazon research station',
      },
    };
    return posts[charityId] || posts['isbjorn'];
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
      {/* Short Banner */}
      <div className="relative h-32 bg-gradient-to-r from-[rgb(3,105,161)] to-[rgb(2,85,131)] overflow-hidden">
        <img
          src={charity.id === 'isbjorn' ? polarBearMapBg : (charity.heroImage || polarBearMapBg)}
          alt={charity.name}
          className="w-full h-full object-cover opacity-80"
          onError={(e) => {
            e.currentTarget.src = polarBearMapBg;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
      </div>

      {/* Header with Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
            {/* Tabs aligned with left sidebar */}
            <div className="lg:col-span-3">
              <div className="flex gap-6">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-all ${activeTab === 'overview'
                    ? 'border-[rgb(3,105,161)] text-[rgb(3,105,161)]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-all flex items-center gap-1 ${activeTab === 'community'
                    ? 'border-[rgb(3,105,161)] text-[rgb(3,105,161)]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                    }`}
                >
                  <UserGroupIcon className="w-4 h-4" />
                  Community
                </button>
              </div>
            </div>
            {/* Empty columns to maintain alignment */}
            <div className="lg:col-span-9"></div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - About & Donate */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-[80px] pb-8">
              {/* Logo and Title */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <div className="flex items-center gap-3 mb-3">
                  <img
                    src={charity.logoUrl || 'https://via.placeholder.com/150'}
                    alt={`${charity.name} logo`}
                    className="w-12 h-12 rounded-lg object-contain border border-gray-200 bg-white p-1"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150';
                    }}
                  />
                  <div className="flex-1">
                    <h1 className="text-xl font-bold text-gray-900">{charity.name}</h1>
                    <p className="text-xs text-gray-600">{charity.category} • {charity.location}</p>
                  </div>
                  <button className="px-4 py-2 bg-[rgb(3,105,161)] hover:bg-[rgb(2,85,131)] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all whitespace-nowrap">
                    Subscribe
                  </button>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{charity.description}</p>

                {/* Socials */}
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-600 hover:text-[rgb(3,105,161)]">
                    <GlobeAltIcon className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-[rgb(3,105,161)]">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Video Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    className="absolute top-0 left-0 w-full h-full"
                    src={getVideoUrl(id || 'isbjorn')}
                    title="Conservation Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Top Mission Card - Timeline Style */}
              <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/map?lat=78.22&lng=15.65&zoom=6')}>
                <div className="flex items-start gap-2">
                  {/* Isbjorn Logo */}
                  <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                    <img src={isbjornLogo} alt="Isbjorn" className="w-full h-full object-cover" />
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <div className="flex items-center gap-1">
                          <span className="text-sm font-bold text-gray-900">Isbjorn Foundation</span>
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(3, 105, 161)' }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="text-xs text-gray-500">
                          Conservation Team
                        </div>
                      </div>
                    </div>

                    {/* Title */}
                    <h4 className="font-bold text-sm text-gray-800 mb-1">
                      Polar Bear Conservation in Svalbard
                    </h4>

                    {/* Content */}
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      Real-time monitoring in Svalbard, Norway. Tracking ice coverage and wildlife patterns.
                    </p>

                    {/* Mini Map */}
                    <div className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2 border border-gray-200">
                      <div className="absolute inset-0 flex items-center justify-center bg-[rgb(3,105,161)]/10">
                        <div className="text-center">
                          <svg className="w-8 h-8 mx-auto mb-1 text-[rgb(3,105,161)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                          <p className="text-xs font-semibold text-[rgb(3,105,161)]">View on Map</p>
                          <p className="text-xs text-gray-500">Svalbard, Norway</p>
                        </div>
                      </div>
                    </div>

                    {/* Category and Actions */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: 'rgb(3, 105, 161)' }}>
                        Top Mission
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate('/map?lat=78.22&lng=15.65&zoom=6'); }}
                          className="flex items-center gap-0.5 px-2 py-1 rounded text-xs font-semibold transition-all bg-[rgb(3,105,161)] text-white hover:bg-[rgb(2,85,131)]"
                        >
                          View Map
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Column - Featured & Timeline */}
          <div className="lg:col-span-6">
            {activeTab === 'overview' && (
              <div className="space-y-4 pb-8">
                {/* Featured Post */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Featured</h2>

                  <div className="flex items-center gap-3 mb-3">
                    <img src={getFeaturedPost(id || 'isbjorn').authorPhoto} alt="Author" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{getFeaturedPost(id || 'isbjorn').author}</p>
                      <p className="text-xs text-gray-500">{getFeaturedPost(id || 'isbjorn').time}</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">{getFeaturedPost(id || 'isbjorn').title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    {getFeaturedPost(id || 'isbjorn').content}
                  </p>

                  {/* Main Photo */}
                  {getFeaturedPost(id || 'isbjorn').mainPhoto && (
                    <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden">
                      <img
                        src={getFeaturedPost(id || 'isbjorn').mainPhoto}
                        alt={getFeaturedPost(id || 'isbjorn').title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {/* Map Link - Compact Card */}
                  <a href={getFeaturedPost(id || 'isbjorn').mapLink} className="block mb-4">
                    <div className="bg-gradient-to-r from-[rgb(3,105,161)]/10 to-[rgb(3,105,161)]/5 rounded-lg p-4 border border-[rgb(3,105,161)]/20 hover:border-[rgb(3,105,161)]/40 transition-all hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[rgb(3,105,161)]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-[rgb(3,105,161)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-[rgb(3,105,161)]">View on Interactive Map</p>
                          <p className="text-xs text-gray-600">{getFeaturedPost(id || 'isbjorn').mapLabel}</p>
                        </div>
                        <svg className="w-5 h-5 text-[rgb(3,105,161)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>

                  {/* Reaction Buttons */}
                  <div className="flex items-center gap-4 text-xs text-gray-500 pb-4 border-b border-gray-100">
                    <button className="flex items-center gap-1 hover:text-green-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                      </svg>
                      <span className="font-medium">243</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-600 transition-colors">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                      </svg>
                      <span className="font-medium">12</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-[rgb(3,105,161)] transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span className="font-medium">18</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-4 space-y-3">
                    <h4 className="text-sm font-bold text-gray-900">Comments</h4>
                    {[
                      { name: 'Michael Chen', img: 12, time: '1h', text: 'This is incredible research! The data on ice melt patterns is really concerning but important to track.' },
                      { name: 'Jennifer Lee', img: 24, time: '45m', text: 'Thank you for sharing this update. How can we support the monitoring station efforts?' },
                      { name: 'Robert Miller', img: 33, time: '30m', text: 'Fascinating work! Looking forward to seeing the full research findings.' }
                    ].map((comment, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <img
                          src={`https://i.pravatar.cc/150?img=${comment.img}`}
                          alt={comment.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm font-semibold text-gray-900">{comment.name}</p>
                            <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          </div>
                          <div className="flex items-center gap-3 mt-1 ml-2">
                            <span className="text-xs text-gray-500">{comment.time} ago</span>
                            <button className="text-xs text-gray-500 hover:text-[rgb(3,105,161)] font-medium">Reply</button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Community Highlights - 3 Column Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Community Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Emma Wilson', org: 'Polar Bear Community', img: 9, time: '2h', text: 'Just spotted a mother polar bear with two cubs near Churchill!', photo: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80', likes: 342 },
                      { name: 'Marcus Chen', org: 'Arctic Wildlife Watch', img: 15, time: '5h', text: 'Beautiful day in Svalbard - polar bears are thriving this season.', photo: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=600&q=80', likes: 289 },
                      { name: 'Sophie Anderson', org: 'Bear Lovers Society', img: 27, time: '1d', text: 'Amazing footage of polar bears swimming in the Arctic Ocean!', photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', likes: 421 },
                      { name: 'David Johnson', org: 'Arctic Explorers', img: 33, time: '2d', text: 'Incredible encounter with a polar bear fishing for seals today. Respect for these magnificent creatures!', photo: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=600&q=80', likes: 298 },
                      { name: 'Rachel Brown', org: 'Wildlife Photography Network', img: 44, time: '3d', text: 'Captured this stunning shot of a polar bear on ice at sunset in Hudson Bay.', photo: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?auto=format&fit=crop&w=600&q=80', likes: 512 },
                      { name: 'Tom Mitchell', org: 'Climate Watch Alliance', img: 51, time: '4d', text: 'Our research team documented positive ice trends this month. Hope for the Arctic!', photo: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=600&q=80', likes: 367 }
                    ].map((post, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {post.photo && (
                          <div className="relative h-40">
                            <img
                              src={post.photo}
                              alt="Post content"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={`https://i.pravatar.cc/150?img=${post.img}`}
                              alt={post.name}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{post.name}</p>
                              <p className="text-xs text-gray-500 truncate">{post.org}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {post.text}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{post.time} ago</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span className="font-medium">{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-4 pb-8">
                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Sort
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[rgb(3,105,161)] hover:bg-[rgb(2,85,131)] rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Post
                  </button>
                </div>

                {/* Community Highlights - 3 Column Grid */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Community Highlights</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { name: 'Emma Wilson', org: 'Polar Bear Community', img: 9, time: '2h', text: 'Just spotted a mother polar bear with two cubs near Churchill!', photo: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?auto=format&fit=crop&w=600&q=80', likes: 342 },
                      { name: 'Marcus Chen', org: 'Arctic Wildlife Watch', img: 15, time: '5h', text: 'Beautiful day in Svalbard - polar bears are thriving this season.', photo: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?auto=format&fit=crop&w=600&q=80', likes: 289 },
                      { name: 'Sophie Anderson', org: 'Bear Lovers Society', img: 27, time: '1d', text: 'Amazing footage of polar bears swimming in the Arctic Ocean!', photo: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=600&q=80', likes: 421 }
                    ].map((post, i) => (
                      <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                        {post.photo && (
                          <div className="relative h-40">
                            <img
                              src={post.photo}
                              alt="Post content"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <img
                              src={`https://i.pravatar.cc/150?img=${post.img}`}
                              alt={post.name}
                              className="w-8 h-8 rounded-full flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900 truncate">{post.name}</p>
                              <p className="text-xs text-gray-500 truncate">{post.org}</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                            {post.text}
                          </p>
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{post.time} ago</span>
                            <div className="flex items-center gap-1">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span className="font-medium">{post.likes}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Create Post */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Create a Post</h2>

                  {/* Post Text */}
                  <div className="mb-3">
                    <textarea
                      placeholder="Share your thoughts about polar bears and Arctic conservation..."
                      rows={4}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(3,105,161)] focus:border-[rgb(3,105,161)] text-sm resize-none"
                    />
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* Image Icon */}
                      <button className="p-2 text-gray-600 hover:text-[rgb(3,105,161)] hover:bg-gray-100 rounded-lg transition-colors" title="Add image">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                      {/* Link Icon */}
                      <button className="p-2 text-gray-600 hover:text-[rgb(3,105,161)] hover:bg-gray-100 rounded-lg transition-colors" title="Add link">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                      </button>
                    </div>

                    {/* Post Button */}
                    <button className="px-6 py-2.5 bg-[rgb(3,105,161)] hover:bg-[rgb(2,85,131)] text-white rounded-lg font-semibold text-sm shadow-md hover:shadow-lg transition-all">
                      Post
                    </button>
                  </div>
                </div>

                {/* Timeline - Polar Bear Community */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-4">Timeline</h2>
                  <div className="space-y-4">
                    {[
                      { name: 'Alex Thompson', org: 'Churchill Bear Watchers', img: 11, time: '1h', text: 'Morning patrol today - saw a beautiful male polar bear hunting near the ice edge. Nature at its finest!', likes: 89, comments: 12 },
                      { name: 'Jennifer Lee', org: 'Arctic Photo Club', img: 12, time: '3h', text: 'Captured this amazing moment of a polar bear family playing in the snow. The cubs are growing so fast!', likes: 156, comments: 23 },
                      { name: 'Robert Miller', org: 'Svalbard Wildlife Society', img: 13, time: '6h', text: 'Ice conditions are looking good this week. Perfect time for polar bear sightings around Longyearbyen.', likes: 67, comments: 8 },
                      { name: 'Maria Santos', org: 'Bear Enthusiasts Network', img: 14, time: '12h', text: 'Just finished an incredible documentary about polar bear migration patterns. The Arctic is truly magical!', likes: 234, comments: 31 }
                    ].map((post, i) => (
                      <div key={i} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start gap-3">
                          <img
                            src={`https://i.pravatar.cc/150?img=${post.img}`}
                            alt={post.name}
                            className="w-10 h-10 rounded-full flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="text-sm font-semibold text-gray-900">{post.name}</p>
                              <span className="text-xs text-gray-500">• {post.time} ago</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{post.org}</p>
                            <p className="text-sm text-gray-700 leading-relaxed mb-3">
                              {post.text}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <button className="flex items-center gap-1 hover:text-[rgb(3,105,161)] transition-colors">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                                </svg>
                                <span className="font-medium">{post.likes}</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-[rgb(3,105,161)] transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                <span className="font-medium">{post.comments}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Profile & Context */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-[80px] pb-8">
              {/* Profile Section */}
              {isAuthenticated && user ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Your Profile</h3>
                  <div className="flex items-start gap-3 mb-4">
                    <img
                      src={user?.avatar || 'https://i.pravatar.cc/150?img=1'}
                      alt={user?.name || 'User'}
                      className="w-12 h-12 rounded-full border-2 border-[rgb(3,105,161)] flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0 space-y-3">
                      <div>
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email || ''}</p>
                      </div>

                      {/* XP Progress */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-gray-700">Experience</span>
                          <span className="text-sm font-bold text-[rgb(3,105,161)]">{user?.xp || 0} XP</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-gradient-to-r from-[rgb(3,105,161)] to-[rgb(2,85,131)] h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(((user?.xp || 0) % 1000) / 10, 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500 text-center">
                          {1000 - ((user?.xp || 0) % 1000)} XP to next level
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate('/profile')}
                    className="w-full mt-4 py-2 border-2 border-[rgb(3,105,161)] text-[rgb(3,105,161)] rounded-lg font-semibold text-sm hover:bg-[rgb(3,105,161)] hover:text-white transition-all"
                  >
                    View Profile
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-3">Join the Community</h3>
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                    Sign in to earn XP, create posts, and connect with fellow polar bear enthusiasts!
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-[rgb(3,105,161)] hover:bg-[rgb(2,85,131)] text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/register')}
                    className="w-full mt-2 py-2.5 border-2 border-[rgb(3,105,161)] text-[rgb(3,105,161)] rounded-lg font-semibold text-sm hover:bg-[rgb(3,105,161)] hover:text-white transition-all"
                  >
                    Create Account
                  </button>
                </div>
              )}

              {/* Donate Box */}
              <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-md">
                <h3 className="text-base font-bold text-gray-900 mb-4">Donate</h3>

                {/* Quick Amount Buttons */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {[10, 25, 50, 100, 250, 500].map((suggestedAmount) => (
                    <button
                      key={suggestedAmount}
                      type="button"
                      onClick={() => setAmount(suggestedAmount.toString())}
                      className={`py-3 px-3 border-2 rounded-lg font-bold text-sm transition-all ${amount === suggestedAmount.toString()
                        ? 'border-[rgb(3,105,161)] bg-[rgb(3,105,161)]/10 text-[rgb(3,105,161)]'
                        : 'border-gray-300 text-gray-700 hover:border-[rgb(3,105,161)]'
                        }`}
                    >
                      ${suggestedAmount}
                    </button>
                  ))}
                </div>

                {/* Custom Amount */}
                <div className="mb-3">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Custom</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
                    <input
                      type="number"
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(3,105,161)] focus:border-[rgb(3,105,161)] text-sm"
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                    placeholder="you@email.com"
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-[rgb(3,105,161)] focus:border-[rgb(3,105,161)] text-sm"
                  />
                </div>

                {/* Donate Button */}
                <div className="mt-4">
                  <CryptoDonationButton
                    amount={amount}
                    onBeforeTransaction={handleBeforeDonation}
                    onSuccess={handleDonationSuccess}
                    onError={(err) => {
                      setDonationStatus('error');
                      setDonationError(err.message || 'Donation failed');
                    }}
                    disabled={!receiptEmail}
                    className="w-full"
                  />
                  {donationStatus === 'success' && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg text-center animate-fade-in">
                      <p className="text-sm font-semibold text-green-800">Thank you for your donation!</p>
                      <p className="text-xs text-green-600 mt-1">Your contribution makes a difference.</p>
                      <button
                        onClick={() => setDonationStatus('idle')}
                        className="mt-2 text-xs text-green-700 underline hover:text-green-900"
                      >
                        Donate again
                      </button>
                    </div>
                  )}
                </div>

                {/* Status Messages */}
                {donationStatus === 'success' && (
                  <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700 font-medium text-center">✓ Donation successful! Redirecting...</p>
                  </div>
                )}
                {donationStatus === 'error' && donationError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700 text-center">{donationError}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 text-center mt-3">
                  Powered by x402 payments
                </p>
              </div>

              {activeTab === 'overview' && (
                /* Team Section */
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">{getTeamSectionTitle(id || 'isbjorn')}</h3>
                  <div className="space-y-3">
                    {teamMembers.map((member) => (
                      <div key={member.id} className="flex items-center gap-3">
                        <img src={member.avatar} alt={member.name} className="w-12 h-12 rounded-full" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{member.name}</p>
                          <p className="text-sm text-gray-600">{member.role}</p>
                          <p className="text-xs text-gray-500">{member.specialty}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'community' && (
                <>
                  {/* Moderators */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <ShieldCheckIcon className="w-5 h-5 text-[rgb(3,105,161)]" />
                      <h3 className="text-base font-bold text-gray-900">Moderators</h3>
                    </div>
                    <div className="space-y-3">
                      {moderators.map((mod) => (
                        <div key={mod.id} className="flex items-center gap-3">
                          <img src={mod.avatar} alt={mod.name} className="w-12 h-12 rounded-full" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{mod.name}</p>
                            <p className="text-sm text-gray-600">{mod.role}</p>
                            <p className="text-xs text-gray-500">{mod.specialty}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Top Contributors */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <FireIcon className="w-5 h-5 text-orange-500" />
                      <h3 className="text-base font-bold text-gray-900">Top Contributors</h3>
                    </div>
                    <div className="space-y-3">
                      {thoughtLeaders.map((leader, index) => (
                        <div key={leader.id} className="flex items-center gap-3">
                          <div className="relative">
                            <img src={leader.avatar} alt={leader.name} className="w-12 h-12 rounded-full" />
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 border-white">
                              {index + 1}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900">{leader.name}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-green-600 font-semibold">${leader.totalDonated.toLocaleString()}</p>
                              <span className={`text-xs font-semibold ${leader.percentageChange >= 0 ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                {leader.percentageChange >= 0 ? '+' : ''}{leader.percentageChange}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{leader.posts} posts</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CharityDetailsPage;

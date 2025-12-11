import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  UserGroupIcon,
  ShieldCheckIcon,
  FireIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import LoadingSpinner from '../components/LoadingSpinner';
import SocialFeed from '../components/SocialFeed';
import { useAuth } from '@/contexts/AuthContext';
import { API_URL } from '@/utils/apiUrl';
import polarBearMapBg from '@/assets/polar-bear-donate-bg.jpg';
import isbjornLogo from '@/assets/isbjorn-logo.png.jpg';

const CharityDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [charity, setCharity] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'community'>('overview');
  const [amount, setAmount] = useState('');
  const [receiptEmail, setReceiptEmail] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_URL}/public/charities/${id}`);

        if (res.ok) {
          const data = await res.json();
          if (data?.success && data.data) {
            const charityData = data.data.id === 'isbjorn' || data.data.name === 'Isbjorn'
              ? { ...data.data, name: 'Isbjorn Foundation', logoUrl: isbjornLogo, heroImage: polarBearMapBg }
              : data.data;
            setCharity(charityData);
            return;
          }
        }

        try {
          const listRes = await fetch(`${API_URL}/public/charities`);
          if (listRes.ok) {
            const listData = await listRes.json();
            if (listData?.success) {
              const found = listData.data.find((c: any) => String(c.id) === String(id) || c.slug === id);
              if (found) {
                const charityData = found.id === 'isbjorn' || found.name === 'Isbjorn'
                  ? { ...found, name: 'Isbjorn Foundation', logoUrl: isbjornLogo, heroImage: polarBearMapBg }
                  : found;
                setCharity(charityData);
                return;
              }
            }
          }
        } catch (listError) {
          console.log('Could not fetch charity list');
        }

        setCharity({
          id,
          name: id === 'isbjorn' ? 'Isbjorn Foundation' : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
          description: 'Thank you for your support in protecting our planet and wildlife.',
          category: 'Climate',
          location: 'Global',
          logoUrl: id === 'isbjorn' ? isbjornLogo : 'https://via.placeholder.com/150',
          heroImage: polarBearMapBg,
        });
      } catch (e) {
        setCharity({
          id,
          name: id === 'isbjorn' ? 'Isbjorn Foundation' : id.charAt(0).toUpperCase() + id.slice(1).replace(/-/g, ' '),
          description: 'Thank you for your support in protecting our planet and wildlife.',
          category: 'Climate',
          location: 'Global',
          logoUrl: id === 'isbjorn' ? isbjornLogo : 'https://via.placeholder.com/150',
          heroImage: polarBearMapBg,
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    if (user?.email && !receiptEmail) {
      setReceiptEmail(user.email);
    }
  }, [user, receiptEmail]);

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

  const thoughtLeaders = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=5',
      totalDonated: 15420,
      posts: 127,
    },
    {
      id: 2,
      name: 'Michael Chen',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=12',
      totalDonated: 12850,
      posts: 98,
    },
    {
      id: 3,
      name: 'Emma Williams',
      role: 'Top Contributor',
      avatar: 'https://i.pravatar.cc/150?img=9',
      totalDonated: 11200,
      posts: 85,
    },
  ];

  const teamMembers = [
    {
      id: 1,
      name: 'Dr. Emily Roberts',
      role: 'Lead Researcher',
      avatar: 'https://i.pravatar.cc/150?img=20',
      specialty: 'Climate Science',
    },
    {
      id: 2,
      name: 'James Wilson',
      role: 'Field Coordinator',
      avatar: 'https://i.pravatar.cc/150?img=33',
      specialty: 'Conservation',
    },
    {
      id: 3,
      name: 'Maria Garcia',
      role: 'Data Analyst',
      avatar: 'https://i.pravatar.cc/150?img=45',
      specialty: 'Environmental Data',
    },
  ];

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
      <div className="relative h-32 bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden">
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
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-all ${
                    activeTab === 'overview'
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('community')}
                  className={`py-2 px-1 border-b-2 font-semibold text-sm transition-all flex items-center gap-1 ${
                    activeTab === 'community'
                      ? 'border-blue-600 text-blue-600'
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
            <div className="space-y-4 sticky top-[80px]">
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
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{charity.name}</h1>
                    <p className="text-xs text-gray-600">{charity.category} • {charity.location}</p>
                  </div>
                </div>
              </div>

              {/* About Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h2 className="text-base font-bold text-gray-900 mb-3">About</h2>
                <p className="text-sm text-gray-700 mb-4 leading-relaxed">{charity.description}</p>

                {/* Socials */}
                <div className="flex items-center gap-4">
                  <a href="#" className="text-gray-600 hover:text-blue-600">
                    <GlobeAltIcon className="w-5 h-5" />
                  </a>
                  <a href="#" className="text-gray-600 hover:text-blue-600">
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
                    src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=0&mute=0&loop=0&controls=1&modestbranding=1"
                    title="Arctic Conservation Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>

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
                      className={`py-3 px-3 border-2 rounded-lg font-bold text-sm transition-all ${
                        amount === suggestedAmount.toString()
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:border-blue-400'
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
                      className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
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
                    className="w-full px-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  />
                </div>

                {/* Donate Button */}
                <button
                  type="button"
                  onClick={() => navigate('/donate')}
                  disabled={!amount || !receiptEmail}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-base shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Donate now
                </button>

                <p className="text-xs text-gray-500 text-center mt-3">
                  Powered by x402 payments
                </p>
              </div>
            </div>
          </div>

          {/* Center Column - Featured & Timeline */}
          <div className="lg:col-span-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Actions Bar */}
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    Sort
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Create Post
                  </button>
                </div>

                {/* Featured Post */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h2 className="text-base font-bold text-gray-900 mb-3">Featured</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <img src="https://i.pravatar.cc/150?img=5" alt="Author" className="w-10 h-10 rounded-full" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Dr. Sarah Chen</p>
                      <p className="text-xs text-gray-500">2h ago</p>
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Arctic Research Breakthrough</h3>
                  <p className="text-sm text-gray-600 leading-relaxed mb-4">
                    New findings show accelerated ice melt in northern regions. Our team is deploying additional monitoring stations to track these changes in real-time.
                  </p>

                  {/* Map Embed */}
                  <a href="/map" className="block relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden hover:opacity-90 transition-opacity border border-gray-200">
                    <div className="absolute inset-0 flex items-center justify-center bg-blue-50">
                      <div className="text-center">
                        <svg className="w-12 h-12 mx-auto mb-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <p className="text-sm font-semibold text-blue-600">View on Map</p>
                        <p className="text-xs text-gray-500">Arctic monitoring station location</p>
                      </div>
                    </div>
                  </a>
                </div>

                {/* Timeline - Posts */}
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-4">
                        <img
                          src={`https://i.pravatar.cc/150?img=${i + 10}`}
                          alt="Author"
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-semibold text-gray-900">Team Member</p>
                            <span className="text-sm text-gray-500">• {i}h ago</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                            Update on our latest conservation efforts. Making great progress in our mission to protect the arctic ecosystem!
                          </p>
                          <div className="flex items-center gap-5 text-sm text-gray-500">
                            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                              </svg>
                              <span className="font-medium">{45 + i * 10}</span>
                            </button>
                            <button className="flex items-center gap-2 hover:text-blue-600 transition-colors">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                              </svg>
                              <span className="font-medium">{5 + i}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'community' && (
              <div className="space-y-4">
                {/* Community Posts */}
                <SocialFeed nonprofitName={charity.name} nonprofitId={charity.id} />
              </div>
            )}
          </div>

          {/* Right Column - Subscribe & Context */}
          <div className="lg:col-span-3">
            <div className="space-y-4 sticky top-[80px]">
              {/* Subscribe Section */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                <h3 className="text-base font-bold text-gray-900 mb-3">Subscribe</h3>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  Get updates about our conservation efforts and latest news.
                </p>
                <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2.5 rounded-lg font-bold text-sm shadow-md hover:shadow-lg transition-all">
                  Subscribe
                </button>
              </div>

              {activeTab === 'overview' && (
                /* Meet the Team */
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
                  <h3 className="text-base font-bold text-gray-900 mb-4">Meet the Team</h3>
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
                      <ShieldCheckIcon className="w-5 h-5 text-blue-600" />
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
                            <p className="text-sm text-green-600 font-semibold">${leader.totalDonated.toLocaleString()}</p>
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

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import { authService } from '@/services/auth';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  UserCircleIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  HeartIcon,
  ChartBarIcon,
  SparklesIcon,
  CreditCardIcon,
  LinkIcon,
  UserGroupIcon,
  ChatBubbleLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckBadgeIcon } from '@heroicons/react/24/solid';
import { calculateLevel, getXpProgress } from '@/utils/xp';


const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const activeAccount = useActiveAccount();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'community' | 'profile' | 'security' | 'account' | 'wallet' | 'integrations'>('overview');
  const [profilePicture, setProfilePicture] = useState<string>(user?.profilePicture || '');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    username: user?.username || user?.companyName || user?.name || '',
    taxId: user?.taxId || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      postalCode: user?.address?.postalCode || '',
      country: user?.address?.country || 'New Zealand',
    },
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || '',
        username: user.username || user.companyName || user.name || '',
        taxId: user.taxId || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'New Zealand',
        },
      });
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      const response = await api.get<any>(`/user/stats`);
      setUserStats(response);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };


  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);

    try {
      // Convert to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;

        try {
          const updatedUser = await authService.updateProfile({ profilePicture: base64String });
          updateUser(updatedUser);
          setProfilePicture(base64String);
          toast.success('Profile picture updated!');
        } catch (error: any) {
          console.error('Profile picture update error:', error);
          toast.error('Failed to update profile picture');
        } finally {
          setUploadingPicture(false);
        }
      };

      reader.onerror = () => {
        toast.error('Failed to read image file');
        setUploadingPicture(false);
      };

      reader.readAsDataURL(file);
    } catch (error: any) {
      console.error('Profile picture error:', error);
      toast.error('Failed to upload profile picture');
      setUploadingPicture(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const updates: any = {
        email: profileData.email,
        username: profileData.username,
      };

      if (profileData.taxId) {
        updates.taxId = profileData.taxId;
      }

      if (Object.values(profileData.address).some(v => v !== '')) {
        updates.address = profileData.address;
      }

      const updatedUser = await authService.updateProfile(updates);
      updateUser(updatedUser);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setPasswordLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );

      toast.success('Password changed successfully');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      console.error('Password change error:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // ─── Community post helpers ───────────────────────────────────────────────────
  type CommunityCategory = 'story' | 'question' | 'action' | 'milestone';
  interface MyPost {
    id: string;
    content: string;
    category: CommunityCategory;
    timestamp: Date;
    likes: number;
    comments: number;
    xpEarned: number;
  }

  const [myPosts, setMyPosts] = useState<MyPost[]>([
    {
      id: 'p1',
      content: 'Just signed up for a monthly donation — even small amounts help fund the monitoring stations. The level system is a great reminder that consistency matters 🐻‍❄️',
      category: 'milestone',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      likes: 12,
      comments: 3,
      xpEarned: 2,
    },
    {
      id: 'p2',
      content: 'Has anyone else noticed the sea ice data from NSIDC this month? The Beaufort Sea numbers are really alarming. Sharing it with my school class tomorrow.',
      category: 'question',
      timestamp: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
      likes: 7,
      comments: 5,
      xpEarned: 2,
    },
  ]);

  const [newPostText, setNewPostText] = useState('');
  const [newPostCategory, setNewPostCategory] = useState<CommunityCategory>('story');

  const COMMUNITY_XP_PER_POST = 2;
  const communityXpTotal = myPosts.length * COMMUNITY_XP_PER_POST;

  const CommunityCategoryConfig: Record<CommunityCategory, { label: string; color: string; icon: string }> = {
    story:     { label: 'Story',     color: 'bg-green-100 text-green-800 border-green-300',   icon: '📖' },
    question:  { label: 'Question',  color: 'bg-sky-100 text-sky-800 border-sky-300',         icon: '❓' },
    action:    { label: 'Action',    color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🌍' },
    milestone: { label: 'Milestone', color: 'bg-violet-100 text-violet-800 border-violet-300', icon: '🎯' },
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const handleNewPost = () => {
    if (!newPostText.trim()) return;
    const post: MyPost = {
      id: `p${Date.now()}`,
      content: newPostText.trim(),
      category: newPostCategory,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      xpEarned: COMMUNITY_XP_PER_POST,
    };
    setMyPosts(prev => [post, ...prev]);
    setNewPostText('');
    toast.success(`+${COMMUNITY_XP_PER_POST} XP earned for your post!`);
  };

  // ─── Level badge (mirrors SocialFeed) ────────────────────────────────────────
  const getLevelBadgeClass = (level: number) => {
    const tiers = [
      'from-slate-400 to-slate-500',
      'from-green-400 to-emerald-500',
      'from-blue-400 to-blue-500',
      'from-purple-400 to-purple-500',
      'from-amber-400 to-orange-500',
      'from-red-400 to-rose-500',
    ];
    return tiers[Math.min(Math.floor(level / 3), tiers.length - 1)];
  };

  // If no user from traditional auth, but wallet is connected, create a wallet-based user object
  const effectiveUser = user || (activeAccount ? {
    id: activeAccount.address,
    username: `${activeAccount.address.slice(0, 6)}...${activeAccount.address.slice(-4)}`,
    email: '',
    role: 'user' as const,
    walletAddress: activeAccount.address,
    spiritAnimal: null,
    profilePicture: '',
    donationStreak: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } : null);

  if (!effectiveUser) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Connect Wallet</h2>
          <p className="text-ice-600">Connect your wallet to view your profile.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ice-900">Profile</h1>
          <p className="text-ice-600 mt-2">Manage your account, progress, and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveSection('overview')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'overview'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveSection('community')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'community'
                    ? 'bg-emerald-50 text-emerald-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <UserGroupIcon className="w-5 h-5" />
                  <span>Community</span>
                  <span className="ml-auto text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">
                    ⚡ {communityXpTotal} XP
                  </span>
                </button>

                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'profile'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'security'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Security</span>
                </button>

                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'account'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Account Info</span>
                </button>

                <button
                  onClick={() => setActiveSection('wallet')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'wallet'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <CreditCardIcon className="w-5 h-5" />
                  <span>Wallet</span>
                </button>

                <button
                  onClick={() => setActiveSection('integrations')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${activeSection === 'integrations'
                    ? 'bg-arctic-50 text-arctic-700 font-semibold'
                    : 'text-ice-600 hover:bg-ice-50'
                    }`}
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Integrations</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Overview Section */}
            {activeSection === 'overview' && (
              <>
                {/* Profile Card with Avatar and Level */}
                <div className="bg-gradient-to-br from-arctic-500 to-ice-600 rounded-2xl shadow-xl p-8 text-white">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Profile Picture */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-lg overflow-hidden">
                        {profilePicture ? (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="text-6xl">👤</div>
                        )}
                      </div>
                      {/* Upload button */}
                      <label
                        htmlFor="profile-picture-upload"
                        className="absolute -bottom-2 -right-2 bg-white text-arctic-600 rounded-full p-2 shadow-lg hover:scale-110 transition-transform cursor-pointer"
                        title="Upload Profile Picture"
                      >
                        {uploadingPicture ? (
                          <div className="w-5 h-5 border-2 border-arctic-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <UserCircleIcon className="w-5 h-5" />
                        )}
                      </label>
                      <input
                        id="profile-picture-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePictureChange}
                        className="hidden"
                        disabled={uploadingPicture}
                      />
                      {/* Spirit Animal button */}
                    </div>

                    {/* User Info & Level */}
                    <div className="flex-1 text-center md:text-left">
                      <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                        {profilePicture && (
                          <img
                            src={profilePicture}
                            alt="Profile"
                            className="w-10 h-10 rounded-full border-2 border-white/30 object-cover"
                          />
                        )}
                        <h2 className="text-3xl font-bold">{effectiveUser.username}</h2>
                      </div>
                      <p className="text-white/80 mb-4">{effectiveUser.email}</p>


                      {/* Level badge + XP Bar */}
                      {(() => {
                        const xp = userStats?.xp || 0;
                        const level = calculateLevel(xp);
                        const { currentProgress, totalNeeded, percentage } = getXpProgress(xp);
                        return (
                          <div className="mt-4">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`inline-flex items-center bg-gradient-to-br ${getLevelBadgeClass(level)} text-white text-sm font-bold px-2.5 py-1 rounded-lg shadow`}>
                                Lv.{level}
                              </span>
                              <div className="flex items-center justify-between flex-1">
                                <span className="text-sm font-semibold">Level {level}</span>
                                <span className="text-sm text-white/80">{xp} XP total</span>
                              </div>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-yellow-300 to-orange-400 h-full rounded-full transition-all duration-500"
                                style={{ width: `${Math.min(percentage, 100)}%` }}
                              />
                            </div>
                            <div className="text-xs text-white/70 mt-1">
                              {currentProgress} / {totalNeeded} XP to level {level + 1}
                            </div>
                          </div>
                        );
                      })()}

                      {/* Coins + Community XP earned */}
                      <div className="mt-4 flex flex-wrap gap-3">
                        <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                          <span className="text-2xl mr-2">🪙</span>
                          <span className="text-xl font-bold">{userStats?.coins || 0}</span>
                          <span className="text-sm ml-2 text-white/80">Coins</span>
                        </div>
                        <div className="inline-flex items-center bg-amber-400/30 backdrop-blur-sm border border-amber-300/40 rounded-lg px-4 py-2">
                          <span className="text-lg mr-2">⚡</span>
                          <span className="text-xl font-bold">{communityXpTotal}</span>
                          <span className="text-sm ml-2 text-white/80">Community XP</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-arctic-100">
                    <div className="flex items-center justify-between mb-2">
                      <ChartBarIcon className="w-8 h-8 text-arctic-500" />
                      <span className="text-3xl font-bold text-arctic-600">{userStats?.xp || 0}</span>
                    </div>
                    <p className="text-sm text-ice-600 font-medium">Total XP</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-arctic-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🪙</span>
                      <span className="text-3xl font-bold text-arctic-600">{userStats?.coins || 0}</span>
                    </div>
                    <p className="text-sm text-ice-600 font-medium">Coins</p>
                  </div>

                  <div className="bg-white rounded-xl p-6 shadow-lg border border-arctic-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl">🔥</span>
                      <span className="text-3xl font-bold text-arctic-600">{effectiveUser.donationStreak || 0}</span>
                    </div>
                    <p className="text-sm text-ice-600 font-medium">Day Streak</p>
                  </div>

                  <button
                    onClick={() => setActiveSection('community')}
                    className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-6 shadow-lg border border-emerald-200 text-left hover:shadow-md transition-shadow group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <UserGroupIcon className="w-8 h-8 text-emerald-500" />
                      <span className="text-3xl font-bold text-emerald-600">{myPosts.length}</span>
                    </div>
                    <p className="text-sm text-emerald-700 font-medium">Community Posts</p>
                    <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
                      <span>⚡</span> {communityXpTotal} XP earned
                    </p>
                  </button>
                </div>

                {/* XP Sources breakdown */}
                <div className="bg-white rounded-xl shadow-lg border border-arctic-100 p-6">
                  <h3 className="text-base font-bold text-ice-900 mb-4 flex items-center gap-2">
                    <ChartBarIcon className="w-5 h-5 text-arctic-500" />
                    XP Sources
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <HeartIcon className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">Donations</span>
                          <span className="font-bold text-slate-900">{(userStats?.xp || 0) - communityXpTotal} XP</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-blue-500 h-full rounded-full"
                            style={{ width: `${Math.min(((userStats?.xp || 0) - communityXpTotal) / Math.max(userStats?.xp || 1, 1) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">⚡</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">Community Posts</span>
                          <span className="font-bold text-amber-700">{communityXpTotal} XP</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div
                            className="bg-amber-400 h-full rounded-full"
                            style={{ width: `${Math.min(communityXpTotal / Math.max(userStats?.xp || 1, 1) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Community Tab */}
            {activeSection === 'community' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                {/* Community identity card */}
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-2xl font-bold">
                      {effectiveUser.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl font-bold">{effectiveUser.username}</span>
                        {(() => {
                          const level = calculateLevel(userStats?.xp || 0);
                          return (
                            <span className={`inline-flex items-center bg-gradient-to-br ${getLevelBadgeClass(level)} text-white text-sm font-bold px-2 py-0.5 rounded-lg shadow border border-white/20`}>
                              Lv.{level}
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-white/80 text-sm">@{effectiveUser.username?.toLowerCase().replace(/\s+/g, '_')}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold">{myPosts.length}</p>
                      <p className="text-white/80 text-xs">posts</p>
                    </div>
                    <div className="text-right border-l border-white/20 pl-4">
                      <p className="text-3xl font-bold text-amber-300">{communityXpTotal}</p>
                      <p className="text-white/80 text-xs">community XP</p>
                    </div>
                  </div>
                </div>

                {/* Compose box */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 rounded-xl p-4 shadow-sm">
                  <p className="text-sm font-semibold text-emerald-900 mb-1 flex items-center gap-1.5">
                    <span>⚡</span> Share something with the community — earn +{COMMUNITY_XP_PER_POST} XP
                  </p>
                  <textarea
                    value={newPostText}
                    onChange={e => setNewPostText(e.target.value)}
                    placeholder="Share your climate action, ask a question, or celebrate a milestone..."
                    className="w-full text-sm rounded-lg border border-emerald-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-slate-800 placeholder:text-slate-400 mt-2"
                    rows={3}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <select
                      value={newPostCategory}
                      onChange={e => setNewPostCategory(e.target.value as CommunityCategory)}
                      className="text-xs border border-emerald-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
                    >
                      {(Object.keys(CommunityCategoryConfig) as CommunityCategory[]).map(k => (
                        <option key={k} value={k}>
                          {CommunityCategoryConfig[k].icon} {CommunityCategoryConfig[k].label}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleNewPost}
                      disabled={!newPostText.trim()}
                      className="ml-auto flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                    >
                      <span>⚡</span> Post & earn XP
                    </button>
                  </div>
                </div>

                {/* Post history */}
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Your Posts</h3>
                  {myPosts.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <p className="text-3xl mb-2">🌍</p>
                      <p>You haven't posted yet. Be the first!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myPosts.map(post => {
                        const cat = CommunityCategoryConfig[post.category];
                        return (
                          <div key={post.id} className="bg-white rounded-xl border border-emerald-200 shadow-sm p-4">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${cat.color}`}>
                                  {cat.icon} {cat.label}
                                </span>
                                <span className="text-xs text-slate-400">{formatTimeAgo(post.timestamp)}</span>
                              </div>
                              <div className="flex-shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
                                <span className="text-amber-500 text-xs">⚡</span>
                                <span className="text-amber-700 text-xs font-bold">+{post.xpEarned} XP</span>
                              </div>
                            </div>
                            <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                              <span>❤️ {post.likes}</span>
                              <span><ChatBubbleLeftIcon className="w-3 h-3 inline mr-0.5" />{post.comments}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Profile Settings Tab */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-ice-900 mb-6">Profile Information</h2>
                  <form onSubmit={handleProfileUpdate} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-ice-900 mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileData.email}
                          onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-ice-900 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={profileData.username}
                          onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          required
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-ice-900 mb-2">
                          Tax ID / NZBN <span className="text-ice-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={profileData.taxId}
                          onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          placeholder="e.g., 9429000000000"
                        />
                      </div>
                    </div>

                    <div className="border-t border-ice-200 pt-6">
                      <h3 className="text-lg font-bold text-ice-900 mb-4">Business Address</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-ice-900 mb-2">
                            Street Address
                          </label>
                          <input
                            type="text"
                            value={profileData.address.street}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, street: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ice-900 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            value={profileData.address.city}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, city: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ice-900 mb-2">
                            State/Region
                          </label>
                          <input
                            type="text"
                            value={profileData.address.state}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, state: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ice-900 mb-2">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            value={profileData.address.postalCode}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, postalCode: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-ice-900 mb-2">
                            Country
                          </label>
                          <input
                            type="text"
                            value={profileData.address.country}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, country: e.target.value }
                            })}
                            className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary"
                      >
                        {loading ? 'Updating...' : 'Update Profile'}
                      </button>
                    </div>
                  </form>
                </div>
              </motion.div>
            )}

            {/* Security Tab */}
            {activeSection === 'security' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-ice-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-6 max-w-md">
                  <div>
                    <label className="block text-sm font-semibold text-ice-900 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ice-900 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-ice-500 mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-ice-900 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-lg border-2 border-ice-200 bg-white text-ice-900 focus:border-arctic-500 focus:ring-2 focus:ring-arctic-500/20 placeholder:text-ice-400 transition-all"
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn-primary"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {/* Account Info Tab */}
            {activeSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg p-8"
              >
                <h2 className="text-2xl font-bold text-ice-900 mb-6">Account Information</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Account Type</p>
                      <p className="text-lg font-bold text-ice-900 capitalize">{effectiveUser.role}</p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Member Since</p>
                      <p className="text-lg font-bold text-ice-900">
                        {new Date(effectiveUser.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Last Updated</p>
                      <p className="text-lg font-bold text-ice-900">
                        {new Date(effectiveUser.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Account ID</p>
                      <p className="text-sm font-mono text-ice-900">{effectiveUser.id}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Wallet Tab */}
            {activeSection === 'wallet' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-ice-900 mb-6">Wallet & Blockchain</h2>
                  <div className="space-y-6">
                    {/* Wallet Balance */}
                    <div className="bg-gradient-to-br from-arctic-500 to-blue-600 rounded-xl p-6 text-white">
                      <p className="text-white/80 mb-2">Total Balance</p>
                      <p className="text-4xl font-bold mb-4">${userStats?.walletBalance || 0}</p>
                      <div className="flex gap-3">
                        <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all">
                          Add Funds
                        </button>
                        <button className="flex-1 bg-white/20 backdrop-blur-sm hover:bg-white/30 px-4 py-2 rounded-lg font-semibold transition-all">
                          Withdraw
                        </button>
                      </div>
                    </div>

                    {/* Connected Wallets */}
                    <div>
                      <h3 className="text-lg font-bold text-ice-900 mb-4">Connected Wallets</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                              <span className="text-xl">₿</span>
                            </div>
                            <div>
                              <p className="font-semibold text-ice-900">Bitcoin Wallet</p>
                              <p className="text-sm text-ice-500">Not connected</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-arctic-500 text-white rounded-lg font-semibold hover:bg-arctic-600 transition-all">
                            Connect
                          </button>
                        </div>

                        <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                              <span className="text-xl">Ξ</span>
                            </div>
                            <div>
                              <p className="font-semibold text-ice-900">Ethereum Wallet</p>
                              <p className="text-sm text-ice-500">Not connected</p>
                            </div>
                          </div>
                          <button className="px-4 py-2 bg-arctic-500 text-white rounded-lg font-semibold hover:bg-arctic-600 transition-all">
                            Connect
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Transaction History */}
                    <div>
                      <h3 className="text-lg font-bold text-ice-900 mb-4">Recent Transactions</h3>
                      <div className="text-center py-8 text-ice-500">
                        No transactions yet
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Integrations Tab */}
            {activeSection === 'integrations' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-lg p-8">
                  <h2 className="text-2xl font-bold text-ice-900 mb-6">Integrations</h2>
                  <p className="text-ice-600 mb-6">Connect your favorite services to enhance your Isbjörn experience</p>

                  <div className="space-y-4">
                    {/* Xero */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📊</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">Xero</h3>
                          <p className="text-sm text-ice-500">Sync donations to accounting system</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* QuickBooks */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📗</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">QuickBooks</h3>
                          <p className="text-sm text-ice-500">Track donations in QuickBooks</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* NZ Charities Services */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🇳🇿</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">NZ Charities Services</h3>
                          <p className="text-sm text-ice-500">Verify charity registration & compliance</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* IRD */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🧾</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">IRD (Inland Revenue)</h3>
                          <p className="text-sm text-ice-500">Automatic tax receipt generation</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* Blockchain Explorer */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">⛓️</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">Blockchain Explorer</h3>
                          <p className="text-sm text-ice-500">View transaction history on-chain</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-arctic-500 text-white rounded-lg font-semibold hover:bg-arctic-600 transition-all">
                        Connected
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

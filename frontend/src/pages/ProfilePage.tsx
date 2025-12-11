import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
} from '@heroicons/react/24/outline';

// Spirit Animals with meaningful traits and charity logos
const SPIRIT_ANIMALS = [
  {
    id: 'isbjorn',
    name: 'Isbjörn',
    logo: '/logo.png',
    trait: 'Compassionate Pioneer',
    description: 'Bold, generous, and mission-driven. You lead charitable giving with transparency and heart.',
    color: 'from-arctic-50 to-ice-100'
  },
  {
    id: 'polar_bear',
    name: 'WWF',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/WWF_logo.svg/1200px-WWF_logo.svg.png',
    trait: 'Resilient Leader',
    description: 'Strong, protective, and adaptable. You lead with courage and care for your community.',
    color: 'from-blue-50 to-cyan-100'
  },
  {
    id: 'wolf',
    name: 'Earth Day Network',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Earth_Day.svg/1200px-Earth_Day.svg.png',
    trait: 'Strategic Collaborator',
    description: 'Loyal, intelligent, and team-oriented. You thrive through collaboration and community.',
    color: 'from-gray-50 to-slate-100'
  },
  {
    id: 'owl',
    name: 'Forest & Bird',
    logo: 'https://www.birdlife.org/wp-content/uploads/2021/04/New_Zealand.png',
    trait: 'Wise Observer',
    description: 'Thoughtful, insightful, and patient. You make informed decisions with careful consideration.',
    color: 'from-purple-50 to-indigo-100'
  },
  {
    id: 'penguin',
    name: 'Ocean Conservancy',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Ocean_Conservancy_logo.svg/1200px-Ocean_Conservancy_logo.svg.png',
    trait: 'Dedicated Supporter',
    description: 'Committed, reliable, and nurturing. You stand by your values and support those around you.',
    color: 'from-orange-50 to-amber-100'
  },
  {
    id: 'fox',
    name: 'Wildlife Conservation',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/c/c4/Wildlife_Conservation_Society_logo.svg/1200px-Wildlife_Conservation_Society_logo.svg.png',
    trait: 'Resourceful Innovator',
    description: 'Creative, adaptable, and clever. You find innovative solutions to complex challenges.',
    color: 'from-emerald-50 to-teal-100'
  },
  {
    id: 'whale',
    name: 'Greenpeace',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Greenpeace_logo.svg/1200px-Greenpeace_logo.svg.png',
    trait: 'Empathetic Communicator',
    description: 'Compassionate, expressive, and connected. You build bridges and foster understanding.',
    color: 'from-sky-50 to-blue-100'
  }
];

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'security' | 'account' | 'wallet' | 'integrations'>('overview');
  const [showSpiritAnimalModal, setShowSpiritAnimalModal] = useState(false);
  const [selectedSpiritAnimal, setSelectedSpiritAnimal] = useState(user?.spiritAnimal || null);
  const [profilePicture, setProfilePicture] = useState<string>(user?.profilePicture || '');
  const [uploadingPicture, setUploadingPicture] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    email: user?.email || '',
    companyName: user?.companyName || '',
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
        companyName: user.companyName || '',
        taxId: user.taxId || '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'New Zealand',
        },
      });
      setSelectedSpiritAnimal(user.spiritAnimal || null);
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

  const handleSpiritAnimalSelect = async (animalId: string) => {
    try {
      const updatedUser = await authService.updateProfile({ spiritAnimal: animalId });
      updateUser(updatedUser);
      setSelectedSpiritAnimal(animalId);
      setShowSpiritAnimalModal(false);
      toast.success('Spirit animal updated!');
    } catch (error: any) {
      toast.error('Failed to update spirit animal');
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
        companyName: profileData.companyName,
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

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to view your profile.</p>
        </div>
      </div>
    );
  }

  const currentAnimal = SPIRIT_ANIMALS.find(a => a.id === selectedSpiritAnimal);

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
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'overview'
                      ? 'bg-arctic-50 text-arctic-700 font-semibold'
                      : 'text-ice-600 hover:bg-ice-50'
                  }`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Overview</span>
                </button>

                <button
                  onClick={() => setActiveSection('profile')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-arctic-50 text-arctic-700 font-semibold'
                      : 'text-ice-600 hover:bg-ice-50'
                  }`}
                >
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Profile Settings</span>
                </button>

                <button
                  onClick={() => setActiveSection('security')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'security'
                      ? 'bg-arctic-50 text-arctic-700 font-semibold'
                      : 'text-ice-600 hover:bg-ice-50'
                  }`}
                >
                  <LockClosedIcon className="w-5 h-5" />
                  <span>Security</span>
                </button>

                <button
                  onClick={() => setActiveSection('account')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'account'
                      ? 'bg-arctic-50 text-arctic-700 font-semibold'
                      : 'text-ice-600 hover:bg-ice-50'
                  }`}
                >
                  <UserCircleIcon className="w-5 h-5" />
                  <span>Account Info</span>
                </button>

                <button
                  onClick={() => setActiveSection('wallet')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'wallet'
                      ? 'bg-arctic-50 text-arctic-700 font-semibold'
                      : 'text-ice-600 hover:bg-ice-50'
                  }`}
                >
                  <CreditCardIcon className="w-5 h-5" />
                  <span>Wallet</span>
                </button>

                <button
                  onClick={() => setActiveSection('integrations')}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === 'integrations'
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
                        ) : currentAnimal ? (
                          <img
                            src={currentAnimal.logo}
                            alt={currentAnimal.name}
                            className="w-full h-full object-cover p-2"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-6xl">👤</div>';
                            }}
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
                      <button
                        onClick={() => setShowSpiritAnimalModal(true)}
                        className="absolute -bottom-2 -left-2 bg-white text-arctic-600 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                        title="Choose Spirit Animal"
                      >
                        <SparklesIcon className="w-5 h-5" />
                      </button>
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
                        <h2 className="text-3xl font-bold">{user.companyName}</h2>
                      </div>
                      <p className="text-white/80 mb-4">{user.email}</p>

                      {currentAnimal && (
                        <div className="inline-block bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2 mb-4">
                          <div className="text-sm font-semibold">{currentAnimal.trait}</div>
                          <div className="text-xs text-white/80">{currentAnimal.name}</div>
                        </div>
                      )}

                      {/* Level & XP Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-semibold">Level {userStats?.level || 1}</span>
                          <span className="text-sm">{userStats?.xp || 0} XP</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-yellow-300 to-orange-400 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${((userStats?.xp || 0) % 1000) / 10}%`
                            }}
                          />
                        </div>
                        <div className="text-xs text-white/70 mt-1">
                          {1000 - ((userStats?.xp || 0) % 1000)} XP to next level
                        </div>
                      </div>

                      {/* Coins */}
                      <div className="mt-4 inline-flex items-center bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
                        <span className="text-2xl mr-2">🪙</span>
                        <span className="text-xl font-bold">{userStats?.coins || 0}</span>
                        <span className="text-sm ml-2 text-white/80">Coins</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-arctic-100">
                    <div className="flex items-center justify-between mb-2">
                      <HeartIcon className="w-8 h-8 text-arctic-500" />
                      <span className="text-3xl font-bold text-arctic-600">{userStats?.level || 1}</span>
                    </div>
                    <p className="text-sm text-ice-600 font-medium">Level</p>
                  </div>

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
                      <span className="text-3xl font-bold text-arctic-600">{user.donationStreak || 0}</span>
                    </div>
                    <p className="text-sm text-ice-600 font-medium">Day Streak</p>
                  </div>
                </div>
              </>
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
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={profileData.companyName}
                          onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
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
                      <p className="text-lg font-bold text-ice-900 capitalize">{user.role}</p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Member Since</p>
                      <p className="text-lg font-bold text-ice-900">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Last Updated</p>
                      <p className="text-lg font-bold text-ice-900">
                        {new Date(user.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="bg-ice-50 rounded-lg p-4">
                      <p className="text-sm text-ice-600 mb-1">Account ID</p>
                      <p className="text-sm font-mono text-ice-900">{user.id}</p>
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
                    {/* Stripe */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">💳</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">Stripe</h3>
                          <p className="text-sm text-ice-500">Process payments & donations</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* PayPal */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">🅿️</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">PayPal</h3>
                          <p className="text-sm text-ice-500">Alternative payment method</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* Mailchimp */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">📧</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">Mailchimp</h3>
                          <p className="text-sm text-ice-500">Email marketing & newsletters</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>

                    {/* Slack */}
                    <div className="flex items-center justify-between p-4 border-2 border-ice-200 rounded-lg hover:border-arctic-300 transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                          <span className="text-2xl">💬</span>
                        </div>
                        <div>
                          <h3 className="font-bold text-ice-900">Slack</h3>
                          <p className="text-sm text-ice-500">Team notifications & updates</p>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-white border-2 border-ice-300 text-ice-700 rounded-lg font-semibold hover:bg-ice-50 transition-all">
                        Connect
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Spirit Animal Modal */}
      {showSpiritAnimalModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-ice-200">
              <h2 className="text-2xl font-bold text-ice-900">Choose Your Spirit Animal</h2>
              <p className="text-ice-600 mt-1">Select the animal that best represents your values and approach</p>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {SPIRIT_ANIMALS.map((animal) => (
                <button
                  key={animal.id}
                  onClick={() => handleSpiritAnimalSelect(animal.id)}
                  className={`
                    relative p-6 rounded-xl border-2 text-left transition-all hover:scale-105
                    ${selectedSpiritAnimal === animal.id
                      ? 'border-arctic-500 bg-arctic-50'
                      : 'border-ice-200 bg-white hover:border-arctic-300'
                    }
                  `}
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${animal.color} rounded-t-xl`} />
                  <div className="w-20 h-20 mb-3 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                    <img
                      src={animal.logo}
                      alt={animal.name}
                      className="w-full h-full object-contain p-2"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.parentElement!.innerHTML = '<div class="text-4xl">🏔️</div>';
                      }}
                    />
                  </div>
                  <h3 className="font-bold text-ice-900 mb-1">{animal.name}</h3>
                  <div className="text-sm font-semibold text-arctic-600 mb-2">{animal.trait}</div>
                  <p className="text-xs text-ice-600">{animal.description}</p>
                </button>
              ))}
            </div>

            <div className="p-6 border-t border-ice-200 flex justify-end">
              <button
                onClick={() => setShowSpiritAnimalModal(false)}
                className="px-6 py-2 text-ice-600 hover:text-ice-900 font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

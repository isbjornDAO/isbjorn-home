import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { XPCard } from '@/components/XPCard';
import { CollectableGrid } from '@/components/CollectableGrid';
import { Link } from 'react-router-dom';
import {
  ShoppingBagIcon,
  CurrencyDollarIcon,
  LinkIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

// Spirit Animals with meaningful traits and charity logos
const SPIRIT_ANIMALS = [
  {
    id: 'isbjorn',
    name: 'Isbjorn',
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
  const [collectables, setCollectables] = useState<any[]>([]);
  const [allCollectables, setAllCollectables] = useState<any[]>([]);
  const [donationStats, setDonationStats] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'overview' | 'profile' | 'security' | 'account'>('overview');
  const [showSpiritAnimalModal, setShowSpiritAnimalModal] = useState(false);
  const [selectedSpiritAnimal, setSelectedSpiritAnimal] = useState(user?.spiritAnimal || null);

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
    if (user?.id) {
      loadUserStats();
      loadCollectables();
      loadDonationStats();
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

  const loadCollectables = async () => {
    try {
      const [userCollectablesRes, allCollectablesRes] = await Promise.all([
        api.get<any[]>('/collectables/user'),
        api.get<any[]>('/collectables'),
      ]);
      setCollectables(userCollectablesRes);
      setAllCollectables(allCollectablesRes);
    } catch (error) {
      console.error('Failed to load collectables:', error);
    }
  };

  const loadDonationStats = async () => {
    try {
      const response = await api.get<any>('/dashboard/stats');
      setDonationStats(response);
    } catch (error) {
      console.error('Failed to load donation stats:', error);
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
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
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
                  <SparklesIcon className="w-5 h-5" />
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

                <div className="pt-4 border-t border-ice-200 mt-4 space-y-1">
                  <Link
                    to="/shop"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                  >
                    <ShoppingBagIcon className="w-5 h-5" />
                    <span>Rewards Shop</span>
                  </Link>

                  <Link
                    to="/wallet"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                  >
                    <CurrencyDollarIcon className="w-5 h-5" />
                    <span>My Wallet</span>
                  </Link>

                  <Link
                    to="/integrations"
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-ice-600 hover:bg-ice-50 transition-colors"
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span>Integrations</span>
                  </Link>
                </div>
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
                    {/* Avatar/Spirit Animal */}
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30 shadow-lg overflow-hidden">
                        {currentAnimal ? (
                          <img
                            src={currentAnimal.logo}
                            alt={currentAnimal.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.parentElement!.innerHTML = '<div class="text-6xl">👤</div>';
                            }}
                          />
                        ) : (
                          <div className="text-6xl">👤</div>
                        )}
                      </div>
                      <button
                        onClick={() => setShowSpiritAnimalModal(true)}
                        className="absolute -bottom-2 -right-2 bg-white text-arctic-600 rounded-full p-2 shadow-lg hover:scale-110 transition-transform"
                        title="Choose Spirit Animal"
                      >
                        <SparklesIcon className="w-5 h-5" />
                      </button>
                    </div>

                    {/* User Info & Level */}
                    <div className="flex-1 text-center md:text-left">
                      <h2 className="text-3xl font-bold mb-2">{user.companyName}</h2>
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

                {/* XP and Stats Card */}
                {userStats && (
                  <XPCard
                    xp={userStats.xp || 0}
                    coins={userStats.coins || 0}
                    level={userStats.level || 1}
                    donationStreak={user.donationStreak || 0}
                    longestStreak={user.longestDonationStreak || 0}
                  />
                )}

                {/* Donation Activity Stats */}
                {donationStats && (
                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-ice-900 mb-4">Donation Impact</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-blue-700">
                          {donationStats.totalDonations || 0}
                        </div>
                        <div className="text-sm text-blue-600">Total Donations</div>
                      </div>
                      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-green-700">
                          ${donationStats.totalAmount?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-green-600">Total Donated</div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-purple-700">
                          {donationStats.charitiesSupported || 0}
                        </div>
                        <div className="text-sm text-purple-600">Charities Supported</div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg p-4">
                        <div className="text-2xl font-bold text-orange-700">
                          {user.level || 1}
                        </div>
                        <div className="text-sm text-orange-600">Current Level</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Collectables */}
                {collectables.length > 0 && (
                  <div className="card p-6">
                    <h2 className="text-xl font-bold text-ice-900 mb-4">
                      Your Collectables ({collectables.length})
                    </h2>
                    <CollectableGrid
                      collectables={collectables}
                      allCollectables={allCollectables}
                      maxDisplay={12}
                    />
                  </div>
                )}
              </>
            )}

            {/* Profile Settings Section */}
            {activeSection === 'profile' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-ice-900 mb-6">Profile Information</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-ice-900 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-ice-900 mb-1">
                      Company Name
                    </label>
                    <input
                      type="text"
                      id="companyName"
                      value={profileData.companyName}
                      onChange={(e) => setProfileData({ ...profileData, companyName: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="taxId" className="block text-sm font-medium text-ice-900 mb-1">
                      Tax ID / NZBN (Optional)
                    </label>
                    <input
                      type="text"
                      id="taxId"
                      value={profileData.taxId}
                      onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      placeholder="e.g., 9429000000000"
                    />
                    <p className="text-xs text-ice-500 mt-1">
                      New Zealand Business Number for tax deduction purposes
                    </p>
                  </div>

                  <div className="pt-4 border-t border-ice-200">
                    <h3 className="text-lg font-medium text-ice-900 mb-4">Business Address</h3>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="street" className="block text-sm font-medium text-ice-900 mb-1">
                          Street Address
                        </label>
                        <input
                          type="text"
                          id="street"
                          value={profileData.address.street}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            address: { ...profileData.address, street: e.target.value }
                          })}
                          className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="city" className="block text-sm font-medium text-ice-900 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            id="city"
                            value={profileData.address.city}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, city: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="state" className="block text-sm font-medium text-ice-900 mb-1">
                            State/Region
                          </label>
                          <input
                            type="text"
                            id="state"
                            value={profileData.address.state}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, state: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="postalCode" className="block text-sm font-medium text-ice-900 mb-1">
                            Postal Code
                          </label>
                          <input
                            type="text"
                            id="postalCode"
                            value={profileData.address.postalCode}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, postalCode: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                          />
                        </div>

                        <div>
                          <label htmlFor="country" className="block text-sm font-medium text-ice-900 mb-1">
                            Country
                          </label>
                          <input
                            type="text"
                            id="country"
                            value={profileData.address.country}
                            onChange={(e) => setProfileData({
                              ...profileData,
                              address: { ...profileData.address, country: e.target.value }
                            })}
                            className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-ice-900 mb-6">Change Password</h2>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-ice-900 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-ice-900 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      required
                      minLength={8}
                    />
                    <p className="text-xs text-ice-500 mt-1">
                      Must be at least 8 characters long
                    </p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-ice-900 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-2 border border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500"
                      required
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Account Info Section */}
            {activeSection === 'account' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-ice-900 mb-4">Account Information</h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-ice-100">
                    <span className="text-ice-600">Account Type:</span>
                    <span className="text-ice-900 font-medium capitalize">{user.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-ice-100">
                    <span className="text-ice-600">Member Since:</span>
                    <span className="text-ice-900 font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-ice-600">Last Updated:</span>
                    <span className="text-ice-900 font-medium">
                      {new Date(user.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Spirit Animal Selection Modal */}
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

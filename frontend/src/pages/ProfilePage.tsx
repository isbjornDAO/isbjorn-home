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
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-ice-900 mb-2">Profile Settings</h1>
          <p className="text-ice-600 text-lg">Manage your account and preferences</p>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12"
        >
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
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Profile Information */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-arctic-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arctic-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="w-7 h-7 text-arctic-600" />
              </div>
              <h2 className="text-2xl font-bold text-ice-900">Profile Information</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ice-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ice-900 mb-2">
                  Tax ID / NZBN <span className="text-ice-500 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={profileData.taxId}
                  onChange={(e) => setProfileData({ ...profileData, taxId: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                  placeholder="e.g., 9429000000000"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Profile'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Security Settings */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-arctic-100"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arctic-100 rounded-full flex items-center justify-center">
                <LockClosedIcon className="w-7 h-7 text-arctic-600" />
              </div>
              <h2 className="text-2xl font-bold text-ice-900">Change Password</h2>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ice-900 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {passwordLoading ? 'Changing...' : 'Change Password'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Address Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-arctic-100 md:col-span-2"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-arctic-100 rounded-full flex items-center justify-center">
                <Cog6ToothIcon className="w-7 h-7 text-arctic-600" />
              </div>
              <h2 className="text-2xl font-bold text-ice-900">Business Address</h2>
            </div>

            <form onSubmit={handleProfileUpdate} className="grid md:grid-cols-2 gap-6">
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
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
                  className="w-full px-4 py-3 border-2 border-ice-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-arctic-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white font-bold py-3 rounded-lg hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update Address'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Account Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 border border-arctic-100 md:col-span-2"
          >
            <h2 className="text-2xl font-bold text-ice-900 mb-6">Account Information</h2>
            <div className="grid md:grid-cols-3 gap-6">
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
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

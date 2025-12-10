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
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'security' | 'account'>('profile');

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
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-ice-900">Profile</h1>
          <p className="text-ice-600 mt-2">Manage your account, progress, and preferences</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-4 sticky top-20">
              <nav className="space-y-1">
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
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
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
                          className="input w-full"
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
                          className="input w-full"
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
                          className="input w-full"
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
                            className="input w-full"
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
                            className="input w-full"
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
                            className="input w-full"
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
                            className="input w-full"
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
                            className="input w-full"
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
                      className="input w-full"
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
                      className="input w-full"
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
                      className="input w-full"
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authService } from '@/services/auth';
import { api } from '@/services/api';
import toast from 'react-hot-toast';
import { XPCard } from '@/components/XPCard';
import { CollectableGrid } from '@/components/CollectableGrid';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [userStats, setUserStats] = useState<any>(null);
  const [collectables, setCollectables] = useState<any[]>([]);
  const [allCollectables, setAllCollectables] = useState<any[]>([]);
  const [donationStats, setDonationStats] = useState<any>(null);

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

      // Only include address if at least one field is filled
      if (Object.values(profileData.address).some(v => v !== '')) {
        updates.address = profileData.address;
      }

      const updatedUser = await authService.updateProfile(updates);

      // Update local state with new user data
      updateUser(updatedUser);

      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadUserStats();
      loadCollectables();
      loadDonationStats();
    }
  }, [user?.id]);

  const loadUserStats = async () => {
    try {
      const response = await api.get(`/user/stats`);
      setUserStats(response.data);
    } catch (error) {
      console.error('Failed to load user stats:', error);
    }
  };

  const loadCollectables = async () => {
    try {
      const [userCollectablesRes, allCollectablesRes] = await Promise.all([
        api.get('/collectables/user'),
        api.get('/collectables'),
      ]);
      setCollectables(userCollectablesRes.data);
      setAllCollectables(allCollectablesRes.data);
    } catch (error) {
      console.error('Failed to load collectables:', error);
    }
  };

  const loadDonationStats = async () => {
    try {
      const response = await api.get('/dashboard/stats');
      setDonationStats(response.data);
    } catch (error) {
      console.error('Failed to load donation stats:', error);
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

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ice-900">Account Settings</h1>
          <p className="text-ice-600 mt-2">Manage your profile and account preferences</p>
        </div>

        <div className="space-y-6">
          {/* XP and Progress */}
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
              <h2 className="text-xl font-bold text-ice-900 mb-4">Donation Activity</h2>
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

          {/* Profile Information */}
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

          {/* Change Password */}
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

          {/* Account Information */}
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
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

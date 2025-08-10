import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface AdminStats {
  totalUsers: number;
  totalDonations: number;
  totalAmount: number;
  totalCharities: number;
  recentDonations: Array<{
    id: string;
    amount: number;
    donorCompany: string;
    charityName: string;
    createdAt: string;
  }>;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') {
      fetchAdminData();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Please Sign In</h2>
          <p className="text-ice-600">You need to be signed in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-ice-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold text-ice-900 mb-4">Access Denied</h2>
          <p className="text-ice-600">You don't have permission to access the admin panel.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ice-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-ice-900">Admin Dashboard</h1>
          <p className="text-ice-600 mt-2">Platform overview and management</p>
        </div>

        {loading ? (
          <div className="card p-6">
            <p className="text-ice-600">Loading admin data...</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.totalUsers || 0}</div>
                <div className="text-ice-600 text-sm">Total Users</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.totalDonations || 0}</div>
                <div className="text-ice-600 text-sm">Total Donations</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">${stats?.totalAmount || 0}</div>
                <div className="text-ice-600 text-sm">Total Amount</div>
              </div>
              <div className="card p-6">
                <div className="text-2xl font-bold text-ice-900">{stats?.totalCharities || 0}</div>
                <div className="text-ice-600 text-sm">Active Charities</div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold text-ice-900 mb-4">Recent Donations</h3>
              {stats?.recentDonations?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-ice-200">
                        <th className="text-left py-2">Company</th>
                        <th className="text-left py-2">Charity</th>
                        <th className="text-left py-2">Amount</th>
                        <th className="text-left py-2">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentDonations.map((donation) => (
                        <tr key={donation.id} className="border-b border-ice-100">
                          <td className="py-2 text-ice-900">{donation.donorCompany}</td>
                          <td className="py-2 text-ice-900">{donation.charityName}</td>
                          <td className="py-2 text-ice-900">${donation.amount}</td>
                          <td className="py-2 text-ice-600">
                            {new Date(donation.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-ice-600">No donations yet</p>
              )}
            </div>

            <div className="card p-6">
              <h3 className="text-xl font-bold text-ice-900 mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button className="btn-primary text-center">Manage Charities</button>
                <button className="btn-primary text-center">View All Users</button>
                <button className="btn-primary text-center">Export Data</button>
              </div>
              <p className="text-ice-600 text-sm mt-4">
                Advanced admin features coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
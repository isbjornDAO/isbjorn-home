import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface DonationHistory {
    id: string;
    amount: number;
    currency: string;
    status: string;
    createdAt: string;
    stripePaymentIntentId?: string;
}

const BusinessDashboard: React.FC = () => {
    const { user } = useAuth();
    const [donations, setDonations] = useState<DonationHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get('/api/x402/history');
                if (response.data.success) {
                    setDonations(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch history', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Business Dashboard</h1>
                    <p className="text-gray-600 mt-2">Welcome back, {user?.companyName || 'Partner'}</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">Total Contributed</div>
                        <div className="text-3xl font-bold text-arctic-600">$12,500</div>
                        <div className="text-xs text-green-600 mt-2">↑ 12% from last month</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">Active Validator Nodes</div>
                        <div className="text-3xl font-bold text-arctic-600">2</div>
                        <div className="text-xs text-gray-500 mt-2">Node IDs: #4421, #4498</div>
                    </div>

                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="text-sm font-medium text-gray-500 mb-1">Carbon Offset</div>
                        <div className="text-3xl font-bold text-arctic-600">450 tCO2e</div>
                        <div className="text-xs text-gray-500 mt-2">Equivalent to 2,000 trees</div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Node Status */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Validator Status */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                                <h2 className="text-lg font-bold text-gray-900">Validator Node Performance</h2>
                                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">All Systems Operational</span>
                            </div>
                            <div className="p-6">
                                <div className="space-y-6">
                                    {[1, 2].map((node) => (
                                        <div key={node} className="bg-gray-50 rounded-lg p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">Node #{4420 + node}</h3>
                                                    <p className="text-xs text-gray-500">Deployed: Nov 15, 2025</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-sm font-medium text-gray-900">99.98% Uptime</div>
                                                    <div className="text-xs text-green-600">Generating Rewards</div>
                                                </div>
                                            </div>

                                            {/* Progress Bar */}
                                            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                                                <div className="bg-arctic-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500">
                                                <span>Current Epoch Progress</span>
                                                <span>92%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Donation History */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Recent Contributions</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-gray-50 text-gray-500 font-medium">
                                        <tr>
                                            <th className="px-6 py-3">Date</th>
                                            <th className="px-6 py-3">Amount</th>
                                            <th className="px-6 py-3">Method</th>
                                            <th className="px-6 py-3">Status</th>
                                            <th className="px-6 py-3">Receipt</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {loading ? (
                                            <tr><td colSpan={5} className="px-6 py-4 text-center">Loading...</td></tr>
                                        ) : donations.length > 0 ? (
                                            donations.map((d) => (
                                                <tr key={d.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4">{new Date(d.createdAt).toLocaleDateString()}</td>
                                                    <td className="px-6 py-4 font-medium">${d.amount}</td>
                                                    <td className="px-6 py-4 capitalize">{d.stripePaymentIntentId?.startsWith('x402') ? 'x402' : 'Stripe'}</td>
                                                    <td className="px-6 py-4">
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                            {d.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <button
                                                            onClick={() => window.open(`/api/x402/verify/${d.id}`, '_blank')}
                                                            className="text-arctic-600 hover:text-arctic-800 font-medium"
                                                        >
                                                            Download
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr><td colSpan={5} className="px-6 py-4 text-center text-gray-500">No donations yet</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Impact & Actions */}
                    <div className="space-y-8">
                        {/* Quick Action */}
                        <div className="bg-gradient-to-br from-arctic-600 to-polar-600 rounded-xl shadow-lg p-6 text-white">
                            <h3 className="text-xl font-bold mb-2">Make an Impact</h3>
                            <p className="text-blue-100 mb-6 text-sm">Your contributions directly fund validator nodes that generate perpetual revenue for conservation.</p>
                            <button className="w-full bg-white text-arctic-600 py-3 rounded-lg font-bold hover:bg-blue-50 transition-colors">
                                New Donation
                            </button>
                        </div>

                        {/* Impact Map Preview */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <h2 className="text-lg font-bold text-gray-900">Global Impact</h2>
                            </div>
                            <div className="aspect-video bg-gray-100 relative">
                                <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                    [Interactive Map Placeholder]
                                </div>
                                {/* Pins */}
                                <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                                <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <div className="p-4 bg-gray-50 text-xs text-gray-500 text-center">
                                Powered by Palantir Platform (Coming Soon)
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BusinessDashboard;

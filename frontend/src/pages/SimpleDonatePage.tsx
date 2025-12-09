import React, { useState } from 'react';
import { apiService } from '@/services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SimpleDonatePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'NZD',
    charityId: '1',
    charityName: 'Isbjorn Arctic Conservation',
    donorName: '',
    donorEmail: '',
    walletAddress: '',
    message: ''
  });

  const [result, setResult] = useState<any>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await apiService.post<any>('/payment/direct-payment', {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        charityId: formData.charityId,
        charityName: formData.charityName,
        donorName: formData.donorName,
        donorEmail: formData.donorEmail,
        walletAddress: formData.walletAddress || undefined,
        message: formData.message || undefined
      });

      if (response.success) {
        setResult(response.donation);
        toast.success('Donation processed successfully! Check your email for receipt.');

        // Reset form
        setFormData({
          ...formData,
          amount: '',
          message: ''
        });
      }
    } catch (error: any) {
      console.error('Donation error:', error);
      toast.error(error.response?.data?.message || 'Failed to process donation');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Donation Test</h1>
          <p className="text-gray-600 mb-6">
            Direct payment to: <code className="bg-gray-100 px-2 py-1 rounded text-xs">0x0C39f0970CF3118Fd004A3f069E59dabc6714980</code>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Amount */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Amount
              </label>
              <div className="flex gap-3">
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.01"
                  min="1"
                  required
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                  placeholder="100.00"
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                >
                  <option value="NZD">NZD</option>
                  <option value="USD">USD</option>
                  <option value="AUD">AUD</option>
                </select>
              </div>
            </div>

            {/* Charity */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Charity
              </label>
              <select
                name="charityName"
                value={formData.charityName}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
              >
                <option value="Isbjorn Arctic Conservation">Isbjorn Arctic Conservation</option>
                <option value="Red Cross NZ">Red Cross NZ</option>
                <option value="Starship Foundation">Starship Foundation</option>
                <option value="Forest & Bird">Forest & Bird</option>
              </select>
            </div>

            {/* Donor Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name / Company Name
              </label>
              <input
                type="text"
                name="donorName"
                value={formData.donorName}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                placeholder="John Doe / Acme Corp"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email (for receipt)
              </label>
              <input
                type="email"
                name="donorEmail"
                value={formData.donorEmail}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Wallet Address (Optional) */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Wallet Address (Optional)
              </label>
              <input
                type="text"
                name="walletAddress"
                value={formData.walletAddress}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                placeholder="0x..."
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Message (Optional)
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:ring-2 focus:ring-arctic-500 focus:border-arctic-500"
                placeholder="Your message..."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-arctic-500 to-arctic-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : 'Donate Now'}
            </button>
          </form>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 p-6 bg-green-50 border-2 border-green-200 rounded-xl"
            >
              <h3 className="text-lg font-bold text-green-900 mb-3">✅ Donation Successful!</h3>
              <div className="space-y-2 text-sm">
                <p><span className="font-semibold">Amount:</span> {result.currency} ${result.amount}</p>
                <p><span className="font-semibold">Charity:</span> {result.charityName}</p>
                <p><span className="font-semibold">Transaction ID:</span> {result.transactionId}</p>
                <p><span className="font-semibold">Receipt Number:</span> {result.receiptNumber}</p>
                <p><span className="font-semibold">Recipient Address:</span> <code className="bg-white px-2 py-1 rounded text-xs">{result.recipientAddress}</code></p>
                <p className="text-green-700 font-semibold mt-4">📧 Tax receipt sent to your email!</p>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SimpleDonatePage;

import React from 'react';
import { motion } from 'framer-motion';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const PricingPage: React.FC = () => {
  const comparison = [
    {
      aspect: 'Time Required',
      traditional: '2-4 weeks total process',
      isbjorn: '5 minutes start to finish',
      traditionalIcon: XMarkIcon,
      isbjornIcon: CheckIcon,
    },
    {
      aspect: 'Cost',
      traditional: 'Bank fees ($15-50) + Staff time',
      isbjorn: '1.5% platform fee only',
      traditionalIcon: XMarkIcon,
      isbjornIcon: CheckIcon,
    },
    {
      aspect: 'Tax Receipt',
      traditional: '2-4 weeks by post',
      isbjorn: 'Instant digital receipt',
      traditionalIcon: XMarkIcon,
      isbjornIcon: CheckIcon,
    },
    {
      aspect: 'Compliance',
      traditional: 'Manual verification',
      isbjorn: 'Automatic IRD compliance',
      traditionalIcon: XMarkIcon,
      isbjornIcon: CheckIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-ice-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
            <img
              src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png"
              alt="Transparent Pricing"
              className="w-10 h-10 object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-ice-100 max-w-3xl mx-auto">
            One low fee covers everything - no hidden costs, no monthly subscriptions, no surprises.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Pricing Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="max-w-md mx-auto">
            <div className="card p-8 bg-gradient-to-br from-white to-ice-50 border-2 border-arctic-200">
              <div className="w-16 h-16 mx-auto mb-6 bg-arctic-100 rounded-full flex items-center justify-center">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png"
                  alt="Secure Platform"
                  className="w-8 h-8 object-contain"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-ice-900 font-display mb-2">1.5%</h2>
              <p className="text-arctic-600 font-medium mb-6">Per Donation</p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-ice-700">Instant IRD-compliant receipts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-ice-700">Access to 100+ verified charities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-ice-700">Complete donation tracking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-ice-700">Bank-grade security</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-ice-700">Annual reporting tools</span>
                </div>
              </div>

              <p className="text-sm text-ice-600 mb-6">
                Example: $1,000 donation = $15 fee + $985 to charity
              </p>

              <button className="btn-primary w-full">
                Start Donating Now
              </button>
            </div>
          </div>
        </motion.div>

        {/* Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ice-900 font-display mb-6">
              Compare the True Cost
            </h2>
            <p className="text-xl text-ice-600 max-w-3xl mx-auto">
              Factor in staff time, bank fees, and administrative overhead - Isbjorn often costs less than traditional methods.
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ice-50 border-b border-ice-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ice-900">Aspect</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-red-700">Traditional Method</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-arctic-700">Isbjorn Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-200">
                  {comparison.map((item, index) => (
                    <tr key={index} className="hover:bg-ice-25 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-ice-900">{item.aspect}</td>
                      <td className="px-6 py-4 text-sm text-red-600">
                        <div className="flex items-center space-x-2">
                          <item.traditionalIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
                          <span>{item.traditional}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-arctic-700">
                        <div className="flex items-center space-x-2">
                          <item.isbjornIcon className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span className="font-medium">{item.isbjorn}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-arctic-50 to-ice-100 rounded-xl p-8 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-ice-900 font-display mb-6">
              Trusted by NZ Businesses
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png"
                  alt="Community"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-ice-700">100+ Verified Charities</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png"
                  alt="Security"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-ice-700">Bank-Grade Security</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png"
                  alt="Transparency"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-ice-700">Complete Transparency</span>
              </div>
            </div>

            <p className="text-ice-600 mb-6">
              No setup fees, no monthly subscriptions, no hidden costs. You only pay when you donate.
            </p>

            <div className="flex justify-center">
              <img
                src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/621831225411d1879ee48d99_partners3.png"
                alt="Trusted Partners"
                className="h-8 opacity-70"
                loading="lazy"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PricingPage;
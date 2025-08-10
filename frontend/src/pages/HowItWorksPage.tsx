import React from 'react';
import { motion } from 'framer-motion';
import IggyMascot from '@/components/IggyMascot';
import { 
  ClockIcon, 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline';

const HowItWorksPage: React.FC = () => {
  const steps = [
    {
      step: '01',
      title: 'Browse & Select',
      description: 'Search through 100+ verified NZ charities by cause, location, or name. Each charity is IRD-verified with full transparency.',
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png',
      time: '2 minutes',
    },
    {
      step: '02',
      title: 'Donate Securely',
      description: 'Enter your donation amount and pay with credit card or bank transfer. All transactions use bank-grade encryption.',
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png',
      time: '1 minute',
    },
    {
      step: '03',
      title: 'Instant Receipt',
      description: 'Receive your NZ IRD-compliant tax receipt immediately via email. Perfect for tax time with all required details.',
      icon: DocumentTextIcon,
      time: 'Instant',
      isHeroIcon: true,
    },
    {
      step: '04',
      title: 'Track Impact',
      description: 'Follow your donation\'s impact through transparent reporting and real-time updates from the charity.',
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png',
      time: 'Ongoing',
    },
  ];

  const comparison = [
    {
      aspect: 'Time Required',
      traditional: '2-4 weeks total process',
      isbjorn: '5 minutes start to finish',
    },
    {
      aspect: 'Tax Receipt',
      traditional: 'Wait 2-4 weeks by mail',
      isbjorn: 'Instant digital receipt',
    },
    {
      aspect: 'Charity Verification',
      traditional: 'Manual research required',
      isbjorn: 'Pre-verified by platform',
    },
    {
      aspect: 'Payment Method',
      traditional: 'Cheque or bank transfer',
      isbjorn: 'Credit card or instant transfer',
    },
    {
      aspect: 'Fees',
      traditional: 'Bank fees + staff time',
      isbjorn: '1.5% platform fee only',
    },
    {
      aspect: 'Transparency',
      traditional: 'Limited visibility',
      isbjorn: 'Full donation tracking',
    },
  ];

  return (
    <div className="min-h-screen bg-ice-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-arctic-500 to-polar-500 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center p-4">
            <img
              src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg"
              alt="Iggy the Polar Bear - How It Works"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-4xl font-bold font-display mb-4">
            How Isbjorn Works
          </h1>
          <p className="text-xl text-ice-100 max-w-3xl mx-auto">
            Transform your business charitable giving from weeks to minutes. 
            Here's exactly how our platform streamlines the entire process.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Process Steps */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-ice-900 font-display mb-6">Simple 4-Step Process</h2>
          <p className="text-xl text-ice-600 max-w-3xl mx-auto">
            From browsing charities to receiving your tax receipt, everything happens in one seamless workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="card p-6 text-center hover:shadow-lg transition-all duration-300 h-full">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-arctic-500 to-polar-500 text-white rounded-full flex items-center justify-center text-xl font-bold font-display">
                  {step.step}
                </div>
                
                <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ice-200">
                  {step.isHeroIcon ? (
                    <step.icon className="w-8 h-8 text-arctic-600" />
                  ) : (
                    <img
                      src={step.icon}
                      alt={step.title}
                      className="w-8 h-8 object-contain"
                      loading="lazy"
                    />
                  )}
                </div>

                <h3 className="text-xl font-semibold text-ice-900 mb-3 font-display">
                  {step.title}
                </h3>
                
                <p className="text-ice-600 leading-relaxed mb-4">
                  {step.description}
                </p>

                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-arctic-100 text-arctic-700">
                  <ClockIcon className="w-3 h-3 mr-1" />
                  {step.time}
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                  <ArrowRightIcon className="w-6 h-6 text-arctic-400" />
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Comparison Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-16"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-ice-900 font-display mb-6">
              Traditional vs Isbjorn
            </h2>
            <p className="text-xl text-ice-600 max-w-3xl mx-auto">
              See how Isbjorn transforms the business charitable giving experience
            </p>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-ice-50 border-b border-ice-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ice-900">Aspect</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-ice-900">Traditional Method</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-arctic-700">Isbjorn Platform</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ice-200">
                  {comparison.map((item, index) => (
                    <tr key={index} className="hover:bg-ice-25 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium text-ice-900">{item.aspect}</td>
                      <td className="px-6 py-4 text-sm text-ice-600">{item.traditional}</td>
                      <td className="px-6 py-4 text-sm text-arctic-700 font-medium">{item.isbjorn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Trust & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-gradient-to-r from-arctic-50 to-ice-100 rounded-xl p-8 text-center"
        >
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-ice-900 font-display mb-6">
              Built for Trust & Compliance
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png"
                  alt="Security"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-ice-700">Bank-Grade Security</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
                <span className="text-ice-700">IRD Compliant</span>
              </div>
              <div className="flex items-center justify-center space-x-3">
                <img
                  src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png"
                  alt="Transparency"
                  className="w-8 h-8 object-contain"
                />
                <span className="text-ice-700">Full Transparency</span>
              </div>
            </div>

            <p className="text-ice-600 mb-6">
              Every charity is verified against the NZ Charities Register. All transactions use SSL encryption 
              and comply with NZ financial regulations. Your data is never shared without permission.
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

export default HowItWorksPage;
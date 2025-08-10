import React from 'react';
import { motion } from 'framer-motion';
import IggyMascot from '@/components/IggyMascot';

const AboutPage: React.FC = () => {
  const missionValues = [
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png',
      title: 'Community Impact',
      description: 'Connecting NZ businesses with verified local and national charities to strengthen our communities through strategic giving.',
    },
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png',
      title: 'Complete Transparency',
      description: 'Every donation is tracked with full visibility from payment to impact, ensuring businesses know exactly how their contributions make a difference.',
    },
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png',
      title: 'Trust & Security',
      description: 'Bank-grade security, IRD compliance, and verified charity partnerships provide the foundation for confident corporate giving.',
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
              alt="Iggy the Polar Bear - About Isbjorn"
              className="w-full h-full object-contain"
              loading="eager"
            />
          </div>
          <h1 className="text-4xl font-bold text-ice-900 font-display mb-4">
            About Isbjorn
          </h1>
          <p className="text-xl text-ice-100 max-w-3xl mx-auto">
            The modern platform transforming how New Zealand businesses 
            handle charitable giving - faster, transparent, and more impactful.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Mission Statement */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-ice-900 font-display mb-6">Our Mission</h2>
          <p className="text-xl text-ice-600 max-w-4xl mx-auto leading-relaxed">
            We're building the infrastructure for modern charitable giving in New Zealand. 
            Our platform connects businesses with 100+ verified charities, making donations 
            as simple as any online purchase while ensuring perfect compliance and transparency.
          </p>
        </motion.div>

        {/* Mission Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {missionValues.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="card p-8 text-center hover:shadow-lg transition-all duration-300"
            >
              <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-lg flex items-center justify-center shadow-sm border border-ice-200">
                <img
                  src={value.icon}
                  alt={value.title}
                  className="w-12 h-12 object-contain"
                  loading="lazy"
                />
              </div>
              <h3 className="text-xl font-semibold text-ice-900 mb-4 font-display">
                {value.title}
              </h3>
              <p className="text-ice-600 leading-relaxed">
                {value.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* The Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-2xl font-semibold text-ice-900 font-display mb-6">The Problem We Solve</h2>
            <div className="space-y-4 text-ice-700">
              <p className="leading-relaxed">
                Traditional business charitable giving in New Zealand is broken. Companies waste hours on 
                paperwork, wait weeks for tax receipts, and struggle to find verified charities that 
                align with their values.
              </p>
              <p className="leading-relaxed">
                We've built the Stripe for charitable donations - a single platform where businesses 
                can discover, donate to, and track impact across any registered NZ charity in minutes, 
                not weeks.
              </p>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <img
              src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg"
              alt="Iggy the Polar Bear - Isbjorn Mascot"
              className="w-64 h-64 object-contain rounded-lg bg-white/80 p-4 shadow-lg border border-ice-200"
            />
          </motion.div>
        </div>

        {/* Meet Iggy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="card p-8 bg-gradient-to-r from-arctic-50 to-ice-100"
        >
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-ice-900 font-display mb-4">Meet Iggy, Our Guide</h2>
            <p className="text-ice-700 leading-relaxed max-w-3xl mx-auto">
              Iggy the polar bear represents the spirit of protection and community that drives our platform. 
              While Arctic conservation is one of many important causes on Isbjorn, Iggy serves as our 
              friendly guide helping NZ businesses navigate their charitable giving journey - whether 
              they're supporting local hospitals, education initiatives, or environmental causes.
            </p>
          </div>
        </motion.div>

        {/* Partners Trust Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-16"
        >
          <h2 className="text-2xl font-semibold text-ice-900 font-display mb-8">
            Trusted Infrastructure
          </h2>
          <div className="flex flex-wrap justify-center items-center space-x-8 md:space-x-12 opacity-70 mb-6">
            <img
              src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/621831225411d1879ee48d99_partners3.png"
              alt="Trusted Partners"
              className="h-10 object-contain"
              loading="lazy"
            />
          </div>
          <p className="text-ice-600">
            Integrated with NZ Charities Register • IRD Compliant • Bank-Grade Security • Verified Charity Network
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutPage;
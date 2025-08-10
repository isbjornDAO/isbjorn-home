import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IggyMascot from '@/components/IggyMascot';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  HeartIcon, 
  ChartBarIcon, 
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

const HomePage: React.FC = () => {
  const partnerLogos = [
    // Integration Partners - with brand colors
    {
      name: 'Xero',
      src: 'https://logo.clearbit.com/xero.com',
      type: 'integration',
      brandColor: '#13b5ea'
    },
    {
      name: 'QuickBooks',
      src: 'https://logo.clearbit.com/quickbooks.intuit.com',
      type: 'integration',
      brandColor: '#0077c5'
    },
    {
      name: 'MYOB',
      src: 'https://logo.clearbit.com/myob.com',
      type: 'integration',
      brandColor: '#e31e24'
    },
    // Major Charities - with brand colors
    {
      name: 'Red Cross',
      src: 'https://logo.clearbit.com/redcross.org',
      type: 'charity',
      brandColor: '#ed1b2e'
    },
    {
      name: 'UNICEF',
      src: 'https://logo.clearbit.com/unicef.org',
      type: 'charity',
      brandColor: '#00aeef'
    },
    {
      name: 'World Vision',
      src: 'https://logo.clearbit.com/worldvision.org',
      type: 'charity',
      brandColor: '#ff6900'
    },
    {
      name: 'Oxfam',
      src: 'https://logo.clearbit.com/oxfam.org',
      type: 'charity',
      brandColor: '#00b04f'
    },
    {
      name: 'WWF',
      src: 'https://logo.clearbit.com/worldwildlife.org',
      type: 'charity',
      brandColor: '#000000'
    }
  ];

  const features = [
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png' as const,
      title: '100+ NZ Charities',
      description: 'All verified and registered with NZ Charities Register.',
      isImage: true as const,
    },
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e22b22b4a026b4739160_SECURITY.png' as const,
      title: 'Instant Tax Receipts',
      description: 'IRD-compliant receipts delivered immediately to your email.',
      isImage: true as const,
    },
    {
      icon: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e24f4c389a939113cc19_TRANSPARENCY.png' as const,
      title: 'Simple 1.5% Fee',
      description: 'One transparent fee covers everything. No hidden costs.',
      isImage: true as const,
    },
  ];

  const stats = [
    { label: 'Registered NZ Charities', value: '127', icon: ShieldCheckIcon },
    { label: 'Donations Processed', value: '2,847', icon: HeartIcon },
    { label: 'Total Donated (NZD)', value: '$1.2M', icon: CurrencyDollarIcon },
    { label: 'Business Partners', value: '156', icon: GlobeAltIcon },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-24 bg-gradient-to-br from-ice-50 via-white to-arctic-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-center gap-16"
          >
            {/* Circular Background Image */}
            <div 
              className="w-[400px] h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-cover bg-center shadow-xl hover:shadow-2xl transition-shadow duration-300 flex-shrink-0"
              style={{
                backgroundImage: "url('https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/621732317d36fa50a319746c_Mission%20(1).png')"
              }}
            />
            
            {/* Content */}
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-5xl md:text-6xl font-bold font-display mb-6 text-gray-800">
                Donate to <span className="bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent">NZ</span> <span className="bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent">Charities</span>
              </h1>
              
              <div className="text-lg md:text-xl text-gray-600 mb-10 space-y-3">
                <div className="flex items-center justify-center lg:justify-start">
                  <HeartIcon className="w-6 h-6 text-arctic-500 mr-3 flex-shrink-0" />
                  <span>Choose any verified charity</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <CurrencyDollarIcon className="w-6 h-6 text-arctic-500 mr-3 flex-shrink-0" />
                  <span>Donate in minutes</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <ChartBarIcon className="w-6 h-6 text-arctic-500 mr-3 flex-shrink-0" />
                  <span>Get instant tax receipts</span>
                </div>
              </div>
              
              <div className="flex justify-center lg:justify-start">
                <Link to="/donate" className="btn-primary text-xl px-12 py-4 inline-flex items-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <span className="text-2xl mr-3">🐻‍❄️</span>
                  Browse Charities
                  <ArrowRightIcon className="w-6 h-6 ml-3" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-ice-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center mb-12"
          >
            {stats.map((stat, index) => {
              const IconComponent = stat.icon;
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-full flex items-center justify-center mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <IconComponent className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-3xl md:text-4xl font-bold text-arctic-600 font-display mb-1">
                    {stat.value}
                  </div>
                  <div className="text-base text-ice-600">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-ice-900 font-display mb-4">
              Transparent & Secure
            </h2>
            <p className="text-xl md:text-2xl text-ice-600 max-w-2xl mx-auto">
              Everything you need for business charitable giving
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="text-center bg-white rounded-xl shadow-md border border-ice-100 hover:shadow-lg transition-all duration-300 p-8"
                >
                  <div className="w-40 h-40 mx-auto mb-8 bg-gradient-to-br from-arctic-100 to-ice-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <img
                      src={feature.icon as string}
                      alt={feature.title}
                      className="w-28 h-28 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-h-[120px] flex flex-col justify-center">
                    <h3 className="text-2xl font-bold text-ice-900 mb-4 font-display">
                      {feature.title}
                    </h3>
                    <p className="text-ice-600 text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Enhanced Customer Review Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 via-ice-50 to-white relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute top-20 left-10 w-64 h-64 bg-arctic-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-polar-400 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        </div>
        
        {/* Floating Quote Icon */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <motion.div
            initial={{ opacity: 0, scale: 0, rotate: -180 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center shadow-xl"
          >
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h4v10h-10z"/>
            </svg>
          </motion.div>
        </div>
        
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative"
          >
            {/* Main Review Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 md:p-16 shadow-2xl border border-white/50 relative overflow-hidden">
              {/* Card Background Pattern */}
              <div className="absolute inset-0 opacity-[0.02]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="review-pattern" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                      <circle cx="30" cy="30" r="2" fill="rgb(22, 163, 220)"/>
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#review-pattern)"/>
                </svg>
              </div>
              
              {/* Animated Stars */}
              <div className="flex justify-center mb-8">
                <div className="flex space-x-1 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-sm">
                  {[...Array(5)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0, rotate: -180 }}
                      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                      transition={{ 
                        delay: i * 0.15, 
                        type: "spring", 
                        stiffness: 200,
                        damping: 10
                      }}
                      whileHover={{ 
                        scale: 1.2, 
                        rotate: [0, -10, 10, 0],
                        transition: { duration: 0.5 }
                      }}
                    >
                      <svg className="w-7 h-7 text-yellow-400 drop-shadow-sm" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </motion.div>
                  ))}
                </div>
              </div>
              
              {/* Visual Quote Cards */}
              <div className="grid md:grid-cols-3 gap-6 mb-10">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2, duration: 0.6 }}
                  className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl border border-green-200/50"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-green-800 mb-2">Simple</h3>
                  <p className="text-green-700 text-sm">"Super easy process"</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.6 }}
                  className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200/50"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-blue-800 mb-2">Fast</h3>
                  <p className="text-blue-700 text-sm">
                    <span className="bg-gradient-to-r from-arctic-500 to-arctic-600 bg-clip-text text-transparent font-bold">Under 3 minutes</span>
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6, duration: 0.6 }}
                  className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl border border-purple-200/50"
                >
                  <div className="w-12 h-12 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-purple-800 mb-2">Instant</h3>
                  <p className="text-purple-700 text-sm">"IRD receipt immediately"</p>
                </motion.div>
              </div>

              {/* Short Testimonial */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.8, duration: 0.6 }}
                className="text-center"
              >
                <p className="text-xl text-ice-900 font-medium italic mb-2">
                  "Finally, a platform that actually works!"
                </p>
              </motion.div>
              
              {/* Enhanced Attribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center justify-center"
              >
                <div className="flex items-center space-x-6 bg-gradient-to-r from-ice-50 to-arctic-50 px-8 py-4 rounded-2xl shadow-sm border border-ice-200/30">
                  <motion.div 
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    className="relative"
                  >
                    <div className="w-16 h-16 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-white font-bold text-xl">SG</span>
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-sm"></div>
                  </motion.div>
                  <div className="text-left">
                    <div className="font-bold text-xl text-ice-900 mb-1">Sarah Green</div>
                    <div className="text-arctic-600 font-medium">CFO, GreenTech Solutions</div>
                    <div className="flex items-center mt-2 space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-ice-500 font-medium">Verified Customer</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Floating Metrics */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="absolute -top-4 -right-4 bg-white rounded-2xl p-4 shadow-xl border border-ice-200/50"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-arctic-600">4.9</div>
                <div className="text-xs text-ice-500 font-medium">Avg Rating</div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="absolute -bottom-4 -left-4 bg-white rounded-2xl p-4 shadow-xl border border-ice-200/50"
            >
              <div className="text-center">
                <div className="text-2xl font-bold text-arctic-600">2.5k+</div>
                <div className="text-xs text-ice-500 font-medium">Reviews</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Ready to Donate CTA - Compact */}
      <section className="py-16 bg-gradient-to-br from-arctic-50 via-ice-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-2xl shadow-lg border border-ice-200/50 p-10 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Polar Bear Background */}
            <div 
              className="absolute inset-0 bg-cover opacity-100"
              style={{
                backgroundImage: "url('https://pbs.twimg.com/media/GseIHU4bwAAdCK5?format=jpg&name=medium')",
                backgroundPosition: "-20% 10%",
                backgroundSize: "130%",
                backgroundRepeat: "no-repeat"
              }}
            />
            
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/85 to-transparent"></div>
            
            {/* Content overlay */}
            <div className="relative z-10 text-left max-w-2xl">
              {/* Heart Icon */}
              <div className="flex justify-start mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <HeartIcon className="w-10 h-10 text-white" />
                </div>
              </div>

            <h2 className="text-4xl md:text-5xl font-bold text-ice-900 font-display mb-6 drop-shadow-sm">
              Ready to Donate?
            </h2>
            
            <div className="text-xl md:text-2xl text-ice-600 mb-8">
              <div className="flex flex-col space-y-3">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <HeartIcon className="w-4 h-4 text-arctic-600" />
                  </div>
                  <span className="font-semibold">Choose charity</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <CurrencyDollarIcon className="w-4 h-4 text-arctic-600" />
                  </div>
                  <span className="font-semibold">Donate securely</span>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-3 shadow-sm">
                    <ChartBarIcon className="w-4 h-4 text-arctic-600" />
                  </div>
                  <span className="font-semibold">Get instant receipt</span>
                </div>
              </div>
              <p className="text-lg text-ice-500 mt-4 font-medium">Done in under 5 minutes</p>
            </div>
            
            <Link 
              to="/donate" 
              className="btn-primary text-xl px-12 py-5 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 inline-flex items-center font-bold"
            >
              <HeartIcon className="w-6 h-6 mr-3" />
              Browse Charities
            </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
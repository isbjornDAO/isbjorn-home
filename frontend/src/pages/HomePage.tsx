import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import IggyMascot from '@/components/IggyMascot';
import LoadingSpinner from '@/components/LoadingSpinner';
import TrendingNews from '@/components/TrendingNews';
import {
  HeartIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  GlobeAltIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface PublicStats {
  registeredCharities: number;
  donationsProcessed: number;
  totalDonatedNzd: number;
  businessPartners: number;
}

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();
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

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const result = await apiService.get<{ success: boolean; data: PublicStats }>('/public/stats');
        if ((result as any).success && (result as any).data) {
          setStats((result as any).data as PublicStats);
        }
      } catch (e) {
        console.error('Failed to load public stats', e);
      } finally {
        setStatsLoading(false);
      }
    };
    loadStats();
  }, []);

  const displayValue = (formatter: () => string) => {
    if (statsLoading) return '—';
    try {
      return formatter();
    } catch {
      return '—';
    }
  };

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
      title: 'Open spending',
      description: 'Transparent payments to NGOs, backed by community voting.',
      isImage: true as const,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-12 sm:py-16 md:py-24 bg-gradient-to-br from-ice-50 via-white to-arctic-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16"
          >
            {/* Circular Background Image */}
            <div
              className="w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] md:w-[400px] md:h-[400px] lg:w-[500px] lg:h-[500px] rounded-full bg-cover bg-center shadow-xl hover:shadow-2xl transition-shadow duration-300 flex-shrink-0"
              style={{
                backgroundImage: "url('https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/621732317d36fa50a319746c_Mission%20(1).png')"
              }}
            />

            {/* Content */}
            <div className="text-center lg:text-left flex-1">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-display mb-4 sm:mb-6 text-gray-800 leading-tight">
                Donate to <span className="bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent">NZ</span> <span className="bg-gradient-to-r from-arctic-500 to-arctic-700 bg-clip-text text-transparent">Charities</span>
              </h1>

              <div className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 space-y-2 sm:space-y-3">
                <div className="flex items-center justify-center lg:justify-start">
                  <HeartIcon className="w-5 h-5 sm:w-6 sm:h-6 text-arctic-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Choose any verified charity</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <CurrencyDollarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-arctic-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Donate in minutes</span>
                </div>
                <div className="flex items-center justify-center lg:justify-start">
                  <ChartBarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-arctic-500 mr-2 sm:mr-3 flex-shrink-0" />
                  <span>Get instant tax receipts</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
                <Link
                  to={isAuthenticated ? '/donate' : '/register'}
                  className="group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-xl inline-flex items-center shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {/* Snowflake particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1 left-4 text-white/30 text-xs animate-fall-slow">❄</div>
                    <div className="absolute top-0 left-1/4 text-white/20 text-sm animate-fall-medium">❄</div>
                    <div className="absolute top-2 right-1/4 text-white/25 text-xs animate-fall-fast">❄</div>
                    <div className="absolute top-1 right-8 text-white/20 text-sm animate-fall-slow">❄</div>
                  </div>

                  {/* Aurora shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Polar bear icon */}
                  <span className="mr-2 sm:mr-3 text-xl sm:text-2xl group-hover:animate-bounce">🐻‍❄️</span>

                  <span className="relative font-bold tracking-wide">Ready to Donate?</span>
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-ice-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Stats Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center mb-8 sm:mb-12"
          >
            {[
              { label: 'Registered NZ Charities', key: 'registeredCharities', icon: ShieldCheckIcon },
              { label: 'Donations Processed', key: 'donationsProcessed', icon: HeartIcon },
              { label: 'Total Donated (NZD)', key: 'totalDonatedNzd', icon: CurrencyDollarIcon },
              { label: 'Business Partners', key: 'businessPartners', icon: GlobeAltIcon },
            ].map((stat, index) => {
              const IconComponent = stat.icon;
              const value = displayValue(() => {
                if (!stats) return '—';
                const v = (stats as any)[stat.key];
                if (stat.key === 'totalDonatedNzd') {
                  if (!v || v === 0) return '$0';
                  return `$${Number(v).toLocaleString()}`;
                }
                return v ? Number(v).toLocaleString() : '0';
              });
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-arctic-500 to-arctic-600 rounded-full flex items-center justify-center mb-3 sm:mb-4 shadow-md hover:shadow-lg transition-shadow duration-300">
                    <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                  </div>
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-arctic-600 font-display mb-1">
                    {value}
                  </div>
                  <div className="text-sm sm:text-base text-ice-600 text-center px-1">{stat.label}</div>
                </div>
              );
            })}
          </motion.div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.4 }}
            className="text-center mb-8 sm:mb-12"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ice-900 font-display mb-3 sm:mb-4">
              Transparent & Secure
            </h2>
            <p className="text-lg sm:text-xl md:text-2xl text-ice-600 max-w-2xl mx-auto px-4">
              Everything you need for business charitable giving
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              return (
                <div
                  key={index}
                  className="text-center bg-white rounded-xl shadow-md border border-ice-100 hover:shadow-lg transition-all duration-300 p-6 sm:p-8"
                >
                  <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 sm:mb-8 bg-gradient-to-br from-arctic-100 to-ice-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow duration-300">
                    <img
                      src={feature.icon as string}
                      alt={feature.title}
                      className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-h-[100px] sm:min-h-[120px] flex flex-col justify-center">
                    <h3 className="text-xl sm:text-2xl font-bold text-ice-900 mb-3 sm:mb-4 font-display">
                      {feature.title}
                    </h3>
                    <p className="text-ice-600 text-base sm:text-lg leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>


      {/* Ready to Donate CTA - Compact */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-arctic-50 via-ice-50 to-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative bg-white rounded-2xl shadow-lg border border-ice-200/50 p-6 sm:p-8 md:p-10 hover:shadow-xl transition-shadow duration-300 overflow-hidden"
          >
            {/* Polar Bear Background */}
            <div
              className="absolute inset-0 bg-cover opacity-100 hidden md:block"
              style={{
                backgroundImage: "url('https://pbs.twimg.com/media/GseIHU4bwAAdCK5?format=jpg&name=medium')",
                backgroundPosition: "-20% 10%",
                backgroundSize: "130%",
                backgroundRepeat: "no-repeat"
              }}
            />

            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-white via-white/90 md:via-white/85 to-white md:to-transparent"></div>

            {/* Content overlay */}
            <div className="relative z-10 text-center md:text-left max-w-2xl mx-auto md:mx-0">
              {/* Heart Icon */}
              <div className="flex justify-center md:justify-start mb-4 sm:mb-6">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-arctic-400 to-arctic-600 rounded-full flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                  <HeartIcon className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                </div>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-ice-900 font-display mb-4 sm:mb-6 drop-shadow-sm">
                Start donating today
              </h2>

              <div className="text-lg sm:text-xl md:text-2xl text-ice-600 mb-6 sm:mb-8">
                <div className="flex flex-col space-y-2 sm:space-y-3">
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-sm">
                      <HeartIcon className="w-3 h-3 sm:w-4 sm:h-4 text-arctic-600" />
                    </div>
                    <span className="font-semibold">Community-voted funding.</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-sm">
                      <CurrencyDollarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-arctic-600" />
                    </div>
                    <span className="font-semibold">Donate securely</span>
                  </div>
                  <div className="flex items-center justify-center md:justify-start">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-arctic-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 shadow-sm">
                      <ChartBarIcon className="w-3 h-3 sm:w-4 sm:h-4 text-arctic-600" />
                    </div>
                    <span className="font-semibold">Get instant IRD receipts</span>
                  </div>
                </div>
                <p className="text-base sm:text-lg text-ice-500 mt-3 sm:mt-4 font-medium">done in 2 minutes</p>
              </div>

              <div className="flex justify-center md:justify-start">
                <Link
                  to={isAuthenticated ? '/donate' : '/register'}
                  className="group relative overflow-hidden bg-gradient-to-r from-arctic-500 via-arctic-600 to-arctic-500 bg-[length:200%_100%] animate-gradient text-white text-lg sm:text-xl px-8 sm:px-12 py-4 sm:py-5 rounded-xl inline-flex items-center shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
                >
                  {/* Snowflake particles */}
                  <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1 left-4 text-white/30 text-xs animate-fall-slow">❄</div>
                    <div className="absolute top-0 left-1/4 text-white/20 text-sm animate-fall-medium">❄</div>
                    <div className="absolute top-2 right-1/4 text-white/25 text-xs animate-fall-fast">❄</div>
                    <div className="absolute top-1 right-8 text-white/20 text-sm animate-fall-slow">❄</div>
                  </div>

                  {/* Aurora shimmer effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                  {/* Polar bear icon */}
                  <span className="mr-2 sm:mr-3 text-xl sm:text-2xl group-hover:animate-bounce">🐻‍❄️</span>

                  <span className="relative font-bold tracking-wide">Ready to Donate?</span>
                  <ArrowRightIcon className="w-5 h-5 sm:w-6 sm:h-6 ml-2 sm:ml-3 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trending News and Videos */}
      <section className="py-16 sm:py-20 bg-ice-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrendingNews />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, ClockIcon } from '@heroicons/react/24/outline';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

interface Story {
  id: string;
  title: string;
  excerpt: string;
  image: string;
  category: string;
  date: string;
  readTime: string;
}

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Latest conservation stories
  const stories: Story[] = [
    {
      id: '1',
      title: 'Polar Bears Adapt to Shrinking Arctic Ice',
      excerpt: 'New research reveals how polar bears are modifying their hunting strategies in response to rapidly melting sea ice.',
      image: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?q=80&w=2070',
      category: 'WILDLIFE',
      date: 'December 8, 2025',
      readTime: '5 min read'
    },
    {
      id: '2',
      title: 'The Last Ice: Arctic\'s Final Refuge',
      excerpt: 'Scientists identify critical regions where summer sea ice may persist, offering hope for polar bear survival.',
      image: 'https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070',
      category: 'ENVIRONMENT',
      date: 'December 5, 2025',
      readTime: '8 min read'
    },
    {
      id: '3',
      title: 'Indigenous Communities Lead Arctic Conservation',
      excerpt: 'Traditional knowledge combines with modern science to protect polar bear populations across the circumpolar north.',
      image: 'https://images.unsplash.com/photo-1551244072-5d12893278ab?q=80&w=2070',
      category: 'CULTURE',
      date: 'December 1, 2025',
      readTime: '6 min read'
    },
    {
      id: '4',
      title: 'Blockchain Technology Transforms Conservation Funding',
      excerpt: 'Transparent, traceable donations are revolutionizing how we fund critical wildlife protection efforts.',
      image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2070',
      category: 'TECHNOLOGY',
      date: 'November 28, 2025',
      readTime: '4 min read'
    },
    {
      id: '5',
      title: 'A Mother\'s Journey: 1,000 Miles Across Ice',
      excerpt: 'Follow one polar bear family\'s incredible migration in search of food and stable ice.',
      image: 'https://images.unsplash.com/photo-1564053489984-317bbd824340?q=80&w=2070',
      category: 'PHOTOGRAPHY',
      date: 'November 25, 2025',
      readTime: '7 min read'
    },
    {
      id: '6',
      title: 'Hope in the Arctic: Conservation Success Stories',
      excerpt: 'Discover how targeted protection efforts are making measurable differences for threatened species.',
      image: 'https://images.unsplash.com/photo-1668418321923-becc3715d746?q=80&w=2070',
      category: 'CONSERVATION',
      date: 'November 20, 2025',
      readTime: '5 min read'
    }
  ];

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section - Autoplay Video Background */}
      <section className="relative h-screen w-full overflow-hidden">
        {/* Video Background */}
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://player.vimeo.com/external/370467553.sd.mp4?s=e90dcaba73c19c3e0d1363b2c8bd8d54d3695238&profile_id=164&oauth2_token_id=57447761" type="video/mp4" />
          {/* Fallback to static image if video fails */}
          <div
            className="absolute inset-0 w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1583422409516-2895a77efded?q=80&w=2070')" }}
          />
        </video>

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black"></div>

        {/* Hero Content */}
        <div className="relative z-10 h-full flex flex-col justify-end pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="max-w-4xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-yellow-400"></div>
                <span className="text-yellow-400 text-sm font-bold tracking-[0.2em] uppercase">
                  Featured Story
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                The Arctic's<br />
                Silent Sentinels
              </h1>

              <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl font-light leading-relaxed">
                Polar bears face their greatest challenge yet as Arctic ice vanishes at unprecedented rates.
                But hope remains through transparent, blockchain-powered conservation.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={isAuthenticated ? '/donate' : '/signup'}
                  className="inline-flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-bold px-8 py-4 transition-all duration-300 group"
                >
                  <span>Support Conservation</span>
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>

                <button className="inline-flex items-center justify-center gap-2 border-2 border-white text-white hover:bg-white hover:text-black font-bold px-8 py-4 transition-all duration-300">
                  <span>Explore Stories</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="w-6 h-10 border-2 border-white/60 rounded-full flex justify-center pt-2">
            <motion.div
              className="w-1.5 h-3 bg-white/80 rounded-full"
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
        </motion.div>
      </section>

      {/* Latest Stories Section */}
      <section className="relative bg-black py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="flex items-center gap-4 mb-12">
            <div className="h-px flex-1 bg-gray-800"></div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              Latest Stories
            </h2>
            <div className="h-px flex-1 bg-gray-800"></div>
          </div>

          {/* Featured Story - Large */}
          <div className="mb-12">
            <StoryCard story={stories[0]} featured />
          </div>

          {/* Story Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.slice(1).map((story) => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>

          {/* View More */}
          <div className="text-center mt-16">
            <Link
              to="/donate"
              className="inline-flex items-center gap-2 text-yellow-400 hover:text-yellow-300 font-bold text-lg group transition-colors"
            >
              <span>View All Conservation Stories</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Impact Banner */}
      <section className="relative bg-gradient-to-r from-yellow-500 to-yellow-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                Every donation makes a difference
              </h3>
              <p className="text-black/80 text-lg">
                100% transparent • Blockchain verified • Zero hidden fees
              </p>
            </div>
            <Link
              to={isAuthenticated ? '/donate' : '/signup'}
              className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-bold px-8 py-4 transition-all duration-300 group whitespace-nowrap"
            >
              <span>Start Giving</span>
              <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

// Story Card Component
const StoryCard: React.FC<{ story: Story; featured?: boolean }> = ({ story, featured = false }) => {
  const { isAuthenticated } = useAuth();

  if (featured) {
    return (
      <Link
        to={isAuthenticated ? '/donate' : '/signup'}
        className="group relative block overflow-hidden bg-gray-900"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative h-64 md:h-auto overflow-hidden">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 tracking-wider">
                {story.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 flex flex-col justify-center">
            <div className="flex items-center gap-3 text-gray-400 text-sm mb-4">
              <time>{story.date}</time>
              <span>•</span>
              <span className="flex items-center gap-1">
                <ClockIcon className="w-4 h-4" />
                {story.readTime}
              </span>
            </div>

            <h3 className="text-3xl md:text-4xl font-bold text-white mb-4 group-hover:text-yellow-400 transition-colors leading-tight tracking-tight">
              {story.title}
            </h3>

            <p className="text-gray-300 text-lg leading-relaxed mb-6 font-light">
              {story.excerpt}
            </p>

            <div className="flex items-center gap-2 text-yellow-400 font-bold group-hover:gap-3 transition-all">
              <span>Read More</span>
              <ArrowRightIcon className="w-5 h-5" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      to={isAuthenticated ? '/donate' : '/signup'}
      className="group block overflow-hidden bg-gray-900"
    >
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-yellow-400 text-black text-xs font-bold px-3 py-1 tracking-wider">
            {story.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="flex items-center gap-3 text-gray-400 text-sm mb-3">
          <time>{story.date}</time>
          <span>•</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            {story.readTime}
          </span>
        </div>

        <h3 className="text-xl md:text-2xl font-bold text-white mb-3 group-hover:text-yellow-400 transition-colors leading-tight tracking-tight">
          {story.title}
        </h3>

        <p className="text-gray-300 leading-relaxed mb-4 font-light line-clamp-3">
          {story.excerpt}
        </p>

        <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm group-hover:gap-3 transition-all">
          <span>Read More</span>
          <ArrowRightIcon className="w-4 h-4" />
        </div>
      </div>
    </Link>
  );
};

export default HomePage;

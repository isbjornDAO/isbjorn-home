import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import arcticPoster from '@/assets/arctic-video-poster.jpg.jpg.png';

// Snowflake component for arctic animation
const Snowflake: React.FC<{ delay: number }> = ({ delay }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 8 + Math.random() * 4;

  return (
    <motion.div
      className="absolute text-blue-200 opacity-40"
      style={{ left: `${randomX}%`, top: '-20px' }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, Math.sin(delay) * 50, 0],
        rotate: [0, 360]
      }}
      transition={{
        duration: randomDuration,
        repeat: Infinity,
        delay: delay,
        ease: 'linear'
      }}
    >
      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L10 10L2 12L10 14L12 22L14 14L22 12L14 10L12 2Z" />
      </svg>
    </motion.div>
  );
};

// Words array outside component to prevent recreating
const TYPING_WORDS = ['polar bears', 'world', 'arctic foxes', 'penguins', 'seals', 'whales', 'walruses', 'caribou', 'snowy owls'];

// Typing animation component
const TypingText: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('polar bears');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const currentWord = TYPING_WORDS[currentWordIndex];

    if (isPaused) {
      const pauseDuration = currentWordIndex === 0 && currentText === 'polar bears' ? 3000 : 2000;
      const pauseTimeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseDuration);
      return () => clearTimeout(pauseTimeout);
    }

    if (!isDeleting && currentText === currentWord) {
      setIsPaused(true);
      return;
    }

    const typingSpeed = isDeleting ? 50 : 100;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % TYPING_WORDS.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, currentWordIndex]);

  return (
    <span className="inline-block">
      {currentText}
      <span className="animate-pulse">|</span>
    </span>
  );
};

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Stats Bar */}
      <div className="relative z-50 bg-[#1e3a5f] border-b border-[#2d4a6f] shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-center gap-8 md:gap-12">
            {/* Donations Today */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white font-bold text-sm md:text-base">247</span>
              </div>
              <span className="text-white/90 text-xs md:text-sm">donations today</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/30"></div>

            {/* Users Online */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <div className="absolute -top-0.5 -right-0.5 h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <span className="text-white font-bold text-sm md:text-base">1,342</span>
              </div>
              <span className="text-white/90 text-xs md:text-sm">users online</span>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-white/30"></div>

            {/* Map Contributions */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <span className="text-white font-bold text-sm md:text-base">856</span>
              </div>
              <span className="text-white/90 text-xs md:text-sm">map contributions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Background Video Section */}
      <div className="relative w-full h-[calc(100vh-7rem)] overflow-hidden">
        {/* Video Background Container with Poster Image */}
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${arcticPoster})`
          }}
        >
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none transition-opacity duration-1000"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              width: '1920px',
              height: '1080px',
              objectFit: 'cover',
              opacity: videoLoaded ? 1 : 0
            }}
            src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=1&mute=1&loop=1&playlist=64ZaC04ppLQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&origin=https://isbjorn.io"
            title="Polar Bears Video Background"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            onLoad={() => {
              // Delay to ensure video starts playing before fading in
              setTimeout(() => setVideoLoaded(true), 1500);
            }}
          />
          {/* Additional overlay to block YouTube UI elements */}
          <div className="absolute inset-0 pointer-events-none z-[5]"></div>
        </div>

        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/50 z-10"></div>

        {/* Arctic Snowfall Animation */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <Snowflake key={i} delay={i * 0.4} />
          ))}
        </div>

        {/* Hero Content Over Video */}
        <div className="relative z-30 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-center mb-1"
            style={{
              paddingBottom: '0.2em',
              paddingTop: '0.1em',
              lineHeight: '1.3'
            }}
          >
            <span
              className="bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent animate-gradient inline-block"
              style={{
                backgroundSize: '200% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                paintOrder: 'stroke fill',
                WebkitTextStroke: '0.5px rgba(255, 255, 255, 0.3)',
                filter: 'drop-shadow(0 4px 20px rgba(255, 255, 255, 0.4)) drop-shadow(0 0 40px rgba(255, 255, 255, 0.3))',
                display: 'inline-block',
                overflow: 'visible'
              }}
            >
              It's time to save the <TypingText />
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-2xl md:text-3xl font-light tracking-wide text-white text-center mb-16"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)'
            }}
          >
            You decide how the climate changes. Track progress with transparent donations.
          </motion.p>

          {/* Explore Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            <Link
              to="/map"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white hover:bg-white hover:text-arctic-600 text-white font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 group"
            >
              <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Explore
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

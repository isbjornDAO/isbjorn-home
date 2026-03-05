import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import arcticPoster from '@/assets/arctic-video-poster.jpg.jpg.png';

// Charity logos
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';
import sierraClubLogo from '@/assets/logos/sierra-club.jpg';
import rainforestLogo from '@/assets/logos/rainforest.jpg';

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

const TYPING_WORDS = ['polar bears', 'world', 'arctic foxes', 'penguins', 'seals', 'whales', 'walruses', 'caribou', 'snowy owls'];

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
        setCurrentText(currentWord.slice(0, currentText.length + 1));
      } else {
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
        } else {
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

const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const CHARITIES = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, category: 'Climate', raised: '$154k' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, category: 'Conservation', raised: '$185k' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment', raised: '$141k' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean', raised: '$98k' },
  { id: 'the-nature-conservancy', name: 'The Nature Conservancy', logo: natureConservancyLogo, category: 'Conservation', raised: '$85k' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, category: 'Conservation', raised: '$115k' },
  { id: 'sierra-club', name: 'Sierra Club', logo: sierraClubLogo, category: 'Environment', raised: '$68k' },
  { id: 'rainforest-alliance', name: 'Rainforest Alliance', logo: rainforestLogo, category: 'Forest', raised: '$72k' },
];

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="relative">
      {/* ─── HERO ─── */}
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        <div
          className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${arcticPoster})` }}
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
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
          <div className="absolute inset-0 pointer-events-none z-[5]"></div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 z-10"></div>

        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 20 }).map((_, i) => (
            <Snowflake key={i} delay={i * 0.4} />
          ))}
        </div>

        <div className="relative z-30 h-full flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-center mb-1"
            style={{ paddingBottom: '0.2em', paddingTop: '0.1em', lineHeight: '1.3' }}
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

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-lg sm:text-xl md:text-2xl font-light text-white/90 text-center mb-10 sm:mb-14 max-w-2xl"
            style={{ textShadow: '0 2px 16px rgba(0, 0, 0, 0.7)' }}
          >
            Donate to verified conservation charities. Track every dollar on-chain. Vote on where the money goes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white text-arctic-700 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Donating
            </Link>
            <Link
              to="/live"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white/10 backdrop-blur-md border border-white/40 hover:bg-white/20 text-white font-semibold rounded-full transition-all duration-300"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              Watch Live Cams
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30"
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-5 h-5 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>

      {/* ─── LIVE CAM TEASER ─── */}
      <section className="py-16 sm:py-20 bg-ice-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-center">
              {/* Video embed */}
              <div className="lg:col-span-3 relative rounded-xl overflow-hidden shadow-2xl border border-white/10">
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src="https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                    title="Polar Bear Cam"
                    className="absolute inset-0 w-full h-full pointer-events-none"
                    frameBorder="0"
                    allow="accelerometer; autoplay; encrypted-media; gyroscope"
                  />
                  {/* Block YouTube UI */}
                  <div className="absolute top-0 right-0 w-20 h-14 bg-ice-950 opacity-0 pointer-events-auto z-10"></div>
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-ice-950/90 to-transparent pointer-events-auto z-10"></div>
                </div>
                {/* Live badge overlay */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
                </div>
              </div>

              {/* Text */}
              <div className="lg:col-span-2">
                <div className="text-xs font-bold text-arctic-400 tracking-widest uppercase mb-3">Hudson Bay, Canada</div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
                  Polar bears.<br />Right now.
                </h2>
                <p className="text-ice-400 mb-6 leading-relaxed">
                  Watch wild polar bears on the shores of Hudson Bay through live cameras operated by Polar Bears International. The best viewing is October through November when bears gather along the coast.
                </p>
                <Link
                  to="/live"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/15 transition-all duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                  Open All Cameras
                </Link>
              </div>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ice-900 text-center mb-4">
              How it works
            </h2>
            <p className="text-ice-500 text-center max-w-lg mx-auto mb-14">
              Donate. Earn voting power. Decide where the money goes. Track it all on-chain.
            </p>
          </FadeSection>

          {/* Steps — horizontal on desktop, vertical on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-0 md:gap-0 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-ice-200 z-0"></div>

            {[
              { n: '1', title: 'Donate', desc: 'Fiat or crypto to verified charities', color: 'bg-arctic-500' },
              { n: '2', title: 'Earn', desc: 'Get Donation Coins for voting power', color: 'bg-polar-500' },
              { n: '3', title: 'Vote', desc: 'Choose which nonprofits get funded', color: 'bg-arctic-600' },
              { n: '4', title: 'Track', desc: 'Follow your impact on the blockchain', color: 'bg-arctic-800' },
            ].map((step, i) => (
              <FadeSection key={step.n} delay={i * 0.08}>
                <div className="flex md:flex-col items-center md:items-center gap-4 md:gap-0 py-4 md:py-0">
                  <div className={`relative z-10 w-14 h-14 ${step.color} rounded-full flex items-center justify-center text-white text-xl font-bold shadow-lg flex-shrink-0`}>
                    {step.n}
                  </div>
                  <div className="md:mt-4 md:text-center">
                    <h3 className="font-bold text-ice-900 text-lg">{step.title}</h3>
                    <p className="text-sm text-ice-500 mt-0.5">{step.desc}</p>
                  </div>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CHARITIES ─── */}
      <section className="py-16 sm:py-20 bg-ice-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-2xl sm:text-3xl font-display font-bold text-ice-900 mb-2">
                  Verified charities
                </h2>
                <p className="text-ice-500">Every organization is vetted before receiving donations.</p>
              </div>
              <Link
                to="/donate"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm text-arctic-600 font-semibold hover:text-arctic-700 transition-colors"
              >
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </FadeSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {CHARITIES.map((charity, i) => (
              <FadeSection key={charity.id} delay={i * 0.04}>
                <Link
                  to={`/charity/${charity.id}`}
                  className="group bg-white rounded-xl p-4 border border-ice-100 hover:border-arctic-200 hover:shadow-lg transition-all duration-200 block"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={charity.logo}
                      alt={charity.name}
                      className="w-10 h-10 rounded-full object-cover border border-ice-100 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-700 transition-colors">
                        {charity.name}
                      </div>
                      <div className="text-xs text-ice-400">{charity.category}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-ice-400">Raised</span>
                    <span className="text-sm font-bold text-arctic-700">{charity.raised}</span>
                  </div>
                </Link>
              </FadeSection>
            ))}
          </div>

          <FadeSection delay={0.3}>
            <div className="text-center mt-8 sm:hidden">
              <Link
                to="/donate"
                className="inline-flex items-center gap-1.5 text-sm text-arctic-600 font-semibold hover:text-arctic-700 transition-colors"
              >
                View all charities
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>

      {/* ─── EXPLORE THE PLATFORM ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-ice-900 text-center mb-4">
              Explore the platform
            </h2>
            <p className="text-ice-500 text-center max-w-lg mx-auto mb-12">
              Everything you need to donate, track, and govern — all in one place.
            </p>
          </FadeSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FadeSection delay={0.05}>
              <Link
                to="/donate"
                className="group relative overflow-hidden rounded-xl border border-ice-100 bg-gradient-to-br from-arctic-50 to-white p-6 hover:shadow-lg hover:border-arctic-200 transition-all duration-300 block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-arctic-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-arctic-200 transition-colors">
                    <svg className="w-6 h-6 text-arctic-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-ice-900 text-lg mb-1 group-hover:text-arctic-700 transition-colors">Donate</h3>
                    <p className="text-sm text-ice-500 leading-relaxed">
                      Choose from verified conservation charities. Pay with card or crypto. Every dollar tracked on-chain.
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-arctic-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </FadeSection>

            <FadeSection delay={0.1}>
              <Link
                to="/vote"
                className="group relative overflow-hidden rounded-xl border border-ice-100 bg-gradient-to-br from-polar-50 to-white p-6 hover:shadow-lg hover:border-polar-200 transition-all duration-300 block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-polar-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-polar-200 transition-colors">
                    <svg className="w-6 h-6 text-polar-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-ice-900 text-lg mb-1 group-hover:text-polar-700 transition-colors">Vote</h3>
                    <p className="text-sm text-ice-500 leading-relaxed">
                      Donors govern the treasury. Propose missions, vote on funding, and steer where resources go.
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-polar-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </FadeSection>

            <FadeSection delay={0.15}>
              <Link
                to="/live"
                className="group relative overflow-hidden rounded-xl border border-ice-100 bg-gradient-to-br from-ice-50 to-white p-6 hover:shadow-lg hover:border-ice-300 transition-all duration-300 block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-red-100 transition-colors">
                    <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-ice-900 text-lg mb-1 group-hover:text-ice-700 transition-colors">Live Cams</h3>
                    <p className="text-sm text-ice-500 leading-relaxed">
                      Watch polar bears, arctic foxes, and marine life in real-time through partner wildlife cameras.
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold text-red-500">LIVE</span>
                </div>
              </Link>
            </FadeSection>

            <FadeSection delay={0.2}>
              <Link
                to="/map"
                className="group relative overflow-hidden rounded-xl border border-ice-100 bg-gradient-to-br from-green-50 to-white p-6 hover:shadow-lg hover:border-green-200 transition-all duration-300 block"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-green-200 transition-colors">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 6.75V15m6-6v8.25m.503 3.498l4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 00-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-bold text-ice-900 text-lg mb-1 group-hover:text-green-700 transition-colors">Climate Map</h3>
                    <p className="text-sm text-ice-500 leading-relaxed">
                      Explore real-time climate data. See where donations are making an impact around the world.
                    </p>
                  </div>
                </div>
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </div>
              </Link>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20 bg-ice-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeSection>
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-ice-400 mb-8 max-w-xl mx-auto">
              Pick a charity, make a donation, and watch your impact unfold on-chain. It takes less than a minute.
            </p>
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-ice-900 font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Choose a Charity
            </Link>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

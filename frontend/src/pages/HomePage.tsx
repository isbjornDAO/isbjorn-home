import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
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

// Fade-in section wrapper
const FadeSection: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="relative">
      {/* Background Video Section */}
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
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
              setTimeout(() => setVideoLoaded(true), 1500);
            }}
          />
          <div className="absolute inset-0 pointer-events-none z-[5]"></div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/60 z-10"></div>

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
            className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-display font-black tracking-tight text-center mb-1"
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

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-white text-center mb-12 sm:mb-16 max-w-3xl"
            style={{
              textShadow: '0 4px 20px rgba(0, 0, 0, 0.8), 0 2px 10px rgba(0, 0, 0, 0.6)'
            }}
          >
            Transparent donations. Blockchain accountability. You decide where the money goes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link
              to="/donate"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-arctic-700 font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            >
              Start Donating
            </Link>
            <Link
              to="/map"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-md border-2 border-white/60 hover:bg-white/20 text-white font-bold text-lg rounded-full transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
              Explore the Map
            </Link>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg className="w-6 h-6 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </motion.div>
      </div>

      {/* === BELOW THE FOLD === */}

      {/* How It Works */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-ice-900 mb-4">
                How Isbjorn works
              </h2>
              <p className="text-lg text-ice-500 max-w-2xl mx-auto">
                Every donation is tracked on-chain. You choose which charities receive funding through direct governance.
              </p>
            </div>
          </FadeSection>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-6">
            {[
              {
                step: '01',
                title: 'Donate',
                desc: 'Send fiat or crypto to verified climate charities. Every transaction is recorded on the Avalanche blockchain.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                )
              },
              {
                step: '02',
                title: 'Earn Coins',
                desc: 'Each donation earns you Donation Coins proportional to your contribution. These coins give you voting power.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
                  </svg>
                )
              },
              {
                step: '03',
                title: 'Vote',
                desc: 'Stake your coins and vote on proposals from verified nonprofits. You decide where conservation funding goes.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                  </svg>
                )
              },
              {
                step: '04',
                title: 'Track Impact',
                desc: 'Follow your donations on-chain from wallet to charity. See real conservation outcomes in real time.',
                icon: (
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
                  </svg>
                )
              }
            ].map((item, i) => (
              <FadeSection key={item.step} delay={i * 0.1}>
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-arctic-50 text-arctic-600 mb-5">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-arctic-400 tracking-widest uppercase mb-2">{item.step}</div>
                  <h3 className="text-xl font-bold text-ice-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-ice-500 leading-relaxed">{item.desc}</p>
                </div>
              </FadeSection>
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Transparency */}
      <section className="py-20 sm:py-28 bg-ice-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <FadeSection>
              <div>
                <h2 className="text-3xl sm:text-4xl font-display font-bold text-ice-900 mb-6">
                  Built for trust,<br />not just transactions
                </h2>
                <p className="text-lg text-ice-500 mb-8 leading-relaxed">
                  Traditional charity platforms take your money and hope for the best. Isbjorn records every donation on the Avalanche blockchain, lets donors vote on fund allocation, and distributes revenue transparently through smart contracts.
                </p>
                <div className="space-y-4">
                  {[
                    { label: 'On-chain receipts', desc: 'Every donation generates a verifiable blockchain transaction' },
                    { label: 'DAO governance', desc: 'Donors vote on which nonprofits receive funding each epoch' },
                    { label: 'Smart contract distribution', desc: '70% to charities, 20% to voters, 10% to platform operations' },
                  ].map((item) => (
                    <div key={item.label} className="flex gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-5 h-5 rounded-full bg-arctic-500 flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold text-ice-900">{item.label}</h4>
                        <p className="text-sm text-ice-500">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeSection>

            <FadeSection delay={0.2}>
              <div className="bg-white rounded-2xl shadow-lg border border-ice-200 p-6 sm:p-8">
                <div className="text-sm font-semibold text-ice-400 uppercase tracking-wider mb-6">Platform Overview</div>
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { value: '9', label: 'Verified Charities' },
                    { value: '$102k', label: 'Total Revenue' },
                    { value: '8', label: 'Validator Nodes' },
                    { value: '24.5k', label: 'Transactions' },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="text-3xl font-bold text-ice-900 mb-1">{stat.value}</div>
                      <div className="text-sm text-ice-500">{stat.label}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 pt-6 border-t border-ice-100">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-ice-900">NZ Registered Charity</div>
                      <div className="text-xs text-ice-500">Avalanche L1 Subnet</div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeSection>
          </div>
        </div>
      </section>

      {/* Featured Charities Preview */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeSection>
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-display font-bold text-ice-900 mb-4">
                Verified charities on the platform
              </h2>
              <p className="text-lg text-ice-500">
                Every organization is vetted and verified before receiving any donations.
              </p>
            </div>
          </FadeSection>

          <FadeSection delay={0.1}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {[
                'Polar Bears International',
                'WWF',
                'Greenpeace',
                'Ocean Conservancy',
                'The Nature Conservancy',
              ].map((name) => (
                <div
                  key={name}
                  className="bg-ice-50 rounded-xl p-5 text-center border border-ice-100 hover:border-arctic-200 hover:shadow-md transition-all duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-arctic-100 flex items-center justify-center mx-auto mb-3">
                    <span className="text-sm font-bold text-arctic-600">{name.charAt(0)}</span>
                  </div>
                  <div className="text-sm font-semibold text-ice-800 leading-tight">{name}</div>
                </div>
              ))}
            </div>
          </FadeSection>

          <FadeSection delay={0.2}>
            <div className="text-center mt-10">
              <Link
                to="/donate"
                className="inline-flex items-center gap-2 text-arctic-600 font-semibold hover:text-arctic-700 transition-colors"
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

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-arctic-700 via-arctic-800 to-ice-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeSection>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-6">
              Conservation shouldn't be a black box
            </h2>
            <p className="text-lg text-arctic-200 mb-10 max-w-2xl mx-auto">
              Join a community of donors who don't just give money — they govern it. Track every dollar from your wallet to the field.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/donate"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-arctic-700 font-bold text-lg rounded-full transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Make Your First Donation
              </Link>
              <Link
                to="/live"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 border-2 border-white/30 text-white font-bold text-lg rounded-full transition-all duration-300 hover:bg-white/20"
              >
                Watch Live Cams
              </Link>
            </div>
          </FadeSection>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

import React from 'react';
import { motion } from 'framer-motion';

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

const HomePage: React.FC = () => {
  return (
    <div className="relative">
      {/* Background Video Section */}
      <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
        {/* Video Background Container */}
        <div className="absolute inset-0 w-full h-full">
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full"
            style={{
              minWidth: '100%',
              minHeight: '100%',
              width: '1920px',
              height: '1080px',
              objectFit: 'cover'
            }}
            src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=1&mute=1&loop=1&playlist=64ZaC04ppLQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1"
            title="Polar Bears Video Background"
            frameBorder="0"
            allow="autoplay; encrypted-media"
          />
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
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white leading-tight drop-shadow-2xl text-center"
          >
            It's time to save the polar bears
          </motion.h1>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

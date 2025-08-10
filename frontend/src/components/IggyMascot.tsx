import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

interface IggyMascotProps {
  size?: 'small' | 'medium' | 'large' | 'hero';
  animated?: boolean;
  mood?: 'happy' | 'excited' | 'thoughtful' | 'celebrating';
  className?: string;
}

const IggyMascot: React.FC<IggyMascotProps> = ({ 
  size = 'medium', 
  animated = false,
  mood = 'happy',
  className 
}) => {
  const sizeClasses = {
    small: 'w-12 h-12',
    medium: 'w-24 h-24',
    large: 'w-40 h-40',
    hero: 'w-64 h-64'
  };

  const moodEmojis = {
    happy: '😊',
    excited: '🎉',
    thoughtful: '🤔',
    celebrating: '🎊'
  };

  return (
    <motion.div
      className={clsx(
        'relative flex items-center justify-center',
        sizeClasses[size],
        className
      )}
      animate={animated ? {
        y: [0, -5, 0],
        rotate: [-2, 2, -2],
      } : {}}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <img
        src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg"
        alt="Iggy the Polar Bear - Isbjorn Mascot"
        className={clsx(
          "object-contain rounded-full bg-white/80 backdrop-blur-sm border-2 border-ice-200 shadow-lg",
          sizeClasses[size]
        )}
        loading="lazy"
      />
      
      {animated && (
        <motion.div
          className="absolute inset-0 rounded-full"
          animate={{ 
            boxShadow: [
              '0 0 0 0 rgba(14, 165, 233, 0.3)',
              '0 0 0 10px rgba(14, 165, 233, 0)',
              '0 0 0 0 rgba(14, 165, 233, 0)'
            ]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}
      
      {mood !== 'happy' && (
        <div className="absolute -top-2 -right-2 text-2xl">
          {moodEmojis[mood]}
        </div>
      )}
    </motion.div>
  );
};

export default IggyMascot;
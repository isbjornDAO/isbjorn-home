import React from 'react';
import clsx from 'clsx';

interface ArcticBackgroundProps {
  variant?: 'subtle' | 'hero' | 'pattern';
  className?: string;
}

const ArcticBackground: React.FC<ArcticBackgroundProps> = ({ 
  variant = 'subtle',
  className 
}) => {
  const variants = {
    subtle: 'opacity-5',
    hero: 'opacity-10', 
    pattern: 'opacity-20'
  };

  return (
    <div 
      className={clsx(
        'absolute inset-0 pointer-events-none',
        variants[variant],
        className
      )}
      style={{
        backgroundImage: `url('https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61bb047865923c3ff0cb0cc8_polar_bear_sketch_by_silvercrossfox_d37hx09-fullview.jpg')`,
        backgroundSize: '200px 200px',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
        filter: 'contrast(0.8) brightness(1.2)'
      }}
    />
  );
};

export default ArcticBackground;
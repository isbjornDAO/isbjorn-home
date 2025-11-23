import React from 'react';
import clsx from 'clsx';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  variant?: 'main' | 'alt';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({
  size = 'medium',
  variant = 'main',
  className
}) => {
  const sizeClasses = {
    small: 'h-8',
    medium: 'h-12',
    large: 'h-16'
  };

  const logoUrls = {
    main: 'https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61b2dcbcac4228310e9fda70_Isbjorn%20PNG%20(5).png',
    />
  );
};

export default Logo;
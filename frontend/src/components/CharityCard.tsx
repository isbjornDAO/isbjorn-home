import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { MapPinIcon, CheckBadgeIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { 
  AcademicCapIcon, 
  HomeIcon, 
  HeartIcon as HeartSolidIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface CauseBadge {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  description: string;
}

interface CharityCardProps {
  charity: {
    id: string;
    name: string;
    description: string;
    category: string;
    location: string;
    verified: boolean;
    totalReceived: number;
    donationCount: number;
    logoUrl?: string;
    website?: string;
    causes?: string[]; // New field for specific causes
  };
  className?: string;
  onClick?: (charityId: string) => void;
}

// Available cause badges with icons and colors
const CAUSE_BADGES: Record<string, CauseBadge> = {
  education: {
    id: 'education',
    name: 'Education',
    icon: AcademicCapIcon,
    color: 'bg-blue-100 text-blue-700 border-blue-200',
    description: 'Supporting learning and development'
  },
  housing: {
    id: 'housing',
    name: 'Housing',
    icon: HomeIcon,
    color: 'bg-orange-100 text-orange-700 border-orange-200',
    description: 'Providing shelter and homes'
  },
  healthcare: {
    id: 'healthcare',
    name: 'Healthcare',
    icon: HeartSolidIcon,
    color: 'bg-red-100 text-red-700 border-red-200',
    description: 'Medical care and wellbeing'
  },
  environment: {
    id: 'environment',
    name: 'Environment',
    icon: GlobeAltIcon,
    color: 'bg-green-100 text-green-700 border-green-200',
    description: 'Protecting our planet'
  },
  community: {
    id: 'community',
    name: 'Community',
    icon: UserGroupIcon,
    color: 'bg-purple-100 text-purple-700 border-purple-200',
    description: 'Building stronger communities'
  },
  emergency: {
    id: 'emergency',
    name: 'Emergency Relief',
    icon: SparklesIcon,
    color: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    description: 'Disaster and crisis response'
  }
};

const CharityCard: React.FC<CharityCardProps> = ({ 
  charity, 
  className, 
  onClick 
}) => {
  // Get causes for this charity (fallback to category if causes not specified)
  const charityCauses = charity.causes || [charity.category.toLowerCase()];
  
  return (
    <motion.div
      className={clsx(
        'card p-6 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 cursor-pointer group',
        'border-2 border-transparent hover:border-blue-400',
        className
      )}
      whileHover={{ y: -4 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => onClick?.(charity.id)}
    >
      {/* Header with logo, name, and verification */}
      <div className="flex items-start space-x-4 mb-4">
        {charity.logoUrl ? (
          <div className="w-14 h-14 bg-white rounded-xl border border-ice-200 flex items-center justify-center p-2 group-hover:border-blue-400 transition-colors">
            <img
              src={charity.logoUrl}
              alt={`${charity.name} logo`}
              className="w-full h-full object-contain"
              loading="lazy"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.innerHTML = `
                    <img 
                      src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png" 
                      alt="Charity" 
                      class="w-6 h-6 object-contain opacity-60"
                    />
                  `;
                  parent.className = "w-14 h-14 bg-gradient-to-br from-arctic-100 to-ice-200 rounded-xl flex items-center justify-center";
                }
              }}
            />
          </div>
        ) : (
          <div className="w-14 h-14 bg-gradient-to-br from-arctic-100 to-ice-200 rounded-xl flex items-center justify-center group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
            <img
              src="https://cdn.prod.website-files.com/61b2c2eb638aa348792d99d4/61f5e21264ea04c7d7feb85e_COMMUNITY.png"
              alt="Charity"
              className="w-7 h-7 object-contain opacity-60"
            />
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 min-w-0">
              <h3 className="text-xl font-bold text-ice-900 font-display truncate">
                {charity.name}
              </h3>
              {charity.verified && (
                <CheckBadgeIcon className="w-6 h-6 text-green-500 flex-shrink-0" />
              )}
            </div>
            <ArrowRightIcon className="w-5 h-5 text-arctic-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-ice-600 mb-3">
            <MapPinIcon className="w-4 h-4 flex-shrink-0" />
            <span>{charity.location}</span>
          </div>
        </div>
      </div>
      
      {/* Description */}
      <p className="text-ice-700 text-sm mb-4 leading-relaxed line-clamp-2">
        {charity.description}
      </p>
      
      {/* Cause badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {charityCauses.slice(0, 3).map((cause) => {
          const badge = CAUSE_BADGES[cause] || CAUSE_BADGES.community;
          const Icon = badge.icon;
          
          return (
            <div
              key={cause}
              className={clsx(
                'inline-flex items-center space-x-2 px-3 py-2 rounded-full text-xs font-semibold border',
                badge.color,
                'group-hover:scale-105 transition-transform'
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{badge.name}</span>
            </div>
          );
        })}
      </div>
      
      {/* Impact stats */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gradient-to-r from-ice-50 to-arctic-50 rounded-xl group-hover:from-blue-50 group-hover:to-blue-100 transition-colors">
        <div className="text-center">
          <div className="text-xl font-bold text-arctic-700">
            ${charity.totalReceived.toLocaleString()}
          </div>
          <div className="text-xs text-ice-600 font-medium">Total Impact</div>
        </div>
        <div className="text-center">
          <div className="text-xl font-bold text-arctic-700">
            {charity.donationCount}
          </div>
          <div className="text-xs text-ice-600 font-medium">Supporters</div>
        </div>
      </div>
      
      {/* Call to action hint */}
      <div className="mt-4 text-center">
        <div className="text-sm font-medium text-arctic-600 group-hover:text-blue-700 transition-colors">
          Click to learn more & donate
        </div>
        <div className="text-xs text-ice-500 group-hover:text-blue-600 transition-colors">
          Choose specific causes to support
        </div>
      </div>
    </motion.div>
  );
};

export default CharityCard;
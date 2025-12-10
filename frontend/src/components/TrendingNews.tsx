import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FireIcon, PlayCircleIcon, NewspaperIcon } from '@heroicons/react/24/solid';

interface NewsItem {
  id: string;
  type: 'article' | 'video' | 'update';
  title: string;
  description: string;
  nonprofitName: string;
  nonprofitId: string;
  thumbnail: string;
  timestamp: Date;
  trending: boolean;
  views: number;
}

const TrendingNews: React.FC = () => {
  // Mock data - replace with actual API call
  const trendingItems: NewsItem[] = [
    {
      id: '1',
      type: 'video',
      title: 'Clean Water Project Milestone: 1000 Families Served',
      description: 'See the impact your donations are making in rural Tanzania',
      nonprofitName: 'World Vision',
      nonprofitId: 'wv',
      thumbnail: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      trending: true,
      views: 12400
    },
    {
      id: '2',
      type: 'article',
      title: 'Community Center Opens Its Doors',
      description: 'After 6 months of construction, families now have access to education and healthcare',
      nonprofitName: 'Red Cross NZ',
      nonprofitId: 'rc',
      thumbnail: 'https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      trending: true,
      views: 8900
    },
    {
      id: '3',
      type: 'update',
      title: 'Emergency Response: Cyclone Relief Efforts',
      description: 'Our teams are on the ground providing immediate assistance to affected families',
      nonprofitName: 'Oxfam',
      nonprofitId: 'oxfam',
      thumbnail: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      trending: false,
      views: 6200
    },
    {
      id: '4',
      type: 'video',
      title: 'Meet the Volunteers Making a Difference',
      description: 'Stories from our dedicated team members around the world',
      nonprofitName: 'UNICEF',
      nonprofitId: 'unicef',
      thumbnail: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400',
      timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      trending: false,
      views: 5100
    }
  ];

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const formatViews = (views: number): string => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views.toString();
  };

  const getTypeIcon = (type: NewsItem['type']) => {
    switch (type) {
      case 'video':
        return <PlayCircleIcon className="w-5 h-5" />;
      case 'article':
        return <NewspaperIcon className="w-5 h-5" />;
      default:
        return <FireIcon className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'article':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  return (
    <div className="bg-gradient-to-br from-white to-ice-50 rounded-2xl shadow-lg p-8 border border-ice-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <FireIcon className="w-8 h-8 text-orange-500" />
          <h2 className="text-3xl font-bold text-ice-900">Trending Stories</h2>
        </div>
        <Link
          to="/map"
          className="text-arctic-600 hover:text-arctic-700 font-semibold text-sm hover:underline"
        >
          View All →
        </Link>
      </div>

      <p className="text-ice-600 mb-8">
        Latest news and updates from nonprofits making a difference around the world
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {trendingItems.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-ice-200"
          >
            {/* Thumbnail */}
            <div className="relative h-48 overflow-hidden">
              <img
                src={item.thumbnail}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

              {/* Type Badge */}
              <div className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1 ${getTypeColor(item.type)}`}>
                {getTypeIcon(item.type)}
                <span className="capitalize">{item.type}</span>
              </div>

              {/* Trending Badge */}
              {item.trending && (
                <div className="absolute top-3 right-3 px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-semibold flex items-center space-x-1">
                  <FireIcon className="w-3 h-3" />
                  <span>Trending</span>
                </div>
              )}

              {/* Play button for videos */}
              {item.type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlayCircleIcon className="w-12 h-12 text-arctic-600" />
                  </div>
                </div>
              )}

              {/* Nonprofit name */}
              <div className="absolute bottom-3 left-3 text-white font-semibold text-sm">
                {item.nonprofitName}
              </div>
            </div>

            {/* Content */}
            <div className="p-5">
              <h3 className="font-bold text-lg text-ice-900 mb-2 line-clamp-2 group-hover:text-arctic-600 transition-colors">
                {item.title}
              </h3>
              <p className="text-sm text-ice-600 mb-4 line-clamp-2">{item.description}</p>

              <div className="flex items-center justify-between text-xs text-ice-500">
                <span>{formatTimeAgo(item.timestamp)}</span>
                <span>{formatViews(item.views)} views</span>
              </div>
            </div>

            {/* Link overlay */}
            <Link
              to={`/charity/${item.nonprofitId}`}
              className="absolute inset-0"
              aria-label={`Read more about ${item.title}`}
            />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TrendingNews;

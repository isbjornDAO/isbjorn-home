import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, CheckBadgeIcon, ShareIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

interface SocialPost {
  id: string;
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  category: 'update' | 'milestone' | 'emergency' | 'success' | 'announcement';
  author?: {
    name: string;
    icon: string;
    verified: boolean;
  };
}

interface SocialFeedProps {
  nonprofitName: string;
  nonprofitId: string;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ nonprofitName, nonprofitId }) => {
  // Get charity icon based on name
  const getCharityIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Isbjorn': 'https://logo.clearbit.com/isbjorn.io',
      'Forest & Bird': 'https://www.birdlife.org/wp-content/uploads/2021/04/New_Zealand.png',
      'Greenpeace': 'https://logo.clearbit.com/greenpeace.org',
      'WWF': 'https://upload.wikimedia.org/wikipedia/en/thumb/2/24/WWF_logo.svg/1200px-WWF_logo.svg.png',
      'default': 'https://via.placeholder.com/100'
    };
    return icons[name] || icons['default'];
  };

  // Mock data - replace with actual API call
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: '1',
      content: 'Thanks to your support, we\'ve reached 500 families with clean water this month! Every donation makes a real difference in people\'s lives. 💧',
      images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      likes: 124,
      comments: 18,
      isLiked: false,
      category: 'success',
      author: {
        name: nonprofitName,
        icon: getCharityIcon(nonprofitName),
        verified: true
      }
    },
    {
      id: '2',
      content: 'Construction of our new community center is progressing well. We\'re on track to open next month! 🏗️',
      images: ['https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400'],
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      likes: 89,
      comments: 12,
      isLiked: false,
      category: 'update',
      author: {
        name: nonprofitName,
        icon: getCharityIcon(nonprofitName),
        verified: true
      }
    },
    {
      id: '3',
      content: '🎉 MILESTONE: We\'ve distributed 10,000 meals to families in need since the start of this program. Thank you for being part of this journey!',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      likes: 256,
      comments: 45,
      isLiked: false,
      category: 'milestone',
      author: {
        name: nonprofitName,
        icon: getCharityIcon(nonprofitName),
        verified: true
      }
    }
  ]);

  const handleLike = (postId: string) => {
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, isLiked: !post.isLiked, likes: post.isLiked ? post.likes - 1 : post.likes + 1 }
          : post
      )
    );
  };

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    const weeks = Math.floor(days / 7);
    if (weeks < 4) return `${weeks}w ago`;
    const months = Math.floor(days / 30);
    return `${months}mo ago`;
  };

  const getCategoryBadge = (category: SocialPost['category']) => {
    const styles = {
      update: 'bg-blue-100 text-blue-800 border-blue-300',
      milestone: 'bg-purple-100 text-purple-800 border-purple-300',
      emergency: 'bg-red-100 text-red-800 border-red-300',
      success: 'bg-green-100 text-green-800 border-green-300',
      announcement: 'bg-yellow-100 text-yellow-800 border-yellow-300'
    };
    return styles[category];
  };

  return (
    <div className="space-y-4">
      {/* Timeline Header */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Timeline</h2>
      </div>

      {/* Posts */}
      <div className="space-y-4">
        {posts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* Post Header - Like Facebook */}
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                {/* Profile Picture */}
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img
                    src={post.author?.icon}
                    alt={post.author?.name}
                    className="w-full h-full object-contain p-1"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        parent.innerHTML = `<span class="text-lg font-bold text-blue-600">${post.author?.name.charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>

                {/* Name and Time */}
                <div className="flex-1">
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-gray-900">{post.author?.name}</span>
                    {post.author?.verified && (
                      <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{formatTimeAgo(post.timestamp)}</span>
                    <span>•</span>
                    <span className="text-xs">🌍</span>
                  </div>
                </div>

                {/* Category Badge */}
                <span className={`text-xs px-2 py-1 rounded-full border font-semibold ${getCategoryBadge(post.category)}`}>
                  {post.category}
                </span>
              </div>

              {/* Content */}
              <p className="text-gray-900 mb-3 leading-relaxed whitespace-pre-wrap">{post.content}</p>
            </div>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="grid grid-cols-1">
                {post.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Update ${i + 1}`}
                    className="w-full h-auto object-cover"
                  />
                ))}
              </div>
            )}

            {/* Stats Bar */}
            <div className="px-4 py-2 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
              <div className="flex items-center gap-1">
                <div className="flex -space-x-1">
                  <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center text-white text-xs">
                    ❤️
                  </div>
                </div>
                <span>{post.likes}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>{post.comments} comments</span>
              </div>
            </div>

            {/* Actions - Like Facebook */}
            <div className="px-4 py-2 flex items-center border-t border-gray-200 divide-x divide-gray-200">
              <button
                onClick={() => handleLike(post.id)}
                className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition-colors rounded-lg group"
              >
                {post.isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-gray-600 group-hover:text-red-500" />
                )}
                <span className={`font-semibold ${post.isLiked ? 'text-red-500' : 'text-gray-600 group-hover:text-gray-900'}`}>
                  Like
                </span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition-colors rounded-lg group">
                <ChatBubbleLeftIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                <span className="font-semibold text-gray-600 group-hover:text-gray-900">Comment</span>
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 py-2 hover:bg-gray-50 transition-colors rounded-lg group">
                <ShareIcon className="w-5 h-5 text-gray-600 group-hover:text-gray-900" />
                <span className="font-semibold text-gray-600 group-hover:text-gray-900">Share</span>
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12 text-ice-600">
          <p>No updates yet. Check back soon!</p>
        </div>
      )}
    </div>
  );
};

export default SocialFeed;

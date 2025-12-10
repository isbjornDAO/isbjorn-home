import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
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
}

interface SocialFeedProps {
  nonprofitName: string;
  nonprofitId: string;
}

const SocialFeed: React.FC<SocialFeedProps> = ({ nonprofitName, nonprofitId }) => {
  // Mock data - replace with actual API call
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: '1',
      content: 'Thanks to your support, we\'ve reached 500 families with clean water this month! Every donation makes a real difference in people\'s lives.',
      images: ['https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'],
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      likes: 124,
      comments: 18,
      isLiked: false,
      category: 'success'
    },
    {
      id: '2',
      content: 'Construction of our new community center is progressing well. We\'re on track to open next month!',
      images: ['https://images.unsplash.com/photo-1607400201515-c2c41c07d307?w=400'],
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      likes: 89,
      comments: 12,
      isLiked: false,
      category: 'update'
    },
    {
      id: '3',
      content: 'MILESTONE: We\'ve distributed 10,000 meals to families in need since the start of this program. Thank you for being part of this journey!',
      timestamp: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      likes: 256,
      comments: 45,
      isLiked: false,
      category: 'milestone'
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
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-ice-100">
      <h2 className="text-xl font-bold text-ice-900 mb-6">Latest Posts</h2>

      <div className="space-y-6">
        {posts.map((post, idx) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="border border-ice-200 rounded-xl p-5 hover:shadow-md transition-shadow"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs px-3 py-1 rounded-full border font-semibold uppercase ${getCategoryBadge(post.category)}`}>
                {post.category}
              </span>
              <span className="text-sm text-ice-500">{formatTimeAgo(post.timestamp)}</span>
            </div>

            {/* Content */}
            <p className="text-ice-700 mb-4 leading-relaxed">{post.content}</p>

            {/* Images */}
            {post.images && post.images.length > 0 && (
              <div className="mb-4 grid grid-cols-1 gap-2">
                {post.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={`Update ${i + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center space-x-6 pt-3 border-t border-ice-200">
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center space-x-2 transition-colors group"
              >
                {post.isLiked ? (
                  <HeartSolidIcon className="w-5 h-5 text-red-500" />
                ) : (
                  <HeartIcon className="w-5 h-5 text-ice-500 group-hover:text-red-500" />
                )}
                <span className={`font-semibold ${post.isLiked ? 'text-red-500' : 'text-ice-700'}`}>
                  {post.likes}
                </span>
              </button>
              <button className="flex items-center space-x-2 text-ice-500 hover:text-arctic-600 transition-colors">
                <ChatBubbleLeftIcon className="w-5 h-5" />
                <span className="font-semibold text-ice-700">{post.comments}</span>
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

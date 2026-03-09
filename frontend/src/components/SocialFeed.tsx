import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartIcon, ChatBubbleLeftIcon, ShareIcon, BeakerIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { calculateLevel } from '../utils/xp';

// ─── Types ────────────────────────────────────────────────────────────────────

type OfficialCategory = 'research_update' | 'climate_alert' | 'data_release' | 'breakthrough' | 'policy';
type CommunityCategory = 'story' | 'question' | 'action' | 'milestone';

interface OfficialPost {
  type: 'official';
  id: string;
  content: string;
  citation?: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  category: OfficialCategory;
  author: {
    name: string;
    title: string;
    institution: string;
    role: 'climate_scientist' | 'government_official' | 'research_org';
  };
}

interface CommunityPost {
  type: 'community';
  id: string;
  content: string;
  images?: string[];
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  category: CommunityCategory;
  xpEarned: number;
  author: {
    name: string;
    username: string;
    xp: number;
    avatarColor: string;
  };
}

type Post = OfficialPost | CommunityPost;

interface SocialFeedProps {
  nonprofitName: string;
  nonprofitId: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const OFFICIAL_POSTS: OfficialPost[] = [
  {
    type: 'official',
    id: 'o1',
    content: 'New sea ice extent data released: Arctic sea ice minimum for 2024 reached 4.28 million km², the 4th lowest on record. Continued monitoring shows accelerating melt in the Beaufort and Chukchi seas. Long-term projections indicate ice-free Arctic summers possible by 2035–2040.',
    citation: 'National Snow & Ice Data Center — Arctic Sea Ice News & Analysis, Sept 2024',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    likes: 341,
    comments: 47,
    isLiked: false,
    category: 'data_release',
    author: {
      name: 'Dr. Julienne Stroeve',
      title: 'Senior Research Scientist',
      institution: 'National Snow & Ice Data Center',
      role: 'climate_scientist',
    },
  },
  {
    type: 'official',
    id: 'o2',
    content: 'URGENT: Polar bear habitat loss in the Hudson Bay region has exceeded our worst-case models for 2024. Sea ice break-up occurred 3 weeks earlier than the 1980s average. Females with cubs are showing significant body-condition decline. Emergency funding for monitoring is critical.',
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    likes: 892,
    comments: 134,
    isLiked: false,
    category: 'climate_alert',
    author: {
      name: 'Dr. Steven Amstrup',
      title: 'Chief Scientist',
      institution: 'Polar Bears International',
      role: 'climate_scientist',
    },
  },
  {
    type: 'official',
    id: 'o3',
    content: 'The New Zealand Government has allocated NZ$150M to the Arctic Conservation Fund following the IPCC\'s latest assessment. This funding will support on-the-ground research, community-led conservation, and international data sharing through 2030. Partnership organisations can apply from 1 April.',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    likes: 512,
    comments: 63,
    isLiked: false,
    category: 'policy',
    author: {
      name: 'Hon. Simon Watts',
      title: 'Minister for Climate Change',
      institution: 'New Zealand Government',
      role: 'government_official',
    },
  },
  {
    type: 'official',
    id: 'o4',
    content: 'Breakthrough: A new passive acoustic monitoring system deployed across 12 Arctic research stations can now detect polar bear movement up to 800m away through sea ice vibrations. Early trials show 94% detection accuracy — enabling non-invasive population tracking at scale.',
    citation: 'Stroeve et al. (2024) Nature Climate Change DOI:10.1038/s41558-024-00012-x',
    timestamp: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    likes: 1204,
    comments: 218,
    isLiked: false,
    category: 'breakthrough',
    author: {
      name: 'Dr. Ian Stirling',
      title: 'Adjunct Professor, Arctic Ecology',
      institution: 'University of Alberta',
      role: 'climate_scientist',
    },
  },
];

const COMMUNITY_POSTS: CommunityPost[] = [
  {
    type: 'community',
    id: 'c1',
    content: 'Just made my first recurring donation! Even $10/month feels like it matters knowing it goes directly to polar bear monitoring. The XP system is actually a great reminder of why this stuff adds up over time 🐻‍❄️',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    likes: 34,
    comments: 7,
    isLiked: false,
    category: 'milestone',
    xpEarned: 2,
    author: { name: 'Aroha Ngata', username: 'aroha_nz', xp: 87, avatarColor: 'bg-emerald-500' },
  },
  {
    type: 'community',
    id: 'c2',
    content: 'Question for the community — does anyone know which research stations have live camera feeds? I\'d love to show my kids what the researchers are actually doing out there.',
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
    likes: 19,
    comments: 11,
    isLiked: false,
    category: 'question',
    xpEarned: 2,
    author: { name: 'Tom Beckett', username: 'tomkiwi', xp: 45, avatarColor: 'bg-sky-500' },
  },
  {
    type: 'community',
    id: 'c3',
    content: 'Organised a beach clean-up in Raglan last weekend — 18 volunteers collected 47kg of rubbish. It\'s local action, but connected to the bigger picture of ocean health feeding into Arctic ecosystems. If anyone\'s in Waikato, our next one is March 22!',
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    likes: 76,
    comments: 22,
    isLiked: false,
    category: 'action',
    xpEarned: 2,
    author: { name: 'Sarah Manawaroa', username: 'sarahmw', xp: 203, avatarColor: 'bg-violet-500' },
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const OfficialCategoryConfig: Record<OfficialCategory, { label: string; color: string; icon: string }> = {
  research_update: { label: 'Research Update', color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '🔬' },
  climate_alert:   { label: 'Climate Alert',   color: 'bg-red-100 text-red-800 border-red-300',   icon: '⚠️' },
  data_release:    { label: 'Data Release',    color: 'bg-cyan-100 text-cyan-800 border-cyan-300', icon: '📊' },
  breakthrough:    { label: 'Breakthrough',    color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '🧬' },
  policy:          { label: 'Policy',          color: 'bg-amber-100 text-amber-800 border-amber-300', icon: '🏛️' },
};

const CommunityCategoryConfig: Record<CommunityCategory, { label: string; color: string; icon: string }> = {
  story:     { label: 'Story',     color: 'bg-green-100 text-green-800 border-green-300',  icon: '📖' },
  question:  { label: 'Question',  color: 'bg-sky-100 text-sky-800 border-sky-300',        icon: '❓' },
  action:    { label: 'Action',    color: 'bg-orange-100 text-orange-800 border-orange-300', icon: '🌍' },
  milestone: { label: 'Milestone', color: 'bg-violet-100 text-violet-800 border-violet-300', icon: '🎯' },
};

const RoleBadge: React.FC<{ role: OfficialPost['author']['role'] }> = ({ role }) => {
  const config = {
    climate_scientist:  { label: 'Climate Scientist', bg: 'bg-blue-700',  icon: '🔬' },
    government_official:{ label: 'Gov. Official',     bg: 'bg-slate-700', icon: '🏛️' },
    research_org:       { label: 'Research Org',      bg: 'bg-teal-700',  icon: '🌐' },
  }[role];

  return (
    <span className={`inline-flex items-center gap-1 ${config.bg} text-white text-xs font-semibold px-2 py-0.5 rounded-full`}>
      <span>{config.icon}</span>
      {config.label}
    </span>
  );
};

const LevelBadge: React.FC<{ xp: number }> = ({ xp }) => {
  const level = calculateLevel(xp);
  const colors = [
    'from-slate-400 to-slate-500',
    'from-green-400 to-emerald-500',
    'from-blue-400 to-blue-500',
    'from-purple-400 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-red-400 to-rose-500',
  ];
  const colorClass = colors[Math.min(Math.floor(level / 3), colors.length - 1)];

  return (
    <span className={`inline-flex items-center bg-gradient-to-br ${colorClass} text-white text-xs font-bold px-1.5 py-0.5 rounded-md`}>
      Lv.{level}
    </span>
  );
};

// ─── Official Post Card ───────────────────────────────────────────────────────

const OfficialPostCard: React.FC<{
  post: OfficialPost;
  onLike: (id: string) => void;
  formatTimeAgo: (d: Date) => string;
}> = ({ post, onLike, formatTimeAgo }) => {
  const cat = OfficialCategoryConfig[post.category];
  const isAlert = post.category === 'climate_alert';

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl shadow-md overflow-hidden border-l-4 ${
        isAlert ? 'border-l-red-500 bg-red-50 border border-red-200' : 'border-l-blue-700 bg-white border border-slate-200'
      }`}
    >
      {/* Official header band */}
      <div className={`px-4 py-2 flex items-center gap-2 ${isAlert ? 'bg-red-700' : 'bg-slate-800'}`}>
        <CheckBadgeIcon className="w-4 h-4 text-white flex-shrink-0" />
        <span className="text-white text-xs font-bold uppercase tracking-wider">Official Science Post</span>
        <div className="ml-auto">
          <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${cat.color}`}>
            {cat.icon} {cat.label}
          </span>
        </div>
      </div>

      {/* Author block */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-white ${
          isAlert ? 'bg-red-600' : 'bg-slate-700'
        }`}>
          {post.author.name.split(' ').find(p => p.startsWith('Dr') || p.startsWith('Hon') || p.startsWith('Prof'))
            ? post.author.name.charAt(post.author.name.indexOf('.') + 2)
            : post.author.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-bold text-slate-900 text-sm">{post.author.name}</span>
            <CheckBadgeIcon className="w-4 h-4 text-blue-600 flex-shrink-0" />
            <RoleBadge role={post.author.role} />
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate">{post.author.title} · {post.author.institution}</p>
          <p className="text-xs text-slate-400">{formatTimeAgo(post.timestamp)}</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className={`text-sm leading-relaxed ${isAlert ? 'text-red-900 font-medium' : 'text-slate-800'}`}>
          {post.content}
        </p>
        {post.citation && (
          <p className="mt-2 text-xs text-slate-400 italic border-l-2 border-slate-300 pl-2">
            {post.citation}
          </p>
        )}
      </div>

      {/* Stats & actions */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
        <span>{post.likes.toLocaleString()} reactions · {post.comments} comments</span>
      </div>
      <div className="px-4 py-1.5 flex items-center border-t border-slate-200 divide-x divide-slate-200">
        <button
          onClick={() => onLike(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 transition-colors rounded-lg group"
        >
          {post.isLiked
            ? <HeartSolidIcon className="w-4 h-4 text-red-500" />
            : <HeartIcon className="w-4 h-4 text-slate-500 group-hover:text-red-500" />}
          <span className={`text-sm font-semibold ${post.isLiked ? 'text-red-500' : 'text-slate-600'}`}>Support</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 transition-colors rounded-lg group">
          <ChatBubbleLeftIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">Discuss</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-slate-50 transition-colors rounded-lg group">
          <ShareIcon className="w-4 h-4 text-slate-500 group-hover:text-slate-800" />
          <span className="text-sm font-semibold text-slate-600 group-hover:text-slate-800">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Community Post Card ──────────────────────────────────────────────────────

const CommunityPostCard: React.FC<{
  post: CommunityPost;
  onLike: (id: string) => void;
  formatTimeAgo: (d: Date) => string;
}> = ({ post, onLike, formatTimeAgo }) => {
  const cat = CommunityCategoryConfig[post.category];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl shadow-sm overflow-hidden border border-emerald-200 bg-white"
    >
      {/* Author */}
      <div className="px-4 pt-3 pb-2 flex items-start gap-3">
        <div className={`w-10 h-10 rounded-full ${post.author.avatarColor} flex items-center justify-center flex-shrink-0 text-white font-bold text-base`}>
          {post.author.name.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-semibold text-slate-900 text-sm">{post.author.name}</span>
            <LevelBadge xp={post.author.xp} />
            <span className="text-xs text-slate-400">@{post.author.username}</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs text-slate-400">{formatTimeAgo(post.timestamp)}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full border font-semibold ${cat.color}`}>
              {cat.icon} {cat.label}
            </span>
          </div>
        </div>
        {/* XP earned indicator */}
        <div className="flex-shrink-0 flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">
          <span className="text-amber-500 text-xs">⚡</span>
          <span className="text-amber-700 text-xs font-bold">+{post.xpEarned} XP</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-3">
        <p className="text-sm text-slate-800 leading-relaxed">{post.content}</p>
      </div>

      {/* Stats & actions */}
      <div className="px-4 py-2 flex items-center justify-between text-xs text-slate-500 border-t border-emerald-100">
        <span>{post.likes} likes · {post.comments} comments</span>
      </div>
      <div className="px-4 py-1.5 flex items-center border-t border-emerald-100 divide-x divide-emerald-100">
        <button
          onClick={() => onLike(post.id)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-emerald-50 transition-colors rounded-lg group"
        >
          {post.isLiked
            ? <HeartSolidIcon className="w-4 h-4 text-red-500" />
            : <HeartIcon className="w-4 h-4 text-slate-400 group-hover:text-red-500" />}
          <span className={`text-sm font-semibold ${post.isLiked ? 'text-red-500' : 'text-slate-500 group-hover:text-slate-800'}`}>Like</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-emerald-50 transition-colors rounded-lg group">
          <ChatBubbleLeftIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
          <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800">Comment</span>
        </button>
        <button className="flex-1 flex items-center justify-center gap-1.5 py-2 hover:bg-emerald-50 transition-colors rounded-lg group">
          <ShareIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-800" />
          <span className="text-sm font-semibold text-slate-500 group-hover:text-slate-800">Share</span>
        </button>
      </div>
    </motion.div>
  );
};

// ─── Community Compose Box ────────────────────────────────────────────────────

const ComposeBox: React.FC<{ onPost: (content: string, category: CommunityCategory) => void }> = ({ onPost }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<CommunityCategory>('story');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onPost(text.trim(), category);
    setText('');
  };

  return (
    <div className="rounded-xl border border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
          You
        </div>
        <div>
          <p className="text-sm font-semibold text-emerald-900">Share your story or question</p>
          <p className="text-xs text-emerald-600 flex items-center gap-1">
            <span>⚡</span> Earn <span className="font-bold">+2 XP</span> for every post
          </p>
        </div>
      </div>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="What's on your mind? Ask a question, share your climate action, or celebrate a milestone..."
        className="w-full text-sm rounded-lg border border-emerald-200 bg-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-400 resize-none text-slate-800 placeholder:text-slate-400"
        rows={3}
      />

      <div className="flex items-center gap-2 mt-2">
        <select
          value={category}
          onChange={e => setCategory(e.target.value as CommunityCategory)}
          className="text-xs border border-emerald-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          {(Object.keys(CommunityCategoryConfig) as CommunityCategory[]).map(k => (
            <option key={k} value={k}>
              {CommunityCategoryConfig[k].icon} {CommunityCategoryConfig[k].label}
            </option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={!text.trim()}
          className="ml-auto flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
        >
          <span>⚡</span> Post & earn XP
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

type Tab = 'official' | 'community';

const SocialFeed: React.FC<SocialFeedProps> = ({ nonprofitName }) => {
  const [activeTab, setActiveTab] = useState<Tab>('official');
  const [officialPosts, setOfficialPosts] = useState<OfficialPost[]>(OFFICIAL_POSTS);
  const [communityPosts, setCommunityPosts] = useState<CommunityPost[]>(COMMUNITY_POSTS);

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
    return `${Math.floor(days / 30)}mo ago`;
  };

  const handleOfficialLike = (id: string) => {
    setOfficialPosts(prev =>
      prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p)
    );
  };

  const handleCommunityLike = (id: string) => {
    setCommunityPosts(prev =>
      prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p)
    );
  };

  const handleNewPost = (content: string, category: CommunityCategory) => {
    const newPost: CommunityPost = {
      type: 'community',
      id: `c${Date.now()}`,
      content,
      timestamp: new Date(),
      likes: 0,
      comments: 0,
      isLiked: false,
      category,
      xpEarned: 2,
      author: { name: 'You', username: 'you', xp: 45, avatarColor: 'bg-emerald-500' },
    };
    setCommunityPosts(prev => [newPost, ...prev]);
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-white">
        <button
          onClick={() => setActiveTab('official')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'official'
              ? 'bg-slate-800 text-white'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <BeakerIcon className="w-4 h-4" />
          Official Science
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'official' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
          }`}>
            {officialPosts.length}
          </span>
        </button>
        <div className="w-px bg-slate-200" />
        <button
          onClick={() => setActiveTab('community')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'community'
              ? 'bg-emerald-600 text-white'
              : 'text-slate-600 hover:bg-emerald-50'
          }`}
        >
          <UserGroupIcon className="w-4 h-4" />
          Community
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${
            activeTab === 'community' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-600'
          }`}>
            {communityPosts.length}
          </span>
        </button>
      </div>

      {/* Tab descriptions */}
      <AnimatePresence mode="wait">
        {activeTab === 'official' ? (
          <motion.div
            key="official-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <CheckBadgeIcon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-slate-600">
              Verified posts from <span className="font-semibold">climate scientists, researchers, and government officials</span>.
              All content is sourced from credentialed institutions.
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="community-desc"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg"
          >
            <span className="text-base">⚡</span>
            <p className="text-xs text-emerald-800">
              Share your climate actions, questions, and stories. <span className="font-semibold">Earn +2 XP</span> for every post you contribute to {nonprofitName}.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts */}
      <AnimatePresence mode="wait">
        {activeTab === 'official' ? (
          <motion.div key="official-posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            {officialPosts.map(post => (
              <OfficialPostCard key={post.id} post={post} onLike={handleOfficialLike} formatTimeAgo={formatTimeAgo} />
            ))}
          </motion.div>
        ) : (
          <motion.div key="community-posts" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <ComposeBox onPost={handleNewPost} />
            {communityPosts.map(post => (
              <CommunityPostCard key={post.id} post={post} onLike={handleCommunityLike} formatTimeAgo={formatTimeAgo} />
            ))}
            {communityPosts.length === 0 && (
              <div className="text-center py-12 text-slate-400">
                <p className="text-3xl mb-2">🌍</p>
                <p>No community posts yet. Be the first!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SocialFeed;

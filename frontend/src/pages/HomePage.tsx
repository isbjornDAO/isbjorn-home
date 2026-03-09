import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import { getXpProgress, calculateLevel } from '@/utils/xp';

import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// ─── PALETTE ───
const C = {
  bg: '#0b0e13',
  surface: '#12161d',
  surfaceHover: '#181d26',
  elevated: '#1e2430',
  border: '#262d3a',
  borderSubtle: '#1a2030',
  text: '#e1e4ea',
  textSecondary: '#8b93a5',
  textMuted: '#505868',
  blue: '#0284c7',
  blueLight: '#38bdf8',
  blueBright: '#0ea5e9',
  blueDark: '#0369a1',
  green: '#22c55e',
  red: '#ef4444',
  yellow: '#eab308',
  purple: '#a78bfa',
};

// ─── DATA ───

interface NewsStory {
  id: string;
  headline: string;
  summary: string;
  source: string;
  time: string;
  category: string;
  tag: 'breaking' | 'trending' | 'update' | 'research' | 'alert';
  image?: string;
  tokenId?: string;
  stats?: { label: string; value: string; change?: number }[];
}

interface TokenRow {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  impactScore: number;
  change24h: number;
  volume24h: number;
  sparkline: number[];
  condition: string;
  conditionStatus: 'critical' | 'stable' | 'improving';
}

interface LiveStream {
  id: string;
  title: string;
  location: string;
  viewers: number;
  embedUrl: string;
  thumbnail?: string;
}

const TOKENS: TokenRow[] = [
  { id: 'pbi', ticker: 'PBI', name: 'Polar Bears Intl', logo: pbiLogo, impactScore: 87.4, change24h: 3.2, volume24h: 24500, sparkline: [72,74,73,76,78,77,80,82,81,84,85,87], condition: 'Ice 62%', conditionStatus: 'critical' },
  { id: 'wwf-uk', ticker: 'WWF', name: 'World Wildlife Fund', logo: wwfLogo, impactScore: 92.1, change24h: 1.8, volume24h: 31200, sparkline: [85,86,87,86,88,89,90,89,91,90,91,92], condition: '1,847 spp', conditionStatus: 'stable' },
  { id: 'greenpeace', ticker: 'GPC', name: 'Greenpeace', logo: greenpeaceLogo, impactScore: 78.6, change24h: 5.4, volume24h: 18900, sparkline: [60,62,64,63,67,70,69,73,74,76,77,79], condition: '847K ha', conditionStatus: 'critical' },
  { id: 'ocean-conservancy', ticker: 'OCN', name: 'Ocean Conservancy', logo: oceanConservancyLogo, impactScore: 71.2, change24h: 8.7, volume24h: 12800, sparkline: [45,48,50,52,55,54,58,62,64,67,69,71], condition: '+1.2C', conditionStatus: 'critical' },
  { id: 'the-nature-conservancy', ticker: 'TNC', name: 'Nature Conservancy', logo: natureConservancyLogo, impactScore: 83.9, change24h: 0.6, volume24h: 9400, sparkline: [80,81,82,81,82,83,82,83,84,83,84,84], condition: '2.4M ha', conditionStatus: 'improving' },
  { id: 'conservation-intl', ticker: 'CI', name: 'Conservation Intl', logo: conservationIntlLogo, impactScore: 76.3, change24h: 2.1, volume24h: 11200, sparkline: [62,64,65,64,67,69,68,71,72,74,75,76], condition: '48.2K t', conditionStatus: 'improving' },
];

const FEATURED: NewsStory = {
  id: 'f1',
  headline: 'Arctic Sea Ice Reaches Record Low for March — What It Means for Polar Bear Populations',
  summary: 'New satellite data from the National Snow and Ice Data Center shows Arctic sea ice extent at its lowest March level since records began in 1979. Scientists warn this could disrupt critical spring hunting seasons for polar bears across the Beaufort and Chukchi seas.',
  source: 'NSIDC',
  time: '2h ago',
  category: 'Arctic',
  tag: 'breaking',
  tokenId: 'pbi',
  stats: [
    { label: 'Ice Extent', value: '14.2M km²', change: -3.4 },
    { label: 'vs 1981-2010 avg', value: '-1.1M km²' },
    { label: 'Bear Pop. Affected', value: '~26,000' },
  ],
};

const NEWS: NewsStory[] = [
  {
    id: 'n1',
    headline: 'Amazon Deforestation Rate Slows 18% in Q1 — Satellite Data Confirms',
    summary: 'Brazilian space agency INPE reports a significant slowdown, though environmentalists caution the dry season ahead could reverse gains.',
    source: 'INPE / Reuters', time: '4h ago', category: 'Forest', tag: 'trending', tokenId: 'greenpeace',
    stats: [{ label: 'Area Saved', value: '1,240 km²' }, { label: 'YoY Change', value: '-18%', change: -18 }],
  },
  {
    id: 'n2',
    headline: 'Chukchi Sea Surface Temperature Anomaly Hits +1.2C Above Average',
    summary: 'NOAA ocean buoy network detecting sustained warming in key Arctic marine habitat. Walrus and seal populations showing behavioral shifts.',
    source: 'NOAA', time: '6h ago', category: 'Ocean', tag: 'alert', tokenId: 'ocean-conservancy',
    stats: [{ label: 'Temp Anomaly', value: '+1.2C' }, { label: 'Duration', value: '47 days' }],
  },
  {
    id: 'n3',
    headline: 'WWF Svalbard Marine Reserve Proposal Reaches 70% Community Vote',
    summary: 'The governance proposal to establish a new 12,000 km² marine protected area around western Svalbard is nearing the approval threshold.',
    source: 'Isbjorn DAO', time: '8h ago', category: 'Governance', tag: 'update', tokenId: 'wwf-uk',
  },
  {
    id: 'n4',
    headline: 'New Carbon Credit Methodology Peer-Reviewed for Blue Carbon Mangroves',
    summary: 'Conservation International\'s mangrove restoration methodology has been independently validated, opening $12M in potential carbon credit revenue.',
    source: 'Verra', time: '12h ago', category: 'Climate', tag: 'research', tokenId: 'conservation-intl',
    stats: [{ label: 'Credit Value', value: '$12M' }, { label: 'CO2 Offset', value: '48.2K t/yr' }],
  },
  {
    id: 'n5',
    headline: 'Bear #4471 GPS Collar Transmitting New Data from Hudson Bay',
    summary: 'Researchers confirm the adult female polar bear has moved 340 km north in the past week, tracking receding ice edge for seal hunting.',
    source: 'PBI Research', time: '14h ago', category: 'Arctic', tag: 'update', tokenId: 'pbi',
  },
  {
    id: 'n6',
    headline: 'Nature Conservancy Establishes New 80,000-Hectare Wetland Reserve',
    summary: 'The protected area in Minnesota will safeguard critical migratory bird habitat and serve as a carbon sink sequestering an estimated 15,000 tonnes CO2/year.',
    source: 'TNC', time: '18h ago', category: 'Land', tag: 'trending', tokenId: 'the-nature-conservancy',
  },
  {
    id: 'n7',
    headline: 'Global Ocean Plastic Concentration Mapped at Unprecedented Resolution',
    summary: 'New satellite-AI fusion technique reveals microplastic hotspots across 5 major gyres. Data will guide Greenpeace cleanup vessel routing.',
    source: 'Nature Geoscience', time: '1d ago', category: 'Ocean', tag: 'research', tokenId: 'greenpeace',
  },
];

const STREAMS: LiveStream[] = [
  { id: 's1', title: 'Polar Bear Cam', location: 'Hudson Bay, Canada', viewers: 1247, embedUrl: 'https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0' },
  { id: 's2', title: 'Northern Lights', location: 'Svalbard, Norway', viewers: 892, embedUrl: 'https://www.youtube.com/embed/cKrBqRkn4Bk?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0' },
];

const TOPICS = ['All', 'Arctic', 'Ocean', 'Forest', 'Climate', 'Land', 'Governance'];

const TAG_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  breaking: { bg: `${C.red}18`, color: C.red, label: 'BREAKING' },
  trending: { bg: `${C.blueBright}18`, color: C.blueBright, label: 'TRENDING' },
  alert: { bg: `${C.yellow}18`, color: C.yellow, label: 'ALERT' },
  update: { bg: `${C.green}18`, color: C.green, label: 'UPDATE' },
  research: { bg: `${C.purple}18`, color: C.purple, label: 'RESEARCH' },
};

// ─── COMPONENTS ───

const Sparkline: React.FC<{ data: number[]; color: string; w?: number; h?: number }> = ({ data, color, w = 60, h = 20 }) => {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / r) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={`sp${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.1} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sp${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

const CondDot: React.FC<{ status: string }> = ({ status }) => {
  const color = status === 'critical' ? C.red : status === 'improving' ? C.green : C.yellow;
  return <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />;
};

const fmtUsd = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`;

const TagBadge: React.FC<{ tag: string }> = ({ tag }) => {
  const s = TAG_STYLES[tag];
  if (!s) return null;
  return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-wider" style={{ background: s.bg, color: s.color }}>{s.label}</span>;
};

const StoryCard: React.FC<{ story: NewsStory; featured?: boolean }> = ({ story, featured }) => {
  const token = TOKENS.find(t => t.id === story.tokenId);
  return (
    <Link to={token ? `/charity/${token.id}` : '/map'}
      className="block rounded-lg transition-all group"
      style={{ background: C.surface, border: `1px solid ${C.border}` }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = C.blueDark; e.currentTarget.style.background = C.surfaceHover; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.background = C.surface; }}>
      <div className={featured ? 'p-5' : 'p-4'}>
        {/* Top line: tag + source + time */}
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <TagBadge tag={story.tag} />
          <span className="text-[10px]" style={{ color: C.textMuted }}>{story.category}</span>
          <span className="text-[10px]" style={{ color: C.textMuted }}>·</span>
          <span className="text-[10px]" style={{ color: C.textMuted }}>{story.source}</span>
          <span className="text-[10px] ml-auto flex-shrink-0" style={{ color: C.textMuted }}>{story.time}</span>
        </div>

        {/* Headline */}
        <h3 className={`font-bold leading-snug mb-2 group-hover:text-[${C.blueBright}] transition-colors ${featured ? 'text-base sm:text-lg' : 'text-sm'}`}
          style={{ color: C.text }}>
          {story.headline}
        </h3>

        {/* Summary */}
        <p className={`leading-relaxed mb-3 ${featured ? 'text-sm' : 'text-xs line-clamp-2'}`} style={{ color: C.textSecondary }}>
          {story.summary}
        </p>

        {/* Stats row (if any) */}
        {story.stats && (
          <div className="flex flex-wrap gap-3 mb-3">
            {story.stats.map(s => (
              <div key={s.label} className="px-2.5 py-1.5 rounded" style={{ background: C.elevated }}>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>{s.label}</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold tabular-nums" style={{ color: C.text }}>{s.value}</span>
                  {s.change !== undefined && (
                    <span className="text-[10px] font-bold tabular-nums" style={{ color: s.change >= 0 ? C.green : C.red }}>
                      {s.change >= 0 ? '+' : ''}{s.change}%
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Token link */}
        {token && (
          <div className="flex items-center gap-2 pt-2" style={{ borderTop: `1px solid ${C.borderSubtle}` }}>
            <img src={token.logo} alt={token.ticker} className="w-5 h-5 rounded-full object-cover" style={{ border: `1px solid ${C.border}` }} />
            <span className="text-[11px] font-semibold" style={{ color: C.textSecondary }}>{token.ticker}</span>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: C.text }}>{token.impactScore.toFixed(1)}</span>
            <span className="text-[10px] font-bold tabular-nums" style={{ color: token.change24h >= 0 ? C.green : C.red }}>
              {token.change24h >= 0 ? '+' : ''}{token.change24h}%
            </span>
            <Sparkline data={token.sparkline} color={token.change24h >= 0 ? C.green : C.red} w={48} h={16} />
          </div>
        )}
      </div>
    </Link>
  );
};

// ─── MAIN ───

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const activeAccount = useActiveAccount();
  const isConnected = isAuthenticated || !!activeAccount;
  const userXp = user?.xp || 0;
  const userLevel = user?.level || calculateLevel(userXp);
  const xpProg = getXpProgress(userXp);

  const [topic, setTopic] = useState('All');
  const [activeStream, setActiveStream] = useState(0);

  // Live viewer count simulation
  const [viewerOffset, setViewerOffset] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setViewerOffset(Math.floor(Math.random() * 30) - 15), 4000);
    return () => clearInterval(iv);
  }, []);

  const filteredNews = topic === 'All' ? NEWS : NEWS.filter(n => n.category === topic);

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>

      {/* ─── TOP BAR ─── */}
      <div style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex items-center gap-3">
          {isConnected ? (
            <div className="flex items-center gap-2.5 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.blueDark}, ${C.blueBright})`, color: '#fff' }}>
                {(user?.username || 'E')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold truncate" style={{ color: C.text }}>{user?.username || 'Explorer'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.elevated, color: C.blueBright }}>Lv {userLevel}</span>
              <div className="hidden sm:flex items-center gap-2 max-w-[180px]">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, xpProg.percentage)}%`, background: C.blueBright }} />
                </div>
                <span className="text-[9px] tabular-nums" style={{ color: C.textMuted }}>{Math.round(xpProg.percentage)}%</span>
              </div>
            </div>
          ) : (
            <span className="text-xs flex-1" style={{ color: C.textSecondary }}>Sign in to track impact and earn XP</span>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded" style={{ background: C.elevated }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="text-[10px] tabular-nums" style={{ color: C.textSecondary }}>
                {fmtUsd(TOKENS.reduce((s, t) => s + t.volume24h, 0))} 24h
              </span>
            </div>
            <Link to="/map" className="text-[10px] font-semibold px-2 py-1 rounded transition-colors"
              style={{ background: C.elevated, color: C.blueBright }}>
              Map
            </Link>
          </div>
        </div>
      </div>

      {/* ─── TOPIC FILTER ─── */}
      <div style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-1.5 flex items-center gap-1 overflow-x-auto scrollbar-hide">
          {TOPICS.map(t => (
            <button key={t} onClick={() => setTopic(t)}
              className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all whitespace-nowrap"
              style={topic === t
                ? { background: `${C.blueDark}30`, color: C.blueBright, border: `1px solid ${C.blueDark}` }
                : { background: 'transparent', color: C.textMuted, border: '1px solid transparent' }
              }>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ─── MAIN CONTENT ─── */}
      <div className="max-w-[1600px] mx-auto flex gap-0" style={{ height: 'calc(100vh - 98px)' }}>

        {/* ════ LEFT: NEWS FEED ════ */}
        <div className="flex-1 min-w-0 overflow-y-auto px-3 sm:px-5 py-4" style={{ borderRight: `1px solid ${C.borderSubtle}` }}>
          <div className="max-w-[800px] space-y-4">

            {/* Featured story */}
            {(topic === 'All' || FEATURED.category === topic) && (
              <StoryCard story={FEATURED} featured />
            )}

            {/* News grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredNews.map(story => (
                <StoryCard key={story.id} story={story} />
              ))}
            </div>
          </div>
        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <div className="hidden lg:flex flex-col w-[320px] xl:w-[360px] overflow-y-auto flex-shrink-0">

          {/* Live Stream */}
          <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-semibold" style={{ color: C.text }}>Live</span>
              </div>
              <Link to="/live" className="text-[10px] font-semibold" style={{ color: C.blueBright }}>All streams</Link>
            </div>
            {/* Stream embed */}
            <div className="relative" style={{ paddingTop: '56.25%' }}>
              <iframe
                src={STREAMS[activeStream].embedUrl}
                title={STREAMS[activeStream].title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; encrypted-media"
              />
            </div>
            {/* Stream info + switcher */}
            <div className="px-4 py-2.5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="text-xs font-semibold" style={{ color: C.text }}>{STREAMS[activeStream].title}</div>
                  <div className="text-[10px]" style={{ color: C.textMuted }}>{STREAMS[activeStream].location}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
                  <span className="text-[10px] tabular-nums" style={{ color: C.textSecondary }}>
                    {(STREAMS[activeStream].viewers + viewerOffset).toLocaleString()}
                  </span>
                </div>
              </div>
              {/* Stream tabs */}
              <div className="flex gap-1">
                {STREAMS.map((s, i) => (
                  <button key={s.id} onClick={() => setActiveStream(i)}
                    className="flex-1 py-1 rounded text-[10px] font-semibold transition-all"
                    style={activeStream === i
                      ? { background: C.elevated, color: C.text, border: `1px solid ${C.border}` }
                      : { color: C.textMuted, border: '1px solid transparent' }
                    }>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Token Watchlist */}
          <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div className="px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: C.text }}>Watchlist</span>
              <Link to="/donate" className="text-[10px] font-semibold" style={{ color: C.blueBright }}>All tokens</Link>
            </div>
            <div>
              {TOKENS.map((t, i) => (
                <Link key={t.id} to={`/charity/${t.id}`}
                  className="flex items-center gap-2.5 px-4 py-2 transition-colors"
                  style={{ borderBottom: i < TOKENS.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <img src={t.logo} alt={t.ticker} className="w-7 h-7 rounded-full object-cover flex-shrink-0" style={{ border: `1px solid ${C.border}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] font-bold" style={{ color: C.text }}>{t.ticker}</span>
                      <span className="text-[10px] font-bold tabular-nums" style={{ color: C.textSecondary }}>{t.impactScore.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <CondDot status={t.conditionStatus} />
                      <span className="text-[9px]" style={{ color: C.textMuted }}>{t.condition}</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-[10px] font-bold tabular-nums" style={{ color: t.change24h >= 0 ? C.green : C.red }}>
                      {t.change24h >= 0 ? '+' : ''}{t.change24h}%
                    </div>
                    <Sparkline data={t.sparkline} color={t.change24h >= 0 ? C.green : C.red} w={44} h={14} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Climate Conditions Summary */}
          <div className="flex-shrink-0 px-4 py-3" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div className="text-[9px] uppercase tracking-wider font-semibold mb-2.5" style={{ color: C.textMuted }}>Global Conditions</div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Arctic Ice', value: '14.2M km²', status: 'critical' as const, delta: '-3.4%' },
                { label: 'CO2 Level', value: '423 ppm', status: 'critical' as const, delta: '+0.6%' },
                { label: 'Ocean Temp', value: '+1.18C', status: 'critical' as const, delta: '+0.04' },
                { label: 'Forest Loss', value: '-4.1M ha/yr', status: 'improving' as const, delta: '-18%' },
              ].map(c => (
                <div key={c.label} className="rounded-md p-2.5" style={{ background: C.elevated }}>
                  <div className="flex items-center gap-1 mb-1">
                    <CondDot status={c.status} />
                    <span className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>{c.label}</span>
                  </div>
                  <div className="text-xs font-bold tabular-nums" style={{ color: C.text }}>{c.value}</div>
                  <div className="text-[10px] font-semibold tabular-nums" style={{ color: c.status === 'improving' ? C.green : C.red }}>{c.delta}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div className="px-4 py-3 flex-shrink-0">
            <div className="space-y-1.5">
              {[
                { label: 'Explore the Map', to: '/map', desc: 'See all active missions worldwide' },
                { label: 'Governance', to: '/vote', desc: 'Vote on conservation proposals' },
                { label: 'Live Cams', to: '/live', desc: 'Watch wildlife streams' },
              ].map(link => (
                <Link key={link.to} to={link.to}
                  className="flex items-center justify-between px-3 py-2 rounded-md transition-colors"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => (e.currentTarget.style.background = C.elevated)}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div>
                    <div className="text-[11px] font-semibold" style={{ color: C.text }}>{link.label}</div>
                    <div className="text-[10px]" style={{ color: C.textMuted }}>{link.desc}</div>
                  </div>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke={C.textMuted} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

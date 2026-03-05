import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import arcticPoster from '@/assets/arctic-video-poster.jpg.jpg.png';

// Charity logos
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';
import sierraClubLogo from '@/assets/logos/sierra-club.jpg';
import rainforestLogo from '@/assets/logos/rainforest.jpg';

// ─── MOCK DATA ───

const MOCK_TRENDING = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, category: 'Climate', sparkline: [12, 15, 13, 18, 22, 19, 25, 28, 24, 30, 27, 35], followers: 2847, weeklyChange: 23, raised: '$154,200' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, category: 'Conservation', sparkline: [20, 22, 21, 24, 23, 26, 28, 27, 30, 29, 32, 34], followers: 4102, weeklyChange: 12, raised: '$185,400' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment', sparkline: [8, 10, 12, 11, 15, 18, 17, 20, 22, 24, 23, 28], followers: 3291, weeklyChange: 18, raised: '$141,800' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean', sparkline: [5, 8, 7, 12, 15, 14, 20, 22, 25, 28, 30, 35], followers: 1856, weeklyChange: 31, raised: '$98,500' },
  { id: 'the-nature-conservancy', name: 'The Nature Conservancy', logo: natureConservancyLogo, category: 'Conservation', sparkline: [18, 19, 20, 19, 21, 22, 23, 22, 24, 25, 26, 27], followers: 2134, weeklyChange: 8, raised: '$85,200' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, category: 'Conservation', sparkline: [10, 12, 14, 13, 16, 18, 20, 19, 22, 24, 26, 28], followers: 1678, weeklyChange: 15, raised: '$115,600' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'donation' as const, user: 'arctic_whale', detail: 'donated $250 to Polar Bears International', time: '2m ago' },
  { id: 2, type: 'vote' as const, user: 'icekeeper', detail: 'voted on "Fund Arctic Research Station"', time: '5m ago' },
  { id: 3, type: 'donation' as const, user: 'snow_leopard', detail: 'donated $1,000 to WWF', time: '8m ago' },
  { id: 4, type: 'follow' as const, user: 'northern_lights', detail: 'started following Ocean Conservancy', time: '12m ago' },
  { id: 5, type: 'donation' as const, user: 'tundra_fox', detail: 'donated $75 to Greenpeace', time: '15m ago' },
  { id: 6, type: 'proposal' as const, user: 'glacier_guard', detail: 'created "Expand Svalbard Monitoring"', time: '22m ago' },
  { id: 7, type: 'donation' as const, user: 'polar_dawn', detail: 'donated $500 to Nature Conservancy', time: '28m ago' },
  { id: 8, type: 'vote' as const, user: 'frost_byte', detail: 'voted on "Q1 2026 Allocations"', time: '34m ago' },
];

const MOCK_MISSIONS = [
  { id: 'm1', name: 'Arctic Research Station Expansion', charity: 'Polar Bears International', charityLogo: pbiLogo, fundingGoal: 50000, fundingReceived: 34200, status: 'active' as const },
  { id: 'm2', name: 'Marine Conservation Svalbard', charity: 'WWF', charityLogo: wwfLogo, fundingGoal: 75000, fundingReceived: 52100, status: 'voting' as const },
  { id: 'm3', name: 'Rainforest Protection Initiative', charity: 'Greenpeace', charityLogo: greenpeaceLogo, fundingGoal: 40000, fundingReceived: 40000, status: 'funded' as const },
];

const MOCK_PROPOSALS = [
  { id: 'p1', title: 'Fund Marine Conservation Project', proposer: 'WWF', votesFor: 450, votesAgainst: 120, votingEnds: '2d 14h', status: 'active' as const },
  { id: 'p2', title: 'Expand Arctic Research Stations', proposer: 'NRDC', votesFor: 380, votesAgainst: 90, votingEnds: '4d 8h', status: 'active' as const },
  { id: 'p3', title: 'Rainforest Protection Initiative', proposer: 'Greenpeace', votesFor: 520, votesAgainst: 80, votingEnds: 'Ended', status: 'passed' as const },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'GlacierGuard', initials: 'GG', total: '$12,450', donations: 47 },
  { rank: 2, name: 'ArcticPhoenix', initials: 'AP', total: '$9,820', donations: 34 },
  { rank: 3, name: 'NorthernStar', initials: 'NS', total: '$8,340', donations: 62 },
  { rank: 4, name: 'IcebergAlpha', initials: 'IA', total: '$6,190', donations: 28 },
  { rank: 5, name: 'PolarVortex', initials: 'PV', total: '$4,750', donations: 19 },
];

// ─── HELPER COMPONENTS ───

const Snowflake: React.FC<{ delay: number }> = ({ delay }) => {
  const randomX = Math.random() * 100;
  const randomDuration = 10 + Math.random() * 6;
  return (
    <motion.div
      className="absolute text-blue-200 opacity-30"
      style={{ left: `${randomX}%`, top: '-20px' }}
      animate={{ y: ['0vh', '110vh'], x: [0, Math.sin(delay) * 30, 0], rotate: [0, 360] }}
      transition={{ duration: randomDuration, repeat: Infinity, delay, ease: 'linear' }}
    >
      <svg className="w-2 h-2" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2L10 10L2 12L10 14L12 22L14 14L22 12L14 10L12 2Z" />
      </svg>
    </motion.div>
  );
};

const TYPING_WORDS = ['polar bears', 'world', 'arctic foxes', 'penguins', 'seals', 'whales', 'walruses', 'caribou', 'snowy owls'];

const TypingText: React.FC = () => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('polar bears');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const currentWord = TYPING_WORDS[currentWordIndex];
    if (isPaused) {
      const pauseDuration = currentWordIndex === 0 && currentText === 'polar bears' ? 3000 : 2000;
      const t = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, pauseDuration);
      return () => clearTimeout(t);
    }
    if (!isDeleting && currentText === currentWord) { setIsPaused(true); return; }
    const speed = isDeleting ? 50 : 100;
    const t = setTimeout(() => {
      if (!isDeleting) { setCurrentText(currentWord.slice(0, currentText.length + 1)); }
      else if (currentText.length > 0) { setCurrentText(currentText.slice(0, -1)); }
      else { setIsDeleting(false); setCurrentWordIndex((p) => (p + 1) % TYPING_WORDS.length); }
    }, speed);
    return () => clearTimeout(t);
  }, [currentText, isDeleting, isPaused, currentWordIndex]);

  return <span className="inline-block">{currentText}<span className="animate-pulse">|</span></span>;
};

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: 'easeOut' }} className={className}>
      {children}
    </motion.div>
  );
};

// SVG sparkline
const Sparkline: React.FC<{ data: number[]; color?: string; className?: string }> = ({ data, color = '#0ea5e9', className = '' }) => {
  const w = 72, h = 24;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.15} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={fillD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

// Animated counter
const Counter: React.FC<{ end: number; prefix?: string; suffix?: string }> = ({ end, prefix = '', suffix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const frames = 50;
    const inc = end / frames;
    const timer = setInterval(() => {
      frame++;
      if (frame >= frames) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(inc * frame)); }
    }, 30);
    return () => clearInterval(timer);
  }, [inView, end]);
  const fmt = count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
};

// Activity type config
const activityConfig = {
  donation: { color: 'text-green-500', bg: 'bg-green-50', icon: '💚' },
  vote: { color: 'text-arctic-500', bg: 'bg-arctic-50', icon: '🗳️' },
  proposal: { color: 'text-purple-500', bg: 'bg-purple-50', icon: '📝' },
  follow: { color: 'text-pink-500', bg: 'bg-pink-50', icon: '⭐' },
};

// Rank badge colors
const rankColors = ['', 'from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'];

// ─── MAIN COMPONENT ───

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const activeAccount = useActiveAccount();
  const isConnected = isAuthenticated || !!activeAccount;
  const [followedIds, setFollowedIds] = useState<Set<string>>(new Set());

  const toggleFollow = (id: string) => {
    setFollowedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="relative bg-ice-50 min-h-screen">

      {/* ─── COMPACT HERO ─── */}
      <div className="relative w-full overflow-hidden" style={{ height: 'min(42vh, 420px)' }}>
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: `url(${arcticPoster})` }}>
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-1000"
            style={{ minWidth: '100%', minHeight: '100%', width: '1920px', height: '1080px', objectFit: 'cover', opacity: videoLoaded ? 1 : 0 }}
            src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=1&mute=1&loop=1&playlist=64ZaC04ppLQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&origin=https://isbjorn.io"
            title="Polar Bears Video Background"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-ice-50 z-10" />
        <div className="absolute inset-0 pointer-events-none z-20">
          {Array.from({ length: 10 }).map((_, i) => <Snowflake key={i} delay={i * 0.6} />)}
        </div>

        <div className="relative z-30 h-full flex flex-col items-center justify-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-black tracking-tight text-center mb-2"
          >
            <span className="text-white drop-shadow-lg">It's time to save the <TypingText /></span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6, duration: 0.6 }}
            className="text-sm sm:text-base text-white/80 text-center mb-5 max-w-lg"
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.5)' }}
          >
            Donate. Track on-chain. Vote on where the money goes.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8, duration: 0.5 }} className="flex gap-3">
            <Link to="/donate" className="px-5 py-2.5 bg-white text-arctic-700 font-bold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
              Start Donating
            </Link>
            <Link to="/live" className="flex items-center gap-2 px-5 py-2.5 bg-white/15 backdrop-blur-md border border-white/30 text-white font-semibold text-sm rounded-full hover:bg-white/25 transition-all duration-300">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              Watch Live
            </Link>
          </motion.div>
        </div>
      </div>

      {/* ─── STATS BAR ─── */}
      <div className="relative -mt-6 z-40 px-4 sm:px-6 lg:px-10">
        <FadeIn>
          <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-lg border border-ice-100 px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              {[
                { label: 'Total Donated', value: 1247000, prefix: '$' },
                { label: 'Active Donors', value: 8432 },
                { label: 'Charities Funded', value: 12 },
                { label: 'Votes Cast', value: 24500 },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-xl sm:text-2xl font-black text-ice-900">
                    <Counter end={stat.value} prefix={stat.prefix || ''} />
                  </div>
                  <div className="text-xs text-ice-400 font-medium mt-0.5">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ─── DASHBOARD GRID ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-8 space-y-4">

        {/* Row 1: Trending (2 cols) + Live Cam (1 col) + Missions (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Trending Charities — spans 2 cols */}
          <FadeIn className="lg:col-span-2" delay={0.05}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-5 h-full animate-aurora">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-ice-900 flex items-center gap-2">
                  <span className="text-lg">🔥</span> Trending Charities
                </h2>
                <Link to="/donate" className="text-xs text-arctic-600 font-semibold hover:text-arctic-700 transition-colors">View all →</Link>
              </div>
              <div className="space-y-0">
                {MOCK_TRENDING.map((c, i) => (
                  <Link key={c.id} to={`/charity/${c.id}`}
                    className="flex items-center gap-3 py-2.5 px-2 -mx-2 rounded-lg hover:bg-ice-50 transition-colors group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-ice-300 w-4 text-right">{i + 1}</span>
                    <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-ice-100 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-700 transition-colors">{c.name}</div>
                      <div className="text-xs text-ice-400">{c.category}</div>
                    </div>
                    <Sparkline data={c.sparkline} color={c.weeklyChange > 20 ? '#22c55e' : '#0ea5e9'} className="hidden sm:block flex-shrink-0" />
                    <div className="text-right flex-shrink-0 hidden sm:block">
                      <div className="text-xs font-bold text-green-600">+{c.weeklyChange}%</div>
                      <div className="text-xs text-ice-400">{c.followers.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(c.id); }}
                      className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-200 ${followedIds.has(c.id) ? 'bg-arctic-100 text-arctic-700' : 'bg-ice-100 text-ice-500 hover:bg-arctic-50 hover:text-arctic-600'}`}
                    >
                      {followedIds.has(c.id) ? 'Following' : 'Follow'}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Live Cam Preview */}
          <FadeIn className="lg:col-span-1" delay={0.1}>
            <Link to="/live" className="block bg-ice-950 rounded-2xl border border-white/10 shadow-sm overflow-hidden h-full group">
              <div className="relative w-full animate-breathe" style={{ paddingTop: '75%' }}>
                <iframe
                  src="https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                  title="Polar Bear Cam"
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  frameBorder="0"
                  allow="accelerometer; encrypted-media"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ice-950/80 via-transparent to-transparent z-10" />
                <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white text-[10px] font-bold tracking-wide">LIVE</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold text-arctic-400 tracking-widest uppercase mb-1">Hudson Bay</div>
                <div className="text-white font-bold text-sm mb-1 group-hover:text-arctic-300 transition-colors">Polar Bears — Right Now</div>
                <div className="flex items-center gap-1.5 text-ice-500 text-xs">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                  1,247 watching
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Active Missions */}
          <FadeIn className="lg:col-span-1" delay={0.15}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-ice-900 flex items-center gap-2">
                  <span className="text-lg">🎯</span> Active Missions
                </h2>
                <Link to="/map" className="text-xs text-arctic-600 font-semibold hover:text-arctic-700 transition-colors">Map →</Link>
              </div>
              <div className="space-y-3">
                {MOCK_MISSIONS.map((m) => {
                  const pct = Math.min(100, Math.round((m.fundingReceived / m.fundingGoal) * 100));
                  const statusColors = { active: 'bg-green-100 text-green-700', voting: 'bg-arctic-100 text-arctic-700', funded: 'bg-purple-100 text-purple-700' };
                  return (
                    <Link key={m.id} to="/vote" className="block p-3 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all group">
                      <div className="flex items-center gap-2 mb-2">
                        <img src={m.charityLogo} alt={m.charity} className="w-6 h-6 rounded-full object-cover border border-ice-100" />
                        <span className="text-xs font-semibold text-ice-900 truncate flex-1 group-hover:text-arctic-700 transition-colors">{m.name}</span>
                      </div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-1.5 bg-ice-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-arctic-400 to-arctic-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ice-500">{pct}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-ice-400">${(m.fundingReceived / 1000).toFixed(1)}k / ${(m.fundingGoal / 1000).toFixed(0)}k</span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${statusColors[m.status]}`}>{m.status}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Row 2: Activity Feed (1 col) + Map Snapshot (2 cols) + Voting (1 col) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">

          {/* Activity Feed */}
          <FadeIn className="lg:col-span-1" delay={0.2}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-5 h-full">
              <h2 className="text-sm font-bold text-ice-900 flex items-center gap-2 mb-4">
                <span className="text-lg">⚡</span> Live Activity
              </h2>
              <div className="space-y-2">
                {MOCK_ACTIVITY.map((a, i) => {
                  const cfg = activityConfig[a.type];
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                      className="flex items-start gap-2.5 py-1.5"
                    >
                      <span className={`w-7 h-7 ${cfg.bg} rounded-full flex items-center justify-center text-xs flex-shrink-0`}>{cfg.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-ice-700 leading-relaxed">
                          <span className="font-semibold text-ice-900">{a.user}</span>{' '}{a.detail}
                        </p>
                        <p className="text-[10px] text-ice-400 mt-0.5">{a.time}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Map Snapshot */}
          <FadeIn className="lg:col-span-2" delay={0.25}>
            <Link to="/map" className="block bg-white rounded-2xl border border-ice-100 shadow-sm overflow-hidden h-full group animate-aurora">
              <div className="relative h-full min-h-[260px]">
                {/* Static map image placeholder — replaced by live mini-map on interaction */}
                <div className="absolute inset-0 bg-gradient-to-br from-arctic-900 via-arctic-800 to-ice-900">
                  {/* Stylized dots representing arctic region */}
                  <div className="absolute inset-0 opacity-30" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(88,166,255,0.3) 1px, transparent 1px)',
                    backgroundSize: '20px 20px',
                  }} />
                  {/* Mission markers */}
                  {[
                    { top: '30%', left: '45%', label: 'Svalbard' },
                    { top: '25%', left: '62%', label: 'Chukchi Sea' },
                    { top: '45%', left: '25%', label: 'Hudson Bay' },
                  ].map((pin, i) => (
                    <div key={i} className="absolute flex flex-col items-center" style={{ top: pin.top, left: pin.left }}>
                      <div className="w-3 h-3 bg-arctic-400 rounded-full border-2 border-white shadow-lg animate-pulse" />
                      <span className="text-[9px] text-white/70 font-medium mt-0.5">{pin.label}</span>
                    </div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
                <div className="absolute bottom-4 left-5 z-10">
                  <div className="text-white font-bold text-lg group-hover:text-arctic-300 transition-colors">Climate Map</div>
                  <div className="text-white/60 text-xs">3 active missions • Real-time data</div>
                </div>
                <div className="absolute top-4 right-4 z-10 bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="text-white text-xs font-semibold">Explore →</span>
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Voting Status */}
          <FadeIn className="lg:col-span-1" delay={0.3}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-5 h-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-ice-900 flex items-center gap-2">
                  <span className="text-lg">🗳️</span> Voting
                </h2>
                <Link to="/vote" className="text-xs text-arctic-600 font-semibold hover:text-arctic-700 transition-colors">All →</Link>
              </div>
              <div className="space-y-3">
                {MOCK_PROPOSALS.map((p) => {
                  const total = p.votesFor + p.votesAgainst;
                  const forPct = total > 0 ? Math.round((p.votesFor / total) * 100) : 0;
                  return (
                    <Link key={p.id} to="/vote" className="block p-3 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all">
                      <div className="text-xs font-semibold text-ice-900 mb-1.5 leading-snug">{p.title}</div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="flex-1 h-1.5 bg-ice-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${forPct}%` }} />
                          <div className="h-full bg-red-300 rounded-r-full" style={{ width: `${100 - forPct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-green-600 font-bold">{forPct}% for</span>
                        <span className={`font-bold ${p.status === 'passed' ? 'text-green-600' : 'text-ice-400'}`}>
                          {p.status === 'passed' ? '✓ Passed' : p.votingEnds}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* Row 3: Leaderboard (1 col) + Profile/Join CTA (1 col) — 2-col on desktop, centered */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* Top Donors */}
          <FadeIn className="lg:col-span-2" delay={0.35}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-5 h-full">
              <h2 className="text-sm font-bold text-ice-900 flex items-center gap-2 mb-4">
                <span className="text-lg">🏆</span> Top Donors This Month
              </h2>
              <div className="space-y-2">
                {MOCK_LEADERBOARD.map((d) => (
                  <div key={d.rank} className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg hover:bg-ice-50 transition-colors">
                    {d.rank <= 3 ? (
                      <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${rankColors[d.rank]} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>{d.rank}</div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-ice-100 flex items-center justify-center text-ice-500 text-xs font-bold flex-shrink-0">{d.rank}</div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-arctic-100 flex items-center justify-center text-arctic-700 text-xs font-bold flex-shrink-0">{d.initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ice-900">{d.name}</div>
                      <div className="text-xs text-ice-400">{d.donations} donations</div>
                    </div>
                    <div className="text-sm font-bold text-arctic-700 flex-shrink-0">{d.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Join CTA / Profile Card */}
          <FadeIn className="lg:col-span-2" delay={0.4}>
            {isConnected ? (
              /* Signed-in: Personalized card */
              <div className="bg-gradient-to-br from-arctic-600 to-arctic-800 rounded-2xl shadow-sm p-6 h-full text-white">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl border-2 border-white/30">
                    🐻‍❄️
                  </div>
                  <div>
                    <div className="font-bold text-lg">{user?.username || 'Explorer'}</div>
                    <div className="text-white/70 text-sm">Level {user?.level || 1} • {user?.xp || 0} XP</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-5">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{user?.coins || 0}</div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wide">Coins</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">{user?.donationStreak || 0}</div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wide">Streak</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
                    <div className="text-lg font-bold">🐻‍❄️</div>
                    <div className="text-[10px] text-white/60 uppercase tracking-wide">Spirit</div>
                  </div>
                </div>
                <Link to="/dashboard" className="block w-full text-center px-4 py-2.5 bg-white text-arctic-700 font-bold text-sm rounded-xl hover:bg-white/90 transition-all">
                  View Dashboard
                </Link>
              </div>
            ) : (
              /* Signed-out: Join prompt */
              <div className="bg-gradient-to-br from-arctic-50 via-white to-polar-50 rounded-2xl border border-arctic-100 shadow-sm p-6 h-full flex flex-col justify-between">
                <div>
                  <div className="text-3xl mb-3">🐻‍❄️</div>
                  <h3 className="text-lg font-bold text-ice-900 mb-2">Join 8,000+ donors</h3>
                  <p className="text-sm text-ice-500 leading-relaxed mb-4">
                    Create an account to track your impact, vote on missions, earn XP & Donation Coins, and customize your dashboard.
                  </p>
                  <div className="space-y-2 mb-5">
                    {['Track every donation on-chain', 'Vote on where funds go', 'Earn XP & climb the leaderboard', 'Choose your spirit animal'].map((item) => (
                      <div key={item} className="flex items-center gap-2 text-xs text-ice-600">
                        <svg className="w-3.5 h-3.5 text-arctic-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <Link to="/donate" className="block w-full text-center px-4 py-3 bg-arctic-600 text-white font-bold text-sm rounded-xl hover:bg-arctic-700 transition-all shadow-sm">
                  Get Started — It's Free
                </Link>
              </div>
            )}
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import { getXpProgress, calculateLevel } from '@/utils/xp';

import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// ─── DATA ───

const CHARITIES = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, category: 'Climate', sparkline: [12,15,13,18,22,19,25,28,24,30,27,35], followers: 2847, change: 23, raised: '$154.2K', desc: 'Wild polar bears & sea ice conservation' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, category: 'Conservation', sparkline: [20,22,21,24,23,26,28,27,30,29,32,34], followers: 4102, change: 12, raised: '$185.4K', desc: 'People living in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment', sparkline: [8,10,12,11,15,18,17,20,22,24,23,28], followers: 3291, change: 18, raised: '$141.8K', desc: 'Ending environmental destruction' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean', sparkline: [5,8,7,12,15,14,20,22,25,28,30,35], followers: 1856, change: 31, raised: '$98.5K', desc: 'Protecting the ocean' },
  { id: 'the-nature-conservancy', name: 'Nature Conservancy', logo: natureConservancyLogo, category: 'Conservation', sparkline: [18,19,20,19,21,22,23,22,24,25,26,27], followers: 2134, change: 8, raised: '$85.2K', desc: 'Lands & waters conservation' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, category: 'Conservation', sparkline: [10,12,14,13,16,18,20,19,22,24,26,28], followers: 1678, change: 15, raised: '$115.6K', desc: 'Nature-based climate solutions' },
];

const ACTIVITY = [
  { id: 1, type: 'donation' as const, user: 'arctic_whale', detail: 'donated $250 to PBI', time: '2m', icon: '💚' },
  { id: 2, type: 'vote' as const, user: 'icekeeper', detail: 'voted on Arctic Research', time: '5m', icon: '🗳️' },
  { id: 3, type: 'donation' as const, user: 'snow_leopard', detail: 'donated $1,000 to WWF', time: '8m', icon: '💚' },
  { id: 4, type: 'follow' as const, user: 'northern_lights', detail: 'followed Ocean Conservancy', time: '12m', icon: '⭐' },
  { id: 5, type: 'donation' as const, user: 'tundra_fox', detail: 'donated $75 to Greenpeace', time: '15m', icon: '💚' },
  { id: 6, type: 'proposal' as const, user: 'glacier_guard', detail: 'created Svalbard proposal', time: '22m', icon: '📝' },
  { id: 7, type: 'donation' as const, user: 'polar_dawn', detail: 'donated $500 to TNC', time: '28m', icon: '💚' },
];

const MISSIONS = [
  { id: 'm1', name: 'Arctic Research Station', charity: 'PBI', logo: pbiLogo, goal: 50000, raised: 34200, status: 'active' as const },
  { id: 'm2', name: 'Svalbard Marine Conservation', charity: 'WWF', logo: wwfLogo, goal: 75000, raised: 52100, status: 'voting' as const },
  { id: 'm3', name: 'Rainforest Protection', charity: 'Greenpeace', logo: greenpeaceLogo, goal: 40000, raised: 40000, status: 'funded' as const },
  { id: 'm4', name: 'Chukchi Sea Patrol', charity: 'Ocean Conservancy', logo: oceanConservancyLogo, goal: 60000, raised: 18500, status: 'active' as const },
];

const PROPOSALS = [
  { id: 'p1', title: 'Fund Marine Conservation', votes: 570, forPct: 79, ends: '2d 14h', status: 'active' as const },
  { id: 'p2', title: 'Expand Arctic Stations', votes: 470, forPct: 81, ends: '4d 8h', status: 'active' as const },
  { id: 'p3', title: 'Rainforest Initiative', votes: 600, forPct: 87, ends: 'Ended', status: 'passed' as const },
];

const LEADERBOARD = [
  { rank: 1, name: 'GlacierGuard', initials: 'GG', total: '$12,450', donations: 47 },
  { rank: 2, name: 'ArcticPhoenix', initials: 'AP', total: '$9,820', donations: 34 },
  { rank: 3, name: 'NorthernStar', initials: 'NS', total: '$8,340', donations: 62 },
  { rank: 4, name: 'IcebergAlpha', initials: 'IA', total: '$6,190', donations: 28 },
  { rank: 5, name: 'PolarVortex', initials: 'PV', total: '$4,750', donations: 19 },
];

const TYPING_WORDS = ['polar bears', 'the world', 'arctic foxes', 'the ocean', 'our future', 'wildlife', 'the ice caps'];
const STATUS_COLORS: Record<string, string> = { active: '#3fb950', voting: '#58a6ff', funded: '#bc8cff', planned: '#8b949e' };

// ─── SMALL COMPONENTS ───

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.4, delay }} className={className}>
      {children}
    </motion.div>
  );
};

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#58a6ff' }) => {
  const w = 80, h = 24, max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / r) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sg${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

const Counter: React.FC<{ end: number; prefix?: string; suffix?: string }> = ({ end, prefix = '', suffix = '' }) => {
  const [c, setC] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let f = 0;
    const t = setInterval(() => {
      f++;
      if (f >= 40) { setC(end); clearInterval(t); } else setC(Math.floor((end / 40) * f));
    }, 25);
    return () => clearInterval(t);
  }, [inView, end]);
  const fmt = c >= 1e6 ? `${(c / 1e6).toFixed(1)}M` : c >= 1e3 ? `${(c / 1e3).toFixed(1)}K` : c.toLocaleString();
  return <span ref={ref}>{prefix}{fmt}{suffix}</span>;
};

const TypingText: React.FC = () => {
  const [wi, setWi] = useState(0);
  const [text, setText] = useState('polar bears');
  const [del, setDel] = useState(false);
  const [pause, setPause] = useState(true);
  useEffect(() => {
    const w = TYPING_WORDS[wi];
    if (pause) { const t = setTimeout(() => { setPause(false); setDel(true); }, wi === 0 && text === 'polar bears' ? 3000 : 2000); return () => clearTimeout(t); }
    if (!del && text === w) { setPause(true); return; }
    const t = setTimeout(() => {
      if (!del) setText(w.slice(0, text.length + 1));
      else if (text.length > 0) setText(text.slice(0, -1));
      else { setDel(false); setWi(p => (p + 1) % TYPING_WORDS.length); }
    }, del ? 40 : 80);
    return () => clearTimeout(t);
  }, [text, del, pause, wi]);
  return <span className="text-[#58a6ff]">{text}<span className="animate-pulse text-[#58a6ff]/50">|</span></span>;
};

// ─── HOMEPAGE ───

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const activeAccount = useActiveAccount();
  const isConnected = isAuthenticated || !!activeAccount;
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const userXp = user?.xp || 0;
  const userLevel = user?.level || calculateLevel(userXp);
  const xpProg = getXpProgress(userXp);

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>

      {/* ═══ REPO-STYLE HEADER ═══ */}
      <div className="w-full" style={{ borderBottom: '1px solid #21262d' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          {/* Repo title line */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-2xl" style={{ background: '#161b22', border: '1px solid #30363d' }}>
                🐻‍❄️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[#8b949e] text-sm">isbjornDAO</span>
                  <span className="text-[#8b949e]">/</span>
                  <span className="text-[#58a6ff] text-lg font-bold hover:underline cursor-pointer">isbjorn-home</span>
                  <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ border: '1px solid #30363d', color: '#8b949e' }}>Public</span>
                </div>
                <p className="text-[#8b949e] text-xs mt-0.5">Decentralized conservation platform — Donate. Track on-chain. Vote on where it goes.</p>
              </div>
            </div>
            <div className="sm:ml-auto flex items-center gap-2">
              <Link to="/donate" className="px-4 py-1.5 rounded-md text-sm font-semibold text-white transition-colors" style={{ background: '#238636', border: '1px solid #2ea043' }}>
                ⭐ Donate
              </Link>
              <Link to="/live" className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors" style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9' }}>
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />Live
              </Link>
            </div>
          </div>

          {/* Repo stats bar */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs" style={{ color: '#8b949e' }}>
            {[
              { icon: '⭐', label: 'Stars', value: '8.4k' },
              { icon: '🔀', label: 'Forks', value: '1.2k' },
              { icon: '👁️', label: 'Watching', value: '347' },
              { icon: '💚', label: 'Donated', value: '$1.2M' },
              { icon: '🗳️', label: 'Proposals', value: '156' },
              { icon: '🌍', label: 'Missions', value: '24' },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-1.5">
                <span>{s.icon}</span>
                <span>{s.label}</span>
                <span className="font-bold" style={{ color: '#c9d1d9' }}>{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ═══ XP BAR (connected users) / PLATFORM METRICS (guests) ═══ */}
      <div className="w-full" style={{ borderBottom: '1px solid #21262d' }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4">
          {isConnected ? (
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl" style={{ background: 'linear-gradient(135deg, #1f6feb, #58a6ff)', boxShadow: '0 0 16px rgba(88,166,255,0.3)' }}>
                  🐻‍❄️
                </div>
                <div>
                  <div className="font-bold text-sm" style={{ color: '#c9d1d9' }}>{user?.username || 'Explorer'}</div>
                  <div className="text-xs" style={{ color: '#8b949e' }}>Level {userLevel}</div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: '#8b949e' }}>XP Progress — Level {userLevel}</span>
                  <span className="tabular-nums" style={{ color: '#58a6ff' }}>{xpProg.currentProgress}/{xpProg.totalNeeded} XP</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#21262d' }}>
                  <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, xpProg.percentage)}%`, background: 'linear-gradient(90deg, #1f6feb, #58a6ff, #79c0ff)' }} />
                </div>
                <div className="text-[10px] text-right mt-0.5" style={{ color: '#484f58' }}>{Math.round(xpProg.percentage)}% to Level {userLevel + 1}</div>
              </div>
              <div className="flex items-center gap-5 flex-shrink-0">
                {[
                  { label: 'Coins', val: user?.coins || 0, icon: '🪙' },
                  { label: 'Streak', val: `${user?.donationStreak || 0}d`, icon: '🔥' },
                  { label: 'XP', val: userXp, icon: '⭐' },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-sm font-bold tabular-nums" style={{ color: '#c9d1d9' }}>{s.icon} {s.val}</div>
                    <div className="text-[10px] uppercase tracking-wider" style={{ color: '#484f58' }}>{s.label}</div>
                  </div>
                ))}
              </div>
              <Link to="/dashboard" className="flex-shrink-0 px-4 py-1.5 rounded-md text-sm font-semibold transition-colors" style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9' }}>
                Dashboard →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
              {[
                { label: 'Total Donated', value: 1247000, prefix: '$', icon: '💚', color: '#3fb950' },
                { label: 'Active Donors', value: 8432, icon: '👥', color: '#58a6ff' },
                { label: 'Charities Funded', value: 12, icon: '🏛️', color: '#bc8cff' },
                { label: 'Votes Cast', value: 24500, icon: '🗳️', color: '#d29922' },
              ].map(s => (
                <div key={s.label} className="text-center py-2">
                  <div className="text-xl sm:text-2xl font-black tabular-nums" style={{ color: s.color }}>
                    <Counter end={s.value} prefix={s.prefix || ''} />
                  </div>
                  <div className="text-xs mt-1" style={{ color: '#8b949e' }}>{s.icon} {s.label}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── ROW 1: Hero banner (full-width) ── */}
        <FadeIn>
          <div className="relative rounded-xl overflow-hidden" style={{ border: '1px solid #30363d' }}>
            <div className="relative h-[200px] sm:h-[260px]" style={{ background: 'linear-gradient(135deg, #0d1117 0%, #161b22 40%, #1a2332 70%, #0d1117 100%)' }}>
              {/* Telescope star field effect */}
              <div className="absolute inset-0 star-field opacity-40" />
              {/* Gradient overlay */}
              <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 30% 50%, rgba(31,111,235,0.15) 0%, transparent 60%)' }} />
              <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
                <motion.h1 initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-center mb-3">
                  <span style={{ color: '#c9d1d9' }}>It's time to save </span><TypingText />
                </motion.h1>
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  className="text-sm text-center max-w-md mb-5" style={{ color: '#8b949e' }}>
                  The decentralized conservation platform. Transparent. On-chain. Community-governed.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex gap-3">
                  <Link to="/donate" className="px-5 py-2 rounded-md font-semibold text-sm text-white transition-all hover:brightness-110" style={{ background: '#238636', border: '1px solid #2ea043' }}>
                    Start Donating →
                  </Link>
                  <Link to="/map" className="px-5 py-2 rounded-md font-medium text-sm transition-all" style={{ background: '#21262d', border: '1px solid #30363d', color: '#c9d1d9' }}>
                    🗺️ Explore Map
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ── ROW 2: Charities table (full-width) ── */}
        <FadeIn delay={0.05}>
          <div className="rounded-xl overflow-hidden" style={{ background: '#161b22', border: '1px solid #30363d' }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #21262d' }}>
              <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>
                <span>🔥</span> Trending Charities
              </h2>
              <Link to="/donate" className="text-xs font-semibold" style={{ color: '#58a6ff' }}>View all →</Link>
            </div>
            {/* Header */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2 text-[10px] uppercase tracking-wider" style={{ color: '#484f58', borderBottom: '1px solid #21262d' }}>
              <div className="col-span-1">#</div>
              <div className="col-span-4">Charity</div>
              <div className="col-span-2 text-right">Trend</div>
              <div className="col-span-1 text-right">7d</div>
              <div className="col-span-1 text-right">Raised</div>
              <div className="col-span-1 text-right">Followers</div>
              <div className="col-span-2 text-right"></div>
            </div>
            {/* Rows */}
            <div>
              {CHARITIES.map((c, i) => (
                <Link key={c.id} to={`/charity/${c.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-5 py-3 transition-colors group"
                  style={{ borderBottom: i < CHARITIES.length - 1 ? '1px solid #21262d' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#1c2128')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <div className="hidden md:block col-span-1 text-sm font-bold tabular-nums" style={{ color: '#484f58' }}>{i + 1}</div>
                  <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                    <span className="md:hidden text-sm font-bold w-5" style={{ color: '#484f58' }}>{i + 1}</span>
                    <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full object-cover" style={{ border: '1px solid #30363d' }} />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate group-hover:text-[#58a6ff] transition-colors" style={{ color: '#c9d1d9' }}>{c.name}</div>
                      <div className="text-xs truncate" style={{ color: '#484f58' }}>{c.desc}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex col-span-2 justify-end"><Sparkline data={c.sparkline} color={c.change > 20 ? '#3fb950' : '#58a6ff'} /></div>
                  <div className="hidden md:block col-span-1 text-right text-xs font-bold" style={{ color: '#3fb950' }}>+{c.change}%</div>
                  <div className="hidden md:block col-span-1 text-right text-xs font-semibold" style={{ color: '#c9d1d9' }}>{c.raised}</div>
                  <div className="hidden md:block col-span-1 text-right text-xs" style={{ color: '#8b949e' }}>{c.followers.toLocaleString()}</div>
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFollowed(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }}
                      className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
                      style={followed.has(c.id)
                        ? { background: '#1f6feb20', color: '#58a6ff', border: '1px solid #1f6feb' }
                        : { background: '#21262d', color: '#8b949e', border: '1px solid #30363d' }
                      }>
                      {followed.has(c.id) ? '✓ Following' : 'Follow'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── ROW 3: Missions + Governance (side by side) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Missions */}
          <FadeIn delay={0.1}>
            <div className="rounded-xl h-full" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #21262d' }}>
                <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>🎯 Active Missions</h2>
                <Link to="/map" className="text-xs font-semibold" style={{ color: '#58a6ff' }}>Map →</Link>
              </div>
              <div className="p-4 space-y-3">
                {MISSIONS.map(m => {
                  const pct = Math.round((m.raised / m.goal) * 100);
                  const statusColor = STATUS_COLORS[m.status] || '#8b949e';
                  return (
                    <Link key={m.id} to="/vote" className="flex items-center gap-3 p-3 rounded-lg transition-all"
                      style={{ border: '1px solid #21262d' }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = '#1c2128'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = 'transparent'; }}>
                      <img src={m.logo} alt={m.charity} className="w-9 h-9 rounded-full object-cover flex-shrink-0" style={{ border: '1px solid #30363d' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold truncate" style={{ color: '#c9d1d9' }}>{m.name}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ background: `${statusColor}15`, color: statusColor, border: `1px solid ${statusColor}40` }}>
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#21262d' }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${statusColor}80, ${statusColor})` }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums w-9 text-right" style={{ color: '#8b949e' }}>{pct}%</span>
                        </div>
                        <div className="text-[11px] mt-1" style={{ color: '#484f58' }}>${(m.raised / 1e3).toFixed(1)}k / ${(m.goal / 1e3).toFixed(0)}k</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Governance */}
          <FadeIn delay={0.15}>
            <div className="rounded-xl h-full" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid #21262d' }}>
                <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>🗳️ Governance</h2>
                <Link to="/vote" className="text-xs font-semibold" style={{ color: '#58a6ff' }}>All proposals →</Link>
              </div>
              <div className="p-4 space-y-3">
                {PROPOSALS.map(p => (
                  <Link key={p.id} to="/vote" className="block p-3 rounded-lg transition-all"
                    style={{ border: '1px solid #21262d' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#30363d'; e.currentTarget.style.background = '#1c2128'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#21262d'; e.currentTarget.style.background = 'transparent'; }}>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>{p.title}</span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                        style={p.status === 'passed'
                          ? { background: '#3fb95015', color: '#3fb950', border: '1px solid #3fb95040' }
                          : { background: '#58a6ff15', color: '#58a6ff', border: '1px solid #58a6ff40' }
                        }>
                        {p.status === 'passed' ? '✓ Passed' : 'Active'}
                      </span>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden flex mb-2" style={{ background: '#21262d' }}>
                      <div className="h-full rounded-l-full" style={{ width: `${p.forPct}%`, background: '#3fb950' }} />
                      <div className="h-full rounded-r-full" style={{ width: `${100 - p.forPct}%`, background: '#f8514940' }} />
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span style={{ color: '#3fb950' }} className="font-bold">{p.forPct}% for</span>
                      <span style={{ color: '#8b949e' }}>{p.votes} votes</span>
                      <span className="font-semibold" style={{ color: p.status === 'passed' ? '#3fb950' : '#8b949e' }}>{p.status === 'passed' ? '✓ Passed' : p.ends}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── ROW 4: Activity + Leaderboard + Live Feed (3-col) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Activity */}
          <FadeIn delay={0.2}>
            <div className="rounded-xl h-full" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #21262d' }}>
                <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>⚡ Live Activity</h2>
              </div>
              <div className="p-4 space-y-1">
                {ACTIVITY.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = '#1c2128')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0" style={{ background: '#21262d' }}>{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs" style={{ color: '#8b949e' }}><span className="font-semibold" style={{ color: '#c9d1d9' }}>{a.user}</span> {a.detail}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: '#484f58' }}>{a.time} ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Leaderboard */}
          <FadeIn delay={0.25}>
            <div className="rounded-xl h-full" style={{ background: '#161b22', border: '1px solid #30363d' }}>
              <div className="px-5 py-3" style={{ borderBottom: '1px solid #21262d' }}>
                <h2 className="font-bold text-sm flex items-center gap-2" style={{ color: '#c9d1d9' }}>🏆 Top Donors</h2>
              </div>
              <div className="p-4 space-y-1">
                {LEADERBOARD.map(d => {
                  const rankColors = ['', '#d4a72c', '#8b949e', '#9e6a03'];
                  const isTop3 = d.rank <= 3;
                  return (
                    <div key={d.rank} className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-lg transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = '#1c2128')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      {isTop3 ? (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${rankColors[d.rank]}20`, color: rankColors[d.rank], border: `1px solid ${rankColors[d.rank]}40` }}>
                          {d.rank}
                        </div>
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: '#21262d', color: '#484f58' }}>{d.rank}</div>
                      )}
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{ background: '#1f6feb20', color: '#58a6ff' }}>{d.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold" style={{ color: '#c9d1d9' }}>{d.name}</div>
                        <div className="text-xs" style={{ color: '#484f58' }}>{d.donations} donations</div>
                      </div>
                      <div className="text-sm font-bold" style={{ color: '#3fb950' }}>{d.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Live Cam + Join CTA */}
          <FadeIn delay={0.3}>
            <div className="flex flex-col gap-5 h-full">
              {/* Cam */}
              <Link to="/live" className="block rounded-xl overflow-hidden group flex-1" style={{ background: '#0d1117', border: '1px solid #30363d' }}>
                <div className="relative" style={{ paddingTop: '56%' }}>
                  <iframe src="https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                    title="Polar Bear Cam" className="absolute inset-0 w-full h-full pointer-events-none" frameBorder="0" allow="accelerometer; encrypted-media" />
                  <div className="absolute inset-0 z-10" style={{ background: 'linear-gradient(to top, #0d1117 0%, transparent 40%)' }} />
                  <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" /><span className="text-white text-[10px] font-bold">LIVE</span>
                  </div>
                </div>
                <div className="p-4">
                  <div className="font-bold text-sm group-hover:text-[#58a6ff] transition-colors" style={{ color: '#c9d1d9' }}>Polar Bears — Hudson Bay</div>
                  <div className="flex items-center gap-1.5 text-xs mt-1" style={{ color: '#8b949e' }}>
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />1,247 watching
                  </div>
                </div>
              </Link>
              {/* Join CTA (guest only) */}
              {!isConnected && (
                <div className="rounded-xl p-5" style={{ background: '#161b22', border: '1px solid #30363d' }}>
                  <div className="text-2xl mb-2">🐻‍❄️</div>
                  <h3 className="font-bold text-sm mb-1" style={{ color: '#c9d1d9' }}>Join 8,000+ donors</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: '#8b949e' }}>Track impact on-chain, vote on missions, earn XP.</p>
                  <Link to="/donate" className="block text-center px-4 py-2 rounded-md text-sm font-bold text-white transition-all hover:brightness-110" style={{ background: '#238636', border: '1px solid #2ea043' }}>
                    Get Started Free →
                  </Link>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { useAuth } from '@/contexts/AuthContext';
import { useActiveAccount } from 'thirdweb/react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import { getXpProgress, calculateLevel } from '@/utils/xp';
import 'leaflet/dist/leaflet.css';
import arcticPoster from '@/assets/arctic-video-poster.jpg.jpg.png';

import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// ─── DATA ───

const CHARITIES = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, sparkline: [12,15,13,18,22,19,25,28,24,30,27,35], followers: 2847, change: 23, raised: '$154.2K', desc: 'Wild polar bears & sea ice conservation' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, sparkline: [20,22,21,24,23,26,28,27,30,29,32,34], followers: 4102, change: 12, raised: '$185.4K', desc: 'People living in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, sparkline: [8,10,12,11,15,18,17,20,22,24,23,28], followers: 3291, change: 18, raised: '$141.8K', desc: 'Ending environmental destruction' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, sparkline: [5,8,7,12,15,14,20,22,25,28,30,35], followers: 1856, change: 31, raised: '$98.5K', desc: 'Protecting the ocean' },
  { id: 'the-nature-conservancy', name: 'Nature Conservancy', logo: natureConservancyLogo, sparkline: [18,19,20,19,21,22,23,22,24,25,26,27], followers: 2134, change: 8, raised: '$85.2K', desc: 'Lands & waters conservation' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, sparkline: [10,12,14,13,16,18,20,19,22,24,26,28], followers: 1678, change: 15, raised: '$115.6K', desc: 'Nature-based climate solutions' },
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

const MAP_PINS = [
  { lat: 58.7, lng: -94.2, label: 'Hudson Bay', status: 'active' as const },
  { lat: 78.2, lng: 15.6, label: 'Svalbard', status: 'voting' as const },
  { lat: 68.0, lng: -170.0, label: 'Chukchi Sea', status: 'active' as const },
  { lat: 71.0, lng: -155.0, label: 'Beaufort Sea', status: 'funded' as const },
  { lat: 72.5, lng: -40.0, label: 'Greenland', status: 'active' as const },
  { lat: 64.0, lng: -150.0, label: 'Alaska', status: 'planned' as const },
];

const MAP_STATUS_COLORS: Record<string, string> = { active: '#22c55e', voting: '#3b82f6', funded: '#a855f7', planned: '#6b7280' };
const STATUS_PILL: Record<string, string> = { active: 'bg-green-50 text-green-600 border-green-100', voting: 'bg-blue-50 text-blue-600 border-blue-100', funded: 'bg-purple-50 text-purple-600 border-purple-100', planned: 'bg-gray-50 text-gray-500 border-gray-200' };

const LIVE_CAMS = [
  { id: 'hudson', title: 'Hudson Bay', location: 'Manitoba, Canada', videoId: 'U9_Fdcp73Pc', viewers: 1247 },
  { id: 'wapusk', title: 'Wapusk National Park', location: 'Manitoba, Canada', videoId: 'ZGCCMkurNGc', viewers: 823 },
  { id: 'tundra', title: 'Tundra Buggy Lodge', location: 'Churchill, Canada', videoId: '4XzYvaDCv7s', viewers: 654 },
];

const TYPING_WORDS = ['polar bears', 'the world', 'arctic foxes', 'the ocean', 'our future', 'wildlife', 'the ice caps'];

// ─── SMALL COMPONENTS ───

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = '#0ea5e9' }) => {
  const w = 80, h = 24, max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / r) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={`sg${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.15} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#sg${color.replace('#','')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

const Counter: React.FC<{ end: number; prefix?: string }> = ({ end, prefix = '' }) => {
  const [c, setC] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let f = 0;
    const t = setInterval(() => { f++; if (f >= 50) { setC(end); clearInterval(t); } else setC(Math.floor(end * (1 - Math.pow(1 - f / 50, 3)))); }, 25);
    return () => clearInterval(t);
  }, [inView, end]);
  const fmt = c >= 1e6 ? `${(c / 1e6).toFixed(1)}M` : c >= 1e3 ? `${(c / 1e3).toFixed(1)}K` : c.toLocaleString();
  return <span ref={ref}>{prefix}{fmt}</span>;
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
  return <span className="text-arctic-300">{text}<span className="animate-pulse text-arctic-400/50">|</span></span>;
};

// ─── HOMEPAGE ───

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const activeAccount = useActiveAccount();
  const isConnected = isAuthenticated || !!activeAccount;
  const [followed, setFollowed] = useState<Set<string>>(new Set());

  const userXp = user?.xp || 0;
  const userLevel = user?.level || calculateLevel(userXp);
  const xpProg = getXpProgress(userXp);

  return (
    <div className="min-h-screen bg-white">

      {/* ═══════════ LIVE HERO ═══════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: 'min(56vh, 560px)' }}>
        {/* Live cam background — autoplay */}
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${arcticPoster})` }}>
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-[2000ms]"
            style={{ minWidth: '100%', minHeight: '100%', width: '1920px', height: '1080px', objectFit: 'cover', opacity: videoLoaded ? 1 : 0 }}
            src="https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=1&mute=1&loop=1&playlist=U9_Fdcp73Pc&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&origin=https://isbjorn.io"
            title="Polar Bear Live Cam"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white z-10" />

        {/* LIVE badge — top left */}
        <div className="absolute top-5 left-5 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/60 text-xs">Hudson Bay, Canada</span>
        </div>

        {/* Viewer count — top right */}
        <div className="absolute top-5 right-5 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs">1,247 watching</span>
        </div>

        {/* Hero content */}
        <div className="relative z-20 h-full flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight text-center mb-4"
          >
            <span className="text-white drop-shadow-md">It's time to save <TypingText /></span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-sm sm:text-base text-white/60 text-center mb-6 max-w-lg font-light"
          >
            Track where your donations go. Vote on what matters. Watch conservation live.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            <Link to="/donate" className="px-6 py-2.5 bg-white text-ice-900 font-semibold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              Start Donating
            </Link>
            <Link to="/live" className="flex items-center gap-2 text-white/70 hover:text-white text-sm font-medium transition-colors">
              More Live Cams
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ STATS + XP BAR ═══════════ */}
      <section className="relative z-40 -mt-6 px-4 sm:px-6">
        <FadeIn>
          <div className="max-w-[1400px] mx-auto bg-white rounded-2xl shadow-lg border border-ice-100 px-6 py-5">
            {isConnected ? (
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-arctic-500 to-arctic-600 flex items-center justify-center text-xl shadow-sm">
                    🐻‍❄️
                  </div>
                  <div>
                    <div className="font-bold text-sm text-ice-900">{user?.username || 'Explorer'}</div>
                    <div className="text-xs text-ice-400">Level {userLevel}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-ice-400">XP Progress</span>
                    <span className="tabular-nums text-arctic-600 font-medium">{xpProg.currentProgress}/{xpProg.totalNeeded} XP</span>
                  </div>
                  <div className="h-2 rounded-full overflow-hidden bg-ice-100">
                    <div className="h-full rounded-full transition-all bg-gradient-to-r from-arctic-400 to-arctic-600" style={{ width: `${Math.min(100, xpProg.percentage)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  {[
                    { label: 'Coins', val: user?.coins || 0, icon: '🪙' },
                    { label: 'Streak', val: `${user?.donationStreak || 0}d`, icon: '🔥' },
                    { label: 'XP', val: userXp, icon: '⭐' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-sm font-bold text-ice-900 tabular-nums">{s.icon} {s.val}</div>
                      <div className="text-[10px] text-ice-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link to="/dashboard" className="flex-shrink-0 px-4 py-1.5 bg-arctic-600 text-white rounded-full text-sm font-semibold hover:bg-arctic-700 transition-colors">
                  Dashboard
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {[
                  { label: 'Total Donated', value: 1247000, prefix: '$' },
                  { label: 'Active Donors', value: 8432 },
                  { label: 'Charities Funded', value: 12 },
                  { label: 'Votes Cast', value: 24500 },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <div className="text-2xl sm:text-3xl font-bold text-ice-900 tracking-tight">
                      <Counter end={s.value} prefix={s.prefix || ''} />
                    </div>
                    <div className="text-xs text-ice-400 mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ MORE LIVE CAMS (inline row) ═══════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-8">
        <FadeIn>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {LIVE_CAMS.map(cam => (
              <Link key={cam.id} to="/live" className="group relative rounded-2xl overflow-hidden bg-ice-950 aspect-video">
                <iframe
                  src={`https://www.youtube.com/embed/${cam.videoId}?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                  title={cam.title}
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  frameBorder="0"
                  allow="accelerometer; encrypted-media"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                  <span className="text-white text-[9px] font-bold">LIVE</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
                  <div className="text-white font-semibold text-sm group-hover:text-arctic-300 transition-colors">{cam.title}</div>
                  <div className="flex items-center gap-1.5 text-white/50 text-xs mt-0.5">
                    <div className="w-1 h-1 bg-green-400 rounded-full" />
                    {cam.viewers.toLocaleString()} watching
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </FadeIn>
      </div>

      {/* ═══════════ DASHBOARD CONTENT ═══════════ */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* ── Mission Map + Latest Updates (full-width) ── */}
        <FadeIn delay={0.05}>
          <div className="rounded-2xl overflow-hidden border border-ice-100 shadow-sm">
            <div className="relative" style={{ height: 'min(45vh, 400px)' }}>
              <MapContainer
                center={[68, -30]}
                zoom={2}
                zoomControl={false}
                dragging={false}
                scrollWheelZoom={false}
                doubleClickZoom={false}
                touchZoom={false}
                attributionControl={false}
                style={{ height: '100%', width: '100%', position: 'absolute', inset: 0 }}
              >
                <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                {MAP_PINS.map((pin, i) => (
                  <CircleMarker
                    key={i}
                    center={[pin.lat, pin.lng]}
                    radius={9}
                    pathOptions={{ color: MAP_STATUS_COLORS[pin.status], fillColor: MAP_STATUS_COLORS[pin.status], fillOpacity: 0.5, weight: 2, opacity: 0.8 }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -12]} className="leaflet-tooltip-custom">
                      <span className="text-[10px] font-semibold">{pin.label}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 pointer-events-none" />

              {/* Legend */}
              <div className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 space-y-2">
                {[
                  { label: 'Active', color: '#22c55e', count: 3 },
                  { label: 'Voting', color: '#3b82f6', count: 1 },
                  { label: 'Funded', color: '#a855f7', count: 1 },
                  { label: 'Planned', color: '#6b7280', count: 1 },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2.5">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[11px] text-white/70 font-medium">{s.label}</span>
                    <span className="text-[11px] text-white/30 ml-auto tabular-nums pl-3">{s.count}</span>
                  </div>
                ))}
              </div>

              {/* Latest Updates overlay */}
              <div className="absolute top-4 right-4 bottom-16 z-20 w-60 hidden lg:flex flex-col">
                <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
                  <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                    </span>
                    <span className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">Latest Updates</span>
                  </div>
                  <div className="space-y-2.5 overflow-y-auto flex-1 homepage-scroll">
                    {ACTIVITY.map((a, i) => (
                      <motion.div key={a.id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.08 }}
                        className="flex items-start gap-2">
                        <span className="text-xs mt-0.5 flex-shrink-0">{a.icon}</span>
                        <div className="min-w-0">
                          <p className="text-[11px] text-white/80 leading-relaxed">
                            <span className="font-semibold text-white/90">{a.user}</span> {a.detail}
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">{a.time} ago</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="absolute bottom-0 left-0 right-0 z-20 p-4 sm:p-5">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Real-time tracking</div>
                    <div className="text-white font-bold text-lg sm:text-xl">6 active missions across the Arctic</div>
                  </div>
                  <Link to="/map" className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-all">
                    Open Map
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ── Trending Charities (full-width table) ── */}
        <FadeIn delay={0.08}>
          <div className="bg-white rounded-2xl overflow-hidden border border-ice-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-ice-100">
              <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">
                <span>🔥</span> Trending Charities
              </h2>
              <Link to="/donate" className="text-xs font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">View all →</Link>
            </div>
            {/* Header row */}
            <div className="hidden md:grid grid-cols-12 gap-3 px-5 py-2 text-[10px] uppercase tracking-wider text-ice-400 border-b border-ice-50">
              <div className="col-span-1">#</div>
              <div className="col-span-4">Charity</div>
              <div className="col-span-2 text-right">Trend</div>
              <div className="col-span-1 text-right">7d</div>
              <div className="col-span-1 text-right">Raised</div>
              <div className="col-span-1 text-right">Followers</div>
              <div className="col-span-2 text-right" />
            </div>
            <div>
              {CHARITIES.map((c, i) => (
                <Link key={c.id} to={`/charity/${c.id}`}
                  className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-3 items-center px-5 py-3 border-b border-ice-50 last:border-0 hover:bg-ice-50/50 transition-colors group">
                  <div className="hidden md:block col-span-1 text-sm font-bold tabular-nums text-ice-300">{i + 1}</div>
                  <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                    <span className="md:hidden text-sm font-bold w-5 text-ice-300">{i + 1}</span>
                    <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-ice-100" />
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-600 transition-colors">{c.name}</div>
                      <div className="text-xs text-ice-400 truncate">{c.desc}</div>
                    </div>
                  </div>
                  <div className="hidden md:flex col-span-2 justify-end"><Sparkline data={c.sparkline} color={c.change > 20 ? '#22c55e' : '#0ea5e9'} /></div>
                  <div className="hidden md:block col-span-1 text-right text-xs font-bold text-green-600">+{c.change}%</div>
                  <div className="hidden md:block col-span-1 text-right text-xs font-semibold text-ice-800">{c.raised}</div>
                  <div className="hidden md:block col-span-1 text-right text-xs text-ice-400">{c.followers.toLocaleString()}</div>
                  <div className="col-span-1 md:col-span-2 flex justify-end">
                    <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFollowed(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }}
                      className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all ${followed.has(c.id) ? 'bg-arctic-50 text-arctic-600 ring-1 ring-arctic-200' : 'bg-ice-100 text-ice-500 hover:bg-arctic-50 hover:text-arctic-600'}`}>
                      {followed.has(c.id) ? 'Following' : 'Follow'}
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── Missions + Governance (side by side) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <FadeIn delay={0.1}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-ice-100">
                <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">🎯 Active Missions</h2>
                <Link to="/map" className="text-xs font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">Map →</Link>
              </div>
              <div className="p-4 space-y-3">
                {MISSIONS.map(m => {
                  const pct = Math.round((m.raised / m.goal) * 100);
                  return (
                    <Link key={m.id} to="/vote" className="flex items-center gap-3 p-3 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all group">
                      <img src={m.logo} alt={m.charity} className="w-9 h-9 rounded-full object-cover flex-shrink-0 border border-ice-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-600 transition-colors">{m.name}</span>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${STATUS_PILL[m.status]}`}>{m.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-ice-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-arctic-400 to-arctic-600" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-xs font-bold tabular-nums w-9 text-right text-ice-500">{pct}%</span>
                        </div>
                        <div className="text-[11px] text-ice-400 mt-1">${(m.raised / 1e3).toFixed(1)}k / ${(m.goal / 1e3).toFixed(0)}k</div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          <FadeIn delay={0.15}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-ice-100">
                <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">🗳️ Governance</h2>
                <Link to="/vote" className="text-xs font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">All proposals →</Link>
              </div>
              <div className="p-4 space-y-3">
                {PROPOSALS.map(p => {
                  return (
                    <Link key={p.id} to="/vote" className="block p-3 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-sm font-semibold text-ice-900">{p.title}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 border ${p.status === 'passed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-arctic-50 text-arctic-600 border-arctic-100'}`}>
                          {p.status === 'passed' ? 'Passed' : 'Active'}
                        </span>
                      </div>
                      <div className="h-2 rounded-full overflow-hidden flex mb-2 bg-ice-100">
                        <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${p.forPct}%` }} />
                        <div className="h-full bg-ice-200 rounded-r-full" style={{ width: `${100 - p.forPct}%` }} />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-green-600 font-semibold">{p.forPct}% in favor</span>
                        <span className="text-ice-400">{p.votes} votes</span>
                        <span className={`font-semibold ${p.status === 'passed' ? 'text-green-600' : 'text-ice-400'}`}>{p.status === 'passed' ? 'Completed' : p.ends}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Activity + Leaderboard (2-col) ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Activity */}
          <FadeIn delay={0.2}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="px-5 py-3.5 border-b border-ice-100">
                <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">⚡ Live Activity</h2>
              </div>
              <div className="p-4 space-y-1">
                {ACTIVITY.map((a, i) => (
                  <motion.div key={a.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.04 }}
                    className="flex items-start gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-ice-50 transition-colors">
                    <span className="w-7 h-7 rounded-full bg-ice-50 flex items-center justify-center text-xs flex-shrink-0 border border-ice-100">{a.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-ice-500"><span className="font-semibold text-ice-800">{a.user}</span> {a.detail}</p>
                      <p className="text-[10px] text-ice-400 mt-0.5">{a.time} ago</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Leaderboard */}
          <FadeIn delay={0.25}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="px-5 py-3.5 border-b border-ice-100">
                <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">🏆 Top Donors</h2>
              </div>
              <div className="p-4 space-y-1">
                {LEADERBOARD.map(d => {
                  const medals = ['', 'from-amber-300 to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'];
                  return (
                    <div key={d.rank} className="flex items-center gap-3 py-2 px-2 -mx-2 rounded-xl hover:bg-ice-50 transition-colors">
                      {d.rank <= 3 ? (
                        <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${medals[d.rank]} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>{d.rank}</div>
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-ice-100 flex items-center justify-center text-ice-400 text-xs font-bold flex-shrink-0">{d.rank}</div>
                      )}
                      <div className="w-8 h-8 rounded-full bg-arctic-50 flex items-center justify-center text-arctic-600 text-xs font-bold flex-shrink-0 border border-arctic-100">{d.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ice-900">{d.name}</div>
                        <div className="text-xs text-ice-400">{d.donations} donations</div>
                      </div>
                      <div className="text-sm font-bold text-ice-800">{d.total}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

      </div>
    </div>
  );
};

export default HomePage;

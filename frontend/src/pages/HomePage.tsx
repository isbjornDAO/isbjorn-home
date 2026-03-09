import React, { useState, useEffect, useRef } from 'react';
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

const TOKENS = [
  { ticker: 'PBI', name: 'Polar Bears Intl', logo: pbiLogo, score: 87.4, change: 3.2, volume: 24500, total: 154200, donors: 2847, sparkline: [72,74,73,76,78,77,80,82,81,84,85,87] },
  { ticker: 'WWF', name: 'World Wildlife Fund', logo: wwfLogo, score: 92.1, change: 1.8, volume: 31200, total: 185400, donors: 4102, sparkline: [85,86,87,86,88,89,90,89,91,90,91,92] },
  { ticker: 'GPC', name: 'Greenpeace', logo: greenpeaceLogo, score: 78.6, change: 5.4, volume: 18900, total: 141800, donors: 3291, sparkline: [60,62,64,63,67,70,69,73,74,76,77,79] },
  { ticker: 'OCN', name: 'Ocean Conservancy', logo: oceanConservancyLogo, score: 71.2, change: 8.7, volume: 12800, total: 98500, donors: 1856, sparkline: [45,48,50,52,55,54,58,62,64,67,69,71] },
  { ticker: 'TNC', name: 'Nature Conservancy', logo: natureConservancyLogo, score: 83.9, change: 0.6, volume: 9400, total: 85200, donors: 2134, sparkline: [80,81,82,81,82,83,82,83,84,83,84,84] },
  { ticker: 'CI', name: 'Conservation Intl', logo: conservationIntlLogo, score: 76.3, change: 2.1, volume: 11200, total: 115600, donors: 1678, sparkline: [62,64,65,64,67,69,68,71,72,74,75,76] },
];

const CHARITIES = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, sparkline: [12,15,13,18,22,19,25,28,24,30,27,35], change: 23, raised: '$154.2K', desc: 'Wild polar bears & sea ice conservation' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, sparkline: [20,22,21,24,23,26,28,27,30,29,32,34], change: 12, raised: '$185.4K', desc: 'People living in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, sparkline: [8,10,12,11,15,18,17,20,22,24,23,28], change: 18, raised: '$141.8K', desc: 'Ending environmental destruction' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, sparkline: [5,8,7,12,15,14,20,22,25,28,30,35], change: 31, raised: '$98.5K', desc: 'Protecting the ocean' },
  { id: 'the-nature-conservancy', name: 'Nature Conservancy', logo: natureConservancyLogo, sparkline: [18,19,20,19,21,22,23,22,24,25,26,27], change: 8, raised: '$85.2K', desc: 'Lands & waters conservation' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, sparkline: [10,12,14,13,16,18,20,19,22,24,26,28], change: 15, raised: '$115.6K', desc: 'Nature-based climate solutions' },
];

const MISSIONS = [
  { id: 'm1', name: 'Arctic Research Station', charity: 'PBI', logo: pbiLogo, goal: 50000, raised: 34200, status: 'active' as const },
  { id: 'm2', name: 'Svalbard Marine Conservation', charity: 'WWF', logo: wwfLogo, goal: 75000, raised: 52100, status: 'voting' as const },
  { id: 'm3', name: 'Rainforest Protection', charity: 'Greenpeace', logo: greenpeaceLogo, goal: 40000, raised: 40000, status: 'funded' as const },
];

const PROPOSALS = [
  { id: 'p1', title: 'Fund Marine Conservation', votes: 570, forPct: 79, ends: '2d 14h', status: 'active' as const },
  { id: 'p2', title: 'Expand Arctic Stations', votes: 470, forPct: 81, ends: '4d 8h', status: 'active' as const },
  { id: 'p3', title: 'Rainforest Initiative', votes: 600, forPct: 87, ends: 'Ended', status: 'passed' as const },
];

const ACTIVITY = [
  { id: 1, user: 'arctic_whale', detail: 'donated $250 to PBI', time: '2m', icon: '💚' },
  { id: 2, user: 'icekeeper', detail: 'voted on Arctic Research', time: '5m', icon: '🗳️' },
  { id: 3, user: 'snow_leopard', detail: 'donated $1,000 to WWF', time: '8m', icon: '💚' },
  { id: 4, user: 'northern_lights', detail: 'followed Ocean Conservancy', time: '12m', icon: '⭐' },
  { id: 5, user: 'tundra_fox', detail: 'donated $75 to Greenpeace', time: '15m', icon: '💚' },
];

const MAP_PINS = [
  { lat: 58.7, lng: -94.2, label: 'Hudson Bay', status: 'active' as const },
  { lat: 78.2, lng: 15.6, label: 'Svalbard', status: 'voting' as const },
  { lat: 68.0, lng: -170.0, label: 'Chukchi Sea', status: 'active' as const },
  { lat: 71.0, lng: -155.0, label: 'Beaufort Sea', status: 'funded' as const },
  { lat: 72.5, lng: -40.0, label: 'Greenland', status: 'active' as const },
];

const MAP_STATUS_COLORS: Record<string, string> = { active: '#22c55e', voting: '#3b82f6', funded: '#a855f7' };
const STATUS_PILL: Record<string, string> = { active: 'bg-green-50 text-green-600 border-green-100', voting: 'bg-blue-50 text-blue-600 border-blue-100', funded: 'bg-purple-50 text-purple-600 border-purple-100' };

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

const MiniSparkline: React.FC<{ data: number[]; color?: string; w?: number; h?: number }> = ({ data, color = '#0ea5e9', w = 60, h = 20 }) => {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
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

const Snowfall: React.FC = () => {
  const flakes = useRef(
    Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      size: 2 + Math.random() * 4,
      opacity: 0.15 + Math.random() * 0.35,
      drift: -20 + Math.random() * 40,
    }))
  ).current;
  return (
    <div className="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
      {flakes.map(f => (
        <div
          key={f.id}
          className="absolute rounded-full bg-arctic-200"
          style={{
            left: `${f.left}%`,
            top: '-8px',
            width: f.size,
            height: f.size,
            opacity: f.opacity,
            animation: `snowfall ${f.duration}s linear ${f.delay}s infinite`,
            '--drift': `${f.drift}px`,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const fmtUsd = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`;

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
    <div className="min-h-screen bg-gradient-to-b from-white via-ice-50/30 to-white relative">
      <Snowfall />

      {/* ═══════════ LIVE VIDEO HERO ═══════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: 'min(52vh, 520px)' }}>
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/15 to-white z-10" />

        {/* LIVE badge */}
        <div className="absolute top-5 left-5 z-30 flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
          </span>
          <span className="text-white text-xs font-bold tracking-wide">LIVE</span>
          <span className="text-white/40 text-xs">·</span>
          <span className="text-white/60 text-xs">Hudson Bay, Canada</span>
        </div>

        {/* Viewer count */}
        <div className="absolute top-5 right-5 z-30 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full">
          <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/70 text-xs">1,247 watching</span>
        </div>

        {/* Hero text */}
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
            Track donations. Vote on what matters. Watch conservation live.
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
              More Cams
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ TOKEN PRICES TICKER ═══════════ */}
      <section className="relative z-40 -mt-5">
        <FadeIn>
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-lg border border-ice-100 overflow-hidden">
              <div className="flex items-center gap-1 px-4 py-2 border-b border-ice-50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ice-400">Impact Scores</span>
                <div className="flex-1" />
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-[10px] text-ice-400">Live</span>
                </div>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-ice-50">
                {TOKENS.map(t => (
                  <Link key={t.ticker} to={`/charity/${t.ticker.toLowerCase()}`} className="px-3 py-3 hover:bg-ice-50/50 transition-colors group">
                    <div className="flex items-center gap-2 mb-1.5">
                      <img src={t.logo} alt={t.name} className="w-5 h-5 rounded-full object-cover flex-shrink-0" />
                      <span className="text-xs font-bold text-ice-800 group-hover:text-arctic-600 transition-colors">{t.ticker}</span>
                      <span className={`text-[10px] font-bold tabular-nums ml-auto ${t.change >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {t.change >= 0 ? '+' : ''}{t.change.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex items-end justify-between gap-1">
                      <div>
                        <div className="text-sm font-bold tabular-nums text-ice-900">{t.score.toFixed(1)}</div>
                        <div className="text-[9px] text-ice-400 tabular-nums">{fmtUsd(t.volume)} vol</div>
                      </div>
                      <MiniSparkline data={t.sparkline} color={t.change >= 5 ? '#22c55e' : '#0ea5e9'} w={48} h={18} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ STATS ROW ═══════════ */}
      <section className="relative z-30 pt-6 px-4 sm:px-6">
        <FadeIn delay={0.05}>
          <div className="max-w-[1200px] mx-auto">
            {isConnected && (
              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-ice-100 px-5 py-3 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-arctic-500 to-arctic-600 flex items-center justify-center text-lg shadow-sm">
                    🐻‍❄️
                  </div>
                  <div>
                    <div className="font-bold text-sm text-ice-900">{user?.username || 'Explorer'}</div>
                    <div className="text-[11px] text-ice-400">Level {userLevel}</div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-ice-400">XP Progress</span>
                    <span className="tabular-nums text-arctic-600 font-medium">{xpProg.currentProgress}/{xpProg.totalNeeded}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden bg-ice-100">
                    <div className="h-full rounded-full bg-gradient-to-r from-arctic-400 to-arctic-600 transition-all" style={{ width: `${Math.min(100, xpProg.percentage)}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-5 flex-shrink-0">
                  {[
                    { label: 'Coins', val: user?.coins || 0, icon: '🪙' },
                    { label: 'Streak', val: `${user?.donationStreak || 0}d`, icon: '🔥' },
                  ].map(s => (
                    <div key={s.label} className="text-center">
                      <div className="text-sm font-bold text-ice-900 tabular-nums">{s.icon} {s.val}</div>
                      <div className="text-[9px] text-ice-400 uppercase tracking-wider">{s.label}</div>
                    </div>
                  ))}
                </div>
                <Link to="/dashboard" className="flex-shrink-0 px-4 py-1.5 bg-arctic-600 text-white rounded-full text-xs font-semibold hover:bg-arctic-700 transition-colors">
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ MAIN CONTENT ═══════════ */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-6 relative z-10">

        {/* ── Mission Map ── */}
        <FadeIn delay={0.08}>
          <div className="rounded-2xl overflow-hidden border border-ice-100 shadow-sm bg-white">
            <div className="relative" style={{ height: 'min(40vh, 360px)' }}>
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
                <TileLayer url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" />
                {MAP_PINS.map((pin, i) => (
                  <CircleMarker
                    key={i}
                    center={[pin.lat, pin.lng]}
                    radius={8}
                    pathOptions={{ color: MAP_STATUS_COLORS[pin.status], fillColor: MAP_STATUS_COLORS[pin.status], fillOpacity: 0.35, weight: 2, opacity: 0.7 }}
                  >
                    <Tooltip permanent direction="top" offset={[0, -10]} className="leaflet-tooltip-snow">
                      <span className="text-[10px] font-semibold">{pin.label}</span>
                    </Tooltip>
                  </CircleMarker>
                ))}
              </MapContainer>

              {/* Legend */}
              <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm border border-ice-100 space-y-1.5">
                {[
                  { label: 'Active', color: '#22c55e' },
                  { label: 'Voting', color: '#3b82f6' },
                  { label: 'Funded', color: '#a855f7' },
                ].map(s => (
                  <div key={s.label} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-[10px] text-ice-500 font-medium">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Bottom info */}
              <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-white via-white/90 to-transparent p-4">
                <div className="flex items-end justify-between">
                  <div>
                    <div className="text-ice-400 text-[10px] font-medium uppercase tracking-wider mb-0.5">Real-time tracking</div>
                    <div className="text-ice-900 font-bold text-base">5 active missions across the Arctic</div>
                  </div>
                  <Link to="/map" className="flex items-center gap-1.5 px-3 py-1.5 bg-ice-100 hover:bg-ice-200 text-ice-700 text-xs font-semibold rounded-full transition-colors">
                    Open Map
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* ── Trending Charities ── */}
        <FadeIn delay={0.1}>
          <div className="bg-white rounded-2xl overflow-hidden border border-ice-100 shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-ice-50">
              <h2 className="font-bold text-sm text-ice-900">Trending Charities</h2>
              <Link to="/donate" className="text-[11px] font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">View all</Link>
            </div>
            <div>
              {CHARITIES.map((c, i) => (
                <Link key={c.id} to={`/charity/${c.id}`}
                  className="flex items-center gap-3 px-5 py-2.5 border-b border-ice-50 last:border-0 hover:bg-ice-50/50 transition-colors group">
                  <span className="text-xs font-bold w-5 tabular-nums text-ice-300">{i + 1}</span>
                  <img src={c.logo} alt={c.name} className="w-8 h-8 rounded-full object-cover border border-ice-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-600 transition-colors">{c.name}</div>
                    <div className="text-[11px] text-ice-400 truncate">{c.desc}</div>
                  </div>
                  <div className="hidden sm:block flex-shrink-0">
                    <MiniSparkline data={c.sparkline} color={c.change > 20 ? '#22c55e' : '#0ea5e9'} w={64} h={20} />
                  </div>
                  <span className="text-xs font-bold text-green-600 tabular-nums flex-shrink-0 w-12 text-right">+{c.change}%</span>
                  <span className="hidden md:block text-xs font-semibold text-ice-700 tabular-nums flex-shrink-0 w-16 text-right">{c.raised}</span>
                  <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFollowed(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }}
                    className={`flex-shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${followed.has(c.id) ? 'bg-arctic-50 text-arctic-600 ring-1 ring-arctic-200' : 'bg-ice-100 text-ice-500 hover:bg-arctic-50 hover:text-arctic-600'}`}>
                    {followed.has(c.id) ? 'Following' : 'Follow'}
                  </button>
                </Link>
              ))}
            </div>
          </div>
        </FadeIn>

        {/* ── Missions + Governance ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Missions */}
          <FadeIn delay={0.12}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ice-50">
                <h2 className="font-bold text-sm text-ice-900">Active Missions</h2>
                <Link to="/map" className="text-[11px] font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">Map</Link>
              </div>
              <div className="p-4 space-y-2.5">
                {MISSIONS.map(m => {
                  const pct = Math.round((m.raised / m.goal) * 100);
                  return (
                    <Link key={m.id} to="/vote" className="flex items-center gap-3 p-2.5 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all group">
                      <img src={m.logo} alt={m.charity} className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-ice-100" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-ice-900 truncate group-hover:text-arctic-600 transition-colors">{m.name}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 border ${STATUS_PILL[m.status]}`}>{m.status}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full overflow-hidden bg-ice-100">
                            <div className="h-full rounded-full bg-gradient-to-r from-arctic-400 to-arctic-600" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums text-ice-500">{pct}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Governance */}
          <FadeIn delay={0.14}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full">
              <div className="flex items-center justify-between px-5 py-3 border-b border-ice-50">
                <h2 className="font-bold text-sm text-ice-900">Governance</h2>
                <Link to="/vote" className="text-[11px] font-semibold text-arctic-600 hover:text-arctic-700 transition-colors">All proposals</Link>
              </div>
              <div className="p-4 space-y-2.5">
                {PROPOSALS.map(p => (
                  <Link key={p.id} to="/vote" className="block p-2.5 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-xs font-semibold text-ice-900">{p.title}</span>
                      <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 border ${p.status === 'passed' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-arctic-50 text-arctic-600 border-arctic-100'}`}>
                        {p.status === 'passed' ? 'Passed' : 'Active'}
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden flex mb-1.5 bg-ice-100">
                      <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${p.forPct}%` }} />
                      <div className="h-full bg-ice-200 rounded-r-full" style={{ width: `${100 - p.forPct}%` }} />
                    </div>
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-green-600 font-semibold">{p.forPct}% in favor</span>
                      <span className="text-ice-400">{p.votes} votes</span>
                      <span className={`font-semibold ${p.status === 'passed' ? 'text-green-600' : 'text-ice-400'}`}>{p.status === 'passed' ? 'Completed' : p.ends}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>

        {/* ── Live Activity ── */}
        <FadeIn delay={0.16}>
          <div className="bg-white rounded-2xl border border-ice-100 shadow-sm">
            <div className="px-5 py-3 border-b border-ice-50">
              <h2 className="font-bold text-sm text-ice-900 flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                Live Activity
              </h2>
            </div>
            <div className="px-5 py-3 flex flex-wrap gap-x-6 gap-y-2">
              {ACTIVITY.map((a, i) => (
                <motion.div key={a.id} initial={{ opacity: 0, x: -4 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.04 }}
                  className="flex items-center gap-2 py-1">
                  <span className="text-xs flex-shrink-0">{a.icon}</span>
                  <span className="text-xs text-ice-500"><span className="font-semibold text-ice-700">{a.user}</span> {a.detail}</span>
                  <span className="text-[10px] text-ice-300">{a.time}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </FadeIn>

      </div>
    </div>
  );
};

export default HomePage;

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import arcticPoster from '@/assets/arctic-video-poster.jpg.jpg.png';

import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// ─── DATA ───

const TYPING_WORDS = ['polar bears', 'arctic foxes', 'whales', 'seals', 'caribou', 'snowy owls', 'walruses'];

const MOCK_TRENDING = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, sparkline: [12, 15, 13, 18, 22, 19, 25, 28, 24, 30, 27, 35], followers: 2847, weeklyChange: 23, raised: '$154,200', description: 'Dedicated to wild polar bears and the sea ice they depend on' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, sparkline: [20, 22, 21, 24, 23, 26, 28, 27, 30, 29, 32, 34], followers: 4102, weeklyChange: 12, raised: '$185,400', description: 'Building a future where people live in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, sparkline: [8, 10, 12, 11, 15, 18, 17, 20, 22, 24, 23, 28], followers: 3291, weeklyChange: 18, raised: '$141,800', description: 'Campaigning to end environmental destruction worldwide' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, sparkline: [5, 8, 7, 12, 15, 14, 20, 22, 25, 28, 30, 35], followers: 1856, weeklyChange: 31, raised: '$98,500', description: "Protecting the ocean from today's greatest challenges" },
  { id: 'the-nature-conservancy', name: 'The Nature Conservancy', logo: natureConservancyLogo, sparkline: [18, 19, 20, 19, 21, 22, 23, 22, 24, 25, 26, 27], followers: 2134, weeklyChange: 8, raised: '$85,200', description: 'Conserving the lands and waters on which all life depends' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, sparkline: [10, 12, 14, 13, 16, 18, 20, 19, 22, 24, 26, 28], followers: 1678, weeklyChange: 15, raised: '$115,600', description: 'Spotlight on nature as a source of climate solutions' },
];

const MOCK_ACTIVITY = [
  { id: 1, type: 'donation' as const, user: 'arctic_whale', detail: 'donated $250 to PBI', time: '2m ago' },
  { id: 2, type: 'vote' as const, user: 'icekeeper', detail: 'voted on Arctic Research', time: '5m ago' },
  { id: 3, type: 'donation' as const, user: 'snow_leopard', detail: 'donated $1,000 to WWF', time: '8m ago' },
  { id: 4, type: 'follow' as const, user: 'northern_lights', detail: 'followed Ocean Conservancy', time: '12m ago' },
  { id: 5, type: 'donation' as const, user: 'tundra_fox', detail: 'donated $75 to Greenpeace', time: '15m ago' },
  { id: 6, type: 'proposal' as const, user: 'glacier_guard', detail: 'proposed Svalbard expansion', time: '22m ago' },
];

const MOCK_MISSIONS = [
  { id: 'm1', name: 'Arctic Research Station', charity: 'Polar Bears International', charityLogo: pbiLogo, fundingGoal: 50000, fundingReceived: 34200, status: 'active' as const, description: 'Year-round monitoring of polar bear populations' },
  { id: 'm2', name: 'Marine Conservation Svalbard', charity: 'WWF', charityLogo: wwfLogo, fundingGoal: 75000, fundingReceived: 52100, status: 'voting' as const, description: 'Protecting marine ecosystems in the Arctic' },
  { id: 'm3', name: 'Rainforest Protection', charity: 'Greenpeace', charityLogo: greenpeaceLogo, fundingGoal: 40000, fundingReceived: 40000, status: 'funded' as const, description: 'Defending ancient forests from destruction' },
  { id: 'm4', name: 'Chukchi Sea Patrol', charity: 'Ocean Conservancy', charityLogo: oceanConservancyLogo, fundingGoal: 60000, fundingReceived: 18500, status: 'active' as const, description: 'Anti-poaching coverage for arctic waters' },
];

const MOCK_PROPOSALS = [
  { id: 'p1', title: 'Fund Marine Conservation', votesFor: 450, votesAgainst: 120, votingEnds: '2d 14h', status: 'active' as const, description: 'Protect marine ecosystems around the Svalbard archipelago' },
  { id: 'p2', title: 'Expand Arctic Research', votesFor: 380, votesAgainst: 90, votingEnds: '4d 8h', status: 'active' as const, description: 'Establish 3 new monitoring stations along Hudson Bay' },
  { id: 'p3', title: 'Rainforest Initiative', votesFor: 520, votesAgainst: 80, votingEnds: 'Ended', status: 'passed' as const, description: 'Allocate funds for rapid-response rainforest teams' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'GlacierGuard', initials: 'GG', total: '$12,450', donations: 47, streak: 21 },
  { rank: 2, name: 'ArcticPhoenix', initials: 'AP', total: '$9,820', donations: 34, streak: 14 },
  { rank: 3, name: 'NorthernStar', initials: 'NS', total: '$8,340', donations: 62, streak: 31 },
  { rank: 4, name: 'IcebergAlpha', initials: 'IA', total: '$6,190', donations: 28, streak: 9 },
  { rank: 5, name: 'PolarVortex', initials: 'PV', total: '$4,750', donations: 19, streak: 7 },
];

const MAP_PINS = [
  { lat: 58.7, lng: -94.2, label: 'Hudson Bay', status: 'active' as const },
  { lat: 78.2, lng: 15.6, label: 'Svalbard', status: 'voting' as const },
  { lat: 68.0, lng: -170.0, label: 'Chukchi Sea', status: 'active' as const },
  { lat: 71.0, lng: -155.0, label: 'Beaufort Sea', status: 'funded' as const },
  { lat: 72.5, lng: -40.0, label: 'Greenland', status: 'active' as const },
  { lat: 64.0, lng: -150.0, label: 'Alaska', status: 'planned' as const },
];

const MAP_STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  voting: '#3b82f6',
  funded: '#a855f7',
  planned: '#6b7280',
};

const LIVE_CAMS = [
  { id: 'hudson', title: 'Hudson Bay', location: 'Manitoba, Canada', videoId: 'U9_Fdcp73Pc', viewers: 1247 },
  { id: 'wapusk', title: 'Wapusk National Park', location: 'Manitoba, Canada', videoId: 'ZGCCMkurNGc', viewers: 823 },
  { id: 'tundra', title: 'Tundra Buggy Lodge', location: 'Churchill, Canada', videoId: '4XzYvaDCv7s', viewers: 654 },
  { id: 'northern', title: 'Northern Lights Habitat', location: 'Alaska, USA', videoId: 'lyX7ZxWU64A', viewers: 432 },
];

const activityDot: Record<string, string> = {
  donation: 'bg-green-400',
  vote: 'bg-arctic-400',
  proposal: 'bg-purple-400',
  follow: 'bg-pink-400',
};

// ─── HELPERS ───

const FadeIn: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({ children, className = '', delay = 0 }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.05 });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay, ease: [0.25, 0.1, 0.25, 1] }} className={className}>
      {children}
    </motion.div>
  );
};

const Sparkline: React.FC<{ data: number[]; color?: string; width?: number; height?: number }> = ({ data, color = '#0ea5e9', width = 64, height = 24 }) => {
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * width, y: height - ((v - min) / range) * (height - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = `${d} L${width},${height} L0,${height} Z`;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs><linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.15} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={fillD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Counter: React.FC<{ end: number; prefix?: string }> = ({ end, prefix = '' }) => {
  const [count, setCount] = useState(0);
  const [ref, inView] = useInView({ triggerOnce: true });
  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const frames = 60;
    const timer = setInterval(() => {
      frame++;
      const eased = 1 - Math.pow(1 - frame / frames, 3);
      if (frame >= frames) { setCount(end); clearInterval(timer); }
      else { setCount(Math.floor(end * eased)); }
    }, 25);
    return () => clearInterval(timer);
  }, [inView, end]);
  const fmt = count >= 1000000 ? `${(count / 1000000).toFixed(1)}M` : count >= 1000 ? `${(count / 1000).toFixed(1)}K` : count.toLocaleString();
  return <span ref={ref}>{prefix}{fmt}</span>;
};

const TypingText: React.FC = () => {
  const [wordIdx, setWordIdx] = useState(0);
  const [text, setText] = useState(TYPING_WORDS[0]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(true);

  useEffect(() => {
    const word = TYPING_WORDS[wordIdx];
    if (isPaused) {
      const t = setTimeout(() => { setIsPaused(false); setIsDeleting(true); }, wordIdx === 0 && text === TYPING_WORDS[0] ? 3000 : 2000);
      return () => clearTimeout(t);
    }
    if (!isDeleting && text === word) { setIsPaused(true); return; }
    const t = setTimeout(() => {
      if (!isDeleting) setText(word.slice(0, text.length + 1));
      else if (text.length > 0) setText(text.slice(0, -1));
      else { setIsDeleting(false); setWordIdx((p) => (p + 1) % TYPING_WORDS.length); }
    }, isDeleting ? 50 : 100);
    return () => clearTimeout(t);
  }, [text, isDeleting, isPaused, wordIdx]);

  return <span className="text-arctic-300">{text}<span className="animate-pulse text-arctic-400/60">|</span></span>;
};

// ─── PAGE ───

const HomePage: React.FC = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  return (
    <div className="bg-white min-h-screen">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative w-full overflow-hidden" style={{ height: 'min(52vh, 540px)' }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${arcticPoster})` }}>
          <iframe
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-opacity duration-[2000ms]"
            style={{ minWidth: '100%', minHeight: '100%', width: '1920px', height: '1080px', objectFit: 'cover', opacity: videoLoaded ? 1 : 0 }}
            src="https://www.youtube.com/embed/64ZaC04ppLQ?autoplay=1&mute=1&loop=1&playlist=64ZaC04ppLQ&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&iv_load_policy=3&disablekb=1&fs=0&origin=https://isbjorn.io"
            title="Arctic Video"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            onLoad={() => setTimeout(() => setVideoLoaded(true), 1500)}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-white z-10" />

        <div className="relative z-30 h-full flex flex-col items-center justify-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-center mb-5"
          >
            <span className="text-white drop-shadow-md">Protecting the <TypingText /></span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-base sm:text-lg text-white/60 text-center mb-8 max-w-2xl leading-relaxed font-light"
          >
            Every donation tracked on-chain. Your voice decides where funds go.
            Watch conservation happen live.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex items-center gap-5"
          >
            <Link to="/donate" className="px-7 py-3 bg-white text-ice-900 font-semibold text-sm rounded-full shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
              Explore Missions
            </Link>
            <Link to="/live" className="flex items-center gap-2.5 text-white/70 hover:text-white text-sm font-medium transition-colors duration-300">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
              </span>
              Watch Live
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ═══════════ IMPACT STATS ═══════════ */}
      <section className="relative z-40 -mt-6 px-6">
        <FadeIn>
          <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-10">
              {[
                { label: 'Total Donated', value: 1247000, prefix: '$' },
                { label: 'Active Donors', value: 8432 },
                { label: 'Charities Funded', value: 12 },
                { label: 'Votes Cast', value: 24500 },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold text-ice-900 tracking-tight">
                    <Counter end={stat.value} prefix={stat.prefix || ''} />
                  </div>
                  <div className="text-sm text-ice-400 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* ═══════════ MISSION MAP + LATEST UPDATES ═══════════ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-ice-900 tracking-tight mb-3">Active Missions</h2>
              <p className="text-base text-ice-400 max-w-xl mx-auto leading-relaxed">
                Every pin is a community-funded conservation project.
                Follow their progress in real time.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="rounded-3xl overflow-hidden shadow-lg border border-ice-100">
              {/* Map area */}
              <div className="relative" style={{ height: 'min(55vh, 520px)' }}>
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
                      pathOptions={{
                        color: MAP_STATUS_COLORS[pin.status],
                        fillColor: MAP_STATUS_COLORS[pin.status],
                        fillOpacity: 0.5,
                        weight: 2,
                        opacity: 0.8,
                      }}
                    >
                      <Tooltip permanent direction="top" offset={[0, -12]} className="leaflet-tooltip-custom">
                        <span className="text-[10px] font-semibold">{pin.label}</span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/30 z-10 pointer-events-none" />

                {/* Legend */}
                <div className="absolute top-5 left-5 z-20 bg-black/40 backdrop-blur-xl rounded-2xl px-4 py-3 space-y-2">
                  {[
                    { label: 'Active', color: '#22c55e', count: 3 },
                    { label: 'Voting', color: '#3b82f6', count: 1 },
                    { label: 'Funded', color: '#a855f7', count: 1 },
                    { label: 'Planned', color: '#6b7280', count: 1 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-[11px] text-white/70 font-medium">{s.label}</span>
                      <span className="text-[11px] text-white/30 ml-auto tabular-nums pl-3">{s.count}</span>
                    </div>
                  ))}
                </div>

                {/* Latest Updates overlay panel */}
                <div className="absolute top-5 right-5 bottom-20 z-20 w-64 hidden lg:flex flex-col">
                  <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 flex-1 overflow-hidden flex flex-col">
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-white/10">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                      </span>
                      <span className="text-[11px] text-white/60 font-semibold uppercase tracking-wider">Latest Updates</span>
                    </div>
                    <div className="space-y-2.5 overflow-y-auto flex-1 homepage-scroll">
                      {MOCK_ACTIVITY.map((a, i) => (
                        <motion.div
                          key={a.id}
                          initial={{ opacity: 0, x: 8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 + i * 0.08, duration: 0.4 }}
                          className="flex items-start gap-2"
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${activityDot[a.type]}`} />
                          <div className="min-w-0">
                            <p className="text-[11px] text-white/80 leading-relaxed">
                              <span className="font-semibold text-white/90">{a.user}</span>{' '}{a.detail}
                            </p>
                            <p className="text-[10px] text-white/30 mt-0.5">{a.time}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Bottom bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-white/40 text-xs font-medium uppercase tracking-wider mb-1">Real-time tracking</div>
                      <div className="text-white font-bold text-xl sm:text-2xl">6 missions across the Arctic</div>
                    </div>
                    <Link to="/map" className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium rounded-full hover:bg-white/20 transition-all duration-300">
                      Open Full Map
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mission cards row */}
              <div className="bg-ice-50/80 border-t border-ice-100 p-5 sm:p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {MOCK_MISSIONS.map((m) => {
                    const pct = Math.min(100, Math.round((m.fundingReceived / m.fundingGoal) * 100));
                    const statusStyle: Record<string, string> = {
                      active: 'bg-green-50 text-green-600 border-green-100',
                      voting: 'bg-blue-50 text-blue-600 border-blue-100',
                      funded: 'bg-purple-50 text-purple-600 border-purple-100',
                    };
                    return (
                      <Link key={m.id} to="/vote" className="bg-white rounded-2xl p-4 border border-ice-100 hover:shadow-md hover:border-ice-200 transition-all duration-300 group">
                        <div className="flex items-center gap-2 mb-3">
                          <img src={m.charityLogo} alt={m.charity} className="w-6 h-6 rounded-full object-cover" />
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${statusStyle[m.status]}`}>{m.status}</span>
                        </div>
                        <h4 className="text-sm font-semibold text-ice-900 mb-1 group-hover:text-arctic-700 transition-colors">{m.name}</h4>
                        <p className="text-xs text-ice-400 mb-3 leading-relaxed line-clamp-2">{m.description}</p>
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="flex-1 h-1.5 bg-ice-100 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-arctic-400 to-arctic-500 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[11px] font-semibold text-ice-500 tabular-nums">{pct}%</span>
                        </div>
                        <div className="text-[11px] text-ice-400">${(m.fundingReceived / 1000).toFixed(1)}k of ${(m.fundingGoal / 1000).toFixed(0)}k</div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ LIVE NOW ═══════════ */}
      <section className="bg-ice-950 py-16 sm:py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="flex items-center gap-3 mb-3">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">Live Now</h2>
            </div>
            <p className="text-base text-ice-500 mb-10 max-w-xl leading-relaxed">
              Polar bears, arctic wildlife, and northern lights — streaming live from cameras across the Arctic.
            </p>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Featured cam */}
              <div className="lg:col-span-2">
                <Link to="/live" className="block group">
                  <div className="relative rounded-2xl overflow-hidden aspect-video bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${LIVE_CAMS[0].videoId}?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                      title={LIVE_CAMS[0].title}
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      frameBorder="0"
                      allow="accelerometer; encrypted-media"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                    <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                      <span className="text-white text-[10px] font-bold tracking-wide">LIVE</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 z-20 p-5">
                      <div className="text-white font-bold text-lg group-hover:text-arctic-300 transition-colors">{LIVE_CAMS[0].title}</div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-white/50 text-sm">{LIVE_CAMS[0].location}</span>
                        <span className="text-white/30">·</span>
                        <span className="flex items-center gap-1.5 text-white/50 text-sm">
                          <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                          {LIVE_CAMS[0].viewers.toLocaleString()} watching
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>

              {/* Side cams */}
              <div className="flex flex-col gap-4">
                {LIVE_CAMS.slice(1).map((cam) => (
                  <Link key={cam.id} to="/live" className="block group flex-1">
                    <div className="relative rounded-2xl overflow-hidden h-full min-h-[120px] bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${cam.videoId}?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0`}
                        title={cam.title}
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        frameBorder="0"
                        allow="accelerometer; encrypted-media"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-10" />
                      <div className="absolute top-2.5 left-2.5 z-20 flex items-center gap-1 bg-red-500/80 backdrop-blur-sm px-2 py-0.5 rounded-full">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse" />
                        <span className="text-white text-[9px] font-bold">LIVE</span>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
                        <div className="text-white font-semibold text-sm group-hover:text-arctic-300 transition-colors">{cam.title}</div>
                        <div className="flex items-center gap-1.5 text-white/40 text-xs mt-0.5">
                          <div className="w-1 h-1 bg-green-400 rounded-full" />
                          {cam.viewers.toLocaleString()} watching
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ TRENDING CHARITIES ═══════════ */}
      <section className="py-16 sm:py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold text-ice-900 tracking-tight mb-3">Trending</h2>
                <p className="text-base text-ice-400 max-w-lg leading-relaxed">
                  The organizations making the biggest impact this week, ranked by community support.
                </p>
              </div>
              <Link to="/donate" className="hidden sm:flex items-center gap-1.5 text-sm text-arctic-600 font-medium hover:text-arctic-700 transition-colors">
                View all
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {MOCK_TRENDING.map((c, i) => (
                <Link key={c.id} to={`/charity/${c.id}`} className="group bg-white rounded-2xl border border-ice-100 p-5 hover:shadow-lg hover:border-ice-200 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-4">
                    <img src={c.logo} alt={c.name} className="w-11 h-11 rounded-full object-cover border border-ice-100" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-700 transition-colors">{c.name}</h3>
                      <p className="text-xs text-ice-400 truncate">{c.description}</p>
                    </div>
                    <span className="text-xs font-semibold text-ice-300 tabular-nums">#{i + 1}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="text-sm font-bold text-ice-900">{c.raised}</div>
                        <div className="text-[11px] text-ice-400">raised</div>
                      </div>
                      <div className="w-px h-8 bg-ice-100" />
                      <div>
                        <div className="text-sm font-bold text-ice-900">{c.followers.toLocaleString()}</div>
                        <div className="text-[11px] text-ice-400">followers</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Sparkline data={c.sparkline} color={c.weeklyChange > 20 ? '#22c55e' : '#0ea5e9'} />
                      <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">+{c.weeklyChange}%</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ═══════════ COMMUNITY ═══════════ */}
      <section className="bg-ice-50 py-16 sm:py-20 px-6">
        <div className="max-w-[1400px] mx-auto">
          <FadeIn>
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-ice-900 tracking-tight mb-3">Your Voice Matters</h2>
              <p className="text-base text-ice-400 max-w-xl mx-auto leading-relaxed">
                Every donor gets a vote. Help decide which conservation missions receive funding next.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Governance */}
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-2xl border border-ice-100 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-ice-900">Active Proposals</h3>
                  <Link to="/vote" className="text-sm text-arctic-600 font-medium hover:text-arctic-700 transition-colors">All proposals</Link>
                </div>
                <div className="space-y-3">
                  {MOCK_PROPOSALS.map((p) => {
                    const total = p.votesFor + p.votesAgainst;
                    const forPct = total > 0 ? Math.round((p.votesFor / total) * 100) : 0;
                    return (
                      <Link key={p.id} to="/vote" className="block p-4 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-sm transition-all duration-300">
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <h4 className="text-sm font-semibold text-ice-900">{p.title}</h4>
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === 'passed' ? 'bg-green-50 text-green-600' : 'bg-arctic-50 text-arctic-600'}`}>
                            {p.status === 'passed' ? 'Passed' : 'Active'}
                          </span>
                        </div>
                        <p className="text-xs text-ice-400 mb-3 line-clamp-1">{p.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-ice-100 rounded-full overflow-hidden flex">
                            <div className="h-full bg-green-400 rounded-l-full" style={{ width: `${forPct}%` }} />
                            <div className="h-full bg-ice-200 rounded-r-full" style={{ width: `${100 - forPct}%` }} />
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-green-600 font-semibold">{forPct}% in favor</span>
                          <span className="text-ice-400">{total.toLocaleString()} votes · {p.status === 'passed' ? 'Completed' : p.votingEnds}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Leaderboard */}
            <FadeIn delay={0.15}>
              <div className="bg-white rounded-2xl border border-ice-100 p-6 h-full">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-ice-900">Top Contributors</h3>
                  <span className="text-xs text-ice-400 font-medium">This month</span>
                </div>
                <div className="space-y-1">
                  {MOCK_LEADERBOARD.map((d) => {
                    const medals = ['', 'bg-gradient-to-br from-amber-300 to-amber-500', 'bg-gradient-to-br from-gray-300 to-gray-400', 'bg-gradient-to-br from-amber-600 to-amber-700'];
                    return (
                      <div key={d.rank} className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-ice-50 transition-colors">
                        {d.rank <= 3 ? (
                          <div className={`w-8 h-8 rounded-full ${medals[d.rank]} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>{d.rank}</div>
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-ice-100 flex items-center justify-center text-ice-400 text-xs font-bold flex-shrink-0">{d.rank}</div>
                        )}
                        <div className="w-9 h-9 rounded-full bg-arctic-50 flex items-center justify-center text-arctic-600 text-xs font-bold flex-shrink-0 border border-arctic-100">{d.initials}</div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-ice-900">{d.name}</div>
                          <div className="text-xs text-ice-400">{d.donations} donations</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-bold text-ice-800">{d.total}</div>
                          <div className="text-[11px] text-ice-400">{d.streak}d streak</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

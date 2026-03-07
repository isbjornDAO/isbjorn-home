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

// Charity logos
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import natureConservancyLogo from '@/assets/logos/nature-conservancy.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// ─── MOCK DATA ───

const MOCK_TRENDING = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, category: 'Climate', sparkline: [12, 15, 13, 18, 22, 19, 25, 28, 24, 30, 27, 35], followers: 2847, weeklyChange: 23, raised: '$154,200', description: 'Dedicated to wild polar bears and the sea ice they depend on' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, category: 'Conservation', sparkline: [20, 22, 21, 24, 23, 26, 28, 27, 30, 29, 32, 34], followers: 4102, weeklyChange: 12, raised: '$185,400', description: 'Building a future in which people live in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment', sparkline: [8, 10, 12, 11, 15, 18, 17, 20, 22, 24, 23, 28], followers: 3291, weeklyChange: 18, raised: '$141,800', description: 'Campaigning to end environmental destruction worldwide' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean', sparkline: [5, 8, 7, 12, 15, 14, 20, 22, 25, 28, 30, 35], followers: 1856, weeklyChange: 31, raised: '$98,500', description: 'Protecting the ocean from today\'s greatest challenges' },
  { id: 'the-nature-conservancy', name: 'The Nature Conservancy', logo: natureConservancyLogo, category: 'Conservation', sparkline: [18, 19, 20, 19, 21, 22, 23, 22, 24, 25, 26, 27], followers: 2134, weeklyChange: 8, raised: '$85,200', description: 'Conserving the lands and waters on which all life depends' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, category: 'Conservation', sparkline: [10, 12, 14, 13, 16, 18, 20, 19, 22, 24, 26, 28], followers: 1678, weeklyChange: 15, raised: '$115,600', description: 'Spotlight on nature as a source of climate solutions' },
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
  { id: 'm1', name: 'Arctic Research Station Expansion', charity: 'Polar Bears International', charityLogo: pbiLogo, fundingGoal: 50000, fundingReceived: 34200, status: 'active' as const, description: 'Year-round monitoring of polar bear populations and migration' },
  { id: 'm2', name: 'Marine Conservation Svalbard', charity: 'WWF', charityLogo: wwfLogo, fundingGoal: 75000, fundingReceived: 52100, status: 'voting' as const, description: 'Protecting marine ecosystems around the Svalbard archipelago' },
  { id: 'm3', name: 'Rainforest Protection Initiative', charity: 'Greenpeace', charityLogo: greenpeaceLogo, fundingGoal: 40000, fundingReceived: 40000, status: 'funded' as const, description: 'Defending ancient forests from industrial destruction' },
  { id: 'm4', name: 'Chukchi Sea Patrol', charity: 'Ocean Conservancy', charityLogo: oceanConservancyLogo, fundingGoal: 60000, fundingReceived: 18500, status: 'active' as const, description: 'Anti-poaching patrol coverage for critical arctic waters' },
];

const MOCK_PROPOSALS = [
  { id: 'p1', title: 'Fund Marine Conservation Project', proposer: 'WWF', votesFor: 450, votesAgainst: 120, votingEnds: '2d 14h', status: 'active' as const, description: 'Protect marine ecosystems around the Svalbard archipelago' },
  { id: 'p2', title: 'Expand Arctic Research Stations', proposer: 'NRDC', votesFor: 380, votesAgainst: 90, votingEnds: '4d 8h', status: 'active' as const, description: 'Establish 3 new monitoring stations along Hudson Bay' },
  { id: 'p3', title: 'Rainforest Protection Initiative', proposer: 'Greenpeace', votesFor: 520, votesAgainst: 80, votingEnds: 'Ended', status: 'passed' as const, description: 'Allocate funds for rapid-response teams protecting old-growth rainforests' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, name: 'GlacierGuard', initials: 'GG', total: '$12,450', donations: 47, streak: 21 },
  { rank: 2, name: 'ArcticPhoenix', initials: 'AP', total: '$9,820', donations: 34, streak: 14 },
  { rank: 3, name: 'NorthernStar', initials: 'NS', total: '$8,340', donations: 62, streak: 31 },
  { rank: 4, name: 'IcebergAlpha', initials: 'IA', total: '$6,190', donations: 28, streak: 9 },
  { rank: 5, name: 'PolarVortex', initials: 'PV', total: '$4,750', donations: 19, streak: 7 },
];

const MAP_PINS = [
  { lat: 58.7, lng: -94.2, label: 'Hudson Bay', status: 'active' as const, charity: 'PBI' },
  { lat: 78.2, lng: 15.6, label: 'Svalbard', status: 'voting' as const, charity: 'WWF' },
  { lat: 68.0, lng: -170.0, label: 'Chukchi Sea', status: 'active' as const, charity: 'Greenpeace' },
  { lat: 71.0, lng: -155.0, label: 'Beaufort Sea', status: 'funded' as const, charity: 'Ocean Conservancy' },
  { lat: 72.5, lng: -40.0, label: 'Greenland', status: 'active' as const, charity: 'Conservation Intl' },
  { lat: 64.0, lng: -150.0, label: 'Alaska', status: 'planned' as const, charity: 'Sierra Club' },
];

const MAP_STATUS_COLORS: Record<string, string> = {
  active: '#22c55e',
  voting: '#3b82f6',
  funded: '#a855f7',
  planned: '#6b7280',
};

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

const Sparkline: React.FC<{ data: number[]; color?: string; className?: string; width?: number; height?: number }> = ({ data, color = '#0ea5e9', className = '', width = 80, height = 28 }) => {
  const w = width, h = height;
  const max = Math.max(...data), min = Math.min(...data), range = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / range) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const fillD = `${d} L${w},${h} L0,${h} Z`;
  return (
    <svg width={w} height={h} className={className} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={`sg-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.2} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={fillD} fill={`url(#sg-${color.replace('#', '')})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

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

const activityConfig = {
  donation: { bg: 'bg-green-500/10', icon: '💚' },
  vote: { bg: 'bg-arctic-500/10', icon: '🗳️' },
  proposal: { bg: 'bg-purple-500/10', icon: '📝' },
  follow: { bg: 'bg-pink-500/10', icon: '⭐' },
};

const rankColors = ['', 'from-yellow-400 to-amber-500', 'from-gray-300 to-gray-400', 'from-amber-600 to-amber-700'];

const SectionHeader: React.FC<{ icon: string; title: string; linkTo?: string; linkText?: string; subtitle?: string }> = ({ icon, title, linkTo, linkText, subtitle }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-ice-900 flex items-center gap-2">
        <span className="text-xl">{icon}</span> {title}
      </h2>
      {subtitle && <p className="text-xs text-ice-400 mt-0.5 ml-8">{subtitle}</p>}
    </div>
    {linkTo && (
      <Link to={linkTo} className="text-xs text-arctic-600 font-semibold hover:text-arctic-700 transition-colors flex items-center gap-1">
        {linkText || 'View all'} <span className="text-sm">→</span>
      </Link>
    )}
  </div>
);

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

  // XP progress for connected users (telescope-style)
  const userXp = user?.xp || 0;
  const userLevel = user?.level || calculateLevel(userXp);
  const xpProgress = getXpProgress(userXp);

  return (
    <div className="relative bg-ice-50 min-h-screen">

      {/* ═══════════════════ HERO ═══════════════════ */}
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

      {/* ═══════════════════ STATS BAR ═══════════════════ */}
      <div className="relative -mt-6 z-40 px-4 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="max-w-[1440px] mx-auto bg-white rounded-2xl shadow-lg border border-ice-100 px-8 py-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
              {[
                { label: 'Total Donated', value: 1247000, prefix: '$', icon: '💰' },
                { label: 'Active Donors', value: 8432, icon: '👥' },
                { label: 'Charities Funded', value: 12, icon: '🏛️' },
                { label: 'Votes Cast', value: 24500, icon: '🗳️' },
              ].map((stat) => (
                <div key={stat.label} className="text-center py-1">
                  <div className="text-2xl sm:text-3xl font-black text-ice-900 tracking-tight">
                    <Counter end={stat.value} prefix={stat.prefix || ''} />
                  </div>
                  <div className="text-xs text-ice-400 font-medium mt-1 flex items-center justify-center gap-1.5">
                    <span>{stat.icon}</span> {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>

      {/* ═══════════════════ DASHBOARD ═══════════════════ */}
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12">

        {/*
          SECTION 1: "Your World" — Map + Profile
          WHY: The map IS the product identity (missions on a globe).
          The profile/CTA sits beside it so users immediately see their personal context.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Climate Map — 8 cols — the centrepiece */}
          <FadeIn className="lg:col-span-8" delay={0.05}>
            <Link to="/map" className="block rounded-2xl border border-ice-100 shadow-sm overflow-hidden h-full group relative">
              <div className="relative min-h-[380px] lg:min-h-[440px]">
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
                  className="z-0"
                >
                  <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                  {MAP_PINS.map((pin, i) => (
                    <CircleMarker
                      key={i}
                      center={[pin.lat, pin.lng]}
                      radius={8}
                      pathOptions={{
                        color: MAP_STATUS_COLORS[pin.status],
                        fillColor: MAP_STATUS_COLORS[pin.status],
                        fillOpacity: 0.6,
                        weight: 2,
                        opacity: 0.9,
                      }}
                    >
                      <Tooltip permanent direction="top" offset={[0, -10]} className="leaflet-tooltip-custom">
                        <span className="text-[10px] font-bold">{pin.label}</span>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 z-10 pointer-events-none" />

                {/* Legend — top left */}
                <div className="absolute top-4 left-4 z-20 bg-black/50 backdrop-blur-sm rounded-xl px-3 py-2.5 space-y-1.5">
                  {[
                    { label: 'Active', color: '#22c55e', count: 3 },
                    { label: 'Voting', color: '#3b82f6', count: 1 },
                    { label: 'Funded', color: '#a855f7', count: 1 },
                    { label: 'Planned', color: '#6b7280', count: 1 },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-[10px] text-white/80 font-medium">{s.label}</span>
                      <span className="text-[10px] text-white/40 ml-auto tabular-nums">{s.count}</span>
                    </div>
                  ))}
                </div>

                {/* CTA badge — top right */}
                <div className="absolute top-4 right-4 z-20 bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full">
                  <span className="text-white text-xs font-semibold group-hover:text-arctic-200 transition-colors">Explore Map →</span>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 z-20 p-5 sm:p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-white font-bold text-xl sm:text-2xl group-hover:text-arctic-300 transition-colors mb-1">Climate Mission Map</div>
                      <div className="text-white/60 text-sm">6 active missions across the Arctic · Real-time tracking</div>
                    </div>
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-white font-bold text-xl">6</div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider">Missions</div>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-white font-bold text-xl">3</div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider">Countries</div>
                      </div>
                      <div className="w-px h-8 bg-white/20" />
                      <div className="text-center">
                        <div className="text-white font-bold text-xl">$350K</div>
                        <div className="text-white/40 text-[10px] uppercase tracking-wider">Deployed</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </FadeIn>

          {/* Profile / Join CTA — 4 cols — sits alongside the map */}
          <FadeIn className="lg:col-span-4" delay={0.1}>
            {isConnected ? (
              /* ── CONNECTED: Telescope-style XP Profile Card ── */
              <div className="bg-white rounded-2xl border border-ice-100 shadow-sm h-full flex flex-col">
                {/* Header with gradient banner */}
                <div className="bg-gradient-to-r from-arctic-600 via-arctic-500 to-polar-600 rounded-t-2xl p-5 pb-12 relative">
                  <div className="flex items-center justify-between">
                    <div className="text-white/70 text-xs font-semibold uppercase tracking-wider">Your Profile</div>
                    <Link to="/profile" className="text-white/60 text-xs hover:text-white/90 transition-colors">Edit →</Link>
                  </div>
                </div>

                {/* Avatar + name — overlaps banner */}
                <div className="px-5 -mt-8 relative z-10">
                  <div className="flex items-end gap-3 mb-4">
                    <div className="w-16 h-16 rounded-xl bg-white shadow-lg border-2 border-white flex items-center justify-center text-3xl flex-shrink-0">
                      🐻‍❄️
                    </div>
                    <div className="pb-1">
                      <div className="font-bold text-lg text-ice-900 leading-tight">{user?.username || 'Explorer'}</div>
                      <div className="text-xs text-ice-400">Level {userLevel}</div>
                    </div>
                  </div>

                  {/* XP Progress bar (telescope-style) */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="font-semibold text-ice-600">Level {userLevel}</span>
                      <span className="text-ice-400 tabular-nums">{xpProgress.currentProgress} / {xpProgress.totalNeeded} XP</span>
                    </div>
                    <div className="w-full bg-ice-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-arctic-400 to-arctic-600 h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(100, xpProgress.percentage)}%` }}
                      >
                        <div className="h-full w-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                      </div>
                    </div>
                    <div className="text-[10px] text-ice-400 text-right mt-1">{Math.round(xpProgress.percentage)}% to next level</div>
                  </div>

                  {/* Stat pills (telescope-inspired) */}
                  <div className="grid grid-cols-2 gap-2.5 mb-4">
                    <div className="bg-ice-50 rounded-xl p-3 text-center border border-ice-100">
                      <div className="text-lg font-bold text-ice-900">{user?.coins || 0}</div>
                      <div className="text-[10px] text-ice-400 font-medium uppercase tracking-wide">Coins</div>
                    </div>
                    <div className="bg-ice-50 rounded-xl p-3 text-center border border-ice-100">
                      <div className="text-lg font-bold text-ice-900 flex items-center justify-center gap-1">
                        {user?.donationStreak || 0}<span className="text-sm">🔥</span>
                      </div>
                      <div className="text-[10px] text-ice-400 font-medium uppercase tracking-wide">Day Streak</div>
                    </div>
                    <div className="bg-ice-50 rounded-xl p-3 text-center border border-ice-100">
                      <div className="text-lg font-bold text-ice-900">{userXp}</div>
                      <div className="text-[10px] text-ice-400 font-medium uppercase tracking-wide">Total XP</div>
                    </div>
                    <div className="bg-ice-50 rounded-xl p-3 text-center border border-ice-100">
                      <div className="text-lg font-bold text-ice-900">🐻‍❄️</div>
                      <div className="text-[10px] text-ice-400 font-medium uppercase tracking-wide">Spirit</div>
                    </div>
                  </div>

                  {/* Badges (telescope-style) */}
                  <div className="mb-4">
                    <div className="text-[10px] text-ice-400 font-semibold uppercase tracking-wider mb-2">Badges</div>
                    <div className="flex flex-wrap gap-1.5">
                      {['Early Adopter', 'Season 1'].map((badge) => (
                        <span key={badge} className="text-[10px] font-semibold px-2 py-1 bg-arctic-50 text-arctic-700 border border-arctic-100 rounded-md">
                          {badge}
                        </span>
                      ))}
                      <span className="text-[10px] font-semibold px-2 py-1 bg-ice-50 text-ice-400 border border-ice-100 rounded-md">
                        +3 more
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto p-5 pt-0 space-y-2">
                  <Link to="/dashboard" className="block w-full text-center px-4 py-2.5 bg-arctic-600 text-white font-bold text-sm rounded-xl hover:bg-arctic-700 transition-all">
                    View Dashboard
                  </Link>
                  <Link to="/donate" className="block w-full text-center px-4 py-2.5 bg-ice-50 text-ice-700 font-semibold text-sm rounded-xl border border-ice-200 hover:bg-ice-100 transition-all">
                    Make a Donation
                  </Link>
                </div>
              </div>
            ) : (
              /* ── NOT CONNECTED: Join CTA ── */
              <div className="bg-gradient-to-b from-arctic-50 via-white to-white rounded-2xl border border-arctic-100 shadow-sm h-full flex flex-col p-6">
                <div className="text-4xl mb-4">🐻‍❄️</div>
                <h3 className="text-xl font-bold text-ice-900 mb-2">Join 8,000+ donors</h3>
                <p className="text-sm text-ice-500 leading-relaxed mb-5">
                  Track your impact on-chain, vote on where funds go, earn XP & Donation Coins, and customize your experience.
                </p>

                <div className="space-y-2.5 mb-6 flex-1">
                  {[
                    { icon: '🔗', title: 'On-chain transparency', desc: 'Every donation tracked on the blockchain' },
                    { icon: '🗳️', title: 'Democratic governance', desc: 'Vote on which missions receive funding' },
                    { icon: '⭐', title: 'Earn XP & rewards', desc: 'Level up and climb the leaderboard' },
                    { icon: '🐻‍❄️', title: 'Spirit animals', desc: 'Personalize your profile' },
                  ].map((item) => (
                    <div key={item.title} className="flex items-start gap-3">
                      <span className="text-base flex-shrink-0 mt-0.5">{item.icon}</span>
                      <div>
                        <div className="text-sm font-semibold text-ice-800">{item.title}</div>
                        <div className="text-xs text-ice-400">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <Link to="/donate" className="block w-full text-center px-4 py-3 bg-arctic-600 text-white font-bold text-sm rounded-xl hover:bg-arctic-700 transition-all shadow-sm">
                  Get Started — It's Free
                </Link>
              </div>
            )}
          </FadeIn>
        </div>

        {/*
          SECTION 2: "Discover" — Trending Charities + Active Missions
          WHY: These answer "Where should I put my money?"
          Charities = which orgs, Missions = which specific projects.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">

          {/* Trending Charities — 7 cols */}
          <FadeIn className="lg:col-span-7" delay={0.15}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-6 h-full">
              <SectionHeader icon="🔥" title="Trending Charities" linkTo="/donate" linkText="View all" subtitle="Most followed this week" />
              <div className="space-y-0.5">
                {MOCK_TRENDING.map((c, i) => (
                  <Link key={c.id} to={`/charity/${c.id}`}
                    className="flex items-center gap-3 py-3 px-3 -mx-3 rounded-xl hover:bg-ice-50 transition-all group cursor-pointer"
                  >
                    <span className="text-xs font-bold text-ice-300 w-5 text-right tabular-nums">{i + 1}</span>
                    <img src={c.logo} alt={c.name} className="w-10 h-10 rounded-full object-cover border-2 border-ice-100 flex-shrink-0 group-hover:border-arctic-200 transition-colors" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-ice-900 truncate group-hover:text-arctic-700 transition-colors">{c.name}</div>
                      <div className="text-xs text-ice-400 truncate">{c.description}</div>
                    </div>
                    <Sparkline data={c.sparkline} color={c.weeklyChange > 20 ? '#22c55e' : '#0ea5e9'} className="hidden md:block flex-shrink-0" />
                    <div className="text-right flex-shrink-0 hidden sm:block w-16">
                      <div className="text-xs font-bold text-green-600">+{c.weeklyChange}%</div>
                      <div className="text-[11px] text-ice-400">{c.followers.toLocaleString()}</div>
                    </div>
                    <button
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleFollow(c.id); }}
                      className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${followedIds.has(c.id) ? 'bg-arctic-100 text-arctic-700 ring-1 ring-arctic-200' : 'bg-ice-100 text-ice-500 hover:bg-arctic-50 hover:text-arctic-600'}`}
                    >
                      {followedIds.has(c.id) ? 'Following' : 'Follow'}
                    </button>
                  </Link>
                ))}
              </div>
            </div>
          </FadeIn>

          {/* Active Missions — 5 cols */}
          <FadeIn className="lg:col-span-5" delay={0.2}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-6 h-full">
              <SectionHeader icon="🎯" title="Active Missions" linkTo="/map" linkText="Map" subtitle="Community-funded projects" />
              <div className="space-y-3">
                {MOCK_MISSIONS.map((m) => {
                  const pct = Math.min(100, Math.round((m.fundingReceived / m.fundingGoal) * 100));
                  const statusColors = { active: 'bg-green-100 text-green-700', voting: 'bg-arctic-100 text-arctic-700', funded: 'bg-purple-100 text-purple-700' };
                  return (
                    <Link key={m.id} to="/vote" className="block p-4 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-md transition-all group">
                      <div className="flex items-center gap-2.5 mb-2">
                        <img src={m.charityLogo} alt={m.charity} className="w-7 h-7 rounded-full object-cover border border-ice-100" />
                        <span className="text-sm font-semibold text-ice-900 truncate flex-1 group-hover:text-arctic-700 transition-colors">{m.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${statusColors[m.status]}`}>{m.status}</span>
                      </div>
                      <p className="text-xs text-ice-400 mb-3 leading-relaxed">{m.description}</p>
                      <div className="flex items-center gap-2.5 mb-1">
                        <div className="flex-1 h-2 bg-ice-100 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-arctic-400 to-arctic-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-bold text-ice-600 tabular-nums w-10 text-right">{pct}%</span>
                      </div>
                      <span className="text-[11px] text-ice-400 tabular-nums">${(m.fundingReceived / 1000).toFixed(1)}k raised of ${(m.fundingGoal / 1000).toFixed(0)}k goal</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>
        </div>

        {/*
          SECTION 3: "Community" — Activity + Governance + Leaderboard + Live Cam
          WHY: Social proof & participation. Shows the platform is alive and
          gives users ways to engage beyond just donating.
        */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Live Activity Feed — 3 cols */}
          <FadeIn className="lg:col-span-3" delay={0.25}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-6 h-full">
              <SectionHeader icon="⚡" title="Live Activity" subtitle="Real-time events" />
              <div className="space-y-0.5">
                {MOCK_ACTIVITY.map((a, i) => {
                  const cfg = activityConfig[a.type];
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.06, duration: 0.4 }}
                      className="flex items-start gap-2.5 py-2.5 px-2 -mx-2 rounded-lg hover:bg-ice-50/50 transition-colors"
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

          {/* Governance / Voting — 4 cols */}
          <FadeIn className="lg:col-span-4" delay={0.3}>
            <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-6 h-full">
              <SectionHeader icon="🗳️" title="Governance" linkTo="/vote" linkText="All proposals" subtitle="Community-driven decisions" />
              <div className="space-y-3">
                {MOCK_PROPOSALS.map((p) => {
                  const total = p.votesFor + p.votesAgainst;
                  const forPct = total > 0 ? Math.round((p.votesFor / total) * 100) : 0;
                  return (
                    <Link key={p.id} to="/vote" className="block p-4 rounded-xl border border-ice-100 hover:border-arctic-200 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="text-sm font-semibold text-ice-900 leading-snug">{p.title}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${p.status === 'passed' ? 'bg-green-100 text-green-700' : 'bg-arctic-100 text-arctic-700'}`}>
                          {p.status === 'passed' ? 'Passed' : 'Active'}
                        </span>
                      </div>
                      <p className="text-xs text-ice-400 mb-3 leading-relaxed line-clamp-2">{p.description}</p>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex-1 h-2 bg-ice-100 rounded-full overflow-hidden flex">
                          <div className="h-full bg-green-400 rounded-l-full transition-all" style={{ width: `${forPct}%` }} />
                          <div className="h-full bg-red-300 rounded-r-full transition-all" style={{ width: `${100 - forPct}%` }} />
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-green-600 font-bold">{forPct}% for</span>
                          <span className="text-ice-300">·</span>
                          <span className="text-ice-400">{total.toLocaleString()} votes</span>
                        </div>
                        <span className={`font-semibold ${p.status === 'passed' ? 'text-green-600' : 'text-ice-400'}`}>
                          {p.status === 'passed' ? '✓ Passed' : p.votingEnds}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </FadeIn>

          {/* Right column: Leaderboard + Live Cam stacked — 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">

            {/* Leaderboard */}
            <FadeIn delay={0.35}>
              <div className="bg-white rounded-2xl border border-ice-100 shadow-sm p-6">
                <SectionHeader icon="🏆" title="Top Donors" subtitle="Leaderboard this month" />
                <div className="space-y-0.5">
                  {MOCK_LEADERBOARD.map((d) => (
                    <div key={d.rank} className="flex items-center gap-3 py-2.5 px-3 -mx-3 rounded-xl hover:bg-ice-50 transition-colors">
                      {d.rank <= 3 ? (
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${rankColors[d.rank]} flex items-center justify-center text-white text-xs font-bold shadow-sm flex-shrink-0`}>{d.rank}</div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-ice-100 flex items-center justify-center text-ice-500 text-xs font-bold flex-shrink-0">{d.rank}</div>
                      )}
                      <div className="w-9 h-9 rounded-full bg-arctic-100 flex items-center justify-center text-arctic-700 text-xs font-bold flex-shrink-0">{d.initials}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-ice-900">{d.name}</div>
                        <div className="text-xs text-ice-400">{d.donations} donations · {d.streak}d streak 🔥</div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-sm font-bold text-arctic-700">{d.total}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>

            {/* Live Cam — compact */}
            <FadeIn delay={0.4}>
              <Link to="/live" className="block bg-ice-950 rounded-2xl border border-white/10 shadow-sm overflow-hidden group">
                <div className="flex items-stretch">
                  {/* Cam thumbnail */}
                  <div className="relative w-40 sm:w-48 flex-shrink-0">
                    <iframe
                      src="https://www.youtube.com/embed/U9_Fdcp73Pc?autoplay=0&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=1&fs=0"
                      title="Polar Bear Cam"
                      className="absolute inset-0 w-full h-full pointer-events-none"
                      frameBorder="0"
                      allow="accelerometer; encrypted-media"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-ice-950/50 z-10" />
                    <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-white text-[9px] font-bold tracking-wide">LIVE</span>
                    </div>
                    {/* Force aspect ratio */}
                    <div style={{ paddingTop: '75%' }} />
                  </div>
                  {/* Info */}
                  <div className="p-4 flex flex-col justify-center flex-1 min-w-0">
                    <div className="text-[10px] font-bold text-arctic-400 tracking-widest uppercase mb-1">Hudson Bay, Canada</div>
                    <div className="text-white font-bold text-sm mb-1 group-hover:text-arctic-300 transition-colors truncate">Polar Bears — Right Now</div>
                    <div className="text-xs text-ice-500 mb-2 line-clamp-1">Live stream from one of the largest polar bear habitats</div>
                    <div className="flex items-center gap-1.5 text-ice-500 text-xs">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                      1,247 watching
                    </div>
                  </div>
                </div>
              </Link>
            </FadeIn>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HomePage;

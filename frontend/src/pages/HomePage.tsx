import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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

// ─── COLORS (consistent blue palette from logo) ───
const C = {
  bg: '#0d1117',
  surface: '#161b22',
  surfaceHover: '#1c2128',
  elevated: '#21262d',
  border: '#30363d',
  borderSubtle: '#21262d',
  text: '#c9d1d9',
  textSecondary: '#8b949e',
  textMuted: '#484f58',
  // Logo blues
  blue: '#0284c7',
  blueLight: '#38bdf8',
  blueBright: '#0ea5e9',
  blueDark: '#0369a1',
  blueSubtle: '#075985',
  green: '#3fb950',
};

// ─── DATA ───

const CHARITIES = [
  { id: 'pbi', name: 'Polar Bears International', logo: pbiLogo, category: 'Climate', sparkline: [12,15,13,18,22,19,25,28,24,30,27,35], followers: 2847, change: 23, raised: '$154.2K', desc: 'Wild polar bears & sea ice conservation' },
  { id: 'wwf-uk', name: 'WWF', logo: wwfLogo, category: 'Conservation', sparkline: [20,22,21,24,23,26,28,27,30,29,32,34], followers: 4102, change: 12, raised: '$185.4K', desc: 'People living in harmony with nature' },
  { id: 'greenpeace', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment', sparkline: [8,10,12,11,15,18,17,20,22,24,23,28], followers: 3291, change: 18, raised: '$141.8K', desc: 'Ending environmental destruction' },
  { id: 'ocean-conservancy', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean', sparkline: [5,8,7,12,15,14,20,22,25,28,30,35], followers: 1856, change: 31, raised: '$98.5K', desc: 'Protecting the ocean' },
  { id: 'the-nature-conservancy', name: 'Nature Conservancy', logo: natureConservancyLogo, category: 'Conservation', sparkline: [18,19,20,19,21,22,23,22,24,25,26,27], followers: 2134, change: 8, raised: '$85.2K', desc: 'Lands & waters conservation' },
  { id: 'conservation-intl', name: 'Conservation Intl', logo: conservationIntlLogo, category: 'Conservation', sparkline: [10,12,14,13,16,18,20,19,22,24,26,28], followers: 1678, change: 15, raised: '$115.6K', desc: 'Nature-based climate solutions' },
];

const MISSIONS = [
  { id: 'm1', name: 'Arctic Research Station', charity: 'PBI', logo: pbiLogo, goal: 50000, raised: 34200, status: 'active' as const, lat: 78.2, lng: 15.6 },
  { id: 'm2', name: 'Svalbard Marine Conservation', charity: 'WWF', logo: wwfLogo, goal: 75000, raised: 52100, status: 'voting' as const, lat: 68.0, lng: -170.0 },
  { id: 'm3', name: 'Rainforest Protection', charity: 'Greenpeace', logo: greenpeaceLogo, goal: 40000, raised: 40000, status: 'funded' as const, lat: -3.4, lng: -60.0 },
  { id: 'm4', name: 'Chukchi Sea Patrol', charity: 'Ocean Conservancy', logo: oceanConservancyLogo, goal: 60000, raised: 18500, status: 'active' as const, lat: 71.0, lng: -155.0 },
];

const MAP_PINS = [
  { lat: 58.7, lng: -94.2, label: 'Hudson Bay', status: 'active', detail: 'PBI monitoring station' },
  { lat: 78.2, lng: 15.6, label: 'Svalbard', status: 'active', detail: 'Arctic research ongoing' },
  { lat: 68.0, lng: -170.0, label: 'Chukchi Sea', status: 'voting', detail: 'Marine patrol proposal' },
  { lat: 71.0, lng: -155.0, label: 'Beaufort Sea', status: 'funded', detail: 'Bear tracking funded' },
  { lat: 72.5, lng: -40.0, label: 'Greenland', status: 'active', detail: 'Ice sheet monitoring' },
  { lat: -3.4, lng: -60.0, label: 'Amazon', status: 'funded', detail: 'Rainforest protection' },
  { lat: 64.0, lng: -150.0, label: 'Alaska', status: 'active', detail: 'Wildlife corridor study' },
];

const FEED_ITEMS = [
  { id: 1, text: 'New ice coverage data from Svalbard station', time: '2m', type: 'update' },
  { id: 2, text: '$250 donation to PBI from arctic_whale', time: '5m', type: 'donation' },
  { id: 3, text: 'Chukchi Sea Patrol proposal reached 70% vote', time: '8m', type: 'vote' },
  { id: 4, text: 'Bear #4471 tracked near Hudson Bay', time: '12m', type: 'tracking' },
  { id: 5, text: '$1,000 donation to WWF from snow_leopard', time: '15m', type: 'donation' },
  { id: 6, text: 'Amazon reforestation milestone: 10k trees', time: '18m', type: 'milestone' },
];

const PIN_COLORS: Record<string, string> = { active: C.green, voting: C.blueBright, funded: '#bc8cff', planned: C.textMuted };
const TYPING_WORDS = ['polar bears', 'the world', 'arctic foxes', 'the ocean', 'our future', 'wildlife', 'the ice caps'];

// ─── SMALL COMPONENTS ───

const Sparkline: React.FC<{ data: number[]; color?: string }> = ({ data, color = C.blueBright }) => {
  const w = 72, h = 20, max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
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
  return <span style={{ color: C.blueLight }}>{text}<span className="animate-pulse" style={{ color: `${C.blueLight}60` }}>|</span></span>;
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
    <div className="min-h-screen flex flex-col" style={{ background: C.bg }}>

      {/* ═══ SIGN IN / XP CARD ═══ */}
      <div className="w-full" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3">
          {isConnected ? (
            <div className="flex items-center gap-4">
              {/* Avatar + name */}
              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold"
                  style={{ background: `linear-gradient(135deg, ${C.blueDark}, ${C.blueBright})`, color: '#fff' }}>
                  {(user?.username || 'E')[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: C.text }}>{user?.username || 'Explorer'}</div>
                  <div className="text-[10px]" style={{ color: C.textSecondary }}>Level {userLevel}</div>
                </div>
              </div>
              {/* XP Bar */}
              <div className="flex-1 min-w-0 max-w-sm">
                <div className="flex justify-between text-[10px] mb-0.5">
                  <span style={{ color: C.textSecondary }}>XP</span>
                  <span className="tabular-nums" style={{ color: C.blueBright }}>{xpProg.currentProgress}/{xpProg.totalNeeded}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, xpProg.percentage)}%`, background: `linear-gradient(90deg, ${C.blueDark}, ${C.blueBright})` }} />
                </div>
              </div>
              {/* Quick stats */}
              <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
                <div className="text-center">
                  <div className="text-xs font-bold tabular-nums" style={{ color: C.text }}>{user?.coins || 0}</div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>Coins</div>
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold tabular-nums" style={{ color: C.text }}>{user?.donationStreak || 0}d</div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: C.textMuted }}>Streak</div>
                </div>
              </div>
              <Link to="/dashboard" className="flex-shrink-0 px-3 py-1 rounded-md text-xs font-medium" style={{ background: C.elevated, border: `1px solid ${C.border}`, color: C.textSecondary }}>
                Dashboard
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
                  <svg className="w-4 h-4" fill="none" stroke={C.textSecondary} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" />
                  </svg>
                </div>
                <div>
                  <span className="text-sm font-medium" style={{ color: C.text }}>Sign in to track your impact</span>
                  <span className="hidden sm:inline text-xs ml-2" style={{ color: C.textMuted }}>Earn XP, vote on missions, see your donation history</span>
                </div>
              </div>
              <Link to="/donate" className="px-3 py-1.5 rounded-md text-xs font-semibold" style={{ background: C.blueDark, border: `1px solid ${C.blue}`, color: '#fff' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ═══ HERO: Video bg + "It's time to save" ═══ */}
      <div className="relative w-full" style={{ height: 'clamp(180px, 28vh, 280px)' }}>
        {/* Video background */}
        <div className="absolute inset-0 overflow-hidden">
          <video autoPlay muted loop playsInline poster={arcticPoster}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: 'brightness(0.3) saturate(0.7)' }}>
            <source src="https://cdn.coverr.co/videos/coverr-a-polar-bear-walking-on-snow-4810/1080p.mp4" type="video/mp4" />
          </video>
          {/* Blue gradient overlay */}
          <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${C.bg}40 0%, ${C.blueDark}30 50%, ${C.bg}cc 100%)` }} />
        </div>
        {/* Text */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4">
          <motion.h1 initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }}
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-center mb-2">
            <span style={{ color: '#fff' }}>It's time to save </span><TypingText />
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="text-center max-w-lg leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)', fontSize: 'clamp(12px, 1.5vw, 15px)' }}>
            Transparent, on-chain conservation. Community-governed donations that track real-world impact.
          </motion.p>
        </div>
      </div>

      {/* ═══ MAIN CONTENT: Map + Charities ═══ */}
      <div className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4" style={{ minHeight: 'calc(100vh - 380px)' }}>

          {/* ── LEFT: Mini Map + Live Feed ── */}
          <div className="lg:col-span-2 flex flex-col gap-3">
            {/* Mini Map */}
            <div className="rounded-lg overflow-hidden flex-1" style={{ background: C.surface, border: `1px solid ${C.border}`, minHeight: '260px' }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span className="text-xs font-semibold" style={{ color: C.text }}>Active Missions</span>
                <Link to="/map" className="text-[10px] font-semibold" style={{ color: C.blueBright }}>Full map</Link>
              </div>
              <div style={{ height: 'calc(100% - 36px)' }}>
                <MapContainer
                  center={[40, -20]}
                  zoom={2}
                  minZoom={2}
                  maxZoom={6}
                  style={{ height: '100%', width: '100%', background: C.bg }}
                  zoomControl={false}
                  attributionControl={false}
                  maxBounds={[[-85, -200], [85, 200]]}
                  maxBoundsViscosity={1.0}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  {MAP_PINS.map((pin, i) => (
                    <CircleMarker
                      key={i}
                      center={[pin.lat, pin.lng]}
                      radius={6}
                      pathOptions={{
                        fillColor: PIN_COLORS[pin.status] || C.textMuted,
                        color: PIN_COLORS[pin.status] || C.textMuted,
                        weight: 1.5,
                        opacity: 0.9,
                        fillOpacity: 0.5,
                      }}
                    >
                      <Tooltip className="leaflet-tooltip-custom" direction="top" offset={[0, -8]} opacity={1}>
                        <div>
                          <div className="font-bold">{pin.label}</div>
                          <div style={{ opacity: 0.8 }}>{pin.detail}</div>
                        </div>
                      </Tooltip>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            {/* Live Feed */}
            <div className="rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between px-3 py-2" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                  <span className="text-xs font-semibold" style={{ color: C.text }}>Latest Updates</span>
                </div>
              </div>
              <div className="divide-y" style={{ borderColor: C.borderSubtle }}>
                {FEED_ITEMS.slice(0, 4).map(item => (
                  <div key={item.id} className="px-3 py-2 flex items-start gap-2 transition-colors"
                    onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="w-1 h-1 rounded-full mt-1.5 flex-shrink-0" style={{
                      background: item.type === 'donation' ? C.green : item.type === 'vote' ? C.blueBright : item.type === 'milestone' ? '#bc8cff' : C.textSecondary
                    }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs leading-relaxed" style={{ color: C.textSecondary }}>{item.text}</p>
                    </div>
                    <span className="text-[10px] flex-shrink-0 tabular-nums" style={{ color: C.textMuted }}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT: Charities + Missions ── */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            {/* Charities Table */}
            <div className="rounded-lg overflow-hidden flex-1" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span className="text-xs font-semibold" style={{ color: C.text }}>Trending Charities</span>
                <Link to="/donate" className="text-[10px] font-semibold" style={{ color: C.blueBright }}>View all</Link>
              </div>
              {/* Table header */}
              <div className="hidden md:grid grid-cols-12 gap-2 px-4 py-1.5 text-[9px] uppercase tracking-wider" style={{ color: C.textMuted, borderBottom: `1px solid ${C.borderSubtle}` }}>
                <div className="col-span-1">#</div>
                <div className="col-span-4">Charity</div>
                <div className="col-span-2 text-right">Trend</div>
                <div className="col-span-1 text-right">7d</div>
                <div className="col-span-1 text-right">Raised</div>
                <div className="col-span-1 text-right">Donors</div>
                <div className="col-span-2 text-right"></div>
              </div>
              {/* Rows */}
              <div>
                {CHARITIES.map((c, i) => (
                  <Link key={c.id} to={`/charity/${c.id}`}
                    className="grid grid-cols-1 md:grid-cols-12 gap-1.5 md:gap-2 items-center px-4 py-2.5 transition-colors group"
                    style={{ borderBottom: i < CHARITIES.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}
                    onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                    <div className="hidden md:block col-span-1 text-xs font-bold tabular-nums" style={{ color: C.textMuted }}>{i + 1}</div>
                    <div className="col-span-1 md:col-span-4 flex items-center gap-2.5">
                      <span className="md:hidden text-xs font-bold w-4" style={{ color: C.textMuted }}>{i + 1}</span>
                      <img src={c.logo} alt={c.name} className="w-7 h-7 rounded-full object-cover flex-shrink-0" style={{ border: `1px solid ${C.border}` }} />
                      <div className="min-w-0">
                        <div className="text-xs font-semibold truncate transition-colors" style={{ color: C.text }}
                          onMouseEnter={e => (e.currentTarget.style.color = C.blueBright)}
                          onMouseLeave={e => (e.currentTarget.style.color = C.text)}>{c.name}</div>
                        <div className="text-[10px] truncate" style={{ color: C.textMuted }}>{c.desc}</div>
                      </div>
                    </div>
                    <div className="hidden md:flex col-span-2 justify-end"><Sparkline data={c.sparkline} color={c.change > 20 ? C.green : C.blueBright} /></div>
                    <div className="hidden md:block col-span-1 text-right text-[11px] font-bold" style={{ color: C.green }}>+{c.change}%</div>
                    <div className="hidden md:block col-span-1 text-right text-[11px] font-semibold" style={{ color: C.text }}>{c.raised}</div>
                    <div className="hidden md:block col-span-1 text-right text-[11px]" style={{ color: C.textSecondary }}>{c.followers.toLocaleString()}</div>
                    <div className="col-span-1 md:col-span-2 flex justify-end">
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); setFollowed(p => { const n = new Set(p); n.has(c.id) ? n.delete(c.id) : n.add(c.id); return n; }); }}
                        className="px-2.5 py-0.5 rounded text-[10px] font-semibold transition-all"
                        style={followed.has(c.id)
                          ? { background: `${C.blueDark}20`, color: C.blueBright, border: `1px solid ${C.blueDark}` }
                          : { background: C.elevated, color: C.textSecondary, border: `1px solid ${C.border}` }
                        }>
                        {followed.has(c.id) ? 'Following' : 'Follow'}
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Missions row */}
            <div className="rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
              <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                <span className="text-xs font-semibold" style={{ color: C.text }}>Active Missions</span>
                <Link to="/map" className="text-[10px] font-semibold" style={{ color: C.blueBright }}>All missions</Link>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: C.borderSubtle }}>
                {MISSIONS.map(m => {
                  const pct = Math.round((m.raised / m.goal) * 100);
                  const statusColor = m.status === 'active' ? C.green : m.status === 'voting' ? C.blueBright : '#bc8cff';
                  return (
                    <Link key={m.id} to="/vote" className="flex items-center gap-3 px-4 py-3 transition-colors"
                      onMouseEnter={e => (e.currentTarget.style.background = C.surfaceHover)}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <img src={m.logo} alt={m.charity} className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: `1px solid ${C.border}` }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-xs font-semibold truncate" style={{ color: C.text }}>{m.name}</span>
                          <span className="text-[9px] font-bold px-1 py-px rounded flex-shrink-0" style={{ background: `${statusColor}15`, color: statusColor }}>
                            {m.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: statusColor }} />
                          </div>
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: C.textSecondary }}>{pct}%</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

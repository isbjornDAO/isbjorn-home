import React, { useState, useEffect, useMemo } from 'react';
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
  greenDim: '#16a34a',
  red: '#ef4444',
  redDim: '#dc2626',
  yellow: '#eab308',
  purple: '#a78bfa',
};

// ─── TOKEN DATA ───
interface Token {
  id: string;
  ticker: string;
  name: string;
  logo: string;
  category: string;
  desc: string;
  // DexScreener-style metrics
  impactScore: number;       // like "price" — overall effectiveness score
  impactChange24h: number;   // % change
  impactChange7d: number;
  volume24h: number;         // donation volume in $
  volumeChange: number;      // % change in volume
  totalRaised: number;       // like "market cap"
  donors: number;            // like "holders"
  donorsChange: number;
  sparkline: number[];
  // Weather-style conservation data
  weather: {
    metric: string;          // e.g. "Ice Coverage", "Species Count"
    value: string;
    trend: 'up' | 'down' | 'stable';
    detail: string;
    temp?: string;           // temperature if relevant
    condition?: string;      // "Critical" | "Stable" | "Improving"
  };
  // News/updates
  news: { text: string; time: string; type: 'alert' | 'update' | 'milestone' | 'donation' }[];
  // Active missions
  missions: { name: string; progress: number; status: string }[];
}

const TOKENS: Token[] = [
  {
    id: 'pbi', ticker: 'PBI', name: 'Polar Bears International', logo: pbiLogo, category: 'Arctic',
    desc: 'Wild polar bears & sea ice conservation',
    impactScore: 87.4, impactChange24h: 3.2, impactChange7d: 12.8,
    volume24h: 24500, volumeChange: 31, totalRaised: 154200, donors: 2847, donorsChange: 5.1,
    sparkline: [72,74,73,76,78,77,80,82,81,84,85,87],
    weather: { metric: 'Ice Coverage', value: '62%', trend: 'down', detail: 'Svalbard region — 3.2% decline this month', temp: '-18C', condition: 'Critical' },
    news: [
      { text: 'Bear #4471 GPS collar transmitting from Hudson Bay', time: '2m', type: 'update' },
      { text: 'Ice coverage dropped below 65% threshold in Svalbard', time: '18m', type: 'alert' },
      { text: '$4,200 raised in last 24h — new monthly record', time: '1h', type: 'milestone' },
    ],
    missions: [{ name: 'Arctic Research Station', progress: 68, status: 'active' }, { name: 'Hudson Bay Monitoring', progress: 45, status: 'active' }],
  },
  {
    id: 'wwf-uk', ticker: 'WWF', name: 'World Wildlife Fund', logo: wwfLogo, category: 'Global',
    desc: 'People living in harmony with nature',
    impactScore: 92.1, impactChange24h: 1.8, impactChange7d: 8.4,
    volume24h: 31200, volumeChange: 12, totalRaised: 185400, donors: 4102, donorsChange: 3.2,
    sparkline: [85,86,87,86,88,89,90,89,91,90,91,92],
    weather: { metric: 'Species Index', value: '1,847', trend: 'up', detail: 'Monitored species across 40 countries', condition: 'Stable' },
    news: [
      { text: 'Svalbard marine reserve proposal reaches 70% vote', time: '8m', type: 'update' },
      { text: 'New partnership with Norwegian Arctic Institute', time: '2h', type: 'milestone' },
      { text: '$1,000 donation from snow_leopard', time: '3h', type: 'donation' },
    ],
    missions: [{ name: 'Svalbard Marine Reserve', progress: 69, status: 'voting' }, { name: 'Coral Reef Mapping', progress: 82, status: 'active' }],
  },
  {
    id: 'greenpeace', ticker: 'GPC', name: 'Greenpeace', logo: greenpeaceLogo, category: 'Environment',
    desc: 'Ending environmental destruction',
    impactScore: 78.6, impactChange24h: 5.4, impactChange7d: 18.2,
    volume24h: 18900, volumeChange: 42, totalRaised: 141800, donors: 3291, donorsChange: 7.8,
    sparkline: [60,62,64,63,67,70,69,73,74,76,77,79],
    weather: { metric: 'Forest Coverage', value: '847K ha', trend: 'down', detail: 'Amazon basin deforestation rate tracking', temp: '31C', condition: 'Critical' },
    news: [
      { text: 'Amazon reforestation milestone: 10,000 trees planted', time: '18m', type: 'milestone' },
      { text: 'Deforestation rate increased 2.1% in sector 7', time: '4h', type: 'alert' },
      { text: 'New satellite imagery partnership announced', time: '6h', type: 'update' },
    ],
    missions: [{ name: 'Rainforest Protection', progress: 100, status: 'funded' }, { name: 'Ocean Plastic Cleanup', progress: 34, status: 'active' }],
  },
  {
    id: 'ocean-conservancy', ticker: 'OCN', name: 'Ocean Conservancy', logo: oceanConservancyLogo, category: 'Ocean',
    desc: 'Protecting the ocean from today\'s greatest challenges',
    impactScore: 71.2, impactChange24h: 8.7, impactChange7d: 31.4,
    volume24h: 12800, volumeChange: 56, totalRaised: 98500, donors: 1856, donorsChange: 12.3,
    sparkline: [45,48,50,52,55,54,58,62,64,67,69,71],
    weather: { metric: 'Ocean Temp', value: '+1.2C', trend: 'up', detail: 'Chukchi Sea surface temperature anomaly', temp: '4.8C', condition: 'Critical' },
    news: [
      { text: 'Chukchi Sea patrol vessel deployed for spring survey', time: '30m', type: 'update' },
      { text: 'Record donation volume — up 56% this week', time: '2h', type: 'milestone' },
      { text: 'Microplastic concentration data released', time: '5h', type: 'alert' },
    ],
    missions: [{ name: 'Chukchi Sea Patrol', progress: 31, status: 'active' }, { name: 'Coral Monitoring', progress: 55, status: 'active' }],
  },
  {
    id: 'the-nature-conservancy', ticker: 'TNC', name: 'Nature Conservancy', logo: natureConservancyLogo, category: 'Land',
    desc: 'Conserving the lands and waters on which all life depends',
    impactScore: 83.9, impactChange24h: 0.6, impactChange7d: 4.2,
    volume24h: 9400, volumeChange: -3, totalRaised: 85200, donors: 2134, donorsChange: 1.8,
    sparkline: [80,81,82,81,82,83,82,83,84,83,84,84],
    weather: { metric: 'Protected Land', value: '2.4M ha', trend: 'up', detail: 'Total protected hectares under management', condition: 'Improving' },
    news: [
      { text: 'New wetland reserve established in Minnesota', time: '1h', type: 'milestone' },
      { text: 'Quarterly conservation report published', time: '4h', type: 'update' },
    ],
    missions: [{ name: 'Great Plains Restoration', progress: 71, status: 'active' }],
  },
  {
    id: 'conservation-intl', ticker: 'CI', name: 'Conservation International', logo: conservationIntlLogo, category: 'Climate',
    desc: 'Spotlighting nature-based solutions to climate change',
    impactScore: 76.3, impactChange24h: 2.1, impactChange7d: 15.1,
    volume24h: 11200, volumeChange: 22, totalRaised: 115600, donors: 1678, donorsChange: 4.5,
    sparkline: [62,64,65,64,67,69,68,71,72,74,75,76],
    weather: { metric: 'Carbon Offset', value: '48.2K t', trend: 'up', detail: 'CO2 equivalent offset this quarter', condition: 'Improving' },
    news: [
      { text: 'Blue carbon mangrove project expansion approved', time: '45m', type: 'milestone' },
      { text: 'Carbon credit methodology peer-reviewed', time: '3h', type: 'update' },
      { text: '$500 donation from polar_dawn', time: '5h', type: 'donation' },
    ],
    missions: [{ name: 'Mangrove Restoration', progress: 58, status: 'active' }, { name: 'Carbon Credit Program', progress: 89, status: 'active' }],
  },
];

type SortKey = 'impactScore' | 'impactChange24h' | 'volume24h' | 'totalRaised' | 'donors';
type TimeFilter = '1h' | '24h' | '7d' | '30d';

// ─── COMPONENTS ───

const Sparkline: React.FC<{ data: number[]; color: string; w?: number; h?: number }> = ({ data, color, w = 100, h = 32 }) => {
  const max = Math.max(...data), min = Math.min(...data), r = max - min || 1;
  const pts = data.map((v, i) => ({ x: (i / (data.length - 1)) * w, y: h - ((v - min) / r) * (h - 4) - 2 }));
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const gId = `sp-${color.replace('#','')}`;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <defs><linearGradient id={gId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity={0.12} /><stop offset="100%" stopColor={color} stopOpacity={0} /></linearGradient></defs>
      <path d={`${d} L${w},${h} L0,${h} Z`} fill={`url(#${gId})`} />
      <path d={d} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" />
    </svg>
  );
};

const PctBadge: React.FC<{ value: number; size?: 'sm' | 'md' }> = ({ value, size = 'sm' }) => {
  const pos = value >= 0;
  const color = pos ? C.green : C.red;
  const fontSize = size === 'md' ? '12px' : '10px';
  return (
    <span className="font-bold tabular-nums" style={{ color, fontSize }}>
      {pos ? '+' : ''}{value.toFixed(1)}%
    </span>
  );
};

const ConditionDot: React.FC<{ condition?: string }> = ({ condition }) => {
  const color = condition === 'Critical' ? C.red : condition === 'Improving' ? C.green : C.yellow;
  return <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color }} />;
};

const fmtUsd = (n: number) => n >= 1e6 ? `$${(n/1e6).toFixed(1)}M` : n >= 1e3 ? `$${(n/1e3).toFixed(1)}K` : `$${n}`;

// ─── MAIN PAGE ───

const HomePage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const activeAccount = useActiveAccount();
  const isConnected = isAuthenticated || !!activeAccount;
  const userXp = user?.xp || 0;
  const userLevel = user?.level || calculateLevel(userXp);
  const xpProg = getXpProgress(userXp);

  const [sortKey, setSortKey] = useState<SortKey>('impactScore');
  const [sortAsc, setSortAsc] = useState(false);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('24h');
  const [selectedToken, setSelectedToken] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const categories = useMemo(() => ['All', ...Array.from(new Set(TOKENS.map(t => t.category)))], []);

  const sortedTokens = useMemo(() => {
    let list = [...TOKENS];
    if (categoryFilter !== 'All') list = list.filter(t => t.category === categoryFilter);
    list.sort((a, b) => {
      const av = a[sortKey] as number, bv = b[sortKey] as number;
      return sortAsc ? av - bv : bv - av;
    });
    return list;
  }, [sortKey, sortAsc, categoryFilter]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const selected = selectedToken ? TOKENS.find(t => t.id === selectedToken) : null;

  // Simulated live tick
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const iv = setInterval(() => setTick(t => t + 1), 5000);
    return () => clearInterval(iv);
  }, []);

  const SortHeader: React.FC<{ label: string; k: SortKey; align?: string }> = ({ label, k, align = 'text-right' }) => (
    <button onClick={() => handleSort(k)}
      className={`${align} text-[9px] uppercase tracking-widest font-semibold transition-colors w-full`}
      style={{ color: sortKey === k ? C.blueBright : C.textMuted }}>
      {label}{sortKey === k ? (sortAsc ? ' ▲' : ' ▼') : ''}
    </button>
  );

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>

      {/* ─── TOP BAR: XP / Sign in ─── */}
      <div style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-2 flex items-center justify-between gap-3">
          {isConnected ? (
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${C.blueDark}, ${C.blueBright})`, color: '#fff' }}>
                {(user?.username || 'E')[0].toUpperCase()}
              </div>
              <span className="text-xs font-semibold truncate" style={{ color: C.text }}>{user?.username || 'Explorer'}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.elevated, color: C.blueBright }}>Lv {userLevel}</span>
              <div className="hidden sm:flex items-center gap-2 flex-1 max-w-[200px]">
                <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                  <div className="h-full rounded-full" style={{ width: `${Math.min(100, xpProg.percentage)}%`, background: C.blueBright }} />
                </div>
                <span className="text-[9px] tabular-nums" style={{ color: C.textMuted }}>{Math.round(xpProg.percentage)}%</span>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 flex-1">
              <span className="text-xs" style={{ color: C.textSecondary }}>Sign in to track impact and earn XP</span>
            </div>
          )}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded" style={{ background: C.elevated }}>
              <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
              <span className="text-[10px] tabular-nums" style={{ color: C.textSecondary }}>
                {fmtUsd(TOKENS.reduce((s, t) => s + t.volume24h, 0))} 24h vol
              </span>
            </div>
            <Link to="/map" className="text-[10px] font-semibold px-2 py-1 rounded" style={{ background: C.elevated, color: C.blueBright }}>
              Map
            </Link>
          </div>
        </div>
      </div>

      {/* ─── FILTER BAR ─── */}
      <div style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
        <div className="max-w-[1600px] mx-auto px-3 sm:px-5 py-1.5 flex items-center gap-3 overflow-x-auto scrollbar-hide">
          {/* Category pills */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className="px-2.5 py-1 rounded text-[10px] font-semibold transition-all whitespace-nowrap"
                style={categoryFilter === cat
                  ? { background: `${C.blueDark}30`, color: C.blueBright, border: `1px solid ${C.blueDark}` }
                  : { background: 'transparent', color: C.textMuted, border: `1px solid transparent` }
                }>
                {cat}
              </button>
            ))}
          </div>
          <div className="w-px h-4 flex-shrink-0" style={{ background: C.border }} />
          {/* Time filter */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {(['1h','24h','7d','30d'] as TimeFilter[]).map(t => (
              <button key={t} onClick={() => setTimeFilter(t)}
                className="px-2 py-0.5 rounded text-[10px] font-semibold transition-all"
                style={timeFilter === t
                  ? { background: C.elevated, color: C.text }
                  : { color: C.textMuted }
                }>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ─── MAIN GRID ─── */}
      <div className="max-w-[1600px] mx-auto flex" style={{ height: 'calc(100vh - 140px)' }}>

        {/* ─── TOKEN TABLE (left) ─── */}
        <div className="flex-1 min-w-0 flex flex-col overflow-hidden" style={{ borderRight: `1px solid ${C.borderSubtle}` }}>
          {/* Table header */}
          <div className="flex items-center gap-0 px-3 py-1.5 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
            <div className="w-8 text-[9px] uppercase tracking-widest font-semibold" style={{ color: C.textMuted }}>#</div>
            <div className="flex-1 min-w-[160px] text-[9px] uppercase tracking-widest font-semibold text-left" style={{ color: C.textMuted }}>Token</div>
            <div className="w-[100px] hidden lg:block"><SortHeader label="Impact" k="impactScore" /></div>
            <div className="w-[65px]"><SortHeader label={timeFilter} k="impactChange24h" /></div>
            <div className="w-[80px] hidden md:block"><SortHeader label="Volume" k="volume24h" /></div>
            <div className="w-[80px] hidden md:block"><SortHeader label="Total" k="totalRaised" /></div>
            <div className="w-[65px] hidden lg:block"><SortHeader label="Donors" k="donors" /></div>
            <div className="w-[110px] hidden lg:block text-right text-[9px] uppercase tracking-widest font-semibold" style={{ color: C.textMuted }}>Chart</div>
            <div className="w-[140px] hidden xl:block text-[9px] uppercase tracking-widest font-semibold text-left pl-3" style={{ color: C.textMuted }}>Conditions</div>
          </div>

          {/* Scrollable rows */}
          <div className="flex-1 overflow-y-auto">
            {sortedTokens.map((t, i) => {
              const changeColor = t.impactChange24h >= 0 ? C.green : C.red;
              const isSelected = selectedToken === t.id;
              return (
                <div key={t.id}
                  className="flex items-center gap-0 px-3 py-2.5 cursor-pointer transition-colors"
                  style={{
                    borderBottom: `1px solid ${C.borderSubtle}`,
                    background: isSelected ? C.surfaceHover : 'transparent',
                    borderLeft: isSelected ? `2px solid ${C.blueBright}` : '2px solid transparent',
                  }}
                  onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = C.surfaceHover; }}
                  onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = 'transparent'; }}
                  onClick={() => setSelectedToken(isSelected ? null : t.id)}>

                  <div className="w-8 text-xs font-bold tabular-nums" style={{ color: C.textMuted }}>{i + 1}</div>

                  {/* Token name */}
                  <div className="flex-1 min-w-[160px] flex items-center gap-2.5">
                    <img src={t.logo} alt={t.name} className="w-8 h-8 rounded-full object-cover flex-shrink-0" style={{ border: `1px solid ${C.border}` }} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold" style={{ color: C.text }}>{t.ticker}</span>
                        <span className="text-[9px] px-1 py-px rounded" style={{ background: C.elevated, color: C.textMuted }}>{t.category}</span>
                      </div>
                      <div className="text-[10px] truncate" style={{ color: C.textMuted }}>{t.name}</div>
                    </div>
                  </div>

                  {/* Impact score */}
                  <div className="w-[100px] hidden lg:block text-right">
                    <span className="text-sm font-bold tabular-nums" style={{ color: C.text }}>{t.impactScore.toFixed(1)}</span>
                  </div>

                  {/* Change */}
                  <div className="w-[65px] text-right">
                    <PctBadge value={t.impactChange24h} size="sm" />
                  </div>

                  {/* Volume */}
                  <div className="w-[80px] hidden md:block text-right">
                    <div className="text-[11px] font-semibold tabular-nums" style={{ color: C.text }}>{fmtUsd(t.volume24h)}</div>
                    <PctBadge value={t.volumeChange} />
                  </div>

                  {/* Total raised */}
                  <div className="w-[80px] hidden md:block text-right">
                    <span className="text-[11px] font-semibold tabular-nums" style={{ color: C.text }}>{fmtUsd(t.totalRaised)}</span>
                  </div>

                  {/* Donors */}
                  <div className="w-[65px] hidden lg:block text-right">
                    <div className="text-[11px] tabular-nums" style={{ color: C.textSecondary }}>{t.donors.toLocaleString()}</div>
                  </div>

                  {/* Sparkline */}
                  <div className="w-[110px] hidden lg:flex justify-end">
                    <Sparkline data={t.sparkline} color={changeColor} w={90} h={28} />
                  </div>

                  {/* Weather/conditions */}
                  <div className="w-[140px] hidden xl:flex items-center gap-1.5 pl-3">
                    <ConditionDot condition={t.weather.condition} />
                    <div className="min-w-0">
                      <div className="text-[10px] font-semibold truncate" style={{ color: C.text }}>{t.weather.value}</div>
                      <div className="text-[9px] truncate" style={{ color: C.textMuted }}>{t.weather.metric}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── DETAIL PANEL (right) ─── */}
        <div className="hidden md:flex flex-col w-[340px] lg:w-[380px] xl:w-[420px] overflow-hidden flex-shrink-0">
          <AnimatePresence mode="wait">
            {selected ? (
              <motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 12 }} transition={{ duration: 0.15 }}
                className="flex flex-col h-full overflow-y-auto">

                {/* Header */}
                <div className="px-4 py-3 flex items-center gap-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                  <img src={selected.logo} alt={selected.name} className="w-10 h-10 rounded-full object-cover" style={{ border: `1px solid ${C.border}` }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold" style={{ color: C.text }}>{selected.ticker}</span>
                      <PctBadge value={selected.impactChange24h} size="md" />
                    </div>
                    <div className="text-xs truncate" style={{ color: C.textSecondary }}>{selected.name}</div>
                  </div>
                  <Link to={`/charity/${selected.id}`} className="text-[10px] font-semibold px-2 py-1 rounded flex-shrink-0"
                    style={{ background: C.blueDark, color: '#fff', border: `1px solid ${C.blue}` }}>
                    Donate
                  </Link>
                </div>

                {/* Impact chart area */}
                <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                  <div className="flex items-end gap-2 mb-2">
                    <span className="text-2xl font-black tabular-nums" style={{ color: C.text }}>{selected.impactScore.toFixed(1)}</span>
                    <span className="text-xs mb-1" style={{ color: C.textMuted }}>Impact Score</span>
                  </div>
                  <Sparkline data={selected.sparkline} color={selected.impactChange24h >= 0 ? C.green : C.red} w={360} h={60} />
                </div>

                {/* Metrics grid */}
                <div className="grid grid-cols-3 gap-0 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                  {[
                    { label: '24h Volume', val: fmtUsd(selected.volume24h), change: selected.volumeChange },
                    { label: 'Total Raised', val: fmtUsd(selected.totalRaised) },
                    { label: 'Donors', val: selected.donors.toLocaleString(), change: selected.donorsChange },
                  ].map((m, i) => (
                    <div key={m.label} className="px-3 py-2.5 text-center" style={{ borderRight: i < 2 ? `1px solid ${C.borderSubtle}` : 'none' }}>
                      <div className="text-[9px] uppercase tracking-wider mb-0.5" style={{ color: C.textMuted }}>{m.label}</div>
                      <div className="text-xs font-bold tabular-nums" style={{ color: C.text }}>{m.val}</div>
                      {m.change !== undefined && <PctBadge value={m.change} />}
                    </div>
                  ))}
                </div>

                {/* Weather / conditions */}
                <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                  <div className="text-[9px] uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textMuted }}>Conservation Conditions</div>
                  <div className="rounded-lg p-3" style={{ background: C.elevated }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <ConditionDot condition={selected.weather.condition} />
                        <span className="text-xs font-bold" style={{ color: C.text }}>{selected.weather.metric}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums" style={{ color: C.text }}>{selected.weather.value}</span>
                    </div>
                    {selected.weather.temp && (
                      <div className="text-[10px] mb-1" style={{ color: C.textSecondary }}>Temperature: {selected.weather.temp}</div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{
                          background: selected.weather.condition === 'Critical' ? `${C.red}15` : selected.weather.condition === 'Improving' ? `${C.green}15` : `${C.yellow}15`,
                          color: selected.weather.condition === 'Critical' ? C.red : selected.weather.condition === 'Improving' ? C.green : C.yellow,
                        }}>
                        {selected.weather.condition}
                      </span>
                      <span className="text-[10px]" style={{ color: C.textMuted }}>{selected.weather.detail}</span>
                    </div>
                  </div>
                </div>

                {/* Missions */}
                <div className="px-4 py-3 flex-shrink-0" style={{ borderBottom: `1px solid ${C.borderSubtle}` }}>
                  <div className="text-[9px] uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textMuted }}>Active Missions</div>
                  <div className="space-y-2">
                    {selected.missions.map(m => (
                      <div key={m.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold truncate" style={{ color: C.text }}>{m.name}</span>
                          <span className="text-[10px] font-bold tabular-nums" style={{ color: C.textSecondary }}>{m.progress}%</span>
                        </div>
                        <div className="h-1 rounded-full overflow-hidden" style={{ background: C.elevated }}>
                          <div className="h-full rounded-full" style={{
                            width: `${m.progress}%`,
                            background: m.status === 'funded' ? C.purple : m.status === 'voting' ? C.blueBright : C.green,
                          }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* News feed */}
                <div className="px-4 py-3 flex-1">
                  <div className="text-[9px] uppercase tracking-wider mb-2 font-semibold" style={{ color: C.textMuted }}>Trending News</div>
                  <div className="space-y-0">
                    {selected.news.map((n, i) => (
                      <div key={i} className="flex items-start gap-2 py-2" style={{ borderBottom: i < selected.news.length - 1 ? `1px solid ${C.borderSubtle}` : 'none' }}>
                        <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{
                          background: n.type === 'alert' ? C.red : n.type === 'milestone' ? C.green : n.type === 'donation' ? C.blueBright : C.textMuted,
                        }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] leading-relaxed" style={{ color: C.textSecondary }}>{n.text}</p>
                          <span className="text-[9px] tabular-nums" style={{ color: C.textMuted }}>{n.time} ago</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-full px-6 text-center">
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-3" style={{ background: C.elevated }}>
                  <svg className="w-6 h-6" fill="none" stroke={C.textMuted} viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5" />
                  </svg>
                </div>
                <p className="text-sm font-semibold mb-1" style={{ color: C.text }}>Select a token</p>
                <p className="text-xs leading-relaxed" style={{ color: C.textMuted }}>
                  Click any conservation token to view detailed impact metrics, weather conditions, and trending news.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

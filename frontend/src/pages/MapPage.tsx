import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Polyline, useMap } from 'react-leaflet';
import { Icon, DivIcon, LatLngExpression } from 'leaflet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import { getPolarBearData, type PolarBearData } from '@/services/polarBearService';

// Charity logos
import pbiLogo from '@/assets/logos/pbi.jpg';
import wwfLogo from '@/assets/logos/wwf.jpg';
import greenpeaceLogo from '@/assets/logos/greenpeace.jpg';
import oceanConservancyLogo from '@/assets/logos/ocean-conservancy.jpg';
import sierraClubLogo from '@/assets/logos/sierra-club.jpg';
import conservationIntlLogo from '@/assets/logos/conservation-intl.jpg';

// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({ iconUrl: markerIcon, iconRetinaUrl: markerIcon2x, shadowUrl: markerShadow });

// ─── MISSION PIN DATA ───
// Each pin connects to a charity + proposal, linking Map ↔ Vote ↔ Donate

interface MissionPin {
  id: string;
  lat: number;
  lng: number;
  charityId: string;
  charityName: string;
  charityLogo: string;
  missionName: string;
  description: string;
  proposalId: string;
  fundingGoal: number;
  fundingReceived: number;
  status: 'active' | 'voting' | 'funded' | 'planned';
  votesFor?: number;
  votesAgainst?: number;
}

const MISSION_PINS: MissionPin[] = [
  {
    id: 'mp1', lat: 58.7, lng: -94.2,
    charityId: 'pbi', charityName: 'Polar Bears International', charityLogo: pbiLogo,
    missionName: 'Hudson Bay Monitoring Station',
    description: 'Year-round monitoring of polar bear populations on the western shore of Hudson Bay, tracking migration patterns and sea ice dependency.',
    proposalId: 'p1', fundingGoal: 50000, fundingReceived: 34200, status: 'active',
    votesFor: 450, votesAgainst: 120,
  },
  {
    id: 'mp2', lat: 78.2, lng: 15.6,
    charityId: 'wwf-uk', charityName: 'WWF', charityLogo: wwfLogo,
    missionName: 'Svalbard Marine Conservation',
    description: 'Protecting marine ecosystems around the Svalbard archipelago through research, advocacy, and community engagement with local fisheries.',
    proposalId: 'p2', fundingGoal: 75000, fundingReceived: 52100, status: 'voting',
    votesFor: 380, votesAgainst: 90,
  },
  {
    id: 'mp3', lat: 67.5, lng: -170.0,
    charityId: 'greenpeace', charityName: 'Greenpeace', charityLogo: greenpeaceLogo,
    missionName: 'Chukchi Sea Ice Research',
    description: 'Studying the rapid decline of sea ice in the Chukchi Sea and its impact on arctic marine ecosystems and indigenous communities.',
    proposalId: 'p3', fundingGoal: 40000, fundingReceived: 40000, status: 'funded',
  },
  {
    id: 'mp4', lat: 71.3, lng: -156.8,
    charityId: 'ocean-conservancy', charityName: 'Ocean Conservancy', charityLogo: oceanConservancyLogo,
    missionName: 'Beaufort Sea Cleanup',
    description: 'Addressing microplastic pollution in the Beaufort Sea, one of the last pristine Arctic marine environments.',
    proposalId: 'p4', fundingGoal: 35000, fundingReceived: 12800, status: 'active',
    votesFor: 210, votesAgainst: 45,
  },
  {
    id: 'mp5', lat: 64.2, lng: -51.7,
    charityId: 'conservation-intl', charityName: 'Conservation Intl', charityLogo: conservationIntlLogo,
    missionName: 'Greenland Glacier Study',
    description: 'Monitoring glacier retreat rates in Greenland and assessing impact on global sea levels and local ecosystems.',
    proposalId: 'p5', fundingGoal: 60000, fundingReceived: 28400, status: 'planned',
  },
  {
    id: 'mp6', lat: 61.2, lng: -149.9,
    charityId: 'sierra-club', charityName: 'Sierra Club', charityLogo: sierraClubLogo,
    missionName: 'Alaska Wilderness Preservation',
    description: 'Advocating for the protection of critical wilderness areas in Alaska from industrial development and resource extraction.',
    proposalId: 'p6', fundingGoal: 45000, fundingReceived: 31000, status: 'voting',
    votesFor: 320, votesAgainst: 110,
  },
];

// ─── MISSION PIN ICON ───

const createMissionIcon = (logo: string, status: string) => {
  const borderColor = status === 'active' ? '#22c55e' : status === 'voting' ? '#0ea5e9' : status === 'funded' ? '#a855f7' : '#94a3b8';
  return new DivIcon({
    className: '',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -22],
    html: `<div style="width:36px;height:36px;border-radius:50%;border:3px solid ${borderColor};background:white;box-shadow:0 2px 8px rgba(0,0,0,0.2);overflow:hidden;display:flex;align-items:center;justify-content:center;">
      <img src="${logo}" style="width:28px;height:28px;border-radius:50%;object-fit:cover;" />
    </div>
    <div style="position:absolute;bottom:-4px;left:50%;transform:translateX(-50%);width:8px;height:8px;background:${borderColor};border-radius:50%;box-shadow:0 0 6px ${borderColor}80;"></div>`,
  });
};

// ─── POLAR BEAR ICON ───

const polarBearIcon = new DivIcon({
  className: '',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
  html: `<div style="width:24px;height:24px;border-radius:50%;background:white;border:2px solid #60a5fa;box-shadow:0 1px 4px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:12px;">🐻‍❄️</div>`,
});

// ─── MAP CONTROLLER (handles view) ───

const MapController: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    map.setView([68, -40], 3);
  }, [map]);
  return null;
};

// ─── MAIN COMPONENT ───

const MapPage: React.FC = () => {
  const [hoveredPin, setHoveredPin] = useState<string | null>(null);
  const [polarBears, setPolarBears] = useState<PolarBearData[]>([]);
  const [showBears, setShowBears] = useState(true);

  // Load real polar bear tracking data
  useEffect(() => {
    try {
      const data = getPolarBearData();
      setPolarBears(data.slice(0, 40));
    } catch (e) {
      console.error('Failed to load polar bear data:', e);
    }
  }, []);

  const statusConfig = {
    active: { label: 'Active', bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
    voting: { label: 'In Voting', bg: 'bg-arctic-100', text: 'text-arctic-700', dot: 'bg-arctic-500' },
    funded: { label: 'Funded', bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-500' },
    planned: { label: 'Planned', bg: 'bg-ice-100', text: 'text-ice-600', dot: 'bg-ice-400' },
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] w-full overflow-hidden">

      {/* Map */}
      <MapContainer
        center={[68, -40] as LatLngExpression}
        zoom={3}
        minZoom={2}
        maxZoom={12}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
        maxBounds={[[-85, -180], [85, 180]]}
        maxBoundsViscosity={1.0}
      >
        <MapController />

        {/* Clean dark basemap */}
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Mission Pins */}
        {MISSION_PINS.map((pin) => (
          <Marker
            key={pin.id}
            position={[pin.lat, pin.lng] as LatLngExpression}
            icon={createMissionIcon(pin.charityLogo, pin.status)}
            eventHandlers={{
              mouseover: () => setHoveredPin(pin.id),
              mouseout: () => setHoveredPin(null),
            }}
          >
            <Popup className="mission-popup" maxWidth={300} minWidth={260}>
              <div className="p-1">
                <div className="flex items-center gap-2 mb-2">
                  <img src={pin.charityLogo} alt={pin.charityName} className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                  <div>
                    <div className="font-bold text-sm text-gray-900">{pin.missionName}</div>
                    <div className="text-xs text-gray-500">{pin.charityName}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed mb-3">{pin.description}</p>

                {/* Funding progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Funding</span>
                    <span className="font-bold text-gray-700">{Math.round((pin.fundingReceived / pin.fundingGoal) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600 rounded-full" style={{ width: `${Math.min(100, (pin.fundingReceived / pin.fundingGoal) * 100)}%` }} />
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">${(pin.fundingReceived / 1000).toFixed(1)}k / ${(pin.fundingGoal / 1000).toFixed(0)}k raised</div>
                </div>

                {/* Vote status (if voting) */}
                {pin.votesFor !== undefined && pin.status === 'voting' && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg">
                    <div className="text-[10px] font-bold text-blue-700 mb-1">Active Vote</div>
                    <div className="flex items-center gap-1 h-1.5">
                      <div className="bg-green-400 rounded-full h-full" style={{ width: `${Math.round((pin.votesFor / (pin.votesFor + (pin.votesAgainst || 0))) * 100)}%` }} />
                      <div className="bg-red-300 rounded-full h-full flex-1" />
                    </div>
                    <div className="flex justify-between text-[10px] mt-0.5">
                      <span className="text-green-600">{pin.votesFor} for</span>
                      <span className="text-red-500">{pin.votesAgainst} against</span>
                    </div>
                  </div>
                )}

                {/* Status badge */}
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${statusConfig[pin.status].bg} ${statusConfig[pin.status].text}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[pin.status].dot}`} />
                    {statusConfig[pin.status].label}
                  </span>
                  <div className="flex gap-1.5">
                    {pin.status === 'voting' && (
                      <a href="/vote" className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">Vote →</a>
                    )}
                    <a href={`/charity/${pin.charityId}`} className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors">Donate →</a>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Polar Bear Markers (real USGS data) */}
        {showBears && polarBears.map((bear) => (
          <Marker
            key={bear.id + bear.lastUpdated}
            position={[bear.currentLocation.lat, bear.currentLocation.lng] as LatLngExpression}
            icon={polarBearIcon}
          >
            <Popup maxWidth={200}>
              <div className="p-1">
                <div className="font-bold text-xs text-gray-900 mb-0.5">{bear.name || `Bear #${bear.id}`}</div>
                <div className="text-[10px] text-gray-500">{bear.region}</div>
                <div className="text-[10px] text-gray-400 mt-1">
                  {new Date(bear.lastUpdated).toLocaleDateString()} • USGS Tracking
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay: Title + Legend */}
      <motion.div
        initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}
        className="absolute top-4 left-4 z-[1000]"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-ice-100 px-4 py-3">
          <h1 className="text-sm font-bold text-ice-900 mb-2">Climate Map</h1>
          <div className="space-y-1.5">
            {[
              { color: 'bg-green-500', label: 'Active Mission' },
              { color: 'bg-arctic-500', label: 'In Voting' },
              { color: 'bg-purple-500', label: 'Funded' },
              { color: 'bg-ice-400', label: 'Planned' },
            ].map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${l.color}`} />
                <span className="text-[10px] text-ice-600">{l.label}</span>
              </div>
            ))}
          </div>
          {/* Bear toggle */}
          <button
            onClick={() => setShowBears(!showBears)}
            className={`mt-2 flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors ${showBears ? 'bg-arctic-50 text-arctic-700' : 'bg-ice-100 text-ice-500'}`}
          >
            🐻‍❄️ {showBears ? 'Hide' : 'Show'} Bears ({polarBears.length})
          </button>
        </div>
      </motion.div>

      {/* Zoom Controls */}
      <div className="absolute bottom-6 right-4 z-[1000] flex flex-col gap-1.5">
        <button onClick={() => document.querySelector('.leaflet-container')?.dispatchEvent(new Event('zoomIn'))}
          className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-ice-100 flex items-center justify-center text-ice-600 hover:text-ice-900 hover:bg-white transition-all text-lg font-light"
          id="zoom-in"
        >+</button>
        <button onClick={() => document.querySelector('.leaflet-container')?.dispatchEvent(new Event('zoomOut'))}
          className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-ice-100 flex items-center justify-center text-ice-600 hover:text-ice-900 hover:bg-white transition-all text-lg font-light"
          id="zoom-out"
        >−</button>
      </div>

      {/* Mission count badge */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}
        className="absolute bottom-6 left-4 z-[1000]"
      >
        <div className="bg-white/90 backdrop-blur-md rounded-xl shadow-lg border border-ice-100 px-4 py-2.5 flex items-center gap-3">
          <div className="text-center">
            <div className="text-lg font-black text-ice-900">{MISSION_PINS.filter(p => p.status === 'active' || p.status === 'voting').length}</div>
            <div className="text-[9px] text-ice-400 uppercase tracking-wide">Active</div>
          </div>
          <div className="w-px h-8 bg-ice-200" />
          <div className="text-center">
            <div className="text-lg font-black text-ice-900">{MISSION_PINS.length}</div>
            <div className="text-[9px] text-ice-400 uppercase tracking-wide">Missions</div>
          </div>
          <div className="w-px h-8 bg-ice-200" />
          <div className="text-center">
            <div className="text-lg font-black text-ice-900">{polarBears.length}</div>
            <div className="text-[9px] text-ice-400 uppercase tracking-wide">Bears</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default MapPage;

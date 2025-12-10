import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, CircleMarker, useMapEvents, Polygon } from 'react-leaflet';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FunnelIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ChartBarIcon,
  EyeIcon,
  EyeSlashIcon,
  MapIcon,
  XMarkIcon,
  SwatchIcon,
  ArrowPathIcon,
  BoltIcon,
  SignalIcon,
  GlobeAltIcon,
  RectangleStackIcon,
  CloudIcon
} from '@heroicons/react/24/outline';
import TransactionBoard from '@/components/TransactionBoard';

// Fix for default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// DexScreener-inspired types
type ColorMode = 'fixed' | 'property' | 'function' | 'measure';
type StrokePattern = 'solid' | 'dashed' | 'dotted';
type InterpolationMode = 'linear' | 'last-known-point';
type DataStreamStatus = 'connected' | 'connecting' | 'disconnected';

interface CharityBase {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  type: 'headquarters' | 'regional' | 'field';
  activeProjects: number;
  category: string;
  fundingReceived: number;
  lastActivity: Date;
  impact: number;
  properties: Record<string, any>;
  pulseIntensity?: number;
  recentActivity?: boolean;
  // Climate data for this region
  regionalClimateData: {
    avgTemperature: number; // Current average in Celsius
    temperatureTrend: number; // Change over last decade
    airQualityIndex: number; // 0-500 scale
    forestCoverage: number; // percentage
    waterAvailability: number; // percentage
    carbonFootprint: number; // tons CO2/year
    renewableEnergy: number; // percentage of total energy
  };
}

interface FlightPath {
  id: string;
  from: { lat: number; lng: number };
  to: { lat: number; lng: number };
  fromName: string;
  toName: string;
  amount: number;
  type: 'funding' | 'data' | 'collaboration';
  active: boolean;
  timestamp: Date;
  speed: number;
  intensity?: number;
}

interface ClimateZone {
  id: string;
  location: { lat: number; lng: number };
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'drought' | 'flooding' | 'temperature' | 'deforestation' | 'pollution';
  radius: number;
  affectedPopulation: number;
  trend: 'improving' | 'stable' | 'worsening';
  changing?: boolean;
  // Real climate metrics
  temperatureChange: number; // in Celsius
  co2Level: number; // ppm
  seaLevelRise: number; // in mm
  biodiversityLoss: number; // percentage
  deforestationRate: number; // hectares per year
  waterStress: number; // percentage
  lastUpdated: Date;
  // Polygon boundaries for region shape (optional, falls back to circle if not provided)
  polygonBounds?: [number, number][];
}

interface LayerStyleConfig {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  activeOpacity: number;
  inactiveOpacity: number;
  color: string;
  colorMode: ColorMode;
  strokePattern: StrokePattern;
  strokeWidth: number;
  showArrows: boolean;
  fillPolygons: boolean;
  icon: any;
  minZoom: number;
  maxZoom: number;
  showLegend: boolean;
  showLabels: boolean;
  showTooltips: boolean;
}

interface SavedStyle {
  id: string;
  name: string;
  description: string;
  layers: LayerStyleConfig[];
}

interface MapFilter {
  category: string[];
  type: string[];
  severity: string[];
  fundingRange: [number, number];
  dateRange: [Date, Date] | null;
  impactThreshold: number;
}

// Performance-optimized color interpolation with memoization
const interpolateColor = (value: number, min: number, max: number, colorScale: string[]) => {
  const normalized = Math.max(0, Math.min(1, (value - min) / (max - min)));
  const index = Math.floor(normalized * (colorScale.length - 1));
  return colorScale[index] || colorScale[colorScale.length - 1];
};

const getPropertyColor = (object: any, property: string, colorMap: Record<string, string>) => {
  return colorMap[object[property]] || '#94a3b8';
};

const computeFunctionColor = (object: any, computeFn: (obj: any) => string) => {
  return computeFn(object);
};

// Arc path with performance optimization
const createArcPath = (
  from: { lat: number; lng: number },
  to: { lat: number; lng: number },
  numPoints: number = 50,
  arcHeight: number = 0.3
): LatLngExpression[] => {
  const points: LatLngExpression[] = [];
  const latDiff = to.lat - from.lat;
  const lngDiff = to.lng - from.lng;
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  const height = distance * arcHeight;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = from.lat + latDiff * t + Math.sin(t * Math.PI) * height;
    const lng = from.lng + lngDiff * t;
    points.push([lat, lng]);
  }
  return points;
};

// Temporal opacity calculation
const calculateTemporalOpacity = (
  timestamp: Date,
  currentTime: Date,
  activeOpacity: number,
  inactiveOpacity: number,
  bufferPeriod: number = 3600000,
  fadeDuration: number = 1800000
): number => {
  const timeDiff = currentTime.getTime() - timestamp.getTime();
  if (timeDiff < bufferPeriod) return activeOpacity;
  if (timeDiff > bufferPeriod + fadeDuration) return inactiveOpacity;
  const fadeProgress = (timeDiff - bufferPeriod) / fadeDuration;
  return activeOpacity + (inactiveOpacity - activeOpacity) * fadeProgress;
};

// DexScreener-style animated flight path with pulse
const AnimatedFlightPath: React.FC<{
  path: FlightPath;
  style: LayerStyleConfig;
  currentTime: Date;
  interpolation: InterpolationMode;
}> = ({ path, style, currentTime, interpolation }) => {
  const [animationProgress, setAnimationProgress] = useState(Math.random());
  const [pulseScale, setPulseScale] = useState(1);

  useEffect(() => {
    if (!path.active) return;
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev >= 1 ? 0 : prev + path.speed * 0.008));
      setPulseScale(prev => (prev >= 1.3 ? 1 : prev + 0.01));
    }, 60); // Slower, more relaxing animation
    return () => clearInterval(interval);
  }, [path.active, path.speed]);

  const arcPoints = useMemo(() => createArcPath(path.from, path.to), [path.from, path.to]);
  const pointIndex = interpolation === 'linear'
    ? Math.floor(animationProgress * (arcPoints.length - 1))
    : arcPoints.length - 1;
  const animatedPoint = arcPoints[pointIndex] as [number, number];

  const opacity = calculateTemporalOpacity(
    path.timestamp,
    currentTime,
    style.activeOpacity,
    style.inactiveOpacity
  );

  const dashArray = style.strokePattern === 'dashed' ? '12, 8'
    : style.strokePattern === 'dotted' ? '2, 6'
    : undefined;

  return (
    <>
      <Polyline
        positions={arcPoints}
        pathOptions={{
          color: style.color,
          weight: style.strokeWidth,
          opacity: opacity * 0.7,
          dashArray
        }}
      />
      {path.active && animatedPoint && (
        <>
          {/* Outer pulse ring */}
          <Circle
            center={animatedPoint}
            radius={50000 * pulseScale}
            pathOptions={{
              color: style.color,
              fillColor: style.color,
              fillOpacity: (opacity * 0.3) / pulseScale,
              weight: 0
            }}
          />
          {/* Inner solid marker */}
          <Circle
            center={animatedPoint}
            radius={25000}
            pathOptions={{
              color: '#ffffff',
              fillColor: style.color,
              fillOpacity: opacity * 0.9,
              weight: 2
            }}
          />
          {style.showArrows && pointIndex > 0 && (
            <CircleMarker
              center={animatedPoint}
              radius={6}
              pathOptions={{
                color: '#ffffff',
                fillColor: style.color,
                fillOpacity: 1,
                weight: 2
              }}
            />
          )}
        </>
      )}
    </>
  );
};

// Get category icon SVG path
const getCategoryIcon = (category: string): string => {
  switch (category) {
    case 'Climate':
      // Thermometer/climate icon
      return '<path d="M12 2c-1.1 0-2 .9-2 2v8.5c-1.2.7-2 2-2 3.5 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.5-.8-2.8-2-3.5V4c0-1.1-.9-2-2-2zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="white"/>';
    case 'Conservation':
      // Shield/protection icon
      return '<path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm0 14l-4-4 1.4-1.4 2.6 2.6 4.6-4.6L18 10l-6 6z" fill="white"/>';
    case 'Wildlife':
      // Paw print icon
      return '<path d="M8.5 6c-1.4 0-2.5 1.1-2.5 2.5S7.1 11 8.5 11 11 9.9 11 8.5 9.9 6 8.5 6zm7 0c-1.4 0-2.5 1.1-2.5 2.5S14.1 11 15.5 11 18 9.9 18 8.5 16.9 6 15.5 6zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 3c-2.2 0-4 1.8-4 4s1.8 3 4 3 4-1.8 4-4-1.8-3-4-3z" fill="white"/>';
    case 'Water':
      // Water droplet icon
      return '<path d="M12 2c-3.9 3.9-7 7.5-7 11 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.5-3.1-7.1-7-11zm0 16c-2.2 0-4-1.8-4-4 0-1.5 1.5-3.5 4-6.4 2.5 2.9 4 4.9 4 6.4 0 2.2-1.8 4-4 4z" fill="white"/>';
    case 'Forest':
      // Tree icon
      return '<path d="M16.5 11L19 8h-3V3h-4v5H9l2.5 3L9 14h3v7h4v-7h3z" fill="white"/>';
    default:
      // Default circle
      return '<circle cx="12" cy="12" r="4" fill="white"/>';
  }
};

// Enhanced marker with real-time pulse and category icons
const createPropertyBasedIcon = (
  object: CharityBase,
  colorMode: ColorMode,
  baseColor: string,
  propertyMap?: Record<string, string>,
  pulse: boolean = false
) => {
  const sizes = { headquarters: 36, regional: 28, field: 20 };
  const size = sizes[object.type] || 24;

  let color = baseColor;
  if (colorMode === 'property' && propertyMap) {
    color = getPropertyColor(object, 'category', propertyMap);
  } else if (colorMode === 'function') {
    color = computeFunctionColor(object, (obj) => {
      const impactColors = ['#ef4444', '#f59e0b', '#eab308', '#84cc16', '#22c55e'];
      return interpolateColor(obj.impact, 0, 100, impactColors);
    });
  } else if (colorMode === 'measure') {
    const fundingColors = ['#dbeafe', '#93c5fd', '#60a5fa', '#3b82f6', '#1d4ed8'];
    color = interpolateColor(object.fundingReceived, 0, 5000000, fundingColors);
  }

  const pulseRing = pulse ? `
    <circle cx="12" cy="12" r="11.5" fill="none" stroke="${color}" stroke-width="1" opacity="0.6">
      <animate attributeName="r" from="11" to="15" dur="2s" repeatCount="indefinite"/>
      <animate attributeName="opacity" from="0.6" to="0" dur="2s" repeatCount="indefinite"/>
    </circle>
  ` : '';

  const categoryIcon = getCategoryIcon(object.category);

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
        ${pulseRing}
        <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.3"/>
        <circle cx="12" cy="12" r="9" fill="${color}" opacity="0.8"/>
        ${categoryIcon}
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// Clean live data indicator - just the pulse
const LiveDataIndicator: React.FC<{ status: DataStreamStatus; updateCount: number }> = ({ status }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-center"
      title={status === 'connected' ? 'Live' : status === 'connecting' ? 'Connecting' : 'Offline'}
    >
      <motion.div
        animate={{
          scale: status === 'connected' ? [1, 1.3, 1] : 1,
          opacity: status === 'connected' ? [1, 0.6, 1] : 0.5
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`w-2.5 h-2.5 rounded-full shadow-lg ${
          status === 'connected' ? 'bg-green-500 shadow-green-500/50' :
          status === 'connecting' ? 'bg-yellow-500 shadow-yellow-500/50' :
          'bg-red-500 shadow-red-500/50'
        }`}
      />
    </motion.div>
  );
};

// Mini-map navigator (DexScreener-style)
const MiniMapNavigator: React.FC<{ bounds: any; onNavigate: (lat: number, lng: number) => void }> = ({ bounds, onNavigate }) => {
  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-gray-900/90 backdrop-blur-md border border-gray-700/50 rounded-lg p-2 w-32 h-24">
      <div className="text-xs text-gray-400 mb-1 font-semibold">OVERVIEW</div>
      <div className="w-full h-full bg-gray-800 rounded relative overflow-hidden cursor-pointer">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/20 to-blue-500/20"></div>
        <div className="absolute top-1/2 left-1/2 w-4 h-4 border-2 border-teal-500 rounded-sm -translate-x-1/2 -translate-y-1/2"></div>
      </div>
    </div>
  );
};

// Keyboard shortcuts overlay
const KeyboardShortcuts: React.FC<{ show: boolean; onClose: () => void }> = ({ show, onClose }) => {
  if (!show) return null;

  const shortcuts = [
    { key: 'L', action: 'Toggle Layers Panel' },
    { key: 'F', action: 'Toggle Filters Panel' },
    { key: 'A', action: 'Toggle Analytics Panel' },
    { key: 'S', action: 'Toggle Styles Panel' },
    { key: 'R', action: 'Refresh Data' },
    { key: 'ESC', action: 'Close Panels' },
    { key: '←/→/↑/↓', action: 'Pan Map' },
    { key: '+/-', action: 'Zoom In/Out' },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gray-900 border border-gray-700 rounded-xl p-6 max-w-md"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-gray-100 mb-4">Keyboard Shortcuts</h3>
        <div className="space-y-2">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-sm text-gray-400">{action}</span>
              <kbd className="px-2 py-1 bg-gray-800 text-gray-200 rounded text-xs font-mono border border-gray-700">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

// Clean Zoom Controls
const ZoomControls: React.FC = () => {
  const map = useMap();

  return (
    <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => map.zoomIn()}
        className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-md transition-all"
      >
        <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>+</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => map.zoomOut()}
        className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-md transition-all"
      >
        <span className="text-xl font-bold" style={{ color: '#3b82f6' }}>−</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => map.setView([20, 20], 2)}
        className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-md transition-all"
      >
        <GlobeAltIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
      </motion.button>
    </div>
  );
};

// Map interaction handler
const MapInteractionHandler: React.FC<{ onZoomChange: (zoom: number) => void }> = ({ onZoomChange }) => {
  const map = useMapEvents({
    zoomend: () => {
      onZoomChange(map.getZoom());
    },
  });
  return null;
};


const MapPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [charityBases, setCharityBases] = useState<CharityBase[]>([]);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const [climateZones, setClimateZones] = useState<ClimateZone[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBase, setSelectedBase] = useState<CharityBase | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [interpolationMode, setInterpolationMode] = useState<InterpolationMode>('linear');
  const [currentZoom, setCurrentZoom] = useState(2);
  const [dataStreamStatus, setDataStreamStatus] = useState<DataStreamStatus>('connected');
  const [updateCount, setUpdateCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState<'map' | 'transactions'>('map');

  // News feed state
  const [newsFeed, setNewsFeed] = useState([
    {
      id: 1,
      ngo: 'Greenpeace',
      title: 'Arctic Research Breakthrough',
      content: 'New findings show accelerated ice melt in northern regions. Our team is deploying additional monitoring stations.',
      timestamp: new Date(Date.now() - 3600000),
      category: 'Climate',
      logo: 'https://logo.clearbit.com/greenpeace.org'
    },
    {
      id: 2,
      ngo: 'Rainforest Alliance',
      title: '1 Million Trees Planted',
      content: 'Reached our milestone! Thanks to all supporters who made this reforestation initiative possible.',
      timestamp: new Date(Date.now() - 7200000),
      category: 'Forest',
      logo: 'https://logo.clearbit.com/rainforest-alliance.org'
    },
    {
      id: 3,
      ngo: 'Ocean Conservancy',
      title: 'Pacific Cleanup Update',
      content: 'Removed 50 tons of plastic this month. Progress is steady with our new drone technology.',
      timestamp: new Date(Date.now() - 14400000),
      category: 'Conservation',
      logo: 'https://logo.clearbit.com/oceanconservancy.org'
    },
    {
      id: 4,
      ngo: 'World Wide Fund for Nature',
      title: 'Endangered Species Recovery',
      content: 'Population of Arctic foxes increased by 15% this quarter thanks to protection efforts.',
      timestamp: new Date(Date.now() - 21600000),
      category: 'Wildlife',
      logo: 'https://logo.clearbit.com/worldwildlife.org'
    },
  ]);

  const [liveMissions, setLiveMissions] = useState([
    { id: 1, name: 'Arctic Ice Monitoring', location: 'Iceland', votes: 521, funding: 820000, progress: 68, status: 'active' as const },
    { id: 2, name: 'Amazon Protection', location: 'Brazil', votes: 498, funding: 950000, progress: 82, status: 'active' as const },
    { id: 3, name: 'Ocean Cleanup', location: 'Pacific', votes: 456, funding: 720000, progress: 45, status: 'active' as const },
  ]);

  // Saved style presets
  const [savedStyles] = useState<SavedStyle[]>([
    {
      id: 'default',
      name: 'Default View',
      description: 'Standard visualization with all layers',
      layers: []
    },
    {
      id: 'impact',
      name: 'Impact Focus',
      description: 'Highlights high-impact regions and projects',
      layers: []
    },
    {
      id: 'funding',
      name: 'Funding Flows',
      description: 'Emphasizes financial transactions and flows',
      layers: []
    },
    {
      id: 'climate',
      name: 'Climate Crisis',
      description: 'Shows critical climate zones and severity',
      layers: []
    }
  ]);

  const [activeStyleId, setActiveStyleId] = useState('default');

  // Layer configurations
  const [layers, setLayers] = useState<LayerStyleConfig[]>([
    {
      id: 'charities',
      name: 'Charity Bases',
      visible: true,
      opacity: 1,
      activeOpacity: 1,
      inactiveOpacity: 0.4,
      color: '#14b8a6',
      colorMode: 'function',
      strokePattern: 'solid',
      strokeWidth: 2,
      showArrows: false,
      fillPolygons: true,
      icon: Squares2X2Icon,
      minZoom: 0,
      maxZoom: 22,
      showLegend: true,
      showLabels: true,
      showTooltips: true
    },
    {
      id: 'funding',
      name: 'Funding Flows',
      visible: true,
      opacity: 0.85,
      activeOpacity: 0.95,
      inactiveOpacity: 0.3,
      color: '#22c55e',
      colorMode: 'measure',
      strokePattern: 'dashed',
      strokeWidth: 3,
      showArrows: true,
      fillPolygons: false,
      icon: ChartBarIcon,
      minZoom: 0,
      maxZoom: 22,
      showLegend: true,
      showLabels: false,
      showTooltips: true
    },
    {
      id: 'data',
      name: 'Data Streams',
      visible: true,
      opacity: 0.8,
      activeOpacity: 0.9,
      inactiveOpacity: 0.25,
      color: '#3b82f6',
      colorMode: 'fixed',
      strokePattern: 'dotted',
      strokeWidth: 2,
      showArrows: true,
      fillPolygons: false,
      icon: SignalIcon,
      minZoom: 0,
      maxZoom: 22,
      showLegend: true,
      showLabels: false,
      showTooltips: true
    },
    {
      id: 'collaboration',
      name: 'Collaborations',
      visible: true,
      opacity: 0.75,
      activeOpacity: 0.85,
      inactiveOpacity: 0.2,
      color: '#a855f7',
      colorMode: 'fixed',
      strokePattern: 'solid',
      strokeWidth: 2,
      showArrows: false,
      fillPolygons: false,
      icon: ChartBarIcon,
      minZoom: 0,
      maxZoom: 22,
      showLegend: true,
      showLabels: false,
      showTooltips: true
    },
    {
      id: 'climate',
      name: 'Climate Zones',
      visible: true,
      opacity: 1,
      activeOpacity: 1,
      inactiveOpacity: 0.6,
      color: '#ef4444',
      colorMode: 'property',
      strokePattern: 'solid',
      strokeWidth: 3,
      showArrows: false,
      fillPolygons: false,
      icon: MapIcon,
      minZoom: 0,
      maxZoom: 22,
      showLegend: true,
      showLabels: true,
      showTooltips: true
    },
  ]);

  // Filters
  const [filters, setFilters] = useState<MapFilter>({
    category: [],
    type: [],
    severity: [],
    fundingRange: [0, 10000000],
    dateRange: null,
    impactThreshold: 0
  });

  // Property-based color mapping
  const categoryColorMap = {
    'Climate': '#06b6d4',
    'Conservation': '#10b981',
    'Wildlife': '#f59e0b',
    'Water': '#3b82f6',
    'Forest': '#22c55e'
  };

  // Real-time data simulation (DexScreener-style)
  useEffect(() => {
    loadMockData();

    // Simulate live data updates every 3-5 seconds
    const dataUpdateInterval = setInterval(() => {
      simulateDataUpdate();
    }, 3000 + Math.random() * 2000);

    // Update current time every minute
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 60000);

    return () => {
      clearInterval(dataUpdateInterval);
      clearInterval(timeInterval);
    };
  }, []);

  // Keyboard shortcuts (DexScreener-style)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'l' || e.key === 'L') setShowLayerPanel(prev => !prev);
      if (e.key === 'f' || e.key === 'F') setShowFilterPanel(prev => !prev);
      if (e.key === 's' || e.key === 'S') setShowStylesPanel(prev => !prev);
      if (e.key === 'r' || e.key === 'R') handleRefresh();
      if (e.key === 'Escape') {
        setShowLayerPanel(false);
        setShowFilterPanel(false);
        setShowStylesPanel(false);
        setShowKeyboardShortcuts(false);
      };
      if (e.key === '?') setShowKeyboardShortcuts(prev => !prev);
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const simulateDataUpdate = () => {
    setUpdateCount(prev => prev + 1);

    // Randomly add pulse to some bases
    setCharityBases(prev => prev.map(base => ({
      ...base,
      recentActivity: Math.random() > 0.7,
      pulseIntensity: Math.random()
    })));

    // Update flight path intensities
    setFlightPaths(prev => prev.map(path => ({
      ...path,
      intensity: Math.random()
    })));

    // Occasionally update climate zones
    if (Math.random() > 0.8) {
      setClimateZones(prev => prev.map(zone => ({
        ...zone,
        changing: Math.random() > 0.5
      })));
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setDataStreamStatus('connecting');

    setTimeout(() => {
      loadMockData();
      setDataStreamStatus('connected');
      setIsRefreshing(false);
      setUpdateCount(0);
    }, 1000);
  }, []);

  const loadMockData = () => {
    const mockBases: CharityBase[] = [
      {
        id: 'hq1', name: 'Global Climate HQ', location: { lat: 40.7128, lng: -74.0060 }, type: 'headquarters',
        activeProjects: 45, category: 'Climate', fundingReceived: 2500000, lastActivity: new Date(), impact: 95,
        properties: { region: 'Americas', established: 2010 },
        regionalClimateData: { avgTemperature: 12.5, temperatureTrend: +1.2, airQualityIndex: 85, forestCoverage: 24, waterAvailability: 78, carbonFootprint: 45000, renewableEnergy: 32 }
      },
      {
        id: 'hq2', name: 'EU Operations', location: { lat: 51.5074, lng: -0.1278 }, type: 'headquarters',
        activeProjects: 38, category: 'Conservation', fundingReceived: 1800000, lastActivity: new Date(), impact: 88,
        properties: { region: 'Europe', established: 2012 },
        regionalClimateData: { avgTemperature: 10.8, temperatureTrend: +0.9, airQualityIndex: 72, forestCoverage: 38, waterAvailability: 85, carbonFootprint: 38000, renewableEnergy: 48 }
      },
      {
        id: 'hq3', name: 'Asia-Pacific Hub', location: { lat: 35.6762, lng: 139.6503 }, type: 'headquarters',
        activeProjects: 52, category: 'Wildlife', fundingReceived: 3200000, lastActivity: new Date(), impact: 92,
        properties: { region: 'Asia', established: 2008 },
        regionalClimateData: { avgTemperature: 16.3, temperatureTrend: +1.5, airQualityIndex: 145, forestCoverage: 31, waterAvailability: 68, carbonFootprint: 52000, renewableEnergy: 28 }
      },
      {
        id: 'r1', name: 'African Regional', location: { lat: -1.2921, lng: 36.8219 }, type: 'regional',
        activeProjects: 28, category: 'Water', fundingReceived: 950000, lastActivity: new Date(), impact: 78,
        properties: { region: 'Africa', established: 2015 },
        regionalClimateData: { avgTemperature: 24.5, temperatureTrend: +1.8, airQualityIndex: 95, forestCoverage: 42, waterAvailability: 45, carbonFootprint: 12000, renewableEnergy: 18 }
      },
      {
        id: 'r2', name: 'South America', location: { lat: -23.5505, lng: -46.6333 }, type: 'regional',
        activeProjects: 31, category: 'Forest', fundingReceived: 1200000, lastActivity: new Date(), impact: 85,
        properties: { region: 'South America', established: 2013 },
        regionalClimateData: { avgTemperature: 19.5, temperatureTrend: +1.3, airQualityIndex: 105, forestCoverage: 58, waterAvailability: 72, carbonFootprint: 28000, renewableEnergy: 42 }
      },
      {
        id: 'r3', name: 'Middle East', location: { lat: 25.2048, lng: 55.2708 }, type: 'regional',
        activeProjects: 22, category: 'Climate', fundingReceived: 780000, lastActivity: new Date(), impact: 72,
        properties: { region: 'Middle East', established: 2016 },
        regionalClimateData: { avgTemperature: 28.2, temperatureTrend: +2.1, airQualityIndex: 165, forestCoverage: 8, waterAvailability: 22, carbonFootprint: 68000, renewableEnergy: 15 }
      },
      {
        id: 'f1', name: 'Arctic Research', location: { lat: 64.1466, lng: -21.9426 }, type: 'field',
        activeProjects: 8, category: 'Climate', fundingReceived: 450000, lastActivity: new Date(), impact: 68,
        properties: { region: 'Arctic', established: 2018 },
        regionalClimateData: { avgTemperature: -2.5, temperatureTrend: +3.2, airQualityIndex: 25, forestCoverage: 12, waterAvailability: 95, carbonFootprint: 5000, renewableEnergy: 65 }
      },
      {
        id: 'f2', name: 'Amazon Station', location: { lat: -3.4653, lng: -62.2159 }, type: 'field',
        activeProjects: 12, category: 'Forest', fundingReceived: 620000, lastActivity: new Date(), impact: 82,
        properties: { region: 'Amazon', established: 2014 },
        regionalClimateData: { avgTemperature: 26.8, temperatureTrend: +1.6, airQualityIndex: 45, forestCoverage: 78, waterAvailability: 88, carbonFootprint: 8000, renewableEnergy: 72 }
      },
    ];

    const mockPaths: FlightPath[] = [
      { id: 'fp1', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 51.5074, lng: -0.1278 }, fromName: 'NY', toName: 'London', amount: 250000, type: 'funding', active: true, timestamp: new Date(Date.now() - 3600000), speed: 1.2 },
      { id: 'fp2', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -1.2921, lng: 36.8219 }, fromName: 'London', toName: 'Kenya', amount: 180000, type: 'funding', active: true, timestamp: new Date(Date.now() - 7200000), speed: 0.9 },
      { id: 'fp3', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 1.3521, lng: 103.8198 }, fromName: 'Tokyo', toName: 'Singapore', amount: 120000, type: 'collaboration', active: true, timestamp: new Date(Date.now() - 1800000), speed: 1.5 },
      { id: 'fp4', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 35.6762, lng: 139.6503 }, fromName: 'NY', toName: 'Tokyo', amount: 340000, type: 'data', active: true, timestamp: new Date(Date.now() - 5400000), speed: 0.8 },
      { id: 'fp5', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -23.5505, lng: -46.6333 }, fromName: 'London', toName: 'Brazil', amount: 210000, type: 'funding', active: true, timestamp: new Date(), speed: 1.0 },
    ];

    const mockZones: ClimateZone[] = [
      {
        id: 'cz1', location: { lat: -3.4653, lng: -62.2159 }, name: 'Amazon Deforestation Crisis', severity: 'critical',
        type: 'deforestation', radius: 400000, affectedPopulation: 2500000, trend: 'worsening',
        temperatureChange: +1.8, co2Level: 425, seaLevelRise: 0, biodiversityLoss: 32, deforestationRate: 7900, waterStress: 28, lastUpdated: new Date(),
        polygonBounds: [
          [-5, -73], [-1, -73], [2, -70], [2, -60], [0, -50], [-10, -50], [-15, -60], [-10, -70], [-5, -73]
        ]
      },
      {
        id: 'cz2', location: { lat: 23.8859, lng: 45.0792 }, name: 'Sahara Expansion', severity: 'high',
        type: 'drought', radius: 600000, affectedPopulation: 1800000, trend: 'worsening',
        temperatureChange: +2.3, co2Level: 418, seaLevelRise: 0, biodiversityLoss: 45, deforestationRate: 0, waterStress: 78, lastUpdated: new Date(),
        polygonBounds: [
          [30, 20], [32, 35], [30, 50], [25, 55], [20, 50], [15, 45], [12, 30], [15, 15], [20, 10], [28, 15], [30, 20]
        ]
      },
      {
        id: 'cz3', location: { lat: 28.6139, lng: 77.2090 }, name: 'Delhi Air Pollution', severity: 'critical',
        type: 'pollution', radius: 200000, affectedPopulation: 20000000, trend: 'worsening',
        temperatureChange: +1.5, co2Level: 445, seaLevelRise: 0, biodiversityLoss: 18, deforestationRate: 450, waterStress: 52, lastUpdated: new Date(),
        polygonBounds: [
          [29.5, 76], [29.5, 78.5], [28, 79], [27, 78.5], [27, 76], [28, 75.5], [29.5, 76]
        ]
      },
      {
        id: 'cz4', location: { lat: 64.1466, lng: -21.9426 }, name: 'Arctic Ice Melt', severity: 'critical',
        type: 'temperature', radius: 500000, affectedPopulation: 150000, trend: 'worsening',
        temperatureChange: +3.8, co2Level: 422, seaLevelRise: 3.4, biodiversityLoss: 28, deforestationRate: 0, waterStress: 15, lastUpdated: new Date(),
        polygonBounds: [
          [80, -180], [80, -90], [75, -50], [70, -20], [70, 0], [75, 30], [80, 60], [80, 90], [80, 120], [75, 150], [70, 180], [65, 170], [60, 140], [55, 100], [55, 50], [60, 0], [65, -40], [70, -80], [75, -120], [80, -180]
        ]
      },
      {
        id: 'cz5', location: { lat: 6.5244, lng: 3.3792 }, name: 'Lagos Coastal Flooding', severity: 'high',
        type: 'flooding', radius: 150000, affectedPopulation: 5000000, trend: 'worsening',
        temperatureChange: +1.2, co2Level: 415, seaLevelRise: 2.8, biodiversityLoss: 22, deforestationRate: 1200, waterStress: 45, lastUpdated: new Date(),
        polygonBounds: [
          [7, 2.5], [7, 4.5], [6.2, 5], [5.8, 4.5], [5.8, 2.5], [6.2, 2], [7, 2.5]
        ]
      },
    ];

    setCharityBases(mockBases);
    setFlightPaths(mockPaths);
    setClimateZones(mockZones);
  };

  const toggleLayer = (layerId: string) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, visible: !l.visible } : l));
  };

  const updateLayerProperty = (layerId: string, property: string, value: any) => {
    setLayers(prev => prev.map(l => l.id === layerId ? { ...l, [property]: value } : l));
  };

  const getLayerByType = (type: string) => layers.find(l => l.id === type);

  const getSeverityColor = (severity: string) => {
    const severityMap: Record<string, string> = {
      critical: '#dc2626',
      high: '#ea580c',
      medium: '#d97706',
      low: '#ca8a04'
    };
    return severityMap[severity] || '#6b7280';
  };


  const filteredBases = useMemo(() => {
    return charityBases.filter(base => {
      // Search filter
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = base.name.toLowerCase().includes(query);
        const matchesCategory = base.category.toLowerCase().includes(query);
        const matchesRegion = base.properties.region?.toLowerCase().includes(query);
        if (!matchesName && !matchesCategory && !matchesRegion) return false;
      }
      if (filters.category.length > 0 && !filters.category.includes(base.category)) return false;
      if (filters.type.length > 0 && !filters.type.includes(base.type)) return false;
      if (base.impact < filters.impactThreshold) return false;
      if (base.fundingReceived < filters.fundingRange[0] || base.fundingReceived > filters.fundingRange[1]) return false;
      return true;
    });
  }, [charityBases, searchQuery, filters]);

  const filteredPaths = useMemo(() => {
    return flightPaths.filter(path => {
      const layer = getLayerByType(path.type);
      if (!layer?.visible) return false;
      if (currentZoom < layer.minZoom || currentZoom > layer.maxZoom) return false;
      return true;
    });
  }, [flightPaths, layers, currentZoom]);

  const filteredZones = useMemo(() => {
    return climateZones.filter(zone => {
      if (filters.severity.length > 0 && !filters.severity.includes(zone.severity)) return false;
      const layer = getLayerByType('climate');
      if (currentZoom < (layer?.minZoom || 0) || currentZoom > (layer?.maxZoom || 22)) return false;
      return true;
    });
  }, [climateZones, filters, currentZoom]);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex flex-col overflow-hidden">
      {/* Clean Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100 px-6 py-4 flex items-center justify-between z-10 shadow-sm">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold flex items-center space-x-2">
            <GlobeAltIcon className="w-7 h-7" style={{ color: '#3b82f6' }} />
            <span style={{ color: '#3b82f6' }}>Global Impact Network</span>
          </h1>
          <LiveDataIndicator status={dataStreamStatus} updateCount={updateCount} />
        </div>

        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#3b82f6' }} />
            <input
              type="text"
              placeholder="Search charities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 bg-white text-gray-700 text-sm rounded-lg border border-blue-200 focus:outline-none w-56 placeholder-gray-400 shadow-sm"
              style={{ '--tw-ring-color': '#3b82f6' } as React.CSSProperties}
              onFocus={(e) => e.target.style.boxShadow = '0 0 0 2px #3b82f6'}
              onBlur={(e) => e.target.style.boxShadow = ''}
            />
          </div>

          <div className="h-6 w-px bg-blue-200"></div>

          {/* View Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setViewMode(viewMode === 'map' ? 'transactions' : 'map')}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 shadow-sm ${
              viewMode === 'transactions'
                ? 'bg-gray-900 text-white shadow-lg'
                : 'bg-white border border-blue-200 hover:bg-blue-50 text-gray-700'
            }`}
          >
            {viewMode === 'map' ? <RectangleStackIcon className="w-5 h-5" /> : <MapIcon className="w-5 h-5" />}
            <span className="text-sm font-semibold">{viewMode === 'map' ? 'Transaction Board' : 'Map View'}</span>
          </motion.button>

          {/* Filter Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-2 shadow-sm ${
              showFilterPanel
                ? 'text-white shadow-lg'
                : 'bg-white border border-blue-200 hover:bg-blue-50'
            }`}
            style={showFilterPanel ? { backgroundColor: '#3b82f6' } : { color: '#3b82f6' }}
          >
            <FunnelIcon className="w-5 h-5" />
            <span className="text-sm font-semibold">Filter</span>
          </motion.button>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white border border-blue-200 hover:bg-blue-50 transition-all shadow-sm"
            style={{ color: '#3b82f6' }}
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      {/* Trending - DexScreener Style */}
      <div className="px-6 pt-3 pb-2">
        <div className="bg-white rounded-lg border border-blue-100 shadow-sm px-4 py-2">
          <div className="flex items-center gap-4 overflow-x-hidden">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-bold text-gray-700">Trending Non-Profits</span>
              <BoltIcon className="w-4 h-4" style={{ color: '#3b82f6' }} />
            </div>
            <div className="flex items-center gap-3">
              {charityBases
                .sort((a, b) => b.fundingReceived - a.fundingReceived)
                .slice(0, 6)
                .map((charity, index) => (
                  <motion.button
                    key={charity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.4 }}
                    onClick={() => navigate(`/donate`)}
                    className="group relative flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all cursor-pointer"
                  >
                    <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                    <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {charity.name.split(' ')[0]}
                    </span>

                    {/* Hover tooltip */}
                    <div className="absolute top-full left-0 mt-2 hidden group-hover:block z-50 w-64">
                      <div className="bg-gray-900 text-white text-xs rounded-lg p-3 shadow-2xl">
                        <div className="font-bold mb-2 text-sm">{charity.name}</div>
                        <div className="space-y-1 text-gray-300">
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="text-white font-semibold">{charity.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Funding:</span>
                            <span className="text-green-400 font-semibold">${(charity.fundingReceived / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Projects:</span>
                            <span className="text-blue-400 font-semibold">{charity.activeProjects}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Region:</span>
                            <span className="text-white font-semibold">{charity.properties.region}</span>
                          </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400 italic">
                          Click to donate
                        </div>
                        <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </motion.button>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex relative px-6 pb-6 gap-6 overflow-hidden">
        {/* Conditional View: Map or Transaction Board */}
        <div className="flex-1 relative rounded-2xl shadow-xl border border-blue-200 overflow-hidden" style={{ backgroundColor: '#3b82f6' }}>
          {viewMode === 'transactions' ? (
            <div className="h-full overflow-auto">
              <TransactionBoard />
            </div>
          ) : (
          <MapContainer
            center={[20, 20]}
            zoom={2}
            minZoom={2}
            maxZoom={18}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="bg-blue-50"
            maxBounds={[[-85, -180], [85, 180]]}
            maxBoundsViscosity={1.0}
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />

            <MapInteractionHandler onZoomChange={setCurrentZoom} />
            <ZoomControls />

            {/* Climate Zones */}
            {getLayerByType('climate')?.visible && filteredZones.map(zone => {
              const layer = getLayerByType('climate')!;
              const pathOptions = {
                color: getSeverityColor(zone.severity),
                fillColor: getSeverityColor(zone.severity),
                fillOpacity: layer.fillPolygons ? layer.opacity * (zone.changing ? 0.35 : 0.25) : 0,
                weight: layer.strokeWidth,
                opacity: layer.opacity * 0.8,
                dashArray: layer.strokePattern === 'dashed' ? '8, 4' : undefined
              };

              const popupContent = (
                <Popup maxWidth={400}>
                  <div className="text-sm w-80 bg-white">
                    {/* Header with gradient background */}
                    <div className={`-m-3 mb-3 p-4 rounded-t-lg ${
                      zone.severity === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-700' :
                      zone.severity === 'high' ? 'bg-gradient-to-r from-orange-600 to-orange-700' :
                      zone.severity === 'medium' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' :
                      'bg-gradient-to-r from-blue-600 to-blue-700'
                    }`}>
                      <div className="flex items-center justify-between text-white">
                        <h3 className="text-lg font-bold">{zone.name}</h3>
                        <span className={`text-xs px-3 py-1 rounded-full font-bold bg-white ${
                          zone.severity === 'critical' ? 'text-red-700' :
                          zone.severity === 'high' ? 'text-orange-700' :
                          zone.severity === 'medium' ? 'text-yellow-700' :
                          'text-blue-700'
                        }`}>{zone.severity.toUpperCase()}</span>
                      </div>
                      <div className="text-white text-xs mt-2 opacity-90 font-medium capitalize">
                        {zone.type} Crisis
                      </div>
                    </div>

                    {/* Key Stats */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">Priority Level</div>
                        <div className={`text-base font-bold ${
                          zone.severity === 'critical' ? 'text-red-600' :
                          zone.severity === 'high' ? 'text-orange-600' :
                          zone.severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          {zone.severity.toUpperCase()}
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-3">
                        <div className="text-xs text-gray-500 mb-1">People Served</div>
                        <div className="text-base font-bold text-purple-600">
                          {(zone.affectedPopulation / 1000000).toFixed(1)}M
                        </div>
                      </div>
                    </div>

                    {/* Region Overview */}
                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 border-2 border-gray-200 mb-3">
                      <div className="font-bold text-sm text-gray-800 mb-2">
                        Regional Information
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed mb-3">
                        This region requires support for {zone.type} relief efforts. Projects focus on sustainable solutions and community resilience.
                      </p>
                      <div className="text-xs text-gray-500">
                        Last updated: {new Date(zone.lastUpdated).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Popup>
              );

              // Render Polygon if bounds exist, otherwise Circle
              if (zone.polygonBounds && zone.polygonBounds.length > 0) {
                return (
                  <Polygon
                    key={zone.id}
                    positions={zone.polygonBounds}
                    pathOptions={pathOptions}
                  >
                    {layer.showTooltips && popupContent}
                  </Polygon>
                );
              } else {
                return (
                  <Circle
                    key={zone.id}
                    center={[zone.location.lat, zone.location.lng]}
                    radius={zone.radius}
                    pathOptions={pathOptions}
                  >
                    {layer.showTooltips && popupContent}
                  </Circle>
                );
              }
            })}

            {/* Enhanced Flight Paths with pulse */}
            {filteredPaths.map(path => {
              const layer = getLayerByType(path.type);
              if (!layer) return null;
              return (
                <AnimatedFlightPath
                  key={path.id}
                  path={path}
                  style={layer}
                  currentTime={currentTime}
                  interpolation={interpolationMode}
                />
              );
            })}

            {/* Charity Bases with live pulse */}
            {getLayerByType('charities')?.visible && filteredBases.map(base => {
              const layer = getLayerByType('charities')!;
              return (
                <Marker
                  key={base.id}
                  position={[base.location.lat, base.location.lng]}
                  icon={createPropertyBasedIcon(base, layer.colorMode, layer.color, categoryColorMap, base.recentActivity)}
                  eventHandlers={{
                    click: () => setSelectedBase(base)
                  }}
                >
                  {layer.showTooltips && (
                    <Popup maxWidth={350}>
                      <div className="text-sm w-72 bg-white">
                        {/* Header with gradient */}
                        <div className="-m-3 mb-3 p-4 rounded-t-lg bg-gradient-to-r from-blue-600 to-teal-600">
                          <div className="flex items-center justify-between text-white">
                            <h3 className="text-base font-bold">{base.name}</h3>
                            {base.recentActivity && (
                              <span className="text-xs bg-green-400 text-green-900 px-2 py-1 rounded-full font-bold animate-pulse">LIVE</span>
                            )}
                          </div>
                          <div className="text-white text-xs mt-1 opacity-90 font-medium flex items-center gap-2">
                            <span className="capitalize">{base.type}</span>
                            <span>•</span>
                            <span>{base.category}</span>
                          </div>
                        </div>

                        {/* Key Stats Cards */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="bg-blue-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Projects</div>
                            <div className="text-lg font-bold text-blue-600">{base.activeProjects}</div>
                          </div>
                          <div className="bg-green-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Funding</div>
                            <div className="text-lg font-bold text-green-600">${(base.fundingReceived / 1000).toFixed(0)}K</div>
                          </div>
                          <div className="bg-teal-50 rounded-lg p-2 text-center">
                            <div className="text-xs text-gray-500 mb-1">Impact</div>
                            <div className="text-lg font-bold text-teal-600">{base.impact}%</div>
                          </div>
                        </div>

                        {/* Activity Status */}
                        <div className="bg-blue-50 rounded-lg p-3 mb-3">
                          <div className="text-xs text-gray-600 mb-1">Last Activity</div>
                          <div className="text-sm font-semibold text-gray-800">
                            {base.lastActivity.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={() => setSelectedBase(base)}
                          className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow"
                        >
                          View Details & Vote
                        </button>
                      </div>
                    </Popup>
                  )}
                </Marker>
              );
            })}
          </MapContainer>
          )}
        </div>

        {/* Impact Stats Panel - Charity Focused */}
        <AnimatePresence>
          {false && (
            <motion.div
              initial={{ x: -320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-6 top-6 w-80 bg-white backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl z-[1000] max-h-[calc(100vh-160px)] overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-teal-50">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  <h3 className="font-bold text-gray-800">Impact Overview</h3>
                </div>
                <button
                  onClick={() => {}}
                  className="p-1 rounded-lg hover:bg-blue-100 text-gray-600 hover:text-gray-800 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Global Climate Overview */}
                <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-red-600 rounded mr-2"></span>
                    Global Climate Status
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">Avg Global Temp Rise:</span>
                      <span className="font-bold text-red-700">+{(climateZones.reduce((sum, z) => sum + z.temperatureChange, 0) / climateZones.length).toFixed(1)}°C</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">Active Climate Crises:</span>
                      <span className="font-bold text-orange-700">{climateZones.filter(z => z.severity === 'critical' || z.severity === 'high').length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">People Affected:</span>
                      <span className="font-bold text-red-700">{(climateZones.reduce((sum, z) => sum + z.affectedPopulation, 0) / 1000000).toFixed(1)}M</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-700">Charities Responding:</span>
                      <span className="font-bold text-green-700">{filteredBases.length}</span>
                    </div>
                  </div>
                </div>

                {/* Total Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1">Active Charities</div>
                    <div className="text-2xl font-bold text-blue-700">{filteredBases.length}</div>
                  </div>
                  <div className="bg-gradient-to-br from-teal-50 to-teal-100 border border-teal-200 rounded-xl p-4">
                    <div className="text-xs text-teal-600 font-semibold mb-1">Projects</div>
                    <div className="text-2xl font-bold text-teal-700">
                      {filteredBases.reduce((sum, b) => sum + b.activeProjects, 0)}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl p-4">
                    <div className="text-xs text-green-600 font-semibold mb-1">Total Funding</div>
                    <div className="text-2xl font-bold text-green-700">
                      ${(filteredBases.reduce((sum, b) => sum + b.fundingReceived, 0) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4">
                    <div className="text-xs text-purple-600 font-semibold mb-1">Avg Impact</div>
                    <div className="text-2xl font-bold text-purple-700">
                      {Math.round(filteredBases.reduce((sum, b) => sum + b.impact, 0) / filteredBases.length)}%
                    </div>
                  </div>
                </div>

                {/* Focus Areas */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                    Focus Areas
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredBases.reduce((acc, base) => {
                        acc[base.category] = (acc[base.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-700 font-medium">{category}</span>
                          <span className="text-blue-600 font-semibold">{count} charities</span>
                        </div>
                        <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full"
                            style={{ width: `${(count / filteredBases.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Organization Types */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center">
                    <span className="w-1 h-4 bg-teal-600 rounded mr-2"></span>
                    Network Reach
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredBases.reduce((acc, base) => {
                        acc[base.type] = (acc[base.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs text-gray-700 font-medium capitalize">{type}</span>
                        <span className="text-xs text-teal-700 font-bold">
                          {count} ({Math.round((count / filteredBases.length) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charity Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-6 top-6 w-96 bg-white backdrop-blur-xl border border-blue-200 rounded-2xl shadow-2xl z-[1000] max-h-[calc(100vh-160px)] overflow-hidden flex flex-col"
            >
              <div className="px-5 py-4 border-b border-blue-100 flex items-center justify-between bg-gradient-to-r from-blue-50 to-purple-50">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5" style={{ color: '#3b82f6' }} />
                  <h3 className="font-bold text-gray-800">Filter Charities</h3>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setFilters({
                      category: [],
                      type: [],
                      severity: [],
                      fundingRange: [0, 10000000],
                      dateRange: null,
                      impactThreshold: 0
                    })}
                    className="text-xs px-3 py-1.5 rounded-lg transition-all font-semibold"
                    style={{ backgroundColor: '#e0f2fe', color: '#3b82f6' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#bae6fd'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#e0f2fe'}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="p-1 rounded-lg hover:bg-blue-100 text-gray-600 hover:text-gray-800 transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                {/* Focus Area Filter */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center">
                    <span className="w-1 h-4 bg-blue-600 rounded mr-2"></span>
                    Focus Areas
                  </label>
                  <div className="space-y-2">
                    {['Climate', 'Conservation', 'Wildlife', 'Water', 'Forest'].map(category => (
                      <label key={category} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-blue-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.category.includes(category)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              category: e.target.checked
                                ? [...prev.category, category]
                                : prev.category.filter(c => c !== category)
                            }));
                          }}
                          className="w-4 h-4 rounded border-blue-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Organization Type Filter */}
                <div className="bg-teal-50 border border-teal-200 rounded-xl p-4">
                  <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center">
                    <span className="w-1 h-4 bg-teal-600 rounded mr-2"></span>
                    Organization Type
                  </label>
                  <div className="space-y-2">
                    {['headquarters', 'regional', 'field'].map(type => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-teal-100 transition-colors">
                        <input
                          type="checkbox"
                          checked={filters.type.includes(type)}
                          onChange={(e) => {
                            setFilters(prev => ({
                              ...prev,
                              type: e.target.checked
                                ? [...prev.type, type]
                                : prev.type.filter(t => t !== type)
                            }));
                          }}
                          className="w-4 h-4 rounded border-teal-300 bg-white text-teal-600 focus:ring-teal-500 focus:ring-offset-0"
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Impact Threshold */}
                <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                  <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-1 h-4 bg-purple-600 rounded mr-2"></span>
                      Minimum Impact Score
                    </span>
                    <span className="text-purple-600 font-bold text-base">{filters.impactThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.impactThreshold}
                    onChange={(e) => setFilters(prev => ({ ...prev, impactThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2.5 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-purple-600 font-medium mt-2">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Funding Range */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <label className="text-sm font-bold text-gray-800 mb-3 block flex items-center justify-between">
                    <span className="flex items-center">
                      <span className="w-1 h-4 bg-green-600 rounded mr-2"></span>
                      Funding Range
                    </span>
                    <span className="text-green-600 font-bold text-xs">
                      ${(filters.fundingRange[0] / 1000).toFixed(0)}K - ${(filters.fundingRange[1] / 1000000).toFixed(1)}M
                    </span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={filters.fundingRange[1]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        fundingRange: [prev.fundingRange[0], parseInt(e.target.value)]
                      }))}
                      className="w-full h-2.5 bg-green-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                  </div>
                </div>

                {/* Results Summary */}
                <div className="bg-gradient-to-r from-blue-600 to-teal-600 rounded-xl p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold opacity-90 mb-1">Showing Results</div>
                      <div className="text-2xl font-bold">{filteredBases.length}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold opacity-90 mb-1">of Total</div>
                      <div className="text-2xl font-bold">{charityBases.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side Panel - Latest Updates */}
        <div className="w-96 flex flex-col gap-4">
          {/* Latest Updates */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-4 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold flex items-center space-x-2" style={{ color: '#3b82f6' }}>
                <SignalIcon className="w-5 h-5" />
                <span>Latest Updates</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-3">
              {newsFeed.map((news, index) => (
                <motion.div
                  key={news.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15, duration: 0.8, ease: "easeOut" }}
                  className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-3 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate('/donate')}
                >
                  <div className="flex items-start gap-3">
                    {/* NGO Logo */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-white border border-blue-100 p-1.5">
                      <img
                        src={news.logo}
                        alt={`${news.ngo} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(news.ngo)}&background=3b82f6&color=fff&size=128`;
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold" style={{ color: '#3b82f6' }}>{news.ngo}</span>
                        <span className="text-xs text-gray-500">
                          {Math.floor((Date.now() - news.timestamp.getTime()) / 3600000)}h ago
                        </span>
                      </div>

                      {/* Title */}
                      <h4 className="font-bold text-sm text-gray-800 mb-1 line-clamp-1">
                        {news.title}
                      </h4>

                      {/* Content */}
                      <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                        {news.content}
                      </p>

                      {/* Category badge */}
                      <div className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
                        {news.category}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-3 pt-3 border-t border-blue-100 text-center">
              <button
                onClick={() => navigate('/')}
                className="text-sm font-semibold hover:underline"
                style={{ color: '#3b82f6' }}
              >
                View all updates on Home →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Remove Keyboard Shortcuts */}
    </div>
  );
};

export default MapPage;

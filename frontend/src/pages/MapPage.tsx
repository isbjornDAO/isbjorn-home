import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, CircleMarker, useMapEvents } from 'react-leaflet';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';
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
  GlobeAltIcon
} from '@heroicons/react/24/outline';

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
      setAnimationProgress(prev => (prev >= 1 ? 0 : prev + path.speed * 0.015));
      setPulseScale(prev => (prev >= 1.5 ? 1 : prev + 0.02));
    }, 50); // 20fps for smooth animation
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

// Enhanced marker with real-time pulse
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

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
        ${pulseRing}
        <circle cx="12" cy="12" r="11" fill="${color}" opacity="0.2"/>
        <circle cx="12" cy="12" r="8" fill="${color}" opacity="0.5"/>
        <circle cx="12" cy="12" r="5" fill="${color}" opacity="0.8"/>
        <circle cx="12" cy="12" r="3" fill="${color}"/>
        <circle cx="12" cy="12" r="1.5" fill="white"/>
      </svg>
    `)}`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

// DexScreener-style live data indicator
const LiveDataIndicator: React.FC<{ status: DataStreamStatus; updateCount: number }> = ({ status, updateCount }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center space-x-2 bg-gray-800/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-700/50"
    >
      <motion.div
        animate={{
          scale: status === 'connected' ? [1, 1.2, 1] : 1,
          opacity: status === 'connected' ? [1, 0.7, 1] : 0.5
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`w-2 h-2 rounded-full ${
          status === 'connected' ? 'bg-green-500' :
          status === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
        }`}
      />
      <span className="text-xs font-medium text-gray-300">
        {status === 'connected' ? 'LIVE' : status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
      </span>
      {status === 'connected' && (
        <motion.span
          key={updateCount}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 0.5 }}
          className="text-xs text-teal-400 font-mono"
        >
          +{updateCount}
        </motion.span>
      )}
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

// Zoom Controls with DexScreener style
const ZoomControls: React.FC = () => {
  const map = useMap();

  return (
    <div className="absolute bottom-24 right-4 z-[1000] flex flex-col gap-2">
      <button
        onClick={() => map.zoomIn()}
        className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 shadow-lg transition-all backdrop-blur-sm hover:scale-110"
      >
        <span className="text-xl font-bold text-gray-100">+</span>
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 shadow-lg transition-all backdrop-blur-sm hover:scale-110"
      >
        <span className="text-xl font-bold text-gray-100">−</span>
      </button>
      <button
        onClick={() => map.setView([20, 20], 2)}
        className="bg-gray-800/90 hover:bg-gray-700 border border-gray-600 rounded-lg p-3 shadow-lg transition-all backdrop-blur-sm hover:scale-110"
      >
        <GlobeAltIcon className="w-5 h-5 text-gray-100" />
      </button>
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
  const [charityBases, setCharityBases] = useState<CharityBase[]>([]);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const [climateZones, setClimateZones] = useState<ClimateZone[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBase, setSelectedBase] = useState<CharityBase | null>(null);
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d' | 'all'>('24h');
  const [showLayerPanel, setShowLayerPanel] = useState(true);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showStylesPanel, setShowStylesPanel] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [interpolationMode, setInterpolationMode] = useState<InterpolationMode>('linear');
  const [currentZoom, setCurrentZoom] = useState(2);
  const [dataStreamStatus, setDataStreamStatus] = useState<DataStreamStatus>('connected');
  const [updateCount, setUpdateCount] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
      opacity: 0.65,
      activeOpacity: 0.75,
      inactiveOpacity: 0.35,
      color: '#ef4444',
      colorMode: 'property',
      strokePattern: 'solid',
      strokeWidth: 2,
      showArrows: false,
      fillPolygons: true,
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
      if (e.key === 'a' || e.key === 'A') setShowAnalytics(prev => !prev);
      if (e.key === 's' || e.key === 'S') setShowStylesPanel(prev => !prev);
      if (e.key === 'r' || e.key === 'R') handleRefresh();
      if (e.key === 'Escape') {
        setShowLayerPanel(false);
        setShowFilterPanel(false);
        setShowAnalytics(false);
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
      { id: 'hq1', name: 'Global Climate HQ', location: { lat: 40.7128, lng: -74.0060 }, type: 'headquarters', activeProjects: 45, category: 'Climate', fundingReceived: 2500000, lastActivity: new Date(), impact: 95, properties: { region: 'Americas', established: 2010 } },
      { id: 'hq2', name: 'EU Operations', location: { lat: 51.5074, lng: -0.1278 }, type: 'headquarters', activeProjects: 38, category: 'Conservation', fundingReceived: 1800000, lastActivity: new Date(), impact: 88, properties: { region: 'Europe', established: 2012 } },
      { id: 'hq3', name: 'Asia-Pacific Hub', location: { lat: 35.6762, lng: 139.6503 }, type: 'headquarters', activeProjects: 52, category: 'Wildlife', fundingReceived: 3200000, lastActivity: new Date(), impact: 92, properties: { region: 'Asia', established: 2008 } },
      { id: 'r1', name: 'African Regional', location: { lat: -1.2921, lng: 36.8219 }, type: 'regional', activeProjects: 28, category: 'Water', fundingReceived: 950000, lastActivity: new Date(), impact: 78, properties: { region: 'Africa', established: 2015 } },
      { id: 'r2', name: 'South America', location: { lat: -23.5505, lng: -46.6333 }, type: 'regional', activeProjects: 31, category: 'Forest', fundingReceived: 1200000, lastActivity: new Date(), impact: 85, properties: { region: 'South America', established: 2013 } },
      { id: 'r3', name: 'Middle East', location: { lat: 25.2048, lng: 55.2708 }, type: 'regional', activeProjects: 22, category: 'Climate', fundingReceived: 780000, lastActivity: new Date(), impact: 72, properties: { region: 'Middle East', established: 2016 } },
      { id: 'f1', name: 'Arctic Research', location: { lat: 64.1466, lng: -21.9426 }, type: 'field', activeProjects: 8, category: 'Climate', fundingReceived: 450000, lastActivity: new Date(), impact: 68, properties: { region: 'Arctic', established: 2018 } },
      { id: 'f2', name: 'Amazon Station', location: { lat: -3.4653, lng: -62.2159 }, type: 'field', activeProjects: 12, category: 'Forest', fundingReceived: 620000, lastActivity: new Date(), impact: 82, properties: { region: 'Amazon', established: 2014 } },
    ];

    const mockPaths: FlightPath[] = [
      { id: 'fp1', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 51.5074, lng: -0.1278 }, fromName: 'NY', toName: 'London', amount: 250000, type: 'funding', active: true, timestamp: new Date(Date.now() - 3600000), speed: 1.2 },
      { id: 'fp2', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -1.2921, lng: 36.8219 }, fromName: 'London', toName: 'Kenya', amount: 180000, type: 'funding', active: true, timestamp: new Date(Date.now() - 7200000), speed: 0.9 },
      { id: 'fp3', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 1.3521, lng: 103.8198 }, fromName: 'Tokyo', toName: 'Singapore', amount: 120000, type: 'collaboration', active: true, timestamp: new Date(Date.now() - 1800000), speed: 1.5 },
      { id: 'fp4', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 35.6762, lng: 139.6503 }, fromName: 'NY', toName: 'Tokyo', amount: 340000, type: 'data', active: true, timestamp: new Date(Date.now() - 5400000), speed: 0.8 },
      { id: 'fp5', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -23.5505, lng: -46.6333 }, fromName: 'London', toName: 'Brazil', amount: 210000, type: 'funding', active: true, timestamp: new Date(), speed: 1.0 },
    ];

    const mockZones: ClimateZone[] = [
      { id: 'cz1', location: { lat: -3.4653, lng: -62.2159 }, name: 'Amazon Deforestation', severity: 'critical', type: 'deforestation', radius: 400000, affectedPopulation: 2500000, trend: 'worsening' },
      { id: 'cz2', location: { lat: 23.8859, lng: 45.0792 }, name: 'Sahara Drought', severity: 'high', type: 'drought', radius: 600000, affectedPopulation: 1800000, trend: 'stable' },
      { id: 'cz3', location: { lat: 28.6139, lng: 77.2090 }, name: 'Delhi Air Quality', severity: 'critical', type: 'pollution', radius: 200000, affectedPopulation: 20000000, trend: 'worsening' },
      { id: 'cz4', location: { lat: 64.1466, lng: -21.9426 }, name: 'Arctic Warming', severity: 'critical', type: 'temperature', radius: 500000, affectedPopulation: 150000, trend: 'worsening' },
      { id: 'cz5', location: { lat: 6.5244, lng: 3.3792 }, name: 'Lagos Flooding', severity: 'high', type: 'flooding', radius: 150000, affectedPopulation: 5000000, trend: 'worsening' },
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
      if (searchQuery && !base.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
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
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      {/* Enhanced Top Control Bar with Live Indicator */}
      <div className="bg-gray-900/95 border-b border-gray-700/50 px-4 py-3 flex items-center justify-between z-10 backdrop-blur-md">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-100 flex items-center space-x-2">
            <BoltIcon className="w-5 h-5 text-teal-500" />
            <span>Climate Network Intelligence</span>
          </h1>
          <LiveDataIndicator status={dataStreamStatus} updateCount={updateCount} />
          <div className="flex items-center space-x-2">
            <div className="relative">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search locations, projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 bg-gray-800 text-gray-100 text-sm rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-72 placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
            {(['24h', '7d', '30d', 'all'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                  timeRange === range
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-gray-700"></div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`p-2 rounded-lg transition-all ${
              isRefreshing ? 'bg-teal-600/20 text-teal-400' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
            title="Refresh Data (R)"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>

          <button
            onClick={() => setShowStylesPanel(!showStylesPanel)}
            className={`p-2 rounded-lg transition-all ${
              showStylesPanel ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
            title="Saved Styles (S)"
          >
            <SwatchIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowFilterPanel(!showFilterPanel)}
            className={`p-2 rounded-lg transition-all ${
              showFilterPanel ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
            title="Filters (F)"
          >
            <FunnelIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            className={`p-2 rounded-lg transition-all ${
              showAnalytics ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
            title="Analytics (A)"
          >
            <ChartBarIcon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`p-2 rounded-lg transition-all ${
              showLayerPanel ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50' : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
            title="Layers (L)"
          >
            <Squares2X2Icon className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowKeyboardShortcuts(true)}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-200 hover:bg-gray-800 transition-all"
            title="Keyboard Shortcuts (?)"
          >
            <span className="text-sm font-mono">?</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex relative">
        {/* Main Map */}
        <div className="flex-1 relative">
          <MapContainer
            center={[20, 20]}
            zoom={2}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            className="bg-gray-950"
          >
            <TileLayer
              attribution='&copy; OpenStreetMap'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            <MapInteractionHandler onZoomChange={setCurrentZoom} />
            <ZoomControls />

            {/* Climate Zones */}
            {getLayerByType('climate')?.visible && filteredZones.map(zone => {
              const layer = getLayerByType('climate')!;
              return (
                <Circle
                  key={zone.id}
                  center={[zone.location.lat, zone.location.lng]}
                  radius={zone.radius}
                  pathOptions={{
                    color: getSeverityColor(zone.severity),
                    fillColor: getSeverityColor(zone.severity),
                    fillOpacity: layer.fillPolygons ? layer.opacity * (zone.changing ? 0.35 : 0.25) : 0,
                    weight: layer.strokeWidth,
                    opacity: layer.opacity * 0.8,
                    dashArray: layer.strokePattern === 'dashed' ? '8, 4' : undefined
                  }}
                >
                  {layer.showTooltips && (
                    <Popup>
                      <div className="text-sm max-w-xs">
                        <div className="font-bold text-gray-900 mb-1">{zone.name}</div>
                        <div className="space-y-0.5 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium capitalize">{zone.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Severity:</span>
                            <span className="font-medium capitalize">{zone.severity}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Trend:</span>
                            <span className={`font-medium capitalize ${
                              zone.trend === 'worsening' ? 'text-red-600' :
                              zone.trend === 'improving' ? 'text-green-600' : 'text-gray-600'
                            }`}>{zone.trend}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Population:</span>
                            <span className="font-medium">{zone.affectedPopulation.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Circle>
              );
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
                    <Popup>
                      <div className="text-sm min-w-[220px]">
                        <div className="font-bold text-gray-900 mb-2 flex items-center justify-between">
                          {base.name}
                          {base.recentActivity && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">LIVE</span>
                          )}
                        </div>
                        <div className="space-y-1 text-xs text-gray-600">
                          <div className="flex justify-between">
                            <span>Type:</span>
                            <span className="font-medium capitalize">{base.type}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Category:</span>
                            <span className="font-medium">{base.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Projects:</span>
                            <span className="font-medium">{base.activeProjects}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Funding:</span>
                            <span className="font-medium">${(base.fundingReceived / 1000).toFixed(0)}K</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Impact:</span>
                            <div className="flex items-center">
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full mr-2">
                                <div
                                  className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full"
                                  style={{ width: `${base.impact}%` }}
                                />
                              </div>
                              <span className="font-medium">{base.impact}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Marker>
              );
            })}
          </MapContainer>

          {/* Mini Map Navigator */}
          <MiniMapNavigator bounds={null} onNavigate={() => {}} />
        </div>

        {/* Saved Styles Panel */}
        <AnimatePresence>
          {showStylesPanel && (
            <motion.div
              initial={{ x: -300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute left-4 top-4 w-80 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[1000] max-h-[calc(100vh-120px)] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-teal-600/10 to-blue-600/10">
                <div className="flex items-center space-x-2">
                  <SwatchIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-gray-100">Saved Styles</h3>
                </div>
                <button
                  onClick={() => setShowStylesPanel(false)}
                  className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {savedStyles.map(style => (
                  <motion.div
                    key={style.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveStyleId(style.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      activeStyleId === style.id
                        ? 'bg-teal-600/20 border-teal-500/50 shadow-lg'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-100">{style.name}</h4>
                      {activeStyleId === style.id && (
                        <span className="text-xs bg-teal-500 text-white px-2 py-0.5 rounded-full">ACTIVE</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400">{style.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Layer Control Panel */}
        <AnimatePresence>
          {showLayerPanel && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute right-4 top-4 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[1000] max-h-[calc(100vh-120px)] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-teal-600/10 to-blue-600/10">
                <div className="flex items-center space-x-2">
                  <Squares2X2Icon className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-gray-100">Layer Controls</h3>
                </div>
                <button
                  onClick={() => setShowLayerPanel(false)}
                  className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {layers.map(layer => (
                  <div key={layer.id} className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => toggleLayer(layer.id)}
                          className={`p-2 rounded-lg transition-all ${
                            layer.visible
                              ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                              : 'bg-gray-700/50 text-gray-500 border border-gray-600/50'
                          }`}
                        >
                          {layer.visible ? <EyeIcon className="w-4 h-4" /> : <EyeSlashIcon className="w-4 h-4" />}
                        </button>
                        <div>
                          <h4 className="font-semibold text-gray-100 text-sm">{layer.name}</h4>
                          <p className="text-xs text-gray-500 capitalize">{layer.colorMode} coloring</p>
                        </div>
                      </div>
                    </div>

                    {layer.visible && (
                      <div className="space-y-3 pt-2 border-t border-gray-700/50">
                        {/* Opacity Control */}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block flex items-center justify-between">
                            <span>Opacity</span>
                            <span className="text-teal-400 font-mono">{Math.round(layer.opacity * 100)}%</span>
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={layer.opacity}
                            onChange={(e) => updateLayerProperty(layer.id, 'opacity', parseFloat(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                        </div>

                        {/* Stroke Width */}
                        <div>
                          <label className="text-xs text-gray-400 mb-1 block flex items-center justify-between">
                            <span>Stroke Width</span>
                            <span className="text-teal-400 font-mono">{layer.strokeWidth}px</span>
                          </label>
                          <input
                            type="range"
                            min="1"
                            max="8"
                            step="1"
                            value={layer.strokeWidth}
                            onChange={(e) => updateLayerProperty(layer.id, 'strokeWidth', parseInt(e.target.value))}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                          />
                        </div>

                        {/* Stroke Pattern */}
                        <div>
                          <label className="text-xs text-gray-400 mb-2 block">Stroke Pattern</label>
                          <div className="flex space-x-2">
                            {(['solid', 'dashed', 'dotted'] as const).map(pattern => (
                              <button
                                key={pattern}
                                onClick={() => updateLayerProperty(layer.id, 'strokePattern', pattern)}
                                className={`flex-1 py-1.5 text-xs font-medium rounded transition-all ${
                                  layer.strokePattern === pattern
                                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                                }`}
                              >
                                {pattern}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Color Mode */}
                        <div>
                          <label className="text-xs text-gray-400 mb-2 block">Color Mode</label>
                          <div className="grid grid-cols-2 gap-2">
                            {(['fixed', 'property', 'function', 'measure'] as const).map(mode => (
                              <button
                                key={mode}
                                onClick={() => updateLayerProperty(layer.id, 'colorMode', mode)}
                                className={`py-1.5 text-xs font-medium rounded transition-all ${
                                  layer.colorMode === mode
                                    ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                                    : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                                }`}
                              >
                                {mode}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Toggle Options */}
                        <div className="flex flex-wrap gap-2">
                          {layer.id !== 'charities' && (
                            <label className="flex items-center space-x-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={layer.showArrows}
                                onChange={(e) => updateLayerProperty(layer.id, 'showArrows', e.target.checked)}
                                className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                              />
                              <span className="text-xs text-gray-400">Arrows</span>
                            </label>
                          )}
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={layer.showLabels}
                              onChange={(e) => updateLayerProperty(layer.id, 'showLabels', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400">Labels</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={layer.showTooltips}
                              onChange={(e) => updateLayerProperty(layer.id, 'showTooltips', e.target.checked)}
                              className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                            />
                            <span className="text-xs text-gray-400">Tooltips</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Interpolation Mode */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <label className="text-xs text-gray-400 mb-2 block">Track Interpolation</label>
                  <div className="flex space-x-2">
                    {(['linear', 'last-known-point'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setInterpolationMode(mode)}
                        className={`flex-1 py-2 text-xs font-medium rounded transition-all ${
                          interpolationMode === mode
                            ? 'bg-teal-600/20 text-teal-400 border border-teal-500/50'
                            : 'bg-gray-700/50 text-gray-400 border border-gray-600/50 hover:border-gray-500'
                        }`}
                      >
                        {mode === 'linear' ? 'Linear' : 'Last Known'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Analytics Panel */}
        <AnimatePresence>
          {showAnalytics && (
            <motion.div
              initial={{ y: 300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute bottom-4 right-4 w-96 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[1000] max-h-96 overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-teal-600/10 to-blue-600/10">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-gray-100">Analytics</h3>
                </div>
                <button
                  onClick={() => setShowAnalytics(false)}
                  className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-all"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Total Stats */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Bases</div>
                    <div className="text-2xl font-bold text-gray-100">{filteredBases.length}</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Active Flows</div>
                    <div className="text-2xl font-bold text-teal-400">{filteredPaths.filter(p => p.active).length}</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Climate Zones</div>
                    <div className="text-2xl font-bold text-red-400">{filteredZones.length}</div>
                  </div>
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Total Funding</div>
                    <div className="text-2xl font-bold text-green-400">
                      ${(filteredBases.reduce((sum, b) => sum + b.fundingReceived, 0) / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>

                {/* Category Distribution */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Category Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredBases.reduce((acc, base) => {
                        acc[base.category] = (acc[base.category] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([category, count]) => (
                      <div key={category}>
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">{category}</span>
                          <span className="text-gray-300 font-mono">{count}</span>
                        </div>
                        <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-blue-500 rounded-full"
                            style={{ width: `${(count / filteredBases.length) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Type Distribution */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-100 mb-3">Type Distribution</h4>
                  <div className="space-y-2">
                    {Object.entries(
                      filteredBases.reduce((acc, base) => {
                        acc[base.type] = (acc[base.type] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([type, count]) => (
                      <div key={type} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 capitalize">{type}</span>
                        <span className="text-xs text-gray-300 font-mono">{count} ({Math.round((count / filteredBases.length) * 100)}%)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Enhanced Filter Panel */}
        <AnimatePresence>
          {showFilterPanel && (
            <motion.div
              initial={{ y: -300, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl z-[1000] max-h-[calc(100vh-140px)] overflow-hidden flex flex-col"
            >
              <div className="px-4 py-3 border-b border-gray-700/50 flex items-center justify-between bg-gradient-to-r from-teal-600/10 to-blue-600/10">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5 text-teal-400" />
                  <h3 className="font-bold text-gray-100">Advanced Filters</h3>
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
                    className="text-xs px-3 py-1 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-all"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilterPanel(false)}
                    className="p-1 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-gray-200 transition-all"
                  >
                    <XMarkIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-100 mb-3 block">Category</label>
                    <div className="space-y-2">
                      {['Climate', 'Conservation', 'Wildlife', 'Water', 'Forest'].map(category => (
                        <label key={category} className="flex items-center space-x-2 cursor-pointer group">
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
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{category}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Type Filter */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-100 mb-3 block">Type</label>
                    <div className="space-y-2">
                      {['headquarters', 'regional', 'field'].map(type => (
                        <label key={type} className="flex items-center space-x-2 cursor-pointer group">
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
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors capitalize">{type}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Severity Filter */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-100 mb-3 block">Climate Severity</label>
                    <div className="space-y-2">
                      {['critical', 'high', 'medium', 'low'].map(severity => (
                        <label key={severity} className="flex items-center space-x-2 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={filters.severity.includes(severity)}
                            onChange={(e) => {
                              setFilters(prev => ({
                                ...prev,
                                severity: e.target.checked
                                  ? [...prev.severity, severity]
                                  : prev.severity.filter(s => s !== severity)
                              }));
                            }}
                            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-teal-500 focus:ring-teal-500 focus:ring-offset-0"
                          />
                          <span className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors capitalize">{severity}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Impact Threshold */}
                  <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                    <label className="text-sm font-semibold text-gray-100 mb-3 block flex items-center justify-between">
                      <span>Impact Threshold</span>
                      <span className="text-teal-400 font-mono text-xs">{filters.impactThreshold}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={filters.impactThreshold}
                      onChange={(e) => setFilters(prev => ({ ...prev, impactThreshold: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>0%</span>
                      <span>50%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </div>

                {/* Funding Range */}
                <div className="bg-gray-800/50 border border-gray-700/50 rounded-lg p-4">
                  <label className="text-sm font-semibold text-gray-100 mb-3 block flex items-center justify-between">
                    <span>Funding Range</span>
                    <span className="text-teal-400 font-mono text-xs">
                      ${(filters.fundingRange[0] / 1000000).toFixed(1)}M - ${(filters.fundingRange[1] / 1000000).toFixed(1)}M
                    </span>
                  </label>
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="0"
                      max="10000000"
                      step="100000"
                      value={filters.fundingRange[0]}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        fundingRange: [parseInt(e.target.value), prev.fundingRange[1]]
                      }))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
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
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                </div>

                {/* Results Summary */}
                <div className="bg-gradient-to-r from-teal-600/10 to-blue-600/10 border border-teal-500/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-300">Showing Results:</span>
                    <span className="text-lg font-bold text-teal-400">{filteredBases.length} / {charityBases.length}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts show={showKeyboardShortcuts} onClose={() => setShowKeyboardShortcuts(false)} />
    </div>
  );
};

export default MapPage;

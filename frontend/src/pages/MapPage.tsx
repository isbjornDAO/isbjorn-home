import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap, CircleMarker, useMapEvents, Polygon } from 'react-leaflet';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Icon, LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
import isbjornLogo from '@/assets/isbjorn-logo.png.jpg';
import { getPolarBearData, type PolarBearData } from '@/services/polarBearService';

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

interface MissionRegion {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  fundingGoal: number;
  fundingReceived: number;
  startDate: Date;
  polygonBounds: [number, number][];
  projectCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface PolarBearTracking {
  id: string;
  name: string;
  sex: 'male' | 'female';
  age: number;
  currentLocation: { lat: number; lng: number };
  lastUpdated: Date;
  status: 'active' | 'inactive' | 'hibernating';
  trackingHistory: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
    speed?: number; // km/h
  }>;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  weight: number; // kg
  tagId: string;
  region: string;
  seaIceCondition: 'stable' | 'declining' | 'critical';
  huntingSuccess: number; // percentage
  distanceTraveled: number; // km in last 30 days
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

// Simple animated flight path - just blue lines with moving dot
const AnimatedFlightPath: React.FC<{
  path: FlightPath;
  style: LayerStyleConfig;
  currentTime: Date;
  interpolation: InterpolationMode;
}> = ({ path, style, currentTime, interpolation }) => {
  const [animationProgress, setAnimationProgress] = useState(Math.random());

  useEffect(() => {
    if (!path.active) return;
    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev >= 1 ? 0 : prev + 0.01));
    }, 50);
    return () => clearInterval(interval);
  }, [path.active]);

  const arcPoints = useMemo(() => createArcPath(path.from, path.to), [path.from, path.to]);
  const pointIndex = Math.floor(animationProgress * (arcPoints.length - 1));
  const animatedPoint = arcPoints[pointIndex] as [number, number];

  // Always use blue color
  const blueColor = 'rgb(3, 105, 161)';

  return (
    <>
      <Polyline
        positions={arcPoints}
        pathOptions={{
          color: blueColor,
          weight: 2,
          opacity: 0.6,
        }}
      />
      {path.active && animatedPoint && (
        <Circle
          center={animatedPoint}
          radius={25000}
          pathOptions={{
            color: '#ffffff',
            fillColor: blueColor,
            fillOpacity: 0.8,
            weight: 2
          }}
        />
      )}
    </>
  );
};

// Get category icon SVG path (using blue color)
const getCategoryIcon = (category: string): string => {
  const iconColor = 'rgb(3, 105, 161)'; // Blue
  switch (category) {
    case 'Climate':
      // Thermometer/climate icon
      return `<path d="M12 2c-1.1 0-2 .9-2 2v8.5c-1.2.7-2 2-2 3.5 0 2.2 1.8 4 4 4s4-1.8 4-4c0-1.5-.8-2.8-2-3.5V4c0-1.1-.9-2-2-2zm0 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z" fill="${iconColor}"/>`;
    case 'Conservation':
      // Shield/protection icon
      return `<path d="M12 2L4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4zm0 14l-4-4 1.4-1.4 2.6 2.6 4.6-4.6L18 10l-6 6z" fill="${iconColor}"/>`;
    case 'Wildlife':
      // Paw print icon
      return `<path d="M8.5 6c-1.4 0-2.5 1.1-2.5 2.5S7.1 11 8.5 11 11 9.9 11 8.5 9.9 6 8.5 6zm7 0c-1.4 0-2.5 1.1-2.5 2.5S14.1 11 15.5 11 18 9.9 18 8.5 16.9 6 15.5 6zM6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 3c-2.2 0-4 1.8-4 4s1.8 3 4 3 4-1.8 4-4-1.8-3-4-3z" fill="${iconColor}"/>`;
    case 'Water':
      // Water droplet icon
      return `<path d="M12 2c-3.9 3.9-7 7.5-7 11 0 3.9 3.1 7 7 7s7-3.1 7-7c0-3.5-3.1-7.1-7-11zm0 16c-2.2 0-4-1.8-4-4 0-1.5 1.5-3.5 4-6.4 2.5 2.9 4 4.9 4 6.4 0 2.2-1.8 4-4 4z" fill="${iconColor}"/>`;
    case 'Forest':
      // Tree icon
      return `<path d="M16.5 11L19 8h-3V3h-4v5H9l2.5 3L9 14h3v7h4v-7h3z" fill="${iconColor}"/>`;
    default:
      // Default circle
      return `<circle cx="12" cy="12" r="4" fill="${iconColor}"/>`;
  }
};

// Simple blue marker - Home icons for headquarters, pins for missions
const createPropertyBasedIcon = (
  object: CharityBase,
  colorMode: ColorMode,
  baseColor: string,
  propertyMap?: Record<string, string>,
  pulse: boolean = false
) => {
  const isHeadquarters = object.type === 'headquarters';
  const size = isHeadquarters ? 44 : 36;
  const color = 'rgb(3, 105, 161)'; // Blue

  // Home icon for headquarters (where donations come from)
  // Simple pin with circle for missions (where money goes to)
  if (isHeadquarters) {
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
          <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2.5"/>
          <rect x="7" y="7" width="10" height="10" fill="white"/>
          <rect x="8.5" y="8.5" width="2" height="2" fill="${color}"/>
          <rect x="11.5" y="8.5" width="2" height="2" fill="${color}"/>
          <rect x="14.5" y="8.5" width="2" height="2" fill="${color}"/>
          <rect x="8.5" y="11.5" width="2" height="2" fill="${color}"/>
          <rect x="11.5" y="11.5" width="2" height="2" fill="${color}"/>
          <rect x="14.5" y="11.5" width="2" height="2" fill="${color}"/>
          <rect x="11.5" y="14.5" width="2" height="2.5" fill="${color}"/>
        </svg>
      `)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  } else {
    // Mission pin - simple pin shape with circle
    return new Icon({
      iconUrl: `data:image/svg+xml;base64,${btoa(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${size}" height="${size}">
          <circle cx="12" cy="12" r="10" fill="${color}" stroke="white" stroke-width="2.5"/>
          <circle cx="12" cy="12" r="4" fill="white"/>
        </svg>
      `)}`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  }
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
        <span className="text-xl font-bold" style={{ color: 'rgb(3, 105, 161)' }}>+</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => map.zoomOut()}
        className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-md transition-all"
      >
        <span className="text-xl font-bold" style={{ color: 'rgb(3, 105, 161)' }}>−</span>
      </motion.button>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => map.setView([10, 170], 2)}
        className="bg-white hover:bg-blue-50 border border-blue-200 rounded-lg p-2.5 shadow-md transition-all"
      >
        <GlobeAltIcon className="w-5 h-5" style={{ color: 'rgb(3, 105, 161)' }} />
      </motion.button>
    </div>
  );
};

// Interactive Mission Region Component with hover/click effects
const InteractiveMissionRegion: React.FC<{
  region: MissionRegion;
  onSelect: (region: MissionRegion) => void;
}> = ({ region, onSelect }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981'; // green
      case 'planned': return 'rgb(3, 105, 161)'; // blue
      case 'completed': return '#6b7280'; // gray
      default: return 'rgb(3, 105, 161)';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f97316'; // orange
      case 'medium': return '#eab308'; // yellow
      case 'low': return 'rgb(3, 105, 161)'; // blue
      default: return 'rgb(3, 105, 161)';
    }
  };

  const defaultStyle = {
    color: getStatusColor(region.status),
    fillColor: getStatusColor(region.status),
    fillOpacity: 0.2,
    weight: 2,
    opacity: 0.6,
  };

  const hoverStyle = {
    color: getPriorityColor(region.priority),
    fillColor: getPriorityColor(region.priority),
    fillOpacity: 0.4,
    weight: 4,
    opacity: 1,
  };

  const fundingPercentage = (region.fundingReceived / region.fundingGoal) * 100;

  return (
    <Polygon
      positions={region.polygonBounds}
      pathOptions={isHovered ? hoverStyle : defaultStyle}
      eventHandlers={{
        mouseover: () => setIsHovered(true),
        mouseout: () => setIsHovered(false),
        click: () => onSelect(region),
      }}
    >
      <Popup maxWidth={350}>
        <div className="text-sm w-72 bg-white">
          {/* Header */}
          <div className={`-m-3 mb-3 p-4 rounded-t-lg ${
            region.status === 'active' ? 'bg-gradient-to-r from-green-600 to-teal-600' :
            region.status === 'planned' ? 'bg-gradient-to-r from-blue-600 to-indigo-600' :
            'bg-gradient-to-r from-gray-600 to-gray-700'
          }`}>
            <div className="flex items-center justify-between text-white">
              <h3 className="text-base font-bold">{region.name}</h3>
              <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                region.status === 'active' ? 'bg-green-400 text-green-900' :
                region.status === 'planned' ? 'bg-blue-400 text-blue-900' :
                'bg-gray-400 text-gray-900'
              }`}>
                {region.status.toUpperCase()}
              </span>
            </div>
            <div className="text-white text-xs mt-1 opacity-90">
              {region.description}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-blue-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Projects</div>
              <div className="text-lg font-bold text-blue-600">{region.projectCount}</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Priority</div>
              <div className={`text-sm font-bold ${
                region.priority === 'critical' ? 'text-red-600' :
                region.priority === 'high' ? 'text-orange-600' :
                region.priority === 'medium' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                {region.priority.toUpperCase()}
              </div>
            </div>
            <div className="bg-teal-50 rounded-lg p-2 text-center">
              <div className="text-xs text-gray-500 mb-1">Started</div>
              <div className="text-xs font-bold text-teal-600">
                {region.startDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Funding Progress */}
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Funding Progress</span>
              <span className="font-bold">{fundingPercentage.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-green-500 to-teal-500 h-2 rounded-full transition-all"
                style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-green-600 font-bold">${(region.fundingReceived / 1000).toFixed(0)}K</span>
              <span className="text-gray-500">of ${(region.fundingGoal / 1000).toFixed(0)}K</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            onClick={() => onSelect(region)}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:shadow-lg transition-shadow"
          >
            Support This Mission
          </button>
        </div>
      </Popup>
    </Polygon>
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

// Component to center map based on URL parameters or state
const MapCenterHandler: React.FC<{ lat?: number; lng?: number; zoom?: number; trigger?: number }> = ({ lat, lng, zoom = 6, trigger }) => {
  const map = useMap();

  useEffect(() => {
    if (lat && lng) {
      map.setView([lat, lng], zoom, { animate: true, duration: 1.5 });
    }
  }, [lat, lng, zoom, map, trigger]);

  return null;
};


const MapPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [charityBases, setCharityBases] = useState<CharityBase[]>([]);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);

  // Get coordinates from URL params if present
  const urlLat = searchParams.get('lat') ? parseFloat(searchParams.get('lat')!) : undefined;
  const urlLng = searchParams.get('lng') ? parseFloat(searchParams.get('lng')!) : undefined;
  const urlZoom = searchParams.get('zoom') ? parseFloat(searchParams.get('zoom')!) : undefined;

  // State for programmatic map centering
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [centerTrigger, setCenterTrigger] = useState(0);

  const [climateZones, setClimateZones] = useState<ClimateZone[]>([]);
  const [missionRegions, setMissionRegions] = useState<MissionRegion[]>([]);
  const [polarBears, setPolarBears] = useState<PolarBearData[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBase, setSelectedBase] = useState<CharityBase | null>(null);
  const [selectedRegion, setSelectedRegion] = useState<MissionRegion | null>(null);
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

  // News feed state - people from organizations
  const [newsFeed, setNewsFeed] = useState([
    {
      id: 1,
      ngo: 'Isbjorn',
      ngoSlug: 'isbjorn',
      authorName: 'Dr. Steven Amstrup',
      authorRole: 'Chief Scientist',
      authorPhoto: 'https://www.arcus.org/civicrm/contact/imagefile?photo=steve1_a8d04f7259d817fda6b86ea2ba0977b6.jpg',
      title: 'Arctic Research Breakthrough',
      content: 'New findings show accelerated ice melt in northern regions. Our team is deploying additional monitoring stations.',
      timestamp: new Date(Date.now() - 3600000),
      category: 'Climate',
      upvotes: 142,
      downvotes: 3,
      userVote: null as 'up' | 'down' | null,
    },
    {
      id: 2,
      ngo: 'Amazon Station',
      ngoSlug: 'amazon-station',
      authorName: 'Marcus Silva',
      authorRole: 'Forest Conservation Lead',
      authorPhoto: 'https://i.pravatar.cc/150?img=12',
      title: '1 Million Trees Planted',
      content: 'Reached our milestone! Thanks to all supporters who made this reforestation initiative possible.',
      timestamp: new Date(Date.now() - 7200000),
      category: 'Forest',
      upvotes: 289,
      downvotes: 5,
      userVote: null as 'up' | 'down' | null,
    },
    {
      id: 3,
      ngo: 'WWF UK',
      ngoSlug: 'wwf-uk',
      authorName: 'Emily Rodriguez',
      authorRole: 'Marine Biologist',
      authorPhoto: 'https://i.pravatar.cc/150?img=9',
      title: 'Pacific Cleanup Update',
      content: 'Removed 50 tons of plastic this month. Progress is steady with our new drone technology.',
      timestamp: new Date(Date.now() - 14400000),
      category: 'Conservation',
      upvotes: 187,
      downvotes: 8,
      userVote: null as 'up' | 'down' | null,
    },
    {
      id: 4,
      ngo: 'WWF Japan',
      ngoSlug: 'wwf-japan',
      authorName: 'James Anderson',
      authorRole: 'Wildlife Conservation Director',
      authorPhoto: 'https://i.pravatar.cc/150?img=15',
      title: 'Climate Resilience Program',
      content: 'Protecting Arctic ecosystems threatened by climate change - temperature monitoring shows concerning trends.',
      timestamp: new Date(Date.now() - 21600000),
      category: 'Climate',
      upvotes: 231,
      downvotes: 12,
      userVote: null as 'up' | 'down' | null,
    },
  ]);

  // Handle voting on news items
  const handleVote = (newsId: number, voteType: 'up' | 'down') => {
    setNewsFeed(prev => prev.map(item => {
      if (item.id !== newsId) return item;

      const currentVote = item.userVote;
      let newUpvotes = item.upvotes;
      let newDownvotes = item.downvotes;
      let newUserVote: 'up' | 'down' | null = voteType;

      // Remove previous vote if exists
      if (currentVote === 'up') newUpvotes--;
      if (currentVote === 'down') newDownvotes--;

      // Add new vote or cancel if same
      if (currentVote === voteType) {
        newUserVote = null; // Cancel vote
      } else {
        if (voteType === 'up') newUpvotes++;
        if (voteType === 'down') newDownvotes++;
      }

      return {
        ...item,
        upvotes: newUpvotes,
        downvotes: newDownvotes,
        userVote: newUserVote,
      };
    }));
  };

  const [liveMissions, setLiveMissions] = useState([
    { id: 1, name: 'Arctic Ice Monitoring', location: 'Iceland', votes: 521, funding: 48000, progress: 68, status: 'active' as const },
    { id: 2, name: 'Amazon Protection', location: 'Brazil', votes: 498, funding: 55000, progress: 82, status: 'active' as const },
    { id: 3, name: 'Ocean Cleanup', location: 'Pacific', votes: 456, funding: 42000, progress: 45, status: 'active' as const },
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
      color: 'rgb(3, 105, 161)',
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
      visible: false,
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
    {
      id: 'polarbears',
      name: 'Polar Bear Tracking',
      visible: true,
      opacity: 1,
      activeOpacity: 1,
      inactiveOpacity: 0.5,
      color: '#ffffff',
      colorMode: 'fixed',
      strokePattern: 'solid',
      strokeWidth: 2,
      showArrows: false,
      fillPolygons: false,
      icon: GlobeAltIcon,
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
    fundingRange: [0, 100000],
    dateRange: null,
    impactThreshold: 0
  });

  // Property-based color mapping (Climate-focused categories)
  const categoryColorMap = {
    'Climate': '#06b6d4',
    'Conservation': '#10b981',
    'Water': 'rgb(3, 105, 161)',
    'Forest': '#22c55e',
    'Ocean': '#0ea5e9'
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
    // Load real polar bear tracking data from USGS
    const polarBearData = getPolarBearData();
    setPolarBears(polarBearData);
    console.log(`Loaded ${polarBearData.length} polar bears from USGS tracking data`);

    const mockBases: CharityBase[] = [
      {
        id: 'hq1', name: 'NRDC Headquarters', location: { lat: 40.7128, lng: -74.0060 }, type: 'headquarters',
        activeProjects: 45, category: 'Climate', fundingReceived: 58000, lastActivity: new Date(), impact: 8247,
        properties: { region: 'Americas', established: 2010 },
        regionalClimateData: { avgTemperature: 12.5, temperatureTrend: +1.2, airQualityIndex: 85, forestCoverage: 24, waterAvailability: 78, carbonFootprint: 45000, renewableEnergy: 32 }
      },
      {
        id: 'hq2', name: 'WWF UK', location: { lat: 51.5074, lng: -0.1278 }, type: 'headquarters',
        activeProjects: 38, category: 'Conservation', fundingReceived: 45000, lastActivity: new Date(), impact: 6892,
        properties: { region: 'Europe', established: 2012 },
        regionalClimateData: { avgTemperature: 10.8, temperatureTrend: +0.9, airQualityIndex: 72, forestCoverage: 38, waterAvailability: 85, carbonFootprint: 38000, renewableEnergy: 48 }
      },
      {
        id: 'hq3', name: 'WWF Japan', location: { lat: 35.6762, lng: 139.6503 }, type: 'headquarters',
        activeProjects: 52, category: 'Climate', fundingReceived: 60000, lastActivity: new Date(), impact: 9563,
        properties: { region: 'Asia', established: 2008 },
        regionalClimateData: { avgTemperature: 16.3, temperatureTrend: +1.5, airQualityIndex: 145, forestCoverage: 31, waterAvailability: 68, carbonFootprint: 52000, renewableEnergy: 28 }
      },
      {
        id: 'r1', name: 'African Regional', location: { lat: -1.2921, lng: 36.8219 }, type: 'regional',
        activeProjects: 28, category: 'Water', fundingReceived: 32000, lastActivity: new Date(), impact: 4534,
        properties: { region: 'Africa', established: 2015 },
        regionalClimateData: { avgTemperature: 24.5, temperatureTrend: +1.8, airQualityIndex: 95, forestCoverage: 42, waterAvailability: 45, carbonFootprint: 12000, renewableEnergy: 18 }
      },
      {
        id: 'r2', name: 'South America', location: { lat: -23.5505, lng: -46.6333 }, type: 'regional',
        activeProjects: 31, category: 'Forest', fundingReceived: 38000, lastActivity: new Date(), impact: 5678,
        properties: { region: 'South America', established: 2013 },
        regionalClimateData: { avgTemperature: 19.5, temperatureTrend: +1.3, airQualityIndex: 105, forestCoverage: 58, waterAvailability: 72, carbonFootprint: 28000, renewableEnergy: 42 }
      },
      {
        id: 'r3', name: 'Middle East', location: { lat: 25.2048, lng: 55.2708 }, type: 'regional',
        activeProjects: 22, category: 'Climate', fundingReceived: 28000, lastActivity: new Date(), impact: 3423,
        properties: { region: 'Middle East', established: 2016 },
        regionalClimateData: { avgTemperature: 28.2, temperatureTrend: +2.1, airQualityIndex: 165, forestCoverage: 8, waterAvailability: 22, carbonFootprint: 68000, renewableEnergy: 15 }
      },
      {
        id: 'f1', name: 'Arctic Research', location: { lat: 64.1466, lng: -21.9426 }, type: 'field',
        activeProjects: 8, category: 'Climate', fundingReceived: 22000, lastActivity: new Date(), impact: 2289,
        properties: { region: 'Arctic', established: 2018 },
        regionalClimateData: { avgTemperature: -2.5, temperatureTrend: +3.2, airQualityIndex: 25, forestCoverage: 12, waterAvailability: 95, carbonFootprint: 5000, renewableEnergy: 65 }
      },
      {
        id: 'f2', name: 'Amazon Station', location: { lat: -3.4653, lng: -62.2159 }, type: 'field',
        activeProjects: 12, category: 'Forest', fundingReceived: 25000, lastActivity: new Date(), impact: 3371,
        properties: { region: 'Amazon', established: 2014 },
        regionalClimateData: { avgTemperature: 26.8, temperatureTrend: +1.6, airQualityIndex: 45, forestCoverage: 78, waterAvailability: 88, carbonFootprint: 8000, renewableEnergy: 72 }
      },
      {
        id: 'f3', name: 'Svalbard Polar Research', location: { lat: 78.22, lng: 15.65 }, type: 'field',
        activeProjects: 2, category: 'Climate', fundingReceived: 20000, lastActivity: new Date(), impact: 2542,
        properties: { region: 'Arctic', established: 2019 },
        pulseIntensity: 2.5,
        recentActivity: true,
        regionalClimateData: { avgTemperature: -6.2, temperatureTrend: +4.1, airQualityIndex: 15, forestCoverage: 0, waterAvailability: 98, carbonFootprint: 2500, renewableEnergy: 85 }
      },
    ];

    // Flight paths: from headquarters (homes) to missions (pins)
    const mockPaths: FlightPath[] = [
      // From NRDC Headquarters (NY) to missions
      { id: 'fp1', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: -23.5505, lng: -46.6333 }, fromName: 'NRDC Headquarters', toName: 'South America', amount: 8500, type: 'funding', active: true, timestamp: new Date(Date.now() - 3600000), speed: 1.2 },
      { id: 'fp2', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 64.1466, lng: -21.9426 }, fromName: 'NRDC Headquarters', toName: 'Arctic Research', amount: 12000, type: 'funding', active: true, timestamp: new Date(Date.now() - 5400000), speed: 0.8 },

      // From WWF UK (London) to missions
      { id: 'fp3', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -1.2921, lng: 36.8219 }, fromName: 'WWF UK', toName: 'African Regional', amount: 6500, type: 'funding', active: true, timestamp: new Date(Date.now() - 7200000), speed: 0.9 },
      { id: 'fp4', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: 25.2048, lng: 55.2708 }, fromName: 'WWF UK', toName: 'Middle East', amount: 7500, type: 'funding', active: true, timestamp: new Date(), speed: 1.0 },
      { id: 'fp7', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: 78.22, lng: 15.65 }, fromName: 'WWF UK', toName: 'Svalbard Polar Research', amount: 6500, type: 'funding', active: true, timestamp: new Date(Date.now() - 1200000), speed: 1.3, intensity: 1.8 },

      // From WWF Japan (Tokyo) to missions
      { id: 'fp5', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: -3.4653, lng: -62.2159 }, fromName: 'WWF Japan', toName: 'Amazon Station', amount: 5000, type: 'funding', active: true, timestamp: new Date(Date.now() - 1800000), speed: 1.5 },
      { id: 'fp6', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: -1.2921, lng: 36.8219 }, fromName: 'WWF Japan', toName: 'African Regional', amount: 5500, type: 'funding', active: true, timestamp: new Date(Date.now() - 2400000), speed: 1.1 },
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

    const mockMissionRegions: MissionRegion[] = [
      {
        id: 'mr1',
        name: 'North Island New Zealand - Coastal Restoration',
        description: 'Protecting coastal ecosystems and marine biodiversity around North Island',
        status: 'active',
        fundingGoal: 50000,
        fundingReceived: 34000,
        startDate: new Date('2024-01-15'),
        projectCount: 8,
        priority: 'high',
        polygonBounds: [
          [-34.4, 172.8], [-35.0, 174.3], [-37.5, 175.5], [-39.0, 174.8],
          [-41.0, 174.5], [-41.3, 175.0], [-40.9, 176.2], [-39.5, 177.8],
          [-38.0, 178.2], [-37.0, 178.0], [-36.0, 175.5], [-34.4, 172.8]
        ]
      },
      {
        id: 'mr2',
        name: 'Great Barrier Reef Protection',
        description: 'Coral restoration and water quality improvement initiative',
        status: 'active',
        fundingGoal: 60000,
        fundingReceived: 48000,
        startDate: new Date('2023-09-01'),
        projectCount: 12,
        priority: 'critical',
        polygonBounds: [
          [-10, 142], [-12, 143], [-14, 144.5], [-16, 146], [-18, 147],
          [-20, 148.5], [-22, 149.5], [-24, 153], [-24, 154],
          [-22, 153], [-20, 152], [-18, 150.5], [-16, 149],
          [-14, 147.5], [-12, 146], [-10, 144], [-10, 142]
        ]
      },
      {
        id: 'mr3',
        name: 'Amazon River Basin',
        description: 'Indigenous community support and forest conservation',
        status: 'active',
        fundingGoal: 60000,
        fundingReceived: 52000,
        startDate: new Date('2023-06-20'),
        projectCount: 15,
        priority: 'critical',
        polygonBounds: [
          [-5, -73], [-1, -73], [2, -70], [2, -60], [0, -50],
          [-5, -48], [-10, -50], [-15, -60], [-10, -70], [-5, -73]
        ]
      },
      {
        id: 'mr4',
        name: 'Mediterranean Sea Initiative',
        description: 'Marine plastic cleanup and sustainable fishing practices',
        status: 'active',
        fundingGoal: 55000,
        fundingReceived: 38000,
        startDate: new Date('2024-03-10'),
        projectCount: 10,
        priority: 'high',
        polygonBounds: [
          [30, -6], [36, -5.5], [38, 0], [40, 5], [42, 10],
          [43, 15], [42, 20], [40, 25], [38, 30], [36, 35],
          [32, 36], [30, 33], [30, 25], [31, 15], [30, 0], [30, -6]
        ]
      },
      {
        id: 'mr5',
        name: 'Serengeti Conservation Zone',
        description: 'Wildlife protection and anti-poaching operations',
        status: 'planned',
        fundingGoal: 45000,
        fundingReceived: 22000,
        startDate: new Date('2024-06-01'),
        projectCount: 6,
        priority: 'medium',
        polygonBounds: [
          [-1, 34], [-1.5, 35], [-2, 35.5], [-3, 35.5], [-3.5, 35],
          [-3.5, 34.5], [-3, 34], [-2, 33.5], [-1, 34]
        ]
      },
    ];

    setCharityBases(mockBases);
    setFlightPaths(mockPaths);
    setClimateZones(mockZones);
    setMissionRegions(mockMissionRegions);
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
      <div className="bg-white/80 backdrop-blur-lg border-b border-blue-100 px-6 py-2 flex items-center justify-between z-10 shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-4 flex-1">
          {/* Trending Non-Profits */}
          <div className="flex items-center gap-4 flex-1 overflow-hidden">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-sm font-bold text-gray-700">Trending</span>
              <BoltIcon className="w-4 h-4" style={{ color: 'rgb(3, 105, 161)' }} />
            </div>
            <div className="flex items-center gap-2 flex-1 overflow-hidden">
              {[
                { id: '1', name: 'Isbjorn', category: 'Climate', funding: 58000, projects: 45, region: 'Global', slug: 'isbjorn' },
                { id: '2', name: 'NRDC', category: 'Climate', funding: 58000, projects: 45, region: 'Americas', slug: 'nrdc' },
                { id: '3', name: 'WWF UK', category: 'Conservation', funding: 45000, projects: 38, region: 'Europe', slug: 'wwf-uk' },
                { id: '4', name: 'WWF Japan', category: 'Climate', funding: 60000, projects: 52, region: 'Asia', slug: 'wwf-japan' },
                { id: '5', name: 'African Regional', category: 'Water', funding: 32000, projects: 28, region: 'Africa', slug: 'african-regional' },
                { id: '6', name: 'South America', category: 'Forest', funding: 38000, projects: 31, region: 'South America', slug: 'south-america' },
                { id: '7', name: 'Middle East', category: 'Climate', funding: 28000, projects: 22, region: 'Middle East', slug: 'middle-east' },
                { id: '8', name: 'Arctic Research', category: 'Climate', funding: 22000, projects: 8, region: 'Arctic', slug: 'arctic-research' },
                { id: '9', name: 'Amazon Station', category: 'Forest', funding: 25000, projects: 12, region: 'Amazon', slug: 'amazon-station' }
              ].map((charity, index) => (
                <button
                  key={charity.id}
                  onClick={() => navigate(`/charity/${charity.slug}`)}
                  className="group relative flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-gray-200 hover:border-blue-400 bg-white hover:bg-blue-50 transition-all cursor-pointer flex-shrink-0"
                >
                  <span className="text-xs font-bold text-gray-500">#{index + 1}</span>
                  <span className="text-sm font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {charity.name}
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
                          <span className="text-green-400 font-semibold">${(charity.funding / 1000).toFixed(0)}K</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Projects:</span>
                          <span className="text-blue-400 font-semibold">{charity.projects}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Region:</span>
                          <span className="text-white font-semibold">{charity.region}</span>
                        </div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-gray-700 text-xs text-gray-400 italic">
                        Click to donate
                      </div>
                      <div className="absolute -top-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">

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
            style={showFilterPanel ? { backgroundColor: 'rgb(3, 105, 161)' } : { color: 'rgb(3, 105, 161)' }}
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
            style={{ color: 'rgb(3, 105, 161)' }}
            title="Refresh Data"
          >
            <ArrowPathIcon className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </motion.button>
        </div>
      </div>

      <div className="flex relative px-4 pb-4 pt-4 gap-4 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
        {/* Conditional View: Map or Transaction Board */}
        <div className="flex-1 relative rounded-2xl shadow-xl border border-blue-200 overflow-hidden min-w-0" style={{ backgroundColor: 'rgb(3, 105, 161)', height: '100%' }}>
          {viewMode === 'transactions' ? (
            <div className="h-full overflow-auto">
              <TransactionBoard />
            </div>
          ) : (
          <MapContainer
            center={[10, 170]}
            zoom={3}
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
            <MapCenterHandler
              lat={mapCenter?.lat || urlLat}
              lng={mapCenter?.lng || urlLng}
              zoom={mapCenter?.zoom || urlZoom}
              trigger={centerTrigger}
            />
            <ZoomControls />

            {/* Blue Animated Lines - Donations from headquarters to missions */}
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

            {/* Charity Bases - simple blue pins */}
            {getLayerByType('charities')?.visible && filteredBases.map(base => {
              const layer = getLayerByType('charities')!;
              return (
                <Marker
                  key={base.id}
                  position={[base.location.lat, base.location.lng]}
                  icon={createPropertyBasedIcon(base, layer.colorMode, layer.color, categoryColorMap, false)}
                  eventHandlers={{
                    click: () => setSelectedBase(base)
                  }}
                >
                  {layer.showTooltips && (
                    <Popup maxWidth={280} autoPan={true} autoPanPadding={[50, 50]} className="custom-popup">
                      <div className="text-sm w-64 bg-white p-4 rounded-lg">
                        {/* Header */}
                        <div className="mb-3 pb-3 border-b border-blue-100">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-base font-bold text-gray-900">{base.name}</h3>
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span className="capitalize">{base.type}</span>
                            <span>•</span>
                            <span>{base.category}</span>
                          </div>
                        </div>

                        {/* Key Stats */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-0.5">Projects</div>
                            <div className="text-lg font-bold" style={{ color: 'rgb(3, 105, 161)' }}>{base.activeProjects}</div>
                          </div>
                          <div className="text-center border-x border-blue-100">
                            <div className="text-xs text-gray-500 mb-0.5">Funding</div>
                            <div className="text-lg font-bold" style={{ color: 'rgb(3, 105, 161)' }}>
                              ${base.fundingReceived >= 1000000
                                ? (base.fundingReceived / 1000000).toFixed(1) + 'M'
                                : (base.fundingReceived / 1000).toFixed(0) + 'K'}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-gray-500 mb-0.5">Contributions</div>
                            <div className="text-lg font-bold" style={{ color: 'rgb(3, 105, 161)' }}>{base.impact}</div>
                          </div>
                        </div>
                      </div>
                    </Popup>
                  )}
                </Marker>
              );
            })}

            {/* Polar Bear Tracking - REAL DATA from USGS + Churchill */}
            {getLayerByType('polarbears')?.visible && polarBears.map((bear) => {
              const svgIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="36" height="36">
                <defs>
                  <filter id="shadow">
                    <feDropShadow dx="0" dy="2" stdDeviation="2" flood-opacity="0.3"/>
                  </filter>
                </defs>

                <!-- Polar bear silhouette -->
                <g filter="url(#shadow)">
                  <!-- Back legs -->
                  <ellipse cx="20" cy="48" rx="6" ry="9" fill="#ffffff"/>
                  <ellipse cx="44" cy="48" rx="6" ry="9" fill="#ffffff"/>

                  <!-- Body -->
                  <ellipse cx="32" cy="38" rx="16" ry="18" fill="#ffffff"/>

                  <!-- Head -->
                  <ellipse cx="32" cy="20" rx="12" ry="13" fill="#ffffff"/>

                  <!-- Snout -->
                  <ellipse cx="32" cy="26" rx="7" ry="5" fill="#f8f8f8"/>

                  <!-- Ears -->
                  <ellipse cx="24" cy="12" rx="5" ry="6" fill="#ffffff"/>
                  <ellipse cx="40" cy="12" rx="5" ry="6" fill="#ffffff"/>

                  <!-- Front legs -->
                  <ellipse cx="24" cy="52" rx="5" ry="8" fill="#ffffff"/>
                  <ellipse cx="40" cy="52" rx="5" ry="8" fill="#ffffff"/>

                  <!-- Eyes -->
                  <circle cx="28" cy="18" r="2" fill="#1a1a1a"/>
                  <circle cx="36" cy="18" r="2" fill="#1a1a1a"/>

                  <!-- Nose -->
                  <ellipse cx="32" cy="26" rx="2.5" ry="2" fill="#1a1a1a"/>
                </g>

                <!-- Blue tracking indicator -->
                <circle cx="52" cy="12" r="8" fill="#0369a1" stroke="#ffffff" stroke-width="2"/>
                <path d="M 52 8 L 52 16 M 48 12 L 56 12" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/>
              </svg>`;
              const polarBearIcon = new Icon({
                iconUrl: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svgIcon),
                iconSize: [36, 36],
                iconAnchor: [18, 54],
                popupAnchor: [0, -54],
              });

              return (
                <React.Fragment key={bear.id}>
                  {/* Polar bear current location */}
                  <Marker
                    position={[bear.currentLocation.lat, bear.currentLocation.lng]}
                    icon={polarBearIcon}
                  >
                    <Popup maxWidth={280} className="custom-popup">
                      <div className="bg-gradient-to-br from-blue-50 to-white p-5 rounded-xl">
                        {/* Bear emoji header */}
                        <div className="text-center mb-4">
                          <div className="text-5xl mb-2">🐻‍❄️</div>
                          <h3 className="text-xl font-bold text-gray-900 mb-1">{bear.name}</h3>
                          <div className="inline-block px-3 py-1 bg-blue-100 rounded-full">
                            <span className="text-xs font-semibold text-blue-700">📍 {bear.region}</span>
                          </div>
                        </div>

                        {/* Simple stats */}
                        <div className="bg-white rounded-lg p-4 shadow-sm space-y-3 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">📅</span>
                            <div>
                              <div className="text-xs text-gray-500">Last Seen</div>
                              <div className="text-sm font-semibold text-gray-900">{bear.lastUpdated.split(' ')[0]}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🗺️</span>
                            <div>
                              <div className="text-xs text-gray-500">Tracked Locations</div>
                              <div className="text-sm font-semibold" style={{ color: 'rgb(3, 105, 161)' }}>
                                {bear.trackingHistory.length} GPS points
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Friendly note */}
                        <div className="text-center text-xs text-gray-600 bg-blue-50 rounded-lg p-2">
                          <span className="font-semibold">🛰️ Real GPS Tracking Data</span>
                          <div className="text-[10px] mt-1">USGS & Polar Bears International</div>
                        </div>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Tracking path - subtle */}
                  {bear.trackingHistory.length > 1 && (
                    <Polyline
                      positions={bear.trackingHistory.map(point => [point.lat, point.lng])}
                      pathOptions={{
                        color: '#0369a1',
                        weight: 1,
                        opacity: 0.3,
                        dashArray: '3, 3'
                      }}
                    />
                  )}
                </React.Fragment>
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
                  <ChartBarIcon className="w-5 h-5" style={{ color: 'rgb(3, 105, 161)' }} />
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
              <div className="px-5 py-4 border-b border-blue-200 flex items-center justify-between bg-white">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="w-5 h-5" style={{ color: 'rgb(3, 105, 161)' }} />
                  <h3 className="font-bold" style={{ color: 'rgb(3, 105, 161)' }}>Filter Charities</h3>
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
                    style={{ backgroundColor: '#e0f2fe', color: 'rgb(3, 105, 161)' }}
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
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-bold mb-3 block" style={{ color: 'rgb(3, 105, 161)' }}>
                    Focus Areas
                  </label>
                  <div className="space-y-2">
                    {['Climate', 'Conservation', 'Water', 'Forest', 'Ocean'].map(category => (
                      <label key={category} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors">
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
                          className="w-4 h-4 rounded border-blue-300 bg-white focus:ring-offset-0"
                          style={{ accentColor: 'rgb(3, 105, 161)' }}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium">{category}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Organization Type Filter */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-bold mb-3 block" style={{ color: 'rgb(3, 105, 161)' }}>
                    Organization Type
                  </label>
                  <div className="space-y-2">
                    {['headquarters', 'regional', 'field'].map(type => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer group p-2 rounded-lg hover:bg-blue-50 transition-colors">
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
                          className="w-4 h-4 rounded border-blue-300 bg-white focus:ring-offset-0"
                          style={{ accentColor: 'rgb(3, 105, 161)' }}
                        />
                        <span className="text-sm text-gray-700 group-hover:text-gray-900 font-medium capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Impact Threshold */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-bold mb-3 block flex items-center justify-between">
                    <span style={{ color: 'rgb(3, 105, 161)' }}>
                      Minimum Impact Score
                    </span>
                    <span className="font-bold text-base" style={{ color: 'rgb(3, 105, 161)' }}>{filters.impactThreshold}%</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={filters.impactThreshold}
                    onChange={(e) => setFilters(prev => ({ ...prev, impactThreshold: parseInt(e.target.value) }))}
                    className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                    style={{ accentColor: 'rgb(3, 105, 161)' }}
                  />
                  <div className="flex justify-between text-xs font-medium mt-2" style={{ color: 'rgb(3, 105, 161)' }}>
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>

                {/* Funding Range */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <label className="text-sm font-bold mb-3 block flex items-center justify-between">
                    <span style={{ color: 'rgb(3, 105, 161)' }}>
                      Funding Range
                    </span>
                    <span className="font-bold text-xs" style={{ color: 'rgb(3, 105, 161)' }}>
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
                      className="w-full h-2.5 bg-blue-200 rounded-lg appearance-none cursor-pointer"
                      style={{ accentColor: 'rgb(3, 105, 161)' }}
                    />
                  </div>
                </div>

                {/* Results Summary */}
                <div className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold mb-1" style={{ color: 'rgb(3, 105, 161)' }}>Showing Results</div>
                      <div className="text-2xl font-bold" style={{ color: 'rgb(3, 105, 161)' }}>{filteredBases.length}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-semibold mb-1" style={{ color: 'rgb(3, 105, 161)' }}>of Total</div>
                      <div className="text-2xl font-bold" style={{ color: 'rgb(3, 105, 161)' }}>{charityBases.length}</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Right Side Panel - Timeline */}
        <div className="w-96 flex flex-col gap-3" style={{ height: '100%' }}>
          {/* Top Mission Card */}
          <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => navigate('/charity/isbjorn')}>
            <div className="flex items-start gap-2">
              {/* Isbjorn Logo */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                <img src={isbjornLogo} alt="Isbjorn" className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Header */}
                <div className="flex items-start justify-between mb-1">
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-gray-900">Isbjorn Foundation</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(3, 105, 161)' }}>
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="text-xs text-gray-500">
                      Conservation Team
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-semibold text-red-600">LIVE</span>
                  </div>
                </div>

                {/* Title */}
                <h4 className="font-bold text-sm text-gray-800 mb-1">
                  Polar Bear Conservation in Svalbard
                </h4>

                {/* Content */}
                <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                  Real-time monitoring in Svalbard, Norway. Tracking ice coverage and wildlife patterns.
                </p>

                {/* Mini Map */}
                <div
                  className="relative w-full h-24 bg-gray-100 rounded-lg overflow-hidden mb-2 border border-gray-200 cursor-pointer hover:border-[rgb(3,105,161)] transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMapCenter({ lat: 78.22, lng: 15.65, zoom: 6 });
                    setCenterTrigger(prev => prev + 1);
                  }}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-[rgb(3,105,161)]/10">
                    <div className="text-center">
                      <svg className="w-8 h-8 mx-auto mb-1 text-[rgb(3,105,161)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      <p className="text-xs font-semibold text-[rgb(3,105,161)]">View on Map</p>
                      <p className="text-xs text-gray-500">Svalbard, Norway</p>
                    </div>
                  </div>
                </div>

                {/* Category and Actions */}
                <div className="flex items-center justify-between gap-2">
                  <div className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: 'rgb(3, 105, 161)' }}>
                    Top Mission
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => { e.stopPropagation(); navigate('/live'); }}
                      className="flex items-center gap-0.5 px-2 py-1 rounded text-xs font-semibold transition-all bg-[rgb(3,105,161)] text-white hover:bg-[rgb(2,85,131)]"
                    >
                      Watch Live
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-xl border border-blue-200 shadow-lg p-3 overflow-hidden flex flex-col" style={{ height: 'calc(100% - 230px)' }}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold flex items-center space-x-2" style={{ color: 'rgb(3, 105, 161)' }}>
                <SignalIcon className="w-5 h-5" />
                <span>Timeline</span>
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {newsFeed.map((news, index) => (
                <div
                  key={news.id}
                  className="bg-gradient-to-br from-blue-50 to-white border border-blue-200 rounded-lg p-2 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => navigate(`/charity/${news.ngoSlug}`)}
                >
                  <div className="flex items-start gap-2">
                    {/* Author Profile Picture */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                      <img
                        src={news.authorPhoto}
                        alt={news.authorName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(news.authorName)}&background=3b82f6&color=fff&size=128`;
                        }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header - Author info */}
                      <div className="flex items-start justify-between mb-1">
                        <div>
                          <div className="flex items-center gap-1">
                            <span className="text-sm font-bold text-gray-900">{news.authorName}</span>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20" style={{ color: 'rgb(3, 105, 161)' }}>
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="text-xs text-gray-500">
                            {news.authorRole} at {news.ngo}
                          </div>
                        </div>
                        <span className="text-xs text-gray-500 flex-shrink-0">
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

                      {/* Category badge and votes */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="inline-block text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#eff6ff', color: 'rgb(3, 105, 161)' }}>
                          {news.category}
                        </div>

                        {/* Vote buttons */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleVote(news.id, 'up')}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-all ${
                              news.userVote === 'up'
                                ? 'bg-green-100 text-green-700'
                                : 'hover:bg-gray-100 text-gray-500'
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
                            </svg>
                            <span className="text-xs font-semibold">{news.upvotes}</span>
                          </button>
                          <button
                            onClick={() => handleVote(news.id, 'down')}
                            className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded transition-all ${
                              news.userVote === 'down'
                                ? 'bg-red-100 text-red-700'
                                : 'hover:bg-gray-100 text-gray-500'
                            }`}
                          >
                            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M18 9.5a1.5 1.5 0 11-3 0v-6a1.5 1.5 0 013 0v6zM14 9.667v-5.43a2 2 0 00-1.105-1.79l-.05-.025A4 4 0 0011.055 2H5.64a2 2 0 00-1.962 1.608l-1.2 6A2 2 0 004.44 12H8v4a2 2 0 002 2 1 1 0 001-1v-.667a4 4 0 01.8-2.4l1.4-1.866a4 4 0 00.8-2.4z" />
                            </svg>
                            <span className="text-xs font-semibold">{news.downvotes}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Link */}
            <div className="mt-2 pt-2 border-t border-blue-100 text-center">
              <button
                onClick={() => navigate('/donate')}
                className="text-sm font-semibold hover:underline"
                style={{ color: 'rgb(3, 105, 161)' }}
              >
                View all updates on Donate →
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

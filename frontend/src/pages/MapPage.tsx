import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, LatLngExpression, DivIcon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '@/contexts/AuthContext';

// Fix for default marker icons in React-Leaflet
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

interface Proposal {
  id: string;
  nonprofitId: string;
  nonprofitName: string;
  title: string;
  description: string;
  goal: number;
  raised: number;
  votes: number;
  location: { lat: number; lng: number };
  deadline: Date;
  category: string;
  image: string;
}

interface Activity {
  id: string;
  nonprofitName: string;
  action: string;
  timestamp: Date;
  location: { lat: number; lng: number };
  amount?: number;
}

interface Transaction {
  id: string;
  nonprofitName: string;
  from: string;
  to: string;
  amount: number;
  purpose: string;
  timestamp: Date;
  txHash: string;
  verified: boolean;
}

interface DAOAllocation {
  nonprofitName: string;
  totalFunds: number;
  allocations: {
    category: string;
    amount: number;
    percentage: number;
    spent: number;
    transactions: number;
  }[];
}

interface CharityBase {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  type: 'headquarters' | 'regional' | 'field';
  activeProjects: number;
  lastActivity: Date;
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
}

interface ClimateZone {
  id: string;
  location: { lat: number; lng: number };
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'drought' | 'flooding' | 'temperature' | 'deforestation' | 'pollution';
  radius: number;
}

interface NetworkStats {
  totalTransferred: number;
  activeConnections: number;
  projectsActive: number;
  avgResponseTime: number;
  uptime: number;
}

interface SocialPost {
  id: string;
  nonprofitId: string;
  nonprofitName: string;
  nonprofitAvatar: string;
  content: string;
  images?: string[];
  location: { lat: number; lng: number };
  timestamp: Date;
  likes: number;
  comments: number;
  isLiked: boolean;
  isTrending: boolean;
  category: 'update' | 'milestone' | 'emergency' | 'success' | 'announcement';
  awarenessCount?: number;
}

// Helper function to create arc path points
const createArcPath = (from: { lat: number; lng: number }, to: { lat: number; lng: number }, numPoints: number = 50): LatLngExpression[] => {
  const points: LatLngExpression[] = [];
  const latDiff = to.lat - from.lat;
  const lngDiff = to.lng - from.lng;

  // Calculate arc height based on distance
  const distance = Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  const arcHeight = distance * 0.3;

  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints;
    const lat = from.lat + latDiff * t + Math.sin(t * Math.PI) * arcHeight;
    const lng = from.lng + lngDiff * t;
    points.push([lat, lng]);
  }

  return points;
};

// Animated Flight Path Component
const AnimatedFlightPath: React.FC<{ path: FlightPath }> = ({ path }) => {
  const [animationProgress, setAnimationProgress] = useState(Math.random());
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!path.active) return;

    const distance = Math.sqrt(
      Math.pow(path.to.lat - path.from.lat, 2) +
      Math.pow(path.to.lng - path.from.lng, 2)
    );
    const speed = 0.0015 + (distance * 0.00002);

    const interval = setInterval(() => {
      setAnimationProgress(prev => (prev >= 1 ? 0 : prev + speed));
    }, 150);

    return () => clearInterval(interval);
  }, [path.active, path.from, path.to]);

  const pathColor = path.type === 'funding' ? '#22c55e' : path.type === 'data' ? '#3b82f6' : '#a855f7';
  const arcPoints = createArcPath(path.from, path.to);
  const pointIndex = Math.floor(animationProgress * (arcPoints.length - 1));
  const animatedPoint = arcPoints[pointIndex] as [number, number];

  return (
    <>
      <Polyline
        positions={arcPoints}
        pathOptions={{
          color: pathColor,
          weight: isHovered ? 3 : 2,
          opacity: isHovered ? 0.7 : 0.4,
          dashArray: '8, 12'
        }}
        eventHandlers={{
          mouseover: () => setIsHovered(true),
          mouseout: () => setIsHovered(false)
        }}
      />
      {path.active && animatedPoint && (
        <>
          <Circle
            center={animatedPoint}
            radius={isHovered ? 70000 : 50000}
            pathOptions={{
              color: pathColor,
              fillColor: pathColor,
              fillOpacity: 0.9,
              weight: 2
            }}
          />
          {pointIndex > 5 && (
            <Circle
              center={arcPoints[pointIndex - 5] as [number, number]}
              radius={30000}
              pathOptions={{
                color: pathColor,
                fillColor: pathColor,
                fillOpacity: 0.4,
                weight: 1
              }}
            />
          )}
        </>
      )}
      {isHovered && (
        <Popup
          position={arcPoints[Math.floor(arcPoints.length / 2)] as [number, number]}
          closeButton={false}
          autoClose={false}
          closeOnClick={false}
        >
          <div className="text-xs">
            <div className="font-bold text-gray-900">{path.fromName} → {path.toName}</div>
            <div className="text-green-600 font-semibold">${(path.amount / 1000).toFixed(0)}K</div>
            <div className="text-gray-500 capitalize">{path.type}</div>
          </div>
        </Popup>
      )}
    </>
  );
};

// Custom icon creator
const createCharityIcon = (type: 'headquarters' | 'regional' | 'field') => {
  const colors = {
    headquarters: '#14b8a6',
    regional: '#60a5fa',
    field: '#34d399'
  };

  const sizes = {
    headquarters: 32,
    regional: 24,
    field: 18
  };

  return new Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="${sizes[type]}" height="${sizes[type]}">
        <circle cx="12" cy="12" r="10" fill="${colors[type]}" opacity="0.2"/>
        <circle cx="12" cy="12" r="7" fill="${colors[type]}" opacity="0.5"/>
        <circle cx="12" cy="12" r="4" fill="${colors[type]}" opacity="0.9"/>
        <circle cx="12" cy="12" r="2" fill="white" opacity="0.9"/>
      </svg>
    `)}`,
    iconSize: [sizes[type], sizes[type]],
    iconAnchor: [sizes[type] / 2, sizes[type] / 2]
  });
};

// Pulse animation component
const PulseCircle: React.FC<{ location: { lat: number; lng: number }; type: string }> = ({ location, type }) => {
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPulse(prev => (prev >= 300000 ? 50000 : prev + 2000));
    }, 600);

    return () => clearInterval(interval);
  }, []);

  const colors = {
    headquarters: '#14b8a6',
    regional: '#60a5fa',
    field: '#34d399'
  };

  return (
    <Circle
      center={[location.lat, location.lng]}
      radius={pulse}
      pathOptions={{
        color: colors[type as keyof typeof colors],
        fillOpacity: Math.max(0.05, 0.15 - (pulse / 250000) * 0.15),
        weight: 1,
        opacity: Math.max(0, 0.6 - (pulse / 250000) * 0.6)
      }}
    />
  );
};

const MapPage: React.FC = () => {
  const { user } = useAuth();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [daoAllocations, setDaoAllocations] = useState<DAOAllocation[]>([]);
  const [charityBases, setCharityBases] = useState<CharityBase[]>([]);
  const [flightPaths, setFlightPaths] = useState<FlightPath[]>([]);
  const [climateZones, setClimateZones] = useState<ClimateZone[]>([]);
  const [networkStats, setNetworkStats] = useState<NetworkStats>({
    totalTransferred: 0,
    activeConnections: 0,
    projectsActive: 0,
    avgResponseTime: 0,
    uptime: 99.9
  });
  const [socialPosts, setSocialPosts] = useState<SocialPost[]>([]);
  const [subscribedNonprofits, setSubscribedNonprofits] = useState<string[]>([]);
  const [recentConnections, setRecentConnections] = useState<string[]>([]);
  const [userVotingPower, setUserVotingPower] = useState(0);
  const [selectedProposal, setSelectedProposal] = useState<Proposal | null>(null);
  const [activeTab, setActiveTab] = useState<'map' | 'transparency' | 'dao'>('map');

  // Map filter states
  const [showClimateZones, setShowClimateZones] = useState(true);
  const [showProjects, setShowProjects] = useState(true);
  const [showFundingPaths, setShowFundingPaths] = useState(true);
  const [showDataPaths, setShowDataPaths] = useState(true);
  const [showCollabPaths, setShowCollabPaths] = useState(true);

  // Mock data initialization
  useEffect(() => {
    // Calculate user voting power (1 vote per day active, mock calculation)
    const daysActive = user ? Math.floor(Math.random() * 90) + 1 : 0;
    setUserVotingPower(daysActive);

    // Mock proposals
    const mockProposals: Proposal[] = [
      {
        id: '1',
        nonprofitId: 'wv',
        nonprofitName: 'World Vision',
        title: 'Clean Water Project - Tanzania',
        description: 'Install 50 water wells in rural Tanzania to provide clean drinking water to 10,000 families',
        goal: 250000,
        raised: 180000,
        votes: 1247,
        location: { lat: -6.369028, lng: 34.888822 },
        deadline: new Date('2025-03-15'),
        category: 'Water & Sanitation',
        image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400'
      },
      {
        id: '2',
        nonprofitId: 'rc',
        nonprofitName: 'Red Cross NZ',
        title: 'Disaster Relief - Pacific Islands',
        description: 'Emergency response fund for cyclone victims in Fiji and Tonga',
        goal: 500000,
        raised: 320000,
        votes: 892,
        location: { lat: -18.1416, lng: 178.4419 },
        deadline: new Date('2025-02-28'),
        category: 'Disaster Relief',
        image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400'
      },
      {
        id: '3',
        nonprofitId: 'sf',
        nonprofitName: 'Starship Foundation',
        title: 'Pediatric Cancer Research',
        description: 'Fund groundbreaking research into childhood leukemia treatments',
        goal: 1000000,
        raised: 450000,
        votes: 2103,
        location: { lat: -36.8485, lng: 174.7633 },
        deadline: new Date('2025-06-30'),
        category: 'Healthcare',
        image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?w=400'
      },
      {
        id: '4',
        nonprofitId: 'fb',
        nonprofitName: 'Forest & Bird',
        title: 'Kakapo Conservation Program',
        description: 'Protect and expand habitats for NZ\'s endangered kakapo population',
        goal: 300000,
        raised: 195000,
        votes: 1567,
        location: { lat: -45.0312, lng: 168.6626 },
        deadline: new Date('2025-05-20'),
        category: 'Wildlife Conservation',
        image: 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400'
      },
      {
        id: '5',
        nonprofitId: 'uc',
        nonprofitName: 'UNICEF',
        title: 'Education Access - Southeast Asia',
        description: 'Build 20 schools in rural Vietnam and Cambodia to educate 5,000 children',
        goal: 750000,
        raised: 420000,
        votes: 1834,
        location: { lat: 14.0583, lng: 108.2772 },
        deadline: new Date('2025-08-15'),
        category: 'Education',
        image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400'
      }
    ];

    // Mock recent activities
    const mockActivities: Activity[] = [
      {
        id: 'a1',
        nonprofitName: 'World Vision',
        action: 'Completed well installation in Dodoma village',
        timestamp: new Date(Date.now() - 1000 * 60 * 5),
        location: { lat: -6.369028, lng: 34.888822 }
      },
      {
        id: 'a2',
        nonprofitName: 'Red Cross NZ',
        action: 'Distributed 500 emergency kits in Fiji',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        location: { lat: -18.1416, lng: 178.4419 },
        amount: 45000
      },
      {
        id: 'a3',
        nonprofitName: 'Starship Foundation',
        action: 'Published new research findings on treatment protocol',
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        location: { lat: -36.8485, lng: 174.7633 }
      },
      {
        id: 'a4',
        nonprofitName: 'Forest & Bird',
        action: 'Released 3 kakapo chicks into protected habitat',
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        location: { lat: -45.0312, lng: 168.6626 }
      },
      {
        id: 'a5',
        nonprofitName: 'UNICEF',
        action: 'Opened new school in Mekong Delta region',
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        location: { lat: 14.0583, lng: 108.2772 },
        amount: 85000
      }
    ];

    // Mock transparent transactions
    const mockTransactions: Transaction[] = [
      {
        id: 't1',
        nonprofitName: 'World Vision',
        from: 'Donation Pool',
        to: 'Tanzania Water Project',
        amount: 25000,
        purpose: 'Well drilling equipment',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
        txHash: '0x7f9fade1c0d57a7af66ab4ead79fade1c0d57a7af66ab4ead7c2c2eb7b11a91385',
        verified: true
      },
      {
        id: 't2',
        nonprofitName: 'Red Cross NZ',
        from: 'Emergency Fund',
        to: 'Fiji Relief Operations',
        amount: 50000,
        purpose: 'Medical supplies and temporary shelter',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
        txHash: '0x8a1bc2e3d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1',
        verified: true
      },
      {
        id: 't3',
        nonprofitName: 'Starship Foundation',
        from: 'Research Fund',
        to: 'Clinical Trial Phase 2',
        amount: 120000,
        purpose: 'Drug development and patient trials',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12),
        txHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4',
        verified: true
      },
      {
        id: 't4',
        nonprofitName: 'Forest & Bird',
        from: 'Conservation Fund',
        to: 'Kakapo Habitat Expansion',
        amount: 35000,
        purpose: 'Land acquisition and habitat restoration',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24),
        txHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6',
        verified: true
      }
    ];

    // Mock DAO allocations
    const mockDAOAllocations: DAOAllocation[] = [
      {
        nonprofitName: 'World Vision',
        totalFunds: 180000,
        allocations: [
          { category: 'Infrastructure', amount: 90000, percentage: 50, spent: 65000, transactions: 12 },
          { category: 'Community Training', amount: 36000, percentage: 20, spent: 28000, transactions: 8 },
          { category: 'Maintenance', amount: 27000, percentage: 15, spent: 12000, transactions: 5 },
          { category: 'Administration', amount: 18000, percentage: 10, spent: 15000, transactions: 15 },
          { category: 'Emergency Reserve', amount: 9000, percentage: 5, spent: 0, transactions: 0 }
        ]
      },
      {
        nonprofitName: 'Red Cross NZ',
        totalFunds: 320000,
        allocations: [
          { category: 'Emergency Supplies', amount: 128000, percentage: 40, spent: 95000, transactions: 25 },
          { category: 'Medical Aid', amount: 96000, percentage: 30, spent: 78000, transactions: 18 },
          { category: 'Logistics', amount: 64000, percentage: 20, spent: 52000, transactions: 12 },
          { category: 'Staff & Training', amount: 32000, percentage: 10, spent: 28000, transactions: 8 }
        ]
      },
      {
        nonprofitName: 'Starship Foundation',
        totalFunds: 450000,
        allocations: [
          { category: 'Research & Development', amount: 270000, percentage: 60, spent: 185000, transactions: 6 },
          { category: 'Clinical Trials', amount: 90000, percentage: 20, spent: 45000, transactions: 4 },
          { category: 'Equipment', amount: 54000, percentage: 12, spent: 38000, transactions: 7 },
          { category: 'Patient Support', amount: 36000, percentage: 8, spent: 29000, transactions: 22 }
        ]
      }
    ];

    // Mock charity bases across the globe
    const mockCharityBases: CharityBase[] = [
      { id: 'hq1', name: 'Global Climate HQ', location: { lat: 40.7128, lng: -74.0060 }, type: 'headquarters', activeProjects: 45, lastActivity: new Date() },
      { id: 'hq2', name: 'EU Operations Center', location: { lat: 51.5074, lng: -0.1278 }, type: 'headquarters', activeProjects: 38, lastActivity: new Date() },
      { id: 'hq3', name: 'Asia-Pacific Hub', location: { lat: 35.6762, lng: 139.6503 }, type: 'headquarters', activeProjects: 52, lastActivity: new Date() },
      { id: 'r1', name: 'African Regional', location: { lat: -1.2921, lng: 36.8219 }, type: 'regional', activeProjects: 28, lastActivity: new Date() },
      { id: 'r2', name: 'South America Hub', location: { lat: -23.5505, lng: -46.6333 }, type: 'regional', activeProjects: 31, lastActivity: new Date() },
      { id: 'r3', name: 'Middle East Center', location: { lat: 25.2048, lng: 55.2708 }, type: 'regional', activeProjects: 22, lastActivity: new Date() },
      { id: 'r4', name: 'Australia Base', location: { lat: -33.8688, lng: 151.2093 }, type: 'regional', activeProjects: 19, lastActivity: new Date() },
      { id: 'r5', name: 'Southeast Asia', location: { lat: 1.3521, lng: 103.8198 }, type: 'regional', activeProjects: 25, lastActivity: new Date() },
      { id: 'r6', name: 'India Operations', location: { lat: 19.0760, lng: 72.8777 }, type: 'regional', activeProjects: 34, lastActivity: new Date() },
      { id: 'f1', name: 'Arctic Research', location: { lat: 64.1466, lng: -21.9426 }, type: 'field', activeProjects: 8, lastActivity: new Date() },
      { id: 'f2', name: 'Amazon Field Station', location: { lat: -3.4653, lng: -62.2159 }, type: 'field', activeProjects: 12, lastActivity: new Date() },
      { id: 'f3', name: 'Pacific Islands', location: { lat: -18.1416, lng: 178.4419 }, type: 'field', activeProjects: 6, lastActivity: new Date() },
      { id: 'f4', name: 'Sahara Initiative', location: { lat: 23.8859, lng: 45.0792 }, type: 'field', activeProjects: 9, lastActivity: new Date() },
      { id: 'f5', name: 'Himalayan Center', location: { lat: 27.7172, lng: 85.3240 }, type: 'field', activeProjects: 11, lastActivity: new Date() },
    ];

    // Mock flight paths between charities
    const mockFlightPaths: FlightPath[] = [
      { id: 'fp1', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 51.5074, lng: -0.1278 }, fromName: 'NY HQ', toName: 'London', amount: 250000, type: 'funding', active: true },
      { id: 'fp2', from: { lat: 51.5074, lng: -0.1278 }, to: { lat: -1.2921, lng: 36.8219 }, fromName: 'London', toName: 'Kenya', amount: 180000, type: 'funding', active: true },
      { id: 'fp3', from: { lat: 35.6762, lng: 139.6503 }, to: { lat: 1.3521, lng: 103.8198 }, fromName: 'Tokyo', toName: 'Singapore', amount: 120000, type: 'collaboration', active: true },
      { id: 'fp4', from: { lat: -23.5505, lng: -46.6333 }, to: { lat: -3.4653, lng: -62.2159 }, fromName: 'São Paulo', toName: 'Amazon', amount: 95000, type: 'funding', active: true },
      { id: 'fp5', from: { lat: 40.7128, lng: -74.0060 }, to: { lat: 35.6762, lng: 139.6503 }, fromName: 'NY HQ', toName: 'Tokyo', amount: 340000, type: 'data', active: true },
      { id: 'fp6', from: { lat: 25.2048, lng: 55.2708 }, to: { lat: 23.8859, lng: 45.0792 }, fromName: 'Dubai', toName: 'Sahara', amount: 75000, type: 'funding', active: true },
    ];

    // Mock climate impact zones
    const mockClimateZones: ClimateZone[] = [
      { id: 'cz1', location: { lat: -3.4653, lng: -62.2159 }, name: 'Amazon Deforestation', severity: 'critical', type: 'deforestation', radius: 400000 },
      { id: 'cz2', location: { lat: 23.8859, lng: 45.0792 }, name: 'Sahara Drought', severity: 'high', type: 'drought', radius: 600000 },
      { id: 'cz3', location: { lat: 28.6139, lng: 77.2090 }, name: 'Delhi Air Quality', severity: 'critical', type: 'pollution', radius: 200000 },
      { id: 'cz4', location: { lat: -18.1416, lng: 178.4419 }, name: 'Pacific Rising Seas', severity: 'high', type: 'flooding', radius: 350000 },
      { id: 'cz5', location: { lat: 64.1466, lng: -21.9426 }, name: 'Arctic Warming', severity: 'critical', type: 'temperature', radius: 500000 },
      { id: 'cz6', location: { lat: -33.9249, lng: 18.4241 }, name: 'Cape Town Drought', severity: 'medium', type: 'drought', radius: 250000 },
      { id: 'cz7', location: { lat: 13.7563, lng: 100.5018 }, name: 'Bangkok Flooding', severity: 'medium', type: 'flooding', radius: 200000 },
      { id: 'cz8', location: { lat: -15.7975, lng: -47.8919 }, name: 'Cerrado Loss', severity: 'high', type: 'deforestation', radius: 300000 },
    ];

    // Mock social posts from nonprofits
    const mockSocialPosts: SocialPost[] = [
      {
        id: 'sp1',
        nonprofitId: 'wv',
        nonprofitName: 'World Vision',
        nonprofitAvatar: '🌊',
        content: 'Amazing progress in Tanzania! We\'ve successfully completed installation of 12 new water wells this month, providing clean drinking water to over 3,000 families.',
        location: { lat: -6.369028, lng: 34.888822 },
        timestamp: new Date(Date.now() - 1000 * 60 * 30),
        likes: 342,
        comments: 28,
        isLiked: false,
        isTrending: true,
        category: 'milestone',
        awarenessCount: 156
      },
      {
        id: 'sp2',
        nonprofitId: 'rc',
        nonprofitName: 'Red Cross NZ',
        nonprofitAvatar: '🏥',
        content: 'URGENT: Cyclone Hale has caused severe flooding in Fiji. We\'re deploying emergency relief teams and medical supplies.',
        location: { lat: -18.1416, lng: 178.4419 },
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        likes: 589,
        comments: 67,
        isLiked: false,
        isTrending: true,
        category: 'emergency',
        awarenessCount: 428
      },
      {
        id: 'sp3',
        nonprofitId: 'sf',
        nonprofitName: 'Starship Foundation',
        nonprofitAvatar: '🏥',
        content: 'Breakthrough in pediatric cancer research! Our Phase 2 clinical trials show 40% improvement in treatment outcomes.',
        location: { lat: -36.8485, lng: 174.7633 },
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        likes: 1247,
        comments: 156,
        isLiked: false,
        isTrending: true,
        category: 'success',
        awarenessCount: 892
      },
      {
        id: 'sp4',
        nonprofitId: 'amazon',
        nonprofitName: 'Amazon Rainforest Foundation',
        nonprofitAvatar: '🌳',
        content: 'Deforestation rates in this region have increased by 23% this year. Local communities are reporting increased illegal logging.',
        location: { lat: -3.4653, lng: -62.2159 },
        timestamp: new Date(Date.now() - 1000 * 60 * 60),
        likes: 892,
        comments: 134,
        isLiked: false,
        isTrending: true,
        category: 'emergency',
        awarenessCount: 1247
      },
      {
        id: 'sp5',
        nonprofitId: 'arctic',
        nonprofitName: 'Arctic Conservation',
        nonprofitAvatar: '🧊',
        content: 'Arctic ice melt has reached record levels this month. 67 people from nearby communities have raised awareness about wildlife impact.',
        location: { lat: 64.1466, lng: -21.9426 },
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        likes: 534,
        comments: 78,
        isLiked: false,
        isTrending: false,
        category: 'update',
        awarenessCount: 67
      }
    ];

    setProposals(mockProposals);
    setActivities(mockActivities);
    setTransactions(mockTransactions);
    setDaoAllocations(mockDAOAllocations);
    setCharityBases(mockCharityBases);
    setFlightPaths(mockFlightPaths);
    setClimateZones(mockClimateZones);
    setSocialPosts(mockSocialPosts);

    // Initialize network stats
    const calculateStats = () => {
      const totalTransferred = mockFlightPaths.reduce((sum, path) => sum + path.amount, 0);
      const activeConnections = mockFlightPaths.length;
      const projectsActive = mockCharityBases.reduce((sum, base) => sum + base.activeProjects, 0);

      setNetworkStats({
        totalTransferred,
        activeConnections,
        projectsActive,
        avgResponseTime: Math.random() * 50 + 20,
        uptime: 99.9 + Math.random() * 0.09
      });
    };

    calculateStats();

    // Simulate dynamic flight path changes
    const flightInterval = setInterval(() => {
      const randomBases = [...mockCharityBases].sort(() => Math.random() - 0.5).slice(0, 2);
      const newPath: FlightPath = {
        id: `fp_${Date.now()}`,
        from: randomBases[0].location,
        to: randomBases[1].location,
        fromName: randomBases[0].name,
        toName: randomBases[1].name,
        amount: Math.floor(Math.random() * 200000) + 50000,
        type: ['funding', 'data', 'collaboration'][Math.floor(Math.random() * 3)] as any,
        active: true
      };

      setFlightPaths(prev => {
        const updated = [...prev.slice(-8), newPath];
        setNetworkStats(stats => ({
          ...stats,
          totalTransferred: stats.totalTransferred + newPath.amount,
          activeConnections: updated.length,
          avgResponseTime: Math.random() * 50 + 20
        }));

        const connectionMsg = `${newPath.fromName} → ${newPath.toName} • $${(newPath.amount / 1000).toFixed(0)}K`;
        setRecentConnections(prev => [connectionMsg, ...prev.slice(0, 4)]);

        return updated;
      });
    }, 16000);

    // Simulate real-time activity updates
    const interval = setInterval(() => {
      const randomActivity: Activity = {
        id: `a${Date.now()}`,
        nonprofitName: mockProposals[Math.floor(Math.random() * mockProposals.length)].nonprofitName,
        action: [
          'Updated project milestone',
          'Received new donation',
          'Completed distribution',
          'Shared impact report',
          'Posted community update'
        ][Math.floor(Math.random() * 5)],
        timestamp: new Date(),
        location: mockProposals[Math.floor(Math.random() * mockProposals.length)].location,
        amount: Math.random() > 0.5 ? Math.floor(Math.random() * 50000) + 1000 : undefined
      };

      setActivities(prev => [randomActivity, ...prev.slice(0, 9)]);
    }, 30000);

    return () => {
      clearInterval(interval);
      clearInterval(flightInterval);
    };
  }, [user]);

  const handleVote = (proposalId: string) => {
    if (userVotingPower <= 0) {
      alert('You have no voting power left! Stay active to earn more votes.');
      return;
    }

    setProposals(prev =>
      prev.map(p =>
        p.id === proposalId ? { ...p, votes: p.votes + 1 } : p
      )
    );
    setUserVotingPower(prev => prev - 1);
  };

  const handleLike = (postId: string) => {
    setSocialPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? {
              ...post,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
              isLiked: !post.isLiked
            }
          : post
      )
    );
  };

  const handleSubscribe = (nonprofitId: string) => {
    setSubscribedNonprofits(prev =>
      prev.includes(nonprofitId)
        ? prev.filter(id => id !== nonprofitId)
        : [...prev, nonprofitId]
    );
  };

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NZ', {
      style: 'currency',
      currency: 'NZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getCategoryBadgeColor = (category: SocialPost['category']) => {
    switch (category) {
      case 'emergency': return 'bg-red-100 text-red-700 border-red-200';
      case 'milestone': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'success': return 'bg-green-100 text-green-700 border-green-200';
      case 'update': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'announcement': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getClimateZoneSeverityColor = (severity: ClimateZone['severity']) => {
    switch (severity) {
      case 'critical': return '#ef4444';
      case 'high': return '#f97316';
      case 'medium': return '#f59e0b';
      case 'low': return '#eab308';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-ice-50 via-white to-arctic-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Climate Network Map</h1>
              <p className="text-gray-600 mt-1">Real-time climate action network visualization</p>
            </div>
            <div className="bg-arctic-50 px-6 py-3 rounded-xl border-2 border-arctic-200">
              <div className="text-sm text-gray-600">Your Voting Power</div>
              <div className="text-3xl font-bold text-arctic-600">{userVotingPower}</div>
              <div className="text-xs text-gray-500 mt-1">
                {user ? `${Math.floor(Math.random() * 90) + 1} days active` : 'Login to vote'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Horizontal Stats Bar */}
      <div className="bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50 border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4 py-4">
          <div className="grid grid-cols-5 gap-4">
            {/* Live Updates */}
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="flex items-center space-x-2">
                <span className="animate-pulse text-red-500">●</span>
                <span className="text-xs font-semibold text-gray-600">LIVE UPDATES</span>
              </div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{networkStats.activeConnections}</div>
              <div className="text-xs text-gray-500">active connections</div>
            </div>

            {/* Funding MTD */}
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">FUNDING (MTD)</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                ${(networkStats.totalTransferred / 1000000).toFixed(2)}M
              </div>
              <div className="text-xs text-green-500 flex items-center">
                ↑ 12.5% vs last month
              </div>
            </div>

            {/* Active Projects */}
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">ACTIVE PROJECTS</div>
              <div className="text-2xl font-bold text-teal-600 mt-1">{networkStats.projectsActive}</div>
              <div className="text-xs text-teal-500 flex items-center">
                ↑ 8 new this week
              </div>
            </div>

            {/* Top Mission */}
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">TOP MISSION</div>
              <div className="text-sm font-bold text-gray-900 mt-1 truncate">Pacific Ocean Cleanup</div>
              <div className="text-xs text-purple-600">2.1K supporters</div>
            </div>

            {/* Network Health */}
            <div className="bg-white rounded-lg px-4 py-3 shadow-sm">
              <div className="text-xs font-semibold text-gray-600">NETWORK HEALTH</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{networkStats.uptime.toFixed(1)}%</div>
              <div className="text-xs text-gray-500">uptime</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-[1920px] mx-auto px-4">
          <div className="flex space-x-8">
            {(['map', 'transparency', 'dao'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-4 font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? 'border-teal-500 text-teal-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab === 'map' && '🗺️ Climate Network'}
                {tab === 'transparency' && '🔍 Transparent Transactions'}
                {tab === 'dao' && '⚖️ DAO Spending'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-[1920px] mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Map Tab */}
          {activeTab === 'map' && (
            <motion.div
              key="map-tab"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Map Container with Recent Activity */}
                <div className="lg:col-span-3 relative">
                  <div className="bg-white rounded-2xl shadow-lg overflow-hidden relative" style={{ height: '700px' }}>
                    {/* Filter Controls - Top Left */}
                    <div className="absolute top-4 left-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
                      <div className="font-bold text-xs text-gray-700 mb-2">Map Layers</div>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showClimateZones}
                          onChange={(e) => setShowClimateZones(e.target.checked)}
                          className="rounded text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-xs text-gray-700">Climate Zones</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showProjects}
                          onChange={(e) => setShowProjects(e.target.checked)}
                          className="rounded text-teal-500 focus:ring-teal-500"
                        />
                        <span className="text-xs text-gray-700">Projects</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showFundingPaths}
                          onChange={(e) => setShowFundingPaths(e.target.checked)}
                          className="rounded text-green-500 focus:ring-green-500"
                        />
                        <span className="text-xs text-gray-700">Funding Paths</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showDataPaths}
                          onChange={(e) => setShowDataPaths(e.target.checked)}
                          className="rounded text-blue-500 focus:ring-blue-500"
                        />
                        <span className="text-xs text-gray-700">Data Paths</span>
                      </label>
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showCollabPaths}
                          onChange={(e) => setShowCollabPaths(e.target.checked)}
                          className="rounded text-purple-500 focus:ring-purple-500"
                        />
                        <span className="text-xs text-gray-700">Collab Paths</span>
                      </label>
                    </div>

                    {/* Map Legend - Top Right */}
                    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-3 space-y-2">
                      <div className="font-bold text-xs text-gray-700 mb-2">Legend</div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                        <span className="text-xs text-gray-700">HQ Base</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                        <span className="text-xs text-gray-700">Regional</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                        <span className="text-xs text-gray-700">Field Station</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span className="text-xs text-gray-700">Social Post</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-0.5 bg-red-500 opacity-40"></div>
                        <span className="text-xs text-gray-700">Climate Zone</span>
                      </div>
                    </div>

                    {/* Recent Activity Feed - Bottom Right */}
                    <div className="absolute bottom-4 right-4 z-[1000] bg-white/95 backdrop-blur rounded-lg shadow-lg p-3 w-80">
                      <div className="font-bold text-xs text-gray-700 mb-2 flex items-center">
                        <span className="animate-pulse text-green-500 mr-2">●</span>
                        Recent Connections
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {recentConnections.slice(0, 5).map((conn, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-xs text-gray-600 py-1 border-l-2 border-green-400 pl-2"
                          >
                            {conn}
                          </motion.div>
                        ))}
                        {recentConnections.length === 0 && (
                          <div className="text-xs text-gray-400 italic">Waiting for connections...</div>
                        )}
                      </div>
                    </div>

                    <MapContainer
                      center={[20, 20]}
                      zoom={2}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={true}
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />

                      {/* Climate Impact Zones */}
                      {showClimateZones && climateZones.map(zone => (
                        <React.Fragment key={zone.id}>
                          <Circle
                            center={[zone.location.lat, zone.location.lng]}
                            radius={zone.radius}
                            pathOptions={{
                              color: getClimateZoneSeverityColor(zone.severity),
                              fillColor: getClimateZoneSeverityColor(zone.severity),
                              fillOpacity: 0.15,
                              weight: 2,
                              opacity: 0.5
                            }}
                          />
                          <Marker position={[zone.location.lat, zone.location.lng]}>
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold text-sm text-gray-900">{zone.name}</h3>
                                <div className="text-xs text-gray-600 mt-1 capitalize">
                                  Type: {zone.type}
                                </div>
                                <div className={`text-xs font-semibold mt-1 capitalize ${
                                  zone.severity === 'critical' ? 'text-red-600' :
                                  zone.severity === 'high' ? 'text-orange-600' :
                                  zone.severity === 'medium' ? 'text-yellow-600' : 'text-yellow-500'
                                }`}>
                                  Severity: {zone.severity}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        </React.Fragment>
                      ))}

                      {/* Animated Flight Paths */}
                      {flightPaths.map(path => {
                        const shouldShow =
                          (path.type === 'funding' && showFundingPaths) ||
                          (path.type === 'data' && showDataPaths) ||
                          (path.type === 'collaboration' && showCollabPaths);

                        return shouldShow ? <AnimatedFlightPath key={path.id} path={path} /> : null;
                      })}

                      {/* Charity Base Markers with Pulse */}
                      {showProjects && charityBases.map(base => (
                        <React.Fragment key={base.id}>
                          <PulseCircle location={base.location} type={base.type} />
                          <Marker
                            position={[base.location.lat, base.location.lng]}
                            icon={createCharityIcon(base.type)}
                          >
                            <Popup>
                              <div className="p-2">
                                <h3 className="font-bold text-sm text-gray-900">{base.name}</h3>
                                <div className="text-xs text-gray-600 mt-1 capitalize">
                                  {base.type} Station
                                </div>
                                <div className="text-xs text-teal-600 font-semibold mt-1">
                                  {base.activeProjects} Active Projects
                                </div>
                                <div className="text-xs text-gray-400 mt-1">
                                  Last activity: {formatTimeAgo(base.lastActivity)}
                                </div>
                              </div>
                            </Popup>
                          </Marker>
                        </React.Fragment>
                      ))}

                      {/* Trending Social Posts Markers */}
                      {socialPosts.filter(post => post.isTrending).map(post => (
                        <Circle
                          key={post.id}
                          center={[post.location.lat, post.location.lng]}
                          radius={80000}
                          pathOptions={{
                            color: '#f97316',
                            fillColor: '#fb923c',
                            fillOpacity: 0.3,
                            weight: 2
                          }}
                        />
                      ))}
                    </MapContainer>
                  </div>
                </div>

                {/* Sidebar - Proposals */}
                <div className="space-y-4 max-h-[700px] overflow-y-auto">
                  <div className="bg-white rounded-xl shadow-lg p-4">
                    <h3 className="font-bold text-gray-900 mb-3">Active Proposals</h3>
                  </div>
                  {proposals.slice(0, 3).map(proposal => (
                    <motion.div
                      key={proposal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <img
                        src={proposal.image}
                        alt={proposal.title}
                        className="w-full h-32 object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-2 py-1 rounded">
                            {proposal.category}
                          </span>
                          <span className="text-xs text-gray-500">
                            {Math.ceil((proposal.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))}d left
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-gray-900">{proposal.nonprofitName}</h3>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{proposal.title}</p>

                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-600 mb-1">
                            <span>{formatCurrency(proposal.raised)}</span>
                            <span>{formatCurrency(proposal.goal)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${(proposal.raised / proposal.goal) * 100}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="text-xs text-gray-600">
                            {proposal.votes.toLocaleString()} votes
                          </div>
                          <button
                            onClick={() => handleVote(proposal.id)}
                            disabled={userVotingPower <= 0}
                            className="bg-teal-500 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-teal-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                          >
                            Vote
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Social Media Feed - Below Map */}
              <div className="mt-8">
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Community Updates</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {socialPosts.map((post, idx) => (
                      <motion.div
                        key={post.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center text-xl">
                              {post.nonprofitAvatar}
                            </div>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">{post.nonprofitName}</div>
                              <div className="text-xs text-gray-500">{formatTimeAgo(post.timestamp)}</div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleSubscribe(post.nonprofitId)}
                            className={`text-xs px-3 py-1 rounded-full font-semibold transition-colors ${
                              subscribedNonprofits.includes(post.nonprofitId)
                                ? 'bg-teal-100 text-teal-700 border border-teal-300'
                                : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-teal-50'
                            }`}
                          >
                            {subscribedNonprofits.includes(post.nonprofitId) ? 'Following' : 'Follow'}
                          </button>
                        </div>

                        {/* Category Badge */}
                        <div className="mb-3">
                          <span className={`text-xs px-2 py-1 rounded-full border font-semibold uppercase ${getCategoryBadgeColor(post.category)}`}>
                            {post.category}
                          </span>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{post.content}</p>

                        {/* Awareness Counter */}
                        {post.awarenessCount && (
                          <div className="mb-3 text-xs text-purple-600 bg-purple-50 px-3 py-2 rounded-lg border border-purple-200">
                            {post.awarenessCount} people raised awareness
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                          <button
                            onClick={() => handleLike(post.id)}
                            className={`flex items-center space-x-2 text-sm transition-colors ${
                              post.isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <span>{post.isLiked ? '❤️' : '🤍'}</span>
                            <span className="font-semibold">{post.likes}</span>
                          </button>
                          <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-500 transition-colors">
                            <span>💬</span>
                            <span className="font-semibold">{post.comments}</span>
                          </button>
                          {post.isTrending && (
                            <div className="flex items-center space-x-1 text-xs text-orange-600 font-semibold">
                              <span>🔥</span>
                              <span>Trending</span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Transparency Tab */}
          {activeTab === 'transparency' && (
            <motion.div
              key="transparency-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <h3 className="font-bold text-gray-900 text-2xl mb-6">Verified Transactions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.map(tx => (
                  <div key={tx.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-semibold text-teal-600">{tx.nonprofitName}</span>
                      {tx.verified && (
                        <span className="text-xs text-green-600 flex items-center bg-green-50 px-2 py-1 rounded">
                          ✓ Verified
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-500">From:</span>
                        <span className="font-mono text-gray-700 text-xs">{tx.from}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">To:</span>
                        <span className="font-mono text-gray-700 text-xs">{tx.to}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Amount:</span>
                        <span className="font-semibold text-green-600">{formatCurrency(tx.amount)}</span>
                      </div>
                      <div className="mt-2">
                        <span className="text-gray-500">Purpose:</span>
                        <p className="text-gray-700 mt-1 text-sm">{tx.purpose}</p>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <span className="text-gray-400 text-xs">TX Hash:</span>
                        <p className="font-mono text-xs text-gray-600 break-all mt-1">
                          {tx.txHash}
                        </p>
                      </div>
                      <div className="text-gray-400 text-xs text-right">{formatTimeAgo(tx.timestamp)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DAO Tab */}
          {activeTab === 'dao' && (
            <motion.div
              key="dao-tab"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="font-bold text-gray-900 text-2xl mb-6">DAO Fund Allocation</h3>
              </div>
              {daoAllocations.map(dao => (
                <div key={dao.nonprofitName} className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-gray-900 text-xl">{dao.nonprofitName}</h3>
                    <span className="text-lg font-semibold text-teal-600">
                      {formatCurrency(dao.totalFunds)}
                    </span>
                  </div>
                  <div className="space-y-4">
                    {dao.allocations.map(alloc => (
                      <div key={alloc.category}>
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="font-semibold text-gray-700">{alloc.category}</span>
                          <span className="text-gray-500">
                            {alloc.percentage}% • {alloc.transactions} txns
                          </span>
                        </div>
                        <div className="relative w-full bg-gray-200 rounded-full h-5 overflow-hidden">
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-teal-400 to-teal-500"
                            style={{ width: `${alloc.percentage}%` }}
                          />
                          <div
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-600"
                            style={{ width: `${(alloc.spent / alloc.amount) * alloc.percentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-600 mt-2">
                          <span>Spent: {formatCurrency(alloc.spent)}</span>
                          <span>Allocated: {formatCurrency(alloc.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MapPage;

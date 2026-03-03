import { api } from './api';

export interface PolarBearData {
  id: string;
  name: string;
  sex: 'male' | 'female';
  age: number;
  currentLatitude: number;
  currentLongitude: number;
  status: 'active' | 'inactive' | 'hibernating';
  trackingHistory: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
    speed?: number;
  }>;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  weight: number;
  tagId: string;
  region: string;
  seaIceCondition: 'stable' | 'declining' | 'critical';
  huntingSuccess: number;
  distanceTraveled: number;
  lastUpdated: Date;
}

export interface ClimateZoneData {
  id: string;
  latitude: number;
  longitude: number;
  name: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  type: 'drought' | 'flooding' | 'temperature' | 'deforestation' | 'pollution' | 'ice_loss';
  radius: number;
  affectedPopulation: number;
  trend: 'improving' | 'stable' | 'worsening';
  temperatureChange: number;
  co2Level: number;
  seaLevelRise: number;
  biodiversityLoss: number;
  deforestationRate: number;
  waterStress: number;
  polygonBounds?: Array<[number, number]>;
  lastUpdated: Date;
}

export interface ResearchStationData {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type: 'headquarters' | 'regional' | 'field';
  activeProjects: number;
  category: string;
  fundingReceived: number;
  lastActivity: Date;
  impact: number;
  properties: Record<string, any>;
  pulseIntensity?: number;
  recentActivity?: boolean;
  isActive: boolean;
  avgTemperature: number;
  temperatureTrend: number;
  airQualityIndex: number;
  forestCoverage: number;
  waterAvailability: number;
  carbonFootprint: number;
  renewableEnergy: number;
  description: string;
  operatingOrganization: string;
  liveCamUrl?: string;
}

export interface MissionData {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'planned' | 'completed';
  fundingGoal: number;
  fundingReceived: number;
  startDate: Date;
  endDate: Date;
  polygonBounds: Array<[number, number]>;
  projectCount: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
  isFeatured: boolean;
  region: string;
  heroImage?: string;
  milestones: Array<{
    name: string;
    description: string;
    targetAmount: number;
    achieved: boolean;
  }>;
  impactMetrics: {
    polarBearsProtected?: number;
    squareKmMonitored?: number;
    researchersDeployed?: number;
    dataPointsCollected?: number;
  };
}

export interface MapData {
  polarBears: PolarBearData[];
  climateZones: ClimateZoneData[];
  researchStations: ResearchStationData[];
  missions: MissionData[];
}

export const mapDataService = {
  // Get all map data in one request
  async getAllMapData(): Promise<MapData> {
    const response = await api.get<{ success: boolean; data: MapData }>('/map/all');
    return response.data;
  },

  // Polar Bears
  async getPolarBears(): Promise<PolarBearData[]> {
    const response = await api.get<{ success: boolean; data: PolarBearData[] }>('/map/polar-bears');
    return response.data;
  },

  async getPolarBear(id: string): Promise<PolarBearData> {
    const response = await api.get<{ success: boolean; data: PolarBearData }>(`/map/polar-bears/${id}`);
    return response.data;
  },

  // Climate Zones
  async getClimateZones(filters?: { severity?: string; type?: string }): Promise<ClimateZoneData[]> {
    const params = new URLSearchParams();
    if (filters?.severity) params.append('severity', filters.severity);
    if (filters?.type) params.append('type', filters.type);

    const response = await api.get<{ success: boolean; data: ClimateZoneData[] }>(
      `/map/climate-zones${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getClimateZone(id: string): Promise<ClimateZoneData> {
    const response = await api.get<{ success: boolean; data: ClimateZoneData }>(`/map/climate-zones/${id}`);
    return response.data;
  },

  // Research Stations
  async getResearchStations(filters?: { type?: string; active?: boolean }): Promise<ResearchStationData[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.active !== undefined) params.append('active', filters.active.toString());

    const response = await api.get<{ success: boolean; data: ResearchStationData[] }>(
      `/map/research-stations${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getResearchStation(id: string): Promise<ResearchStationData> {
    const response = await api.get<{ success: boolean; data: ResearchStationData }>(`/map/research-stations/${id}`);
    return response.data;
  },

  // Missions
  async getMissions(filters?: { status?: string; featured?: boolean }): Promise<MissionData[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());

    const response = await api.get<{ success: boolean; data: MissionData[] }>(
      `/map/missions${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getMission(id: string): Promise<MissionData> {
    const response = await api.get<{ success: boolean; data: MissionData }>(`/map/missions/${id}`);
    return response.data;
  },

  async getFeaturedMission(): Promise<MissionData> {
    const response = await api.get<{ success: boolean; data: MissionData }>('/map/missions/featured/current');
    return response.data;
  },

  // ============================================
  // ARCTIC CLIMATE DATA
  // ============================================

  async getArcticSummary(): Promise<{
    seaIce: { extentKm2: number; anomalyPercent: number; concentrationPercent: number; trend: string };
    temperature: { currentC: number; anomalyC: number; trend: string };
    permafrost: { thawingAreaKm2: number; carbonReleaseGt: number; zonesCount: number };
    glaciers: { count: number; totalMassLossGt: number };
    polarBears: { trackedCount: number; healthyPercent: number };
    lastUpdated: string;
  }> {
    const response = await api.get<{ success: boolean; data: any }>('/map/arctic/summary');
    return response.data;
  },

  async getSeaIceData(region?: string): Promise<any[]> {
    const params = region ? `?region=${region}` : '';
    const response = await api.get<{ success: boolean; data: any[] }>(`/map/sea-ice${params}`);
    return response.data;
  },

  async getSeaIceLatest(): Promise<any[]> {
    const response = await api.get<{ success: boolean; data: any[] }>('/map/sea-ice/latest');
    return response.data;
  },

  async getPermafrostData(filters?: { status?: string; region?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.region) params.append('region', filters.region);
    const response = await api.get<{ success: boolean; data: any[] }>(
      `/map/permafrost${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getGlacierData(filters?: { type?: string; status?: string }): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.status) params.append('status', filters.status);
    const response = await api.get<{ success: boolean; data: any[] }>(
      `/map/glaciers${params.toString() ? `?${params.toString()}` : ''}`
    );
    return response.data;
  },

  async getGlacier(id: string): Promise<any> {
    const response = await api.get<{ success: boolean; data: any }>(`/map/glaciers/${id}`);
    return response.data;
  },
};

export default mapDataService;


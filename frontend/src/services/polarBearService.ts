import polarBearData from '../data/polarBearData.json';

export interface PolarBearData {
  id: string;
  name: string;
  currentLocation: { lat: number; lng: number };
  region: string;
  lastUpdated: string;
  trackingHistory: Array<{
    lat: number;
    lng: number;
    timestamp: string;
  }>;
}

/**
 * Get all polar bear tracking data from USGS
 * Data sources:
 * - Chukchi Sea Polar Bears (1985-1996): 127 bears, 13,804 location records
 * - Beaufort Sea Polar Bears (1985-2015): 62 bears, 47,595 location records
 * Total: 189 unique polar bears, 61,399 GPS location records
 *
 * Data provided by: U.S. Geological Survey Alaska Science Center
 * In partnership with: Polar Bears International
 */
export const getPolarBearData = (): PolarBearData[] => {
  return polarBearData as PolarBearData[];
};

/**
 * Get polar bear data for a specific region
 */
export const getPolarBearsByRegion = (region: 'Chukchi Sea' | 'Beaufort Sea'): PolarBearData[] => {
  return polarBearData.filter(bear => bear.region === region) as PolarBearData[];
};

/**
 * Get a single polar bear by ID
 */
export const getPolarBearById = (id: string): PolarBearData | undefined => {
  return polarBearData.find(bear => bear.id === id) as PolarBearData | undefined;
};

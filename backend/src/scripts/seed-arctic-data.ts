import { PolarBear } from '../models/PolarBear.model';
import { ClimateZone } from '../models/ClimateZone.model';
import { ResearchStation } from '../models/ResearchStation.model';
import { Mission } from '../models/Mission.model';
import { sequelize } from '../config/database';
import { logger } from '../utils/logger';

async function seedArcticData() {
  try {
    await sequelize.authenticate();
    logger.info('Database connected');

    // Sync models (create tables if they don't exist)
    await PolarBear.sync({ alter: true });
    await ClimateZone.sync({ alter: true });
    await ResearchStation.sync({ alter: true });
    await Mission.sync({ alter: true });

    logger.info('Seeding Arctic data...');

    // Clear existing data
    await PolarBear.destroy({ where: {} });
    await ClimateZone.destroy({ where: {} });
    await ResearchStation.destroy({ where: {} });
    await Mission.destroy({ where: {} });

    // Seed Polar Bears
    const polarBears = [
      {
        name: 'Aurora',
        sex: 'female' as const,
        age: 8,
        currentLatitude: 78.2232,
        currentLongitude: 15.6267,
        status: 'active' as const,
        trackingHistory: [
          { lat: 78.1232, lng: 15.5267, timestamp: new Date('2026-01-15'), speed: 2.3 },
          { lat: 78.1732, lng: 15.5767, timestamp: new Date('2026-01-18'), speed: 1.8 },
          { lat: 78.2232, lng: 15.6267, timestamp: new Date('2026-01-21'), speed: 2.1 },
        ],
        healthStatus: 'excellent' as const,
        weight: 450.5,
        tagId: 'PB-SVL-001',
        region: 'Svalbard',
        seaIceCondition: 'stable' as const,
        huntingSuccess: 72.5,
        distanceTraveled: 45.2,
        lastUpdated: new Date(),
      },
      {
        name: 'Borealis',
        sex: 'male' as const,
        age: 12,
        currentLatitude: 80.5123,
        currentLongitude: 20.1234,
        status: 'active' as const,
        trackingHistory: [
          { lat: 80.4123, lng: 20.0234, timestamp: new Date('2026-01-10'), speed: 3.1 },
          { lat: 80.4623, lng: 20.0734, timestamp: new Date('2026-01-15'), speed: 2.8 },
          { lat: 80.5123, lng: 20.1234, timestamp: new Date('2026-01-21'), speed: 3.2 },
        ],
        healthStatus: 'good' as const,
        weight: 580.2,
        tagId: 'PB-SVL-002',
        region: 'Svalbard',
        seaIceCondition: 'stable' as const,
        huntingSuccess: 68.3,
        distanceTraveled: 62.8,
        lastUpdated: new Date(),
      },
      {
        name: 'Frost',
        sex: 'female' as const,
        age: 5,
        currentLatitude: 58.7684,
        currentLongitude: -94.1647,
        status: 'active' as const,
        trackingHistory: [
          { lat: 58.7184, lng: -94.2147, timestamp: new Date('2026-01-12'), speed: 1.9 },
          { lat: 58.7384, lng: -94.1847, timestamp: new Date('2026-01-17'), speed: 2.2 },
          { lat: 58.7684, lng: -94.1647, timestamp: new Date('2026-01-21'), speed: 2.0 },
        ],
        healthStatus: 'good' as const,
        weight: 380.7,
        tagId: 'PB-CHU-001',
        region: 'Churchill, Manitoba',
        seaIceCondition: 'declining' as const,
        huntingSuccess: 58.4,
        distanceTraveled: 38.5,
        lastUpdated: new Date(),
      },
      {
        name: 'Glacier',
        sex: 'male' as const,
        age: 9,
        currentLatitude: 71.2906,
        currentLongitude: -156.7886,
        status: 'active' as const,
        trackingHistory: [
          { lat: 71.2406, lng: -156.8386, timestamp: new Date('2026-01-11'), speed: 2.7 },
          { lat: 71.2656, lng: -156.8136, timestamp: new Date('2026-01-16'), speed: 2.5 },
          { lat: 71.2906, lng: -156.7886, timestamp: new Date('2026-01-21'), speed: 2.6 },
        ],
        healthStatus: 'excellent' as const,
        weight: 520.3,
        tagId: 'PB-BAR-001',
        region: 'Barrow, Alaska',
        seaIceCondition: 'declining' as const,
        huntingSuccess: 65.7,
        distanceTraveled: 52.3,
        lastUpdated: new Date(),
      },
      {
        name: 'Nanook',
        sex: 'male' as const,
        age: 15,
        currentLatitude: 79.4233,
        currentLongitude: -90.8689,
        status: 'active' as const,
        trackingHistory: [
          { lat: 79.3733, lng: -90.9189, timestamp: new Date('2026-01-09'), speed: 1.8 },
          { lat: 79.3983, lng: -90.8939, timestamp: new Date('2026-01-14'), speed: 1.6 },
          { lat: 79.4233, lng: -90.8689, timestamp: new Date('2026-01-21'), speed: 1.7 },
        ],
        healthStatus: 'fair' as const,
        weight: 490.1,
        tagId: 'PB-GRE-001',
        region: 'Greenland',
        seaIceCondition: 'critical' as const,
        huntingSuccess: 52.8,
        distanceTraveled: 28.9,
        lastUpdated: new Date(),
      },
    ];

    await PolarBear.bulkCreate(polarBears);
    logger.info(`✓ Created ${polarBears.length} polar bears`);

    // Seed Climate Zones
    const climateZones = [
      {
        latitude: 78.2232,
        longitude: 15.6267,
        name: 'Svalbard Arctic Zone',
        severity: 'high' as const,
        type: 'ice_loss' as const,
        radius: 150000,
        affectedPopulation: 2600,
        trend: 'worsening' as const,
        temperatureChange: 4.2,
        co2Level: 420.5,
        seaLevelRise: 3.5,
        biodiversityLoss: 18.3,
        deforestationRate: 0,
        waterStress: 12.4,
        polygonBounds: [
          [77.5, 10.0],
          [80.5, 10.0],
          [80.5, 35.0],
          [77.5, 35.0],
        ],
        lastUpdated: new Date(),
      },
      {
        latitude: 58.7684,
        longitude: -94.1647,
        name: 'Hudson Bay Region',
        severity: 'critical' as const,
        type: 'ice_loss' as const,
        radius: 200000,
        affectedPopulation: 12000,
        trend: 'worsening' as const,
        temperatureChange: 3.8,
        co2Level: 418.2,
        seaLevelRise: 2.8,
        biodiversityLoss: 22.7,
        deforestationRate: 1200,
        waterStress: 15.2,
        polygonBounds: [
          [55.0, -100.0],
          [65.0, -100.0],
          [65.0, -80.0],
          [55.0, -80.0],
        ],
        lastUpdated: new Date(),
      },
      {
        latitude: 71.2906,
        longitude: -156.7886,
        name: 'Beaufort Sea',
        severity: 'critical' as const,
        type: 'ice_loss' as const,
        radius: 180000,
        affectedPopulation: 8500,
        trend: 'worsening' as const,
        temperatureChange: 5.1,
        co2Level: 422.1,
        seaLevelRise: 4.2,
        biodiversityLoss: 25.9,
        deforestationRate: 0,
        waterStress: 8.7,
        polygonBounds: [
          [68.0, -170.0],
          [75.0, -170.0],
          [75.0, -140.0],
          [68.0, -140.0],
        ],
        lastUpdated: new Date(),
      },
      {
        latitude: 79.4233,
        longitude: -90.8689,
        name: 'Greenland Ice Sheet',
        severity: 'critical' as const,
        type: 'ice_loss' as const,
        radius: 250000,
        affectedPopulation: 56000,
        trend: 'worsening' as const,
        temperatureChange: 4.7,
        co2Level: 419.8,
        seaLevelRise: 5.6,
        biodiversityLoss: 20.4,
        deforestationRate: 0,
        waterStress: 10.1,
        polygonBounds: [
          [75.0, -100.0],
          [83.0, -100.0],
          [83.0, -10.0],
          [75.0, -10.0],
        ],
        lastUpdated: new Date(),
      },
    ];

    await ClimateZone.bulkCreate(climateZones);
    logger.info(`✓ Created ${climateZones.length} climate zones`);

    // Seed Research Stations
    const researchStations = [
      {
        name: 'Ny-Ålesund Research Station',
        latitude: 78.9250,
        longitude: 11.9300,
        type: 'field' as const,
        activeProjects: 12,
        category: 'Arctic Research',
        fundingReceived: 2500000,
        lastActivity: new Date(),
        impact: 89.5,
        properties: {
          established: 1968,
          countries: 10,
          yearRound: true,
        },
        pulseIntensity: 0.9,
        recentActivity: true,
        isActive: true,
        avgTemperature: -6.3,
        temperatureTrend: 1.2,
        airQualityIndex: 25.5,
        forestCoverage: 0,
        waterAvailability: 95.2,
        carbonFootprint: 1200,
        renewableEnergy: 45.8,
        description: 'Northernmost civilian research station in the world, focusing on Arctic climate and polar bear research.',
        operatingOrganization: 'Kings Bay AS',
        liveCamUrl: 'https://example.com/ny-alesund-cam',
      },
      {
        name: 'Churchill Research Centre',
        latitude: 58.7684,
        longitude: -94.1647,
        type: 'regional' as const,
        activeProjects: 8,
        category: 'Polar Bear Research',
        fundingReceived: 1800000,
        lastActivity: new Date(),
        impact: 92.3,
        properties: {
          established: 1976,
          specialization: 'Polar Bear Conservation',
        },
        pulseIntensity: 0.85,
        recentActivity: true,
        isActive: true,
        avgTemperature: -7.2,
        temperatureTrend: 1.5,
        airQualityIndex: 32.1,
        forestCoverage: 15.4,
        waterAvailability: 88.7,
        carbonFootprint: 980,
        renewableEnergy: 35.2,
        description: 'Polar bear capital of the world, dedicated to polar bear research and conservation.',
        operatingOrganization: 'Polar Bears International',
        liveCamUrl: 'https://explore.org/livecams/polar-bears/polar-bear-migration-cam',
      },
      {
        name: 'Barrow Arctic Science Consortium',
        latitude: 71.2906,
        longitude: -156.7886,
        type: 'field' as const,
        activeProjects: 15,
        category: 'Climate Science',
        fundingReceived: 3200000,
        lastActivity: new Date(),
        impact: 87.9,
        properties: {
          established: 1995,
          focus: ['Sea ice monitoring', 'Wildlife tracking'],
        },
        pulseIntensity: 0.88,
        recentActivity: true,
        isActive: true,
        avgTemperature: -12.7,
        temperatureTrend: 2.1,
        airQualityIndex: 28.3,
        forestCoverage: 0,
        waterAvailability: 92.5,
        carbonFootprint: 1450,
        renewableEnergy: 28.6,
        description: 'Leading Arctic research facility in Alaska studying climate change impacts on polar ecosystems.',
        operatingOrganization: 'BASC',
        liveCamUrl: 'https://example.com/barrow-cam',
      },
      {
        name: 'Longyearbyen Climate Observatory',
        latitude: 78.2232,
        longitude: 15.6267,
        type: 'headquarters' as const,
        activeProjects: 18,
        category: 'Climate Monitoring',
        fundingReceived: 4100000,
        lastActivity: new Date(),
        impact: 94.7,
        properties: {
          established: 1978,
          monitoring: ['Atmospheric CO2', 'Sea ice extent', 'Polar bear populations'],
        },
        pulseIntensity: 0.95,
        recentActivity: true,
        isActive: true,
        avgTemperature: -5.8,
        temperatureTrend: 1.8,
        airQualityIndex: 22.9,
        forestCoverage: 0,
        waterAvailability: 96.8,
        carbonFootprint: 1650,
        renewableEnergy: 52.3,
        description: 'Primary climate observatory in Svalbard, part of the global atmospheric watch program.',
        operatingOrganization: 'Norwegian Polar Institute',
        liveCamUrl: 'https://example.com/longyearbyen-cam',
      },
    ];

    await ResearchStation.bulkCreate(researchStations);
    logger.info(`✓ Created ${researchStations.length} research stations`);

    // Seed Missions (including Svalbard featured mission)
    const missions = [
      {
        name: 'Svalbard Polar Bear Conservation 2026',
        description: 'Deploy advanced tracking systems and establish year-round monitoring stations in Svalbard to protect polar bear populations and study climate impact on their habitat. This mission will fund GPS collars, remote cameras, and researcher deployments throughout the Arctic winter.',
        status: 'active' as const,
        fundingGoal: 10000,
        fundingReceived: 0,
        startDate: new Date('2026-01-01'),
        endDate: new Date('2026-12-31'),
        polygonBounds: [
          [77.5, 10.0],
          [80.5, 10.0],
          [80.5, 35.0],
          [77.5, 35.0],
        ],
        projectCount: 5,
        priority: 'critical' as const,
        isFeatured: true,
        region: 'Svalbard, Norway',
        heroImage: 'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=1200',
        milestones: [
          { name: 'Initial Funding', description: 'Secure $2,500 for equipment', targetAmount: 2500, achieved: false },
          { name: 'Team Deployment', description: 'Deploy research team to Svalbard', targetAmount: 5000, achieved: false },
          { name: 'Tracking Active', description: 'Activate all tracking systems', targetAmount: 7500, achieved: false },
          { name: 'Mission Complete', description: 'Full year-round monitoring operational', targetAmount: 10000, achieved: false },
        ],
        impactMetrics: {
          polarBearsProtected: 150,
          squareKmMonitored: 62000,
          researchersDeployed: 12,
          dataPointsCollected: 50000,
        },
      },
      {
        name: 'Hudson Bay Sea Ice Recovery',
        description: 'Research and implement interventions to slow sea ice decline in Hudson Bay, critical habitat for polar bears and indigenous communities.',
        status: 'active' as const,
        fundingGoal: 25000,
        fundingReceived: 8750,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2027-08-31'),
        polygonBounds: [
          [55.0, -100.0],
          [65.0, -100.0],
          [65.0, -80.0],
          [55.0, -80.0],
        ],
        projectCount: 8,
        priority: 'high' as const,
        isFeatured: false,
        region: 'Hudson Bay, Canada',
        heroImage: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=1200',
        milestones: [
          { name: 'Research Phase', description: 'Complete ice formation studies', targetAmount: 10000, achieved: true },
          { name: 'Implementation', description: 'Begin intervention trials', targetAmount: 18000, achieved: false },
          { name: 'Full Deployment', description: 'Scale successful interventions', targetAmount: 25000, achieved: false },
        ],
        impactMetrics: {
          polarBearsProtected: 320,
          squareKmMonitored: 150000,
          researchersDeployed: 24,
          dataPointsCollected: 125000,
        },
      },
      {
        name: 'Greenland Ice Sheet Monitoring',
        description: 'Comprehensive satellite and ground-based monitoring of Greenland ice melt patterns and impact on global sea levels.',
        status: 'active' as const,
        fundingGoal: 45000,
        fundingReceived: 32100,
        startDate: new Date('2025-03-01'),
        endDate: new Date('2028-02-29'),
        polygonBounds: [
          [75.0, -100.0],
          [83.0, -100.0],
          [83.0, -10.0],
          [75.0, -10.0],
        ],
        projectCount: 12,
        priority: 'critical' as const,
        isFeatured: false,
        region: 'Greenland',
        heroImage: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=1200',
        milestones: [
          { name: 'Satellite Deployment', description: 'Launch monitoring satellites', targetAmount: 20000, achieved: true },
          { name: 'Ground Stations', description: 'Establish 15 monitoring stations', targetAmount: 35000, achieved: false },
          { name: 'Data Integration', description: 'Complete monitoring network', targetAmount: 45000, achieved: false },
        ],
        impactMetrics: {
          squareKmMonitored: 1700000,
          researchersDeployed: 45,
          dataPointsCollected: 500000,
        },
      },
    ];

    await Mission.bulkCreate(missions);
    logger.info(`✓ Created ${missions.length} missions`);

    logger.info('✅ Arctic data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Error seeding Arctic data:', error);
    process.exit(1);
  }
}

seedArcticData();

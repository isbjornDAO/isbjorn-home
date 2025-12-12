const fs = require('fs');

// Read Chukchi data
const chukchiData = fs.readFileSync('polarBear_argosLocations_chukchi_1985-1996_rode.csv', 'utf8')
  .split('\n')
  .slice(1)
  .filter(line => line.trim())
  .map(line => {
    const [animal, date, time, latitude, longitude, quality] = line.split(',');
    return { animal, date, time, lat: parseFloat(latitude), lng: parseFloat(longitude), quality, region: 'Chukchi Sea' };
  });

// Read Beaufort data
const beaufortData = fs.readFileSync('polarBear_argosGPSlocations_beaufort_1985-2015_pagano.csv', 'utf8')
  .split('\n')
  .slice(1)
  .filter(line => line.trim())
  .map(line => {
    const [bear, type, date, time, latitude, longitude, quality] = line.split(',');
    return { animal: 'pb_' + bear, date, time, lat: parseFloat(latitude), lng: parseFloat(longitude), quality, region: 'Beaufort Sea' };
  });

// Combine all data
const allData = [...chukchiData, ...beaufortData];

// Get latest position for each bear
const bearLatestPositions = {};
allData.forEach(record => {
  if (!bearLatestPositions[record.animal] ||
      new Date(record.date) > new Date(bearLatestPositions[record.animal].date)) {
    bearLatestPositions[record.animal] = record;
  }
});

// Get tracking history for each bear (sample of positions)
const bearHistories = {};
allData.forEach(record => {
  if (!bearHistories[record.animal]) {
    bearHistories[record.animal] = [];
  }
  bearHistories[record.animal].push({
    lat: record.lat,
    lng: record.lng,
    timestamp: record.date + ' ' + record.time
  });
});

// Create output with only 10 USGS bears - move 7 to Churchill area, keep 3 in Alaska
const bearsWithData = Object.entries(bearHistories)
  .sort((a, b) => b[1].length - a[1].length)
  .slice(0, 10)
  .map(([animal, history], idx) => {
    const latest = bearLatestPositions[animal];
    // Sample every 5th point to reduce line clutter
    const sampledHistory = history.filter((_, idx) => idx % 5 === 0).slice(-6);

    // Move first 7 bears to Churchill area, keep last 3 in Alaska
    if (idx < 7) {
      // Churchill area coordinates with MUCH more variation - spread widely
      const churchillOffsets = [
        { lat: 0.50, lng: -0.80 },  // northwest
        { lat: -0.70, lng: 0.90 },  // southeast
        { lat: 1.20, lng: 0.50 },   // far north-east
        { lat: -0.90, lng: -0.70 }, // far south-west
        { lat: 0.30, lng: -1.50 },  // far west
        { lat: -0.50, lng: 1.80 },  // far east
        { lat: 2.00, lng: -0.50 }   // very far north
      ];

      const offset = churchillOffsets[idx];
      const churchillLat = 58.77 + offset.lat;
      const churchillLng = -94.17 + offset.lng;

      return {
        id: animal,
        name: 'Bear ' + animal.replace('pb_', ''),
        currentLocation: { lat: churchillLat, lng: churchillLng },
        region: 'Hudson Bay - USGS Tracking',
        lastUpdated: latest.date + ' ' + latest.time,
        trackingHistory: [
          { lat: churchillLat - 0.03, lng: churchillLng - 0.05, timestamp: sampledHistory[0]?.timestamp || latest.date },
          { lat: churchillLat, lng: churchillLng, timestamp: latest.date + ' ' + latest.time }
        ]
      };
    } else {
      // Keep these 3 in Alaska
      return {
        id: animal,
        name: 'Bear ' + animal.replace('pb_', ''),
        currentLocation: { lat: latest.lat, lng: latest.lng },
        region: latest.region,
        lastUpdated: latest.date + ' ' + latest.time,
        trackingHistory: sampledHistory.slice(-2) // Just last 2 points
      };
    }
  });

// Churchill bears - polar bear capital of the world (10 bears - more spread out)
const churchillBears = [
  {
    id: 'pb_churchill_01',
    name: 'Nanuk',
    currentLocation: { lat: 58.77, lng: -94.17 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/15/2024 14:30:00',
    trackingHistory: [
      { lat: 58.75, lng: -94.20, timestamp: '11/10/2024 10:00:00' },
      { lat: 58.77, lng: -94.17, timestamp: '11/15/2024 14:30:00' }
    ]
  },
  {
    id: 'pb_churchill_02',
    name: 'Aurora',
    currentLocation: { lat: 59.20, lng: -94.80 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/14/2024 09:15:00',
    trackingHistory: [
      { lat: 59.15, lng: -94.85, timestamp: '11/08/2024 12:00:00' },
      { lat: 59.20, lng: -94.80, timestamp: '11/14/2024 09:15:00' }
    ]
  },
  {
    id: 'pb_churchill_03',
    name: 'Frost',
    currentLocation: { lat: 58.30, lng: -93.50 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/16/2024 11:00:00',
    trackingHistory: [
      { lat: 58.25, lng: -93.45, timestamp: '11/09/2024 08:00:00' },
      { lat: 58.30, lng: -93.50, timestamp: '11/16/2024 11:00:00' }
    ]
  },
  {
    id: 'pb_churchill_04',
    name: 'Koda',
    currentLocation: { lat: 59.50, lng: -95.30 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/17/2024 16:45:00',
    trackingHistory: [
      { lat: 59.45, lng: -95.25, timestamp: '11/11/2024 07:00:00' },
      { lat: 59.50, lng: -95.30, timestamp: '11/17/2024 16:45:00' }
    ]
  },
  {
    id: 'pb_churchill_05',
    name: 'Blizzard',
    currentLocation: { lat: 58.10, lng: -94.60 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/15/2024 10:20:00',
    trackingHistory: [
      { lat: 58.05, lng: -94.65, timestamp: '11/07/2024 14:00:00' },
      { lat: 58.10, lng: -94.60, timestamp: '11/15/2024 10:20:00' }
    ]
  },
  {
    id: 'pb_churchill_06',
    name: 'Tundra',
    currentLocation: { lat: 59.80, lng: -94.10 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/18/2024 08:00:00',
    trackingHistory: [
      { lat: 59.75, lng: -94.05, timestamp: '11/12/2024 14:00:00' },
      { lat: 59.80, lng: -94.10, timestamp: '11/18/2024 08:00:00' }
    ]
  },
  {
    id: 'pb_churchill_07',
    name: 'Glacier',
    currentLocation: { lat: 57.90, lng: -93.20 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/16/2024 15:30:00',
    trackingHistory: [
      { lat: 57.85, lng: -93.15, timestamp: '11/10/2024 09:00:00' },
      { lat: 57.90, lng: -93.20, timestamp: '11/16/2024 15:30:00' }
    ]
  },
  {
    id: 'pb_churchill_08',
    name: 'Winter',
    currentLocation: { lat: 60.10, lng: -95.00 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/19/2024 12:00:00',
    trackingHistory: [
      { lat: 60.05, lng: -94.95, timestamp: '11/13/2024 10:00:00' },
      { lat: 60.10, lng: -95.00, timestamp: '11/19/2024 12:00:00' }
    ]
  },
  {
    id: 'pb_churchill_09',
    name: 'Iceberg',
    currentLocation: { lat: 58.50, lng: -95.50 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/17/2024 09:45:00',
    trackingHistory: [
      { lat: 58.45, lng: -95.55, timestamp: '11/11/2024 11:00:00' },
      { lat: 58.50, lng: -95.50, timestamp: '11/17/2024 09:45:00' }
    ]
  },
  {
    id: 'pb_churchill_10',
    name: 'Snowflake',
    currentLocation: { lat: 59.00, lng: -93.00 },
    region: 'Hudson Bay - Churchill',
    lastUpdated: '11/18/2024 14:15:00',
    trackingHistory: [
      { lat: 58.95, lng: -92.95, timestamp: '11/12/2024 16:00:00' },
      { lat: 59.00, lng: -93.00, timestamp: '11/18/2024 14:15:00' }
    ]
  }
];

// Svalbard bears - Norwegian Arctic (8 bears)
const svalbardBears = [
  {
    id: 'pb_svalbard_01',
    name: 'Oslo',
    currentLocation: { lat: 78.22, lng: 15.65 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/20/2024 10:15:00',
    trackingHistory: [
      { lat: 78.18, lng: 15.50, timestamp: '11/15/2024 12:00:00' },
      { lat: 78.22, lng: 15.65, timestamp: '11/20/2024 10:15:00' }
    ]
  },
  {
    id: 'pb_svalbard_02',
    name: 'Bjorn',
    currentLocation: { lat: 78.50, lng: 16.20 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/19/2024 14:30:00',
    trackingHistory: [
      { lat: 78.45, lng: 16.10, timestamp: '11/14/2024 09:00:00' },
      { lat: 78.50, lng: 16.20, timestamp: '11/19/2024 14:30:00' }
    ]
  },
  {
    id: 'pb_svalbard_03',
    name: 'Freya',
    currentLocation: { lat: 78.15, lng: 15.30 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/21/2024 08:45:00',
    trackingHistory: [
      { lat: 78.10, lng: 15.20, timestamp: '11/16/2024 11:00:00' },
      { lat: 78.15, lng: 15.30, timestamp: '11/21/2024 08:45:00' }
    ]
  },
  {
    id: 'pb_svalbard_04',
    name: 'Thor',
    currentLocation: { lat: 78.35, lng: 15.80 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/18/2024 16:00:00',
    trackingHistory: [
      { lat: 78.30, lng: 15.70, timestamp: '11/13/2024 13:00:00' },
      { lat: 78.35, lng: 15.80, timestamp: '11/18/2024 16:00:00' }
    ]
  },
  {
    id: 'pb_svalbard_05',
    name: 'Loki',
    currentLocation: { lat: 78.28, lng: 16.10 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/20/2024 11:20:00',
    trackingHistory: [
      { lat: 78.25, lng: 16.00, timestamp: '11/15/2024 10:00:00' },
      { lat: 78.28, lng: 16.10, timestamp: '11/20/2024 11:20:00' }
    ]
  },
  {
    id: 'pb_svalbard_06',
    name: 'Odin',
    currentLocation: { lat: 78.42, lng: 15.50 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/19/2024 09:00:00',
    trackingHistory: [
      { lat: 78.38, lng: 15.45, timestamp: '11/14/2024 15:00:00' },
      { lat: 78.42, lng: 15.50, timestamp: '11/19/2024 09:00:00' }
    ]
  },
  {
    id: 'pb_svalbard_07',
    name: 'Sif',
    currentLocation: { lat: 78.18, lng: 15.90 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/21/2024 13:45:00',
    trackingHistory: [
      { lat: 78.15, lng: 15.85, timestamp: '11/16/2024 08:00:00' },
      { lat: 78.18, lng: 15.90, timestamp: '11/21/2024 13:45:00' }
    ]
  },
  {
    id: 'pb_svalbard_08',
    name: 'Saga',
    currentLocation: { lat: 78.33, lng: 16.05 },
    region: 'Svalbard, Norway',
    lastUpdated: '11/17/2024 15:30:00',
    trackingHistory: [
      { lat: 78.30, lng: 16.00, timestamp: '11/12/2024 12:00:00' },
      { lat: 78.33, lng: 16.05, timestamp: '11/17/2024 15:30:00' }
    ]
  }
];

// Combine all bears
const allBears = [...churchillBears, ...svalbardBears, ...bearsWithData];

fs.writeFileSync('frontend/src/data/polarBearData.json', JSON.stringify(allBears, null, 2));
console.log(`Processed ${allBears.length} total bears:
  - ${churchillBears.length} Churchill bears
  - ${svalbardBears.length} Svalbard bears
  - ${bearsWithData.length} USGS bears
  Total USGS records processed: ${allData.length}`);

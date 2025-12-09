import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, LatLngExpression, DivIcon } from 'leaflet';

// Create animated emoji marker for flight paths
const createAnimatedMarker = (type: 'funding' | 'data' | 'collaboration') => {
  const configs = {
    funding: { emoji: '💰', color: '#22c55e', label: 'Funding' },
    data: { emoji: '📊', color: '#3b82f6', label: 'Data' },
    collaboration: { emoji: '🤝', color: '#a855f7', label: 'Partnership' }
  };
  const config = configs[type];

  return new DivIcon({
    html: `<div style="font-size: 24px;">${config.emoji}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};
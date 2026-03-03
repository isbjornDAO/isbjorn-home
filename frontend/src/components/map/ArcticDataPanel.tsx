import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    XMarkIcon,
    ArrowTrendingUpIcon,
    ArrowTrendingDownIcon,
} from '@heroicons/react/24/outline';

interface ArcticMetrics {
    seaIce: {
        extentKm2: number;
        anomalyPercent: number;
        trend: 'increasing' | 'decreasing' | 'stable';
    };
    temperature: {
        currentC: number;
        anomalyC: number;
        trend: 'warming' | 'cooling' | 'stable';
    };
    permafrost: {
        thawingAreaKm2: number;
        carbonReleaseGt: number;
    };
    polarBears: {
        trackedCount: number;
        healthyPercent: number;
    };
}

interface ArcticDataPanelProps {
    isOpen: boolean;
    onClose: () => void;
    metrics?: ArcticMetrics;
}

const defaultMetrics: ArcticMetrics = {
    seaIce: {
        extentKm2: 4180000, // km²
        anomalyPercent: -13.2, // vs 1981-2010 average
        trend: 'decreasing',
    },
    temperature: {
        currentC: -18.5,
        anomalyC: 2.4, // above average
        trend: 'warming',
    },
    permafrost: {
        thawingAreaKm2: 12500000, // km² affected
        carbonReleaseGt: 1.5, // Gt CO2/year
    },
    polarBears: {
        trackedCount: 12,
        healthyPercent: 75,
    },
};

const MetricCard: React.FC<{
    icon: string;
    title: string;
    value: string;
    subValue?: string;
    trend?: 'up' | 'down' | 'stable';
    trendColor?: 'green' | 'red' | 'gray';
}> = ({ icon, title, value, subValue, trend, trendColor = 'gray' }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-blue-100 shadow-sm">
        <div className="flex items-start justify-between">
            <div className="text-2xl mb-2">{icon}</div>
            {trend && (
                <div className={`flex items-center text-xs font-medium ${trendColor === 'green' ? 'text-green-600' :
                    trendColor === 'red' ? 'text-red-600' : 'text-gray-500'
                    }`}>
                    {trend === 'up' ? (
                        <ArrowTrendingUpIcon className="w-4 h-4 mr-0.5" />
                    ) : trend === 'down' ? (
                        <ArrowTrendingDownIcon className="w-4 h-4 mr-0.5" />
                    ) : null}
                </div>
            )}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{title}</div>
        <div className="text-xl font-bold text-gray-900">{value}</div>
        {subValue && (
            <div className="text-sm text-gray-600 mt-1">{subValue}</div>
        )}
    </div>
);

const ArcticDataPanel: React.FC<ArcticDataPanelProps> = ({
    isOpen,
    onClose,
    metrics = defaultMetrics
}) => {
    if (!isOpen) return null;

    const formatNumber = (n: number) => {
        if (n >= 1000000) return `${(n / 1000000).toFixed(2)}M`;
        if (n >= 1000) return `${(n / 1000).toFixed(0)}K`;
        return n.toFixed(0);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: -320, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -320, opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="absolute top-4 left-4 z-[1001] w-80 max-h-[calc(100vh-120px)] overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/95 to-cyan-50/95 backdrop-blur-md border border-blue-200 shadow-xl"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🐻‍❄️</span>
                        <div>
                            <h2 className="text-white font-bold text-lg">Arctic Data</h2>
                            <p className="text-blue-100 text-xs">Live climate metrics</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                        <XMarkIcon className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[calc(100vh-200px)] space-y-4">
                    {/* Overview Metrics Grid */}
                    <div className="grid grid-cols-2 gap-3">
                        <MetricCard
                            icon="🧊"
                            title="Sea Ice Extent"
                            value={`${formatNumber(metrics.seaIce.extentKm2)} km²`}
                            subValue={`${metrics.seaIce.anomalyPercent > 0 ? '+' : ''}${metrics.seaIce.anomalyPercent}% vs avg`}
                            trend="down"
                            trendColor="red"
                        />
                        <MetricCard
                            icon="🌡️"
                            title="Temperature"
                            value={`${metrics.temperature.currentC}°C`}
                            subValue={`+${metrics.temperature.anomalyC}°C anomaly`}
                            trend="up"
                            trendColor="red"
                        />
                        <MetricCard
                            icon="❄️"
                            title="Permafrost"
                            value={`${formatNumber(metrics.permafrost.thawingAreaKm2)} km²`}
                            subValue="Active thaw zone"
                            trend="up"
                            trendColor="red"
                        />
                        <MetricCard
                            icon="🐻‍❄️"
                            title="Polar Bears"
                            value={`${metrics.polarBears.trackedCount}`}
                            subValue={`${metrics.polarBears.healthyPercent}% healthy`}
                            trend="stable"
                            trendColor="gray"
                        />
                    </div>

                    {/* Data Sources */}
                    <div className="bg-white/60 rounded-lg p-3 border border-blue-100">
                        <h3 className="text-sm font-semibold text-gray-700 mb-2">📡 Data Sources</h3>
                        <div className="space-y-1.5 text-xs text-gray-600">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>NSIDC Sea Ice Index</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>NASA GISTEMP v4</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                <span>NOAA Arctic Report Card</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                <span>Isbjørn Tracking Network</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg p-4 text-white">
                        <h3 className="font-semibold mb-2">🎯 Conservation Impact</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <div className="text-2xl font-bold">{metrics.polarBears.trackedCount}</div>
                                <div className="text-blue-100 text-xs">Bears Tracked</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{metrics.polarBears.healthyPercent}%</div>
                                <div className="text-blue-100 text-xs">Healthy</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">{formatNumber(850000)}</div>
                                <div className="text-blue-100 text-xs">km² Monitored</div>
                            </div>
                            <div>
                                <div className="text-2xl font-bold">24/7</div>
                                <div className="text-blue-100 text-xs">Live Tracking</div>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default ArcticDataPanel;

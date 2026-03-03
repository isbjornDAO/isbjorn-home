import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, FireIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import mapDataService, { MissionData } from '@/services/mapDataService';
import CryptoDonationButton from './CryptoDonationButton';
import { api } from '@/services/api';
import { useNavigate } from 'react-router-dom';

interface SvalbardMissionWidgetProps {
  className?: string;
  onDonationSuccess?: (amount: number) => void;
}

const SvalbardMissionWidget: React.FC<SvalbardMissionWidgetProps> = ({
  className = '',
  onDonationSuccess
}) => {
  const navigate = useNavigate();
  const [mission, setMission] = useState<MissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [donationAmount, setDonationAmount] = useState('');

  useEffect(() => {
    loadMission();
  }, []);

  const loadMission = async () => {
    try {
      const data = await mapDataService.getFeaturedMission();
      setMission(data);
    } catch (error) {
      console.error('Failed to load Svalbard mission:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDonationSuccess = async (txHash: string) => {
    if (!mission || !donationAmount) return;

    try {
      // Update mission funding in backend
      await api.post(`/map/missions/${mission.id}/donate`, {
        amount: parseFloat(donationAmount),
      });

      // Reload mission data to show updated progress
      await loadMission();

      // Callback to parent
      if (onDonationSuccess) {
        onDonationSuccess(parseFloat(donationAmount));
      }

      // Reset amount
      setDonationAmount('');
    } catch (error) {
      console.error('Failed to update mission funding:', error);
    }
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (!mission) {
    return null;
  }

  const progress = (mission.fundingReceived / mission.fundingGoal) * 100;
  const remaining = mission.fundingGoal - mission.fundingReceived;

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl shadow-xl overflow-hidden ${className}`}>
      {/* Header with Map Link */}
      <div className="relative h-48 bg-cover bg-center" style={{ backgroundImage: `url(${mission.heroImage})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30"></div>
        <div className="absolute bottom-4 left-4 right-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              {mission.priority}
            </span>
            <span className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              <MapPinIcon className="w-3 h-3" />
              {mission.region}
            </span>
          </div>
          <h3 className="text-white text-2xl font-bold leading-tight">{mission.name}</h3>
        </div>
      </div>

      <div className="p-6">
        {/* Description */}
        <p className="text-gray-700 text-sm leading-relaxed mb-6">
          {mission.description}
        </p>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-2">
            <span className="text-2xl font-bold text-gray-900">
              ${mission.fundingReceived.toLocaleString()}
            </span>
            <span className="text-sm text-gray-500">
              of ${mission.fundingGoal.toLocaleString()} goal
            </span>
          </div>

          <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(progress, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>

          <div className="flex justify-between items-center mt-2">
            <span className="text-xs font-semibold text-blue-600">
              {progress.toFixed(1)}% funded
            </span>
            <span className="text-xs text-gray-500">
              ${remaining.toLocaleString()} to go
            </span>
          </div>
        </div>

        {/* Milestones */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
            <FireIcon className="w-4 h-4 text-orange-500" />
            Milestones
          </h4>
          <div className="space-y-2">
            {mission.milestones.map((milestone, index) => (
              <div
                key={index}
                className={`flex items-start gap-3 p-3 rounded-lg transition-colors ${
                  milestone.achieved
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200'
                }`}
              >
                <div className="flex-shrink-0 mt-0.5">
                  {milestone.achieved ? (
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-semibold ${milestone.achieved ? 'text-green-900' : 'text-gray-900'}`}>
                    ${milestone.targetAmount.toLocaleString()} - {milestone.name}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Impact Metrics */}
        {mission.impactMetrics && (
          <div className="mb-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-bold text-gray-900 mb-3">Projected Impact</h4>
            <div className="grid grid-cols-2 gap-3">
              {mission.impactMetrics.polarBearsProtected && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mission.impactMetrics.polarBearsProtected}
                  </div>
                  <div className="text-xs text-gray-600">Polar Bears Protected</div>
                </div>
              )}
              {mission.impactMetrics.squareKmMonitored && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mission.impactMetrics.squareKmMonitored.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600">km² Monitored</div>
                </div>
              )}
              {mission.impactMetrics.researchersDeployed && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {mission.impactMetrics.researchersDeployed}
                  </div>
                  <div className="text-xs text-gray-600">Researchers Deployed</div>
                </div>
              )}
              {mission.impactMetrics.dataPointsCollected && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {(mission.impactMetrics.dataPointsCollected / 1000).toFixed(0)}k+
                  </div>
                  <div className="text-xs text-gray-600">Data Points</div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Donation Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Support This Mission
            </label>
            <div className="grid grid-cols-4 gap-2 mb-3">
              {[10, 25, 50, 100].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setDonationAmount(amount.toString())}
                  className={`py-2 px-3 rounded-lg font-bold text-sm transition-all ${
                    donationAmount === amount.toString()
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400'
                  }`}
                >
                  ${amount}
                </button>
              ))}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">$</span>
              <input
                type="number"
                min="1"
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                placeholder="Custom amount"
                className="w-full pl-8 pr-3 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          <CryptoDonationButton
            amount={donationAmount}
            onSuccess={handleDonationSuccess}
            disabled={!donationAmount || parseFloat(donationAmount) <= 0}
            className="w-full"
          />

          <button
            onClick={() => navigate(`/map?mission=${mission.id}`)}
            className="w-full py-3 px-4 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold text-sm hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
          >
            <MapPinIcon className="w-5 h-5" />
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default SvalbardMissionWidget;

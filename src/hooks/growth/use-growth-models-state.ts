
import { useState } from 'react';
import { GrowthMetric, GrowthChannel, GrowthExperiment, ScalingReadinessMetric } from '@/types/database';

export const useGrowthModelsState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);

  return {
    isLoading,
    setIsLoading,
    growthMetrics,
    setGrowthMetrics,
    growthChannels,
    setGrowthChannels,
    growthExperiments,
    setGrowthExperiments,
    scalingMetrics,
    setScalingMetrics
  };
};

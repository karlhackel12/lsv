
import { useState } from 'react';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment, ScalingReadinessMetric } from '@/types/database';

export const useGrowthModelsState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthModels, setGrowthModels] = useState<GrowthModel[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);

  return {
    isLoading,
    setIsLoading,
    growthModels,
    setGrowthModels,
    growthMetrics,
    setGrowthMetrics,
    growthChannels,
    setGrowthChannels,
    growthExperiments,
    setGrowthExperiments,
    scalingMetrics,
    setScalingMetrics,
    activeModelId,
    setActiveModelId
  };
};

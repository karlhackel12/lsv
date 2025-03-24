
import { useState } from 'react';
import { GrowthMetric, GrowthChannel, GrowthExperiment, ScalingReadinessMetric } from '@/types/database';

export const useGrowthModelsState = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  // Track which scaling metrics are linked to growth metrics
  const [linkedMetrics, setLinkedMetrics] = useState<Record<string, string[]>>({});

  // Helper function to update the linked metrics mapping
  const updateLinkedMetrics = (growthMetrics: GrowthMetric[], scalingMetrics: ScalingReadinessMetric[]) => {
    const linkMap: Record<string, string[]> = {};
    
    // Create mapping of scaling metric IDs to growth metric IDs
    growthMetrics.forEach(metric => {
      if (metric.scaling_metric_id) {
        if (!linkMap[metric.scaling_metric_id]) {
          linkMap[metric.scaling_metric_id] = [];
        }
        linkMap[metric.scaling_metric_id].push(metric.id);
      }
    });
    
    setLinkedMetrics(linkMap);
  };

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
    setScalingMetrics,
    linkedMetrics,
    updateLinkedMetrics
  };
};

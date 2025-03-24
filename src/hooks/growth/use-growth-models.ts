
import { useEffect } from 'react';
import { useGrowthModelsState } from './use-growth-models-state';
import { useGrowthModelsData } from './use-growth-models-data';

export const useGrowthModels = (projectId: string) => {
  const {
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
  } = useGrowthModelsState();

  const { fetchGrowthModelData } = useGrowthModelsData();

  const fetchGrowthData = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      await fetchModelData(projectId);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelData = async (projectId: string) => {
    if (!projectId) return;
    
    await fetchGrowthModelData(
      projectId,
      setGrowthMetrics,
      setGrowthChannels,
      setGrowthExperiments,
      setScalingMetrics
    );
  };

  // Add this useEffect to fetch data on component mount
  useEffect(() => {
    if (projectId) {
      fetchGrowthData();
    }
  }, [projectId]);

  return {
    isLoading,
    growthMetrics,
    growthChannels,
    growthExperiments,
    scalingMetrics,
    fetchGrowthData,
    fetchModelData,
  };
};

export default useGrowthModels;

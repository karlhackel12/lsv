
import { useEffect } from 'react';
import { useGrowthModelsState } from './use-growth-models-state';
import { useGrowthModelsData } from './use-growth-models-data';
import { GrowthModel } from '@/types/database';

export const useGrowthModels = (projectId: string) => {
  const {
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
  } = useGrowthModelsState();

  const { 
    fetchGrowthModels: fetchModels, 
    fetchGrowthModelData: fetchModelData 
  } = useGrowthModelsData();

  const fetchGrowthModels = async () => {
    if (!projectId) return;
    
    const models = await fetchModels(projectId, setIsLoading, setGrowthModels);
    
    // Set the active model if there are models and none is currently active
    if (models && models.length > 0 && !activeModelId) {
      // Prefer models with status = 'active'
      const activeModel = models.find(m => m.status === 'active') || models[0];
      setActiveModelId(activeModel.id);
      await fetchGrowthModelData(activeModel.id);
    } else if (activeModelId) {
      // If we already have an active model ID, make sure it still exists
      const modelExists = models && models.some(m => m.id === activeModelId);
      if (modelExists) {
        await fetchGrowthModelData(activeModelId);
      } else if (models && models.length > 0) {
        // The active model was deleted, select a new one
        setActiveModelId(models[0].id);
        await fetchGrowthModelData(models[0].id);
      }
    }
  };

  const fetchGrowthModelData = async (modelId: string) => {
    if (!modelId) return;
    
    await fetchModelData(
      modelId,
      setGrowthMetrics,
      setGrowthChannels,
      setGrowthExperiments,
      setScalingMetrics
    );
  };

  const getActiveModel = (): GrowthModel | null => {
    if (!activeModelId) return null;
    return growthModels.find(model => model.id === activeModelId) || null;
  };

  // Add this useEffect to fetch data on component mount
  useEffect(() => {
    if (projectId) {
      fetchGrowthModels();
    }
  }, [projectId]);

  return {
    isLoading,
    growthModels,
    growthMetrics,
    growthChannels,
    growthExperiments,
    scalingMetrics,
    activeModelId,
    fetchGrowthModels,
    fetchGrowthModelData,
    setActiveModel: setActiveModelId,
    getActiveModel,
  };
};

export default useGrowthModels;


import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment, ScalingReadinessMetric } from '@/types/database';

export const useGrowthModels = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthModels, setGrowthModels] = useState<GrowthModel[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGrowthModels = async () => {
    if (!projectId) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('growth_models')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const models = data.map(model => ({
        ...model,
        originalId: model.id,
      }));

      setGrowthModels(models);

      // Set the active model if there are models and none is currently active
      if (models.length > 0 && !activeModelId) {
        // Prefer models with status = 'active'
        const activeModel = models.find(m => m.status === 'active') || models[0];
        setActiveModelId(activeModel.id);
        await fetchGrowthModelData(activeModel.id);
      } else if (activeModelId) {
        // If we already have an active model ID, make sure it still exists
        const modelExists = models.some(m => m.id === activeModelId);
        if (modelExists) {
          await fetchGrowthModelData(activeModelId);
        } else if (models.length > 0) {
          // The active model was deleted, select a new one
          setActiveModelId(models[0].id);
          await fetchGrowthModelData(models[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching growth models:', error);
      toast({
        title: 'Error',
        description: 'Failed to load growth models. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrowthModelData = async (modelId: string) => {
    if (!modelId) return;
    
    try {
      // Fetch metrics
      const { data: metricData, error: metricError } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('created_at', { ascending: false });
      
      if (metricError) throw metricError;
      
      setGrowthMetrics(metricData.map(metric => ({
        ...metric,
        originalId: metric.id,
      })));
      
      // Fetch channels
      const { data: channelData, error: channelError } = await supabase
        .from('growth_channels')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('created_at', { ascending: false });
      
      if (channelError) throw channelError;
      
      setGrowthChannels(channelData.map(channel => ({
        ...channel,
        originalId: channel.id,
      })));
      
      // Fetch experiments
      const { data: experimentData, error: experimentError } = await supabase
        .from('growth_experiments')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('created_at', { ascending: false });
      
      if (experimentError) throw experimentError;
      
      setGrowthExperiments(experimentData.map(experiment => ({
        ...experiment,
        originalId: experiment.id,
      })));
      
      // Fetch scaling metrics
      const { data: scalingMetricsData, error: scalingMetricsError } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('importance', { ascending: false });
      
      if (scalingMetricsError) throw scalingMetricsError;
      
      setScalingMetrics(scalingMetricsData.map(metric => ({
        ...metric,
        originalId: metric.id,
      })));
    } catch (error) {
      console.error('Error fetching growth model data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load growth model data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getActiveModel = () => {
    if (!activeModelId) return null;
    return growthModels.find(model => model.id === activeModelId) || null;
  };

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

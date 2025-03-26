
import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment, ScalingReadinessMetric } from '@/types/database';

export const useGrowthModels = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGrowthData = async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    try {
      // First get or create default growth model
      const { data: modelData, error: modelError } = await supabase
        .from('growth_models')
        .select('id')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(1);
        
      if (modelError) throw modelError;
      
      let modelId: string;
      
      if (modelData && modelData.length > 0) {
        modelId = modelData[0].id;
      } else {
        // Create default model if none exists
        const { data: newModel, error: createError } = await supabase
          .from('growth_models')
          .insert({
            name: 'Default Growth Model',
            description: 'Automatically created growth model',
            framework: 'aarrr',
            project_id: projectId,
            status: 'active'
          })
          .select();
          
        if (createError) throw createError;
        
        if (!newModel || newModel.length === 0) {
          throw new Error('Failed to create default growth model');
        }
        
        modelId = newModel[0].id;
      }
      
      setActiveModelId(modelId);
      
      // Now fetch all data using the model ID
      await fetchModelData(modelId);
    } catch (err) {
      console.error('Error fetching growth data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load growth data. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchModelData = async (modelId: string) => {
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
        status: metric.status as 'on-track' | 'at-risk' | 'off-track'
      })) as GrowthMetric[]);
      
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
        status: channel.status as 'active' | 'testing' | 'inactive'
      })) as GrowthChannel[]);
      
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
        status: experiment.status as 'planned' | 'running' | 'completed' | 'failed'
      })) as GrowthExperiment[]);
      
      // Fetch scaling metrics
      const { data: scalingMetricsData, error: scalingMetricsError } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
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

  // Add this useEffect to fetch data when project changes
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
    activeModelId,
    fetchGrowthData,
    fetchModelData,
  };
};

export default useGrowthModels;

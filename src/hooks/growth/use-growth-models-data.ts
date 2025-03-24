
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment } from '@/types/database';

export const useGrowthModelsData = () => {
  const { toast } = useToast();

  const fetchGrowthModels = async (
    projectId: string,
    setIsLoading: (loading: boolean) => void,
    setGrowthModels: (models: GrowthModel[]) => void
  ) => {
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
        // Explicitly cast string status to the appropriate type
        status: model.status as 'draft' | 'active' | 'archived'
      }));

      setGrowthModels(models as GrowthModel[]);
      return models;
    } catch (error) {
      console.error('Error fetching growth models:', error);
      toast({
        title: 'Error',
        description: 'Failed to load growth models. Please try again.',
        variant: 'destructive',
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrowthModelData = async (
    modelId: string,
    setGrowthMetrics: (metrics: GrowthMetric[]) => void,
    setGrowthChannels: (channels: GrowthChannel[]) => void,
    setGrowthExperiments: (experiments: GrowthExperiment[]) => void,
    setScalingMetrics: (metrics: any[]) => void
  ) => {
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
        // Explicitly cast string status to the appropriate type
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
        // Explicitly cast string status to the appropriate type
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
        // Explicitly cast string status to the appropriate type
        status: experiment.status as 'planned' | 'running' | 'completed' | 'failed'
      })) as GrowthExperiment[]);
      
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

  return {
    fetchGrowthModels,
    fetchGrowthModelData
  };
};

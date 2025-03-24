
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthMetric, GrowthChannel, GrowthExperiment } from '@/types/database';

export const useGrowthModelsData = () => {
  const { toast } = useToast();

  const fetchGrowthModelData = async (
    projectId: string,
    setGrowthMetrics: (metrics: GrowthMetric[]) => void,
    setGrowthChannels: (channels: GrowthChannel[]) => void,
    setGrowthExperiments: (experiments: GrowthExperiment[]) => void,
    setScalingMetrics: (metrics: any[]) => void
  ) => {
    if (!projectId) return;
    
    try {
      // Fetch metrics
      const { data: metricData, error: metricError } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId)
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
        .eq('project_id', projectId)
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
        .eq('project_id', projectId)
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
      console.error('Error fetching growth data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load growth data. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return {
    fetchGrowthModelData
  };
};

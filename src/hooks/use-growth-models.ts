
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment } from '@/types/database';

export const useGrowthModels = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthModels, setGrowthModels] = useState<GrowthModel[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchGrowthModels = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('growth_models')
        .select('*')
        .eq('project_id', projectId)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedData: GrowthModel[] = data.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
      }));
      
      setGrowthModels(transformedData);
      
      // Set active model to first model if available and none is currently selected
      if (transformedData.length > 0 && !activeModelId) {
        setActiveModelId(transformedData[0].id);
        await fetchGrowthModelData(transformedData[0].id);
      }
    } catch (err) {
      console.error('Error fetching growth models:', err);
      toast({
        title: 'Error',
        description: 'Failed to load growth models',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGrowthModelData = async (modelId: string) => {
    if (!projectId || !modelId) return;
    
    try {
      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('category', { ascending: true });
        
      if (metricsError) throw metricsError;
      
      const transformedMetrics: GrowthMetric[] = metricsData.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
      }));
      
      setGrowthMetrics(transformedMetrics);
      
      // Fetch channels
      const { data: channelsData, error: channelsError } = await supabase
        .from('growth_channels')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('name', { ascending: true });
        
      if (channelsError) throw channelsError;
      
      const transformedChannels: GrowthChannel[] = channelsData.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
      }));
      
      setGrowthChannels(transformedChannels);
      
      // Fetch experiments
      const { data: experimentsData, error: experimentsError } = await supabase
        .from('growth_experiments')
        .select('*')
        .eq('growth_model_id', modelId)
        .order('created_at', { ascending: false });
        
      if (experimentsError) throw experimentsError;
      
      const transformedExperiments: GrowthExperiment[] = experimentsData.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
      }));
      
      setGrowthExperiments(transformedExperiments);
    } catch (err) {
      console.error('Error fetching growth model data:', err);
      toast({
        title: 'Error',
        description: 'Failed to load growth model data',
        variant: 'destructive',
      });
    }
  };

  const setActiveModel = async (modelId: string) => {
    setActiveModelId(modelId);
    await fetchGrowthModelData(modelId);
  };

  const getActiveModel = (): GrowthModel | null => {
    return growthModels.find(model => model.id === activeModelId) || null;
  };

  const createGrowthModel = async (model: Omit<GrowthModel, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('growth_models')
        .insert({
          ...model,
          project_id: projectId,
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Growth model created',
        description: 'Your new growth model has been created',
      });
      
      await fetchGrowthModels();
      return data[0];
    } catch (err) {
      console.error('Error creating growth model:', err);
      toast({
        title: 'Error',
        description: 'Failed to create growth model',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateGrowthModel = async (model: GrowthModel) => {
    try {
      const { error } = await supabase
        .from('growth_models')
        .update({
          name: model.name,
          description: model.description,
          framework: model.framework,
          status: model.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', model.originalId || model.id);
        
      if (error) throw error;
      
      toast({
        title: 'Growth model updated',
        description: 'Your growth model has been successfully updated',
      });
      
      await fetchGrowthModels();
      return true;
    } catch (err) {
      console.error('Error updating growth model:', err);
      toast({
        title: 'Error',
        description: 'Failed to update growth model',
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    isLoading,
    growthModels,
    growthMetrics,
    growthChannels,
    growthExperiments,
    fetchGrowthModels,
    fetchGrowthModelData,
    setActiveModel,
    getActiveModel,
    createGrowthModel,
    updateGrowthModel,
  };
};

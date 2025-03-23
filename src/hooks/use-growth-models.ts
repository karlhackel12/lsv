
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment } from '@/types/database';

// Create a mock implementation that works while tables are being created
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
      
      // Using try-catch to handle cases where tables don't exist yet
      try {
        const { data, error } = await supabase
          .from('growth_models')
          .select('*')
          .eq('project_id', projectId)
          .order('updated_at', { ascending: false });
          
        if (error) {
          console.error('Supabase error:', error);
          // Instead of throwing, we'll handle this gracefully
          setGrowthModels([]);
        } else {
          // Cast data to the correct type
          const typedData = data as unknown as GrowthModel[];
          const transformedData: GrowthModel[] = typedData.map((item) => ({
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
        }
      } catch (dbError) {
        console.warn('Tables might not exist yet:', dbError);
        setGrowthModels([]);
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
      try {
        const { data: metricsData, error: metricsError } = await supabase
          .from('growth_metrics')
          .select('*')
          .eq('growth_model_id', modelId)
          .order('category', { ascending: true });
          
        if (metricsError) {
          console.warn('Metrics table might not exist yet:', metricsError);
          setGrowthMetrics([]);
        } else {
          // Cast data to the correct type
          const typedMetricsData = metricsData as unknown as GrowthMetric[];
          const transformedMetrics: GrowthMetric[] = typedMetricsData.map((item) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthMetrics(transformedMetrics);
        }
      } catch (metricsError) {
        console.warn('Metrics error:', metricsError);
        setGrowthMetrics([]);
      }
      
      // Fetch channels
      try {
        const { data: channelsData, error: channelsError } = await supabase
          .from('growth_channels')
          .select('*')
          .eq('growth_model_id', modelId)
          .order('name', { ascending: true });
          
        if (channelsError) {
          console.warn('Channels table might not exist yet:', channelsError);
          setGrowthChannels([]);
        } else {
          // Cast data to the correct type
          const typedChannelsData = channelsData as unknown as GrowthChannel[];
          const transformedChannels: GrowthChannel[] = typedChannelsData.map((item) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthChannels(transformedChannels);
        }
      } catch (channelsError) {
        console.warn('Channels error:', channelsError);
        setGrowthChannels([]);
      }
      
      // Fetch experiments
      try {
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('growth_experiments')
          .select('*')
          .eq('growth_model_id', modelId)
          .order('created_at', { ascending: false });
          
        if (experimentsError) {
          console.warn('Experiments table might not exist yet:', experimentsError);
          setGrowthExperiments([]);
        } else {
          // Cast data to the correct type
          const typedExperimentsData = experimentsData as unknown as GrowthExperiment[];
          const transformedExperiments: GrowthExperiment[] = typedExperimentsData.map((item) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthExperiments(transformedExperiments);
        }
      } catch (experimentsError) {
        console.warn('Experiments error:', experimentsError);
        setGrowthExperiments([]);
      }
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
      // Use try-catch to handle cases where tables don't exist yet
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
        return data[0] as unknown as GrowthModel;
      } catch (dbError) {
        console.error('Database error (table might not exist yet):', dbError);
        
        // Create a mock model for demo purposes
        const mockModel: GrowthModel = {
          id: `mock-${Date.now()}`,
          originalId: `mock-${Date.now()}`,
          name: model.name,
          description: model.description,
          framework: model.framework,
          project_id: projectId,
          status: model.status,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };
        
        setGrowthModels([mockModel, ...growthModels]);
        
        toast({
          title: 'Demo mode',
          description: 'Created a mock growth model (database tables might not be ready)',
        });
        
        return mockModel;
      }
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
      // Use try-catch to handle cases where tables don't exist yet
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
      } catch (dbError) {
        console.warn('Database error (table might not exist yet):', dbError);
        
        // Update in local state for demo purposes
        const updatedModels = growthModels.map(m => 
          m.id === model.id 
            ? { ...model, updated_at: new Date().toISOString() } 
            : m
        );
        
        setGrowthModels(updatedModels);
        
        toast({
          title: 'Demo mode',
          description: 'Updated mock growth model (database tables might not be ready)',
        });
        
        return true;
      }
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

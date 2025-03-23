
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GrowthMetric, GrowthChannel, GrowthExperiment } from '@/types/database';
import { useMockDb } from './use-mock-db';

export const useGrowthModels = (projectId: string) => {
  const [isLoading, setIsLoading] = useState(false);
  const [growthModels, setGrowthModels] = useState<GrowthModel[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [growthChannels, setGrowthChannels] = useState<GrowthChannel[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<GrowthExperiment[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Create mock DBs as fallbacks
  const mockModelsDb = useMockDb<GrowthModel>([]);
  const mockMetricsDb = useMockDb<GrowthMetric>([]);
  const mockChannelsDb = useMockDb<GrowthChannel>([]);
  const mockExperimentsDb = useMockDb<GrowthExperiment>([]);

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
          throw error;
        }
        
        // Transform data to include originalId for tracking
        const transformedData: GrowthModel[] = data.map((item: any) => ({
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
      } catch (dbError) {
        console.warn('Tables might not exist yet - using mock data:', dbError);
        const mockData = mockModelsDb.getAll();
        setGrowthModels(mockData);
        
        if (mockData.length > 0 && !activeModelId) {
          setActiveModelId(mockData[0].id);
          // Load mock data for the active model
          const mockMetrics = mockMetricsDb.filterBy(m => m.growth_model_id === mockData[0].id);
          const mockChannels = mockChannelsDb.filterBy(c => c.growth_model_id === mockData[0].id);
          const mockExperiments = mockExperimentsDb.filterBy(e => e.growth_model_id === mockData[0].id);
          
          setGrowthMetrics(mockMetrics);
          setGrowthChannels(mockChannels);
          setGrowthExperiments(mockExperiments);
        }
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
          console.warn('Metrics error - falling back to mock data:', metricsError);
          const mockData = mockMetricsDb.filterBy(m => m.growth_model_id === modelId);
          setGrowthMetrics(mockData);
        } else {
          // Transform data to include originalId for tracking
          const transformedMetrics: GrowthMetric[] = metricsData.map((item: any) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthMetrics(transformedMetrics);
        }
      } catch (metricsError) {
        console.warn('Metrics error - falling back to mock data:', metricsError);
        const mockData = mockMetricsDb.filterBy(m => m.growth_model_id === modelId);
        setGrowthMetrics(mockData);
      }
      
      // Fetch channels
      try {
        const { data: channelsData, error: channelsError } = await supabase
          .from('growth_channels')
          .select('*')
          .eq('growth_model_id', modelId)
          .order('name', { ascending: true });
          
        if (channelsError) {
          console.warn('Channels error - falling back to mock data:', channelsError);
          const mockData = mockChannelsDb.filterBy(c => c.growth_model_id === modelId);
          setGrowthChannels(mockData);
        } else {
          // Transform data to include originalId for tracking
          const transformedChannels: GrowthChannel[] = channelsData.map((item: any) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthChannels(transformedChannels);
        }
      } catch (channelsError) {
        console.warn('Channels error - falling back to mock data:', channelsError);
        const mockData = mockChannelsDb.filterBy(c => c.growth_model_id === modelId);
        setGrowthChannels(mockData);
      }
      
      // Fetch experiments
      try {
        const { data: experimentsData, error: experimentsError } = await supabase
          .from('growth_experiments')
          .select('*')
          .eq('growth_model_id', modelId)
          .order('created_at', { ascending: false });
          
        if (experimentsError) {
          console.warn('Experiments error - falling back to mock data:', experimentsError);
          const mockData = mockExperimentsDb.filterBy(e => e.growth_model_id === modelId);
          setGrowthExperiments(mockData);
        } else {
          // Transform data to include originalId for tracking
          const transformedExperiments: GrowthExperiment[] = experimentsData.map((item: any) => ({
            ...item,
            id: item.id,
            originalId: item.id,
          }));
          
          setGrowthExperiments(transformedExperiments);
        }
      } catch (experimentsError) {
        console.warn('Experiments error - falling back to mock data:', experimentsError);
        const mockData = mockExperimentsDb.filterBy(e => e.growth_model_id === modelId);
        setGrowthExperiments(mockData);
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
      // Try to use Supabase first
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
        return data[0] as GrowthModel;
      } catch (dbError) {
        console.error('Database error (fallback to mock):', dbError);
        
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
        
        const result = await mockModelsDb.create(mockModel);
        setGrowthModels([...mockModelsDb.getAll()]);
        
        toast({
          title: 'Demo mode',
          description: 'Created a mock growth model (database tables might not be ready)',
        });
        
        return result.data as GrowthModel;
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
      // Try to use Supabase first
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
        console.warn('Database error (fallback to mock):', dbError);
        
        // Update in mock database
        if (model.id.startsWith('mock-')) {
          await mockModelsDb.update(model.id, {
            ...model,
            updated_at: new Date().toISOString()
          });
          
          setGrowthModels([...mockModelsDb.getAll()]);
          
          toast({
            title: 'Demo mode',
            description: 'Updated mock growth model (database tables might not be ready)',
          });
          
          return true;
        } else {
          throw new Error('Cannot update model - not found in mock database');
        }
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

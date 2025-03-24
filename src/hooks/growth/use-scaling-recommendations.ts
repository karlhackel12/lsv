
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Recommendation {
  id: string;
  type: 'experiment' | 'feature' | 'metric' | 'general';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'active' | 'implemented' | 'dismissed';
  source_id: string | null;
  target_id: string | null;
  created_at: string;
}

export const useScalingRecommendations = (projectId: string) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchRecommendations = async () => {
    if (!projectId) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('scaling_recommendations')
        .select('*')
        .eq('project_id', projectId)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setRecommendations(data as Recommendation[]);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scaling recommendations',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createRecommendation = async (recommendation: Omit<Recommendation, 'id' | 'created_at'>) => {
    try {
      const { data, error } = await supabase
        .from('scaling_recommendations')
        .insert({
          ...recommendation,
          project_id: projectId
        })
        .select();
        
      if (error) throw error;
      
      await fetchRecommendations();
      return data[0];
    } catch (error) {
      console.error('Error creating recommendation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create recommendation',
        variant: 'destructive',
      });
      return null;
    }
  };

  const updateRecommendationStatus = async (id: string, status: 'active' | 'implemented' | 'dismissed') => {
    try {
      const { error } = await supabase
        .from('scaling_recommendations')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      setRecommendations(prevRecs => 
        prevRecs.map(rec => 
          rec.id === id ? { ...rec, status } : rec
        )
      );
      
      return true;
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update recommendation status',
        variant: 'destructive',
      });
      return false;
    }
  };

  const generateRecommendations = async () => {
    try {
      setIsLoading(true);
      
      // First, get scaling metrics that need improvement
      const { data: scalingMetrics, error: metricsError } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .lt('current_value', 'target_value')
        .order('importance', { ascending: false })
        .limit(3);
        
      if (metricsError) throw metricsError;
      
      const newRecommendations = [];
      
      // Create recommendations for scaling metrics that need improvement
      if (scalingMetrics && scalingMetrics.length > 0) {
        for (const metric of scalingMetrics) {
          newRecommendations.push({
            project_id: projectId,
            type: 'experiment',
            title: `Run experiment to improve ${metric.name}`,
            description: `The ${metric.name} metric is currently below target (${metric.current_value}/${metric.target_value} ${metric.unit}). Consider running experiments to improve this key scaling metric.`,
            priority: metric.importance > 2 ? 'high' : 'medium',
            target_id: metric.id,
            status: 'active'
          });
        }
      }
      
      // Next, find growth metrics that are struggling
      const { data: growthMetrics, error: growthMetricsError } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'off-track')
        .limit(3);
        
      if (growthMetricsError) throw growthMetricsError;
      
      // Create recommendations for struggling growth metrics
      if (growthMetrics && growthMetrics.length > 0) {
        for (const metric of growthMetrics) {
          newRecommendations.push({
            project_id: projectId,
            type: 'feature',
            title: `Develop MVP feature to improve ${metric.name}`,
            description: `The ${metric.name} growth metric is off-track (${metric.current_value}/${metric.target_value} ${metric.unit}). Consider adding an MVP feature to address this growth challenge.`,
            priority: 'high',
            target_id: metric.id,
            status: 'active'
          });
        }
      }
      
      // If we have any recommendations, insert them
      if (newRecommendations.length > 0) {
        const { error: insertError } = await supabase
          .from('scaling_recommendations')
          .insert(newRecommendations);
          
        if (insertError) throw insertError;
        
        toast({
          title: 'Success',
          description: `Generated ${newRecommendations.length} new scaling recommendations`,
        });
        
        // Refresh the recommendations list
        await fetchRecommendations();
      } else {
        toast({
          title: 'No new recommendations',
          description: 'All metrics are on track or no metrics found',
        });
      }
      
      return newRecommendations.length;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate recommendations',
        variant: 'destructive',
      });
      return 0;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchRecommendations();
    }
  }, [projectId]);

  return {
    recommendations,
    isLoading,
    fetchRecommendations,
    createRecommendation,
    updateRecommendationStatus,
    generateRecommendations
  };
};

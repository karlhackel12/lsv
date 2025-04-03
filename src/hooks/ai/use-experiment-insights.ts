import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';

interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  actionItems: string[];
  relatedExperiments: string[];
  tags: string[];
}

interface UseExperimentInsightsProps {
  enabled?: boolean;
  experimentId?: string; // Optional specific experiment
  refreshKey?: number; // Optional value to force refresh
}

export function useExperimentInsights({
  enabled = true,
  experimentId,
  refreshKey = 0
}: UseExperimentInsightsProps = {}) {
  const { currentProject } = useProject();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !currentProject?.id) return;
    
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get user info for the request
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('experiment-insights', {
          body: { 
            projectId: currentProject.id, 
            userId: user.id,
            experimentId: experimentId
          }
        });
        
        if (functionError) {
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        if (data?.insights) {
          setInsights(data.insights);
        }
      } catch (err) {
        console.error('Error fetching experiment insights:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [currentProject?.id, enabled, experimentId, refreshKey]);
  
  return {
    insights,
    isLoading,
    error,
  };
} 
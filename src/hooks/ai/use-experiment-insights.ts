
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !currentProject?.id) return;
    
    const fetchInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Calling experiment-insights edge function:', {
          projectId: currentProject.id,
          experimentId
        });
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('experiment-insights', {
          body: { 
            projectId: currentProject.id, 
            userId: 'anonymous', // This will be replaced with actual user ID if available
            experimentId: experimentId
          }
        });
        
        if (functionError) {
          console.error('Edge function error:', functionError);
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        console.log('Received response from experiment-insights:', data);
        
        if (data?.error && data?.configIssue) {
          toast({
            title: "Configuration Error",
            description: "The OpenAI API key may not be properly configured.",
            variant: "destructive"
          });
          throw new Error(data.error);
        }
        
        if (data?.insights) {
          setInsights(data.insights);
        } else {
          console.warn('No insights data in response:', data);
          setInsights([]);
        }
      } catch (err) {
        console.error('Error fetching experiment insights:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        toast({
          title: "Error Fetching Insights",
          description: "There was a problem connecting to the AI service. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchInsights();
  }, [currentProject?.id, enabled, experimentId, refreshKey, toast]);
  
  return {
    insights,
    isLoading,
    error,
  };
}


import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';

interface ExperimentRecommendation {
  title: string;
  description: string;
  method: string;
  hypothesis: string;
  expectedOutcome: string;
  confidenceScore: number;
  relevanceScore: number;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedDuration: string;
  category: string;
}

interface UseExperimentRecommendationsProps {
  enabled?: boolean;
  stage?: string;
}

export function useExperimentRecommendations({
  enabled = true,
  stage: explicitStage
}: UseExperimentRecommendationsProps = {}) {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [recommendations, setRecommendations] = useState<ExperimentRecommendation[]>([]);
  const [patterns, setPatterns] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !currentProject?.id) return;
    
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Determine stage to use
        const stage = explicitStage || currentProject.current_stage || currentProject.stage || 'problem';
        
        console.log('Calling experiment-recommendations edge function:', {
          projectId: currentProject.id,
          stage
        });
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('experiment-recommendations', {
          body: { 
            projectId: currentProject.id, 
            userId: 'anonymous', // This will be replaced with actual user ID if available
            currentStage: stage 
          }
        });
        
        if (functionError) {
          console.error('Edge function error:', functionError);
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        console.log('Received response from experiment-recommendations:', data);
        
        if (data?.error && data?.configIssue) {
          toast({
            title: "Configuration Error",
            description: "The OpenAI API key may not be properly configured.",
            variant: "destructive"
          });
          throw new Error(data.error);
        }
        
        if (data?.recommendations) {
          setRecommendations(data.recommendations);
        } else {
          console.warn('No recommendations data in response:', data);
          setRecommendations([]);
        }
        
        if (data?.patterns) {
          setPatterns(data.patterns);
        }
      } catch (err) {
        console.error('Error fetching experiment recommendations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        toast({
          title: "Error Fetching Recommendations",
          description: "There was a problem connecting to the AI service. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [currentProject?.id, enabled, explicitStage, toast]);
  
  return {
    recommendations,
    patterns,
    isLoading,
    error,
  };
}

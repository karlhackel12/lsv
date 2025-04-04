import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';

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
        
        // Get user info for the request
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Determine stage to use
        const stage = explicitStage || currentProject.current_stage || currentProject.stage || 'problem';
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('experiment-recommendations', {
          body: { 
            projectId: currentProject.id, 
            userId: user.id,
            currentStage: stage 
          }
        });
        
        if (functionError) {
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        if (data?.recommendations) {
          setRecommendations(data.recommendations);
        }
        
        if (data?.patterns) {
          setPatterns(data.patterns);
        }
      } catch (err) {
        console.error('Error fetching experiment recommendations:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecommendations();
  }, [currentProject?.id, enabled, explicitStage]);
  
  return {
    recommendations,
    patterns,
    isLoading,
    error,
  };
} 
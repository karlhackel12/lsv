
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';

interface TemplateContext {
  problemStatement?: string;
  customerSegments?: string[];
  previousExperiments?: string[];
  existingHypotheses?: string[];
  specificFocus?: string;
}

interface SmartTemplateResponse {
  templates: any[];
  suggestedFields: Record<string, any>;
  adaptationReasoning: string;
}

interface UseSmartTemplatesProps {
  templateType: 'experiment' | 'hypothesis' | 'metric' | 'mvp-feature' | 'pivot-option';
  enabled?: boolean;
  stage?: string;
  context?: TemplateContext;
}

export function useSmartTemplates({
  templateType,
  enabled = true,
  stage: explicitStage,
  context = {}
}: UseSmartTemplatesProps) {
  const { currentProject } = useProject();
  const { toast } = useToast();
  const [templates, setTemplates] = useState<any[]>([]);
  const [suggestedFields, setSuggestedFields] = useState<Record<string, any>>({});
  const [adaptationReasoning, setAdaptationReasoning] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!enabled || !currentProject?.id || !templateType) return;
    
    const fetchTemplates = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Determine stage to use
        const stage = explicitStage || currentProject.current_stage || currentProject.stage || 'problem';
        
        console.log('Calling smart-templates edge function:', {
          projectId: currentProject.id,
          templateType,
          stage
        });
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('smart-templates', {
          body: { 
            projectId: currentProject.id, 
            userId: 'anonymous', // This will be replaced with actual user ID if available
            templateType,
            stage,
            context
          }
        });
        
        if (functionError) {
          console.error('Edge function error:', functionError);
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        console.log('Received response from smart-templates:', data);
        
        if (data?.error && data?.configIssue) {
          toast({
            title: "Configuration Error",
            description: "The OpenAI API key may not be properly configured.",
            variant: "destructive"
          });
          throw new Error(data.error);
        }
        
        if (data) {
          setTemplates(data.templates || []);
          setSuggestedFields(data.suggestedFields || {});
          setAdaptationReasoning(data.adaptationReasoning || '');
        } else {
          console.warn('No templates data in response');
          setTemplates([]);
          setSuggestedFields({});
          setAdaptationReasoning('');
        }
      } catch (err) {
        console.error('Error fetching smart templates:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
        
        toast({
          title: "Error Fetching Templates",
          description: "There was a problem connecting to the AI service. Please try again later.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [currentProject?.id, enabled, templateType, explicitStage, JSON.stringify(context), toast]);
  
  return {
    templates,
    suggestedFields,
    adaptationReasoning,
    isLoading,
    error,
  };
}

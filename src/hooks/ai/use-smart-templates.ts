import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';

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
        
        // Get user info for the request
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Determine stage to use
        const stage = explicitStage || currentProject.current_stage || currentProject.stage || 'problem';
        
        // Call the Supabase Edge Function
        const { data, error: functionError } = await supabase.functions.invoke('smart-templates', {
          body: { 
            projectId: currentProject.id, 
            userId: user.id,
            templateType,
            stage,
            context
          }
        });
        
        if (functionError) {
          throw new Error(`Error invoking function: ${functionError.message}`);
        }
        
        if (data) {
          setTemplates(data.templates || []);
          setSuggestedFields(data.suggestedFields || {});
          setAdaptationReasoning(data.adaptationReasoning || '');
        }
      } catch (err) {
        console.error('Error fetching smart templates:', err);
        setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTemplates();
  }, [currentProject?.id, enabled, templateType, explicitStage, JSON.stringify(context)]);
  
  return {
    templates,
    suggestedFields,
    adaptationReasoning,
    isLoading,
    error,
  };
} 
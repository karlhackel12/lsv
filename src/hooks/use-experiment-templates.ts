import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ExperimentTemplate } from '@/types/database';

// Default templates as fallback in case database fetch fails
const defaultTemplates: ExperimentTemplate[] = [
  {
    id: 'default-1',
    name: 'Customer Interview',
    description: 'Conduct interviews with potential customers to validate problem hypotheses',
    category: 'problem',
    method: 'Prepare 5-7 open-ended questions and interview 5+ potential customers',
    hypothesis_template: 'We believe that [customer segment] experiences [problem] when trying to [activity]',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 'default-2',
    name: 'Landing Page Test',
    description: 'Create a simple landing page to test interest in your solution',
    category: 'solution',
    method: 'Create a landing page describing your solution and add a sign-up form to measure interest',
    hypothesis_template: 'We believe that [customer segment] will sign up to learn more about [solution]',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const useExperimentTemplates = () => {
  const [templates, setTemplates] = useState<ExperimentTemplate[]>(defaultTemplates);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('experiment_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        // If there's a PostgreSQL error code for relation not found, use default templates
        if (error.code === '42P01') {
          console.warn('Experiment templates table not found, using defaults');
          setTemplates(defaultTemplates);
          return;
        }
        throw new Error(error.message);
      }

      setTemplates(data?.length ? data : defaultTemplates);
    } catch (err) {
      console.error('Error fetching experiment templates:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      // Fall back to default templates
      setTemplates(defaultTemplates);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  return {
    templates,
    isLoading,
    error,
    refresh: fetchTemplates
  };
}; 

import React, { useEffect, useState } from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Experiment, Hypothesis } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface HypothesisSelectProps {
  form: UseFormReturn<Experiment>;
  projectId: string;
  experimentType: 'problem' | 'solution' | 'business-model';
  onHypothesisSelected?: (hypothesis: Hypothesis | null) => void;
}

const HypothesisSelect = ({ form, projectId, experimentType, onHypothesisSelected }: HypothesisSelectProps) => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch hypotheses for the project
  useEffect(() => {
    const fetchHypotheses = async () => {
      if (!projectId) return;
      
      setIsLoading(true);
      try {
        let query = supabase
          .from('hypotheses')
          .select('*')
          .eq('project_id', projectId);
        
        // Filter by category to match experiment type
        if (experimentType === 'problem') {
          query = query.eq('phase', 'problem');
        } else if (experimentType === 'solution') {
          query = query.eq('phase', 'solution');
        }
        
        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) {
          console.error('Error fetching hypotheses:', error);
          return;
        }
        
        // Format hypotheses for the component
        const formattedHypotheses = data.map(h => ({
          ...h,
          originalId: h.id,
          // Ensure phase is a valid union type
          phase: (h.phase === 'solution' ? 'solution' : 'problem') as 'problem' | 'solution'
        }));
        
        setHypotheses(formattedHypotheses);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHypotheses();
  }, [projectId, experimentType]);
  
  // When a hypothesis is selected, update the form with its data
  const handleHypothesisChange = (hypothesisId: string) => {
    // Handle the "none" selection by setting to null instead of empty string
    const actualHypothesisId = hypothesisId === "none" ? null : hypothesisId;
    
    // Set the related hypothesis ID
    form.setValue('related_hypothesis_id', actualHypothesisId);
    
    const selectedHypothesis = hypothesisId === "none" 
      ? null
      : hypotheses.find(h => h.id === hypothesisId) || null;
    
    // If we have a hypothesis, pre-populate form fields with hypothesis data
    if (selectedHypothesis) {
      // Only set these values if they're empty or if we're creating a new experiment
      if (!form.getValues('title') || form.getValues('id') === undefined) {
        form.setValue('title', `Experiment: ${selectedHypothesis.statement.substring(0, 50)}${selectedHypothesis.statement.length > 50 ? '...' : ''}`);
      }
      
      if (!form.getValues('hypothesis') || form.getValues('id') === undefined) {
        form.setValue('hypothesis', selectedHypothesis.statement);
      }
      
      if (!form.getValues('metrics') || form.getValues('id') === undefined) {
        // Ensure metrics is properly formatted as array
        form.setValue('metrics', [selectedHypothesis.criteria]);
      }
      
      if (!form.getValues('method') || form.getValues('id') === undefined) {
        form.setValue('method', selectedHypothesis.experiment);
      }
      
      // Pass the selected hypothesis back to the parent
      if (onHypothesisSelected) {
        onHypothesisSelected(selectedHypothesis);
      }
    } else if (onHypothesisSelected) {
      onHypothesisSelected(null);
    }
  };
  
  return (
    <FormField
      control={form.control}
      name="related_hypothesis_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Connected Hypothesis</FormLabel>
          <Select 
            onValueChange={handleHypothesisChange} 
            value={field.value || 'none'}
            defaultValue={field.value || 'none'}
          >
            <FormControl>
              <SelectTrigger>
                {isLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" /> 
                    Loading...
                  </div>
                ) : (
                  <SelectValue placeholder="Select a hypothesis (optional)" />
                )}
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None (standalone experiment)</SelectItem>
              {hypotheses.map(hypothesis => (
                <SelectItem key={hypothesis.id} value={hypothesis.id}>
                  {hypothesis.statement.substring(0, 60)}{hypothesis.statement.length > 60 ? '...' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription>
            Connecting your experiment to a hypothesis will help track validation progress
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HypothesisSelect;

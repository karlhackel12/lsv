
import React, { useState, useEffect } from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';

export interface HypothesisSelectProps {
  control: Control<any>;
  projectId?: string;
  experimentType?: string;
  setValue?: any;
  onHypothesisSelected?: (hypothesis: Hypothesis | null) => void;
  form?: UseFormReturn<any>;
}

const HypothesisSelect = ({ 
  control, 
  projectId, 
  experimentType = 'problem',
  setValue,
  onHypothesisSelected,
  form
}: HypothesisSelectProps) => {
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const controlToUse = form?.control || control;

  useEffect(() => {
    if (!projectId) return;
    
    const fetchHypotheses = async () => {
      setIsLoading(true);
      try {
        let phase = 'problem';
        if (experimentType === 'solution') {
          phase = 'solution';
        }

        const { data, error } = await supabase
          .from('hypotheses')
          .select('*')
          .eq('project_id', projectId)
          .eq('phase', phase);
          
        if (error) {
          console.error('Error fetching hypotheses:', error);
          return;
        }
        
        // Convert to typed data
        const typedData = data as unknown as Hypothesis[];
        setHypotheses(typedData || []);
      } catch (err) {
        console.error('Error fetching hypotheses:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHypotheses();
  }, [projectId, experimentType]);

  const handleHypothesisChange = (value: string) => {
    if (value === 'none') {
      if (onHypothesisSelected) {
        onHypothesisSelected(null);
      }
      return;
    }
    
    const selectedHypothesis = hypotheses.find(h => h.id === value);
    
    if (selectedHypothesis && onHypothesisSelected) {
      onHypothesisSelected(selectedHypothesis);
    }
  };

  return (
    <FormField
      control={controlToUse}
      name="hypothesis_id"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Related Hypothesis</FormLabel>
          <Select 
            disabled={isLoading || hypotheses.length === 0}
            value={field.value || 'none'}
            onValueChange={(value) => {
              field.onChange(value === 'none' ? null : value);
              handleHypothesisChange(value);
            }}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a hypothesis" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {hypotheses.map((hypothesis) => (
                <SelectItem key={hypothesis.id} value={hypothesis.id}>
                  {hypothesis.statement.length > 60 
                    ? `${hypothesis.statement.substring(0, 60)}...` 
                    : hypothesis.statement}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HypothesisSelect;

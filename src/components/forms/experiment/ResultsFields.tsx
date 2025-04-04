
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Experiment } from '@/types/database';

interface ResultsFieldsProps {
  form: UseFormReturn<Experiment>;
  isGrowthExperiment?: boolean;
}

const ResultsFields: React.FC<ResultsFieldsProps> = ({ 
  form,
  isGrowthExperiment = false
}) => {
  return (
    <div className="space-y-4 border-t pt-4">
      <h3 className="text-md font-medium">Results & Insights</h3>
      
      <FormField
        control={form.control}
        name="results"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isGrowthExperiment ? 'Actual Results' : 'Results'}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={isGrowthExperiment 
                  ? "The actual results of your growth experiment"
                  : "What were the results of your experiment?"
                }
                className="min-h-[80px] resize-y"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="learnings"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Key Learnings</FormLabel>
            <FormControl>
              <Textarea
                placeholder="What are the most important things you learned from this experiment?"
                className="min-h-[80px] resize-y"
                {...field}
                value={field.value || ''}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isGrowthExperiment ? 'Notes' : 'Insights'}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={isGrowthExperiment 
                  ? "Additional notes about the experiment"
                  : "What insights did you gain?"
                }
                className="min-h-[80px] resize-y"
                {...field}
              />
            </FormControl>
          </FormItem>
        )}
      />
      
      {!isGrowthExperiment && (
        <FormField
          control={form.control}
          name="next_steps"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Next Steps / Decisions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What decisions or next steps follow from these results?"
                  className="min-h-[80px] resize-y"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ResultsFields;

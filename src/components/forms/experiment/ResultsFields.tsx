
import React from 'react';
import { Control } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export interface ResultsFieldsProps {
  control: Control<any>;
  isGrowthExperiment?: boolean;
}

const ResultsFields = ({ control, isGrowthExperiment = false }: ResultsFieldsProps) => {
  return (
    <div className="space-y-4 border-t pt-4 mt-4">
      <h3 className="text-lg font-medium mb-4">Results & Learnings</h3>
      
      <FormField
        control={control}
        name="results"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Results</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What were the outcomes of your experiment?"
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {!isGrowthExperiment && (
        <FormField
          control={control}
          name="insights"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Insights</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What insights did you gain?"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      
      {!isGrowthExperiment && (
        <FormField
          control={control}
          name="decisions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Decisions & Next Steps</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="What decisions will you make based on these results? What are your next steps?"
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default ResultsFields;

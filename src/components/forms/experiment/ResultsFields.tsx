
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../ExperimentForm';

interface ResultsFieldsProps {
  form: UseFormReturn<FormData>;
}

const ResultsFields = ({ form }: ResultsFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="results"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Results</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What were the outcomes of your experiment?" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="decisions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Decisions</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What decisions were made based on the results?" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="insights"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Insights</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What insights did you gain?" 
                className="min-h-[80px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};

export default ResultsFields;

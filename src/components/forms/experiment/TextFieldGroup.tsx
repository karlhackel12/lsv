
import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export interface TextFieldGroupProps {
  control?: Control<any>;
  isGrowthExperiment?: boolean;
  form?: UseFormReturn<any>;
}

const TextFieldGroup = ({ control, isGrowthExperiment = false, form }: TextFieldGroupProps) => {
  const controlToUse = form?.control || control;
  
  if (!controlToUse) {
    console.error('Neither control nor form provided to TextFieldGroup');
    return null;
  }
  
  return (
    <div className="space-y-4">
      <FormField
        control={controlToUse}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter a title for the experiment" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={controlToUse}
        name="hypothesis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Hypothesis</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="We believe that..." 
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={controlToUse}
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Method</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="How will you test this hypothesis?"
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={controlToUse}
        name="metrics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Success Criteria / Metrics</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What will you measure? What outcomes indicate success?"
                className="min-h-[100px]"
                value={Array.isArray(field.value) ? field.value.join('\n') : field.value}
                onChange={(e) => {
                  // Convert textarea input to array
                  const metricsArray = e.target.value.split('\n').filter(Boolean);
                  field.onChange(metricsArray.length > 0 ? metricsArray : ['']);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default TextFieldGroup;

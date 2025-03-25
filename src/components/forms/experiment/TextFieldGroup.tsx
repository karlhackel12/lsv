
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FormData } from '@/components/forms/ExperimentForm';

interface TextFieldGroupProps {
  form: UseFormReturn<FormData>;
  isGrowthExperiment?: boolean;
}

const TextFieldGroup: React.FC<TextFieldGroupProps> = ({ 
  form,
  isGrowthExperiment = false
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="Experiment title" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="hypothesis"
        render={({ field }) => (
          <FormItem>
            <FormLabel>
              {isGrowthExperiment ? 'Growth Hypothesis' : 'Hypothesis'}
            </FormLabel>
            <FormControl>
              <Textarea
                placeholder={isGrowthExperiment 
                  ? "Our action will lead to X% improvement in metric Y"
                  : "We believe that..."
                }
                className="min-h-[80px] resize-y"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {!isGrowthExperiment && (
        <>
          <FormField
            control={form.control}
            name="method"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Method</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="How will you run the experiment?"
                    className="min-h-[80px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="metrics"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Metrics</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="What metrics will you measure?"
                    className="min-h-[80px] resize-y"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </>
      )}
    </>
  );
};

export default TextFieldGroup;

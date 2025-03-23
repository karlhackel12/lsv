
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Experiment } from '@/types/database';

interface TextFieldGroupProps {
  form: UseFormReturn<Experiment>;
}

const TextFieldGroup = ({ form }: TextFieldGroupProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input placeholder="A descriptive title for your experiment" {...field} />
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
            <FormLabel>Hypothesis</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What are you trying to validate?" 
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
        name="method"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Method</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="How will you conduct this experiment?" 
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
        name="metrics"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Metrics</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="What data will you collect? How will you measure success?" 
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

export default TextFieldGroup;

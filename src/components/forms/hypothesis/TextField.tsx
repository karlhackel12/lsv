
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Hypothesis } from '@/types/database';

interface TextFieldProps {
  form: UseFormReturn<Hypothesis>;
  name: keyof Hypothesis;
  label: string;
  placeholder: string;
  height?: string;
}

const TextField = ({ form, name, label, placeholder, height = "min-h-[5rem]" }: TextFieldProps) => {
  return (
    <FormField
      control={form.control}
      name={name as any}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={`${height} w-full resize-none`}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TextField;

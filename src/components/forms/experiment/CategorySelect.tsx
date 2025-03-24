
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Experiment } from '@/types/database';

interface CategorySelectProps {
  form: UseFormReturn<Experiment>;
}

const EXPERIMENT_CATEGORIES = [
  { value: 'problem', label: 'Problem' },
  { value: 'solution', label: 'Solution' },
  { value: 'business-model', label: 'Business Model' },
  { value: 'growth', label: 'Growth' },
  { value: 'other', label: 'Other' }
];

const CategorySelect = ({ form }: CategorySelectProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Category</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || 'problem'}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {EXPERIMENT_CATEGORIES.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
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

export default CategorySelect;

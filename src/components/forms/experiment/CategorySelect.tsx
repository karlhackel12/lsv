
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Control } from 'react-hook-form';

export interface CategorySelectProps {
  control: Control<any>;
}

const CategorySelect = ({ control }: CategorySelectProps) => {
  return (
    <FormField
      control={control}
      name="category"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Category</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="problem" id="problem" />
                <label htmlFor="problem" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Problem Validation
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solution" id="solution" />
                <label htmlFor="solution" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Solution Validation
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="business-model" id="business-model" />
                <label htmlFor="business-model" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Business Model Validation
                </label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default CategorySelect;

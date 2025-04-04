
import React from 'react';
import { Control, UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export interface StatusRadioGroupProps {
  control?: Control<any>;
  isGrowthExperiment?: boolean;
  form?: UseFormReturn<any>;
}

const StatusRadioGroup = ({ control, isGrowthExperiment = false, form }: StatusRadioGroupProps) => {
  const controlToUse = form?.control || control;
  
  if (!controlToUse) {
    console.error('Neither control nor form provided to StatusRadioGroup');
    return null;
  }
  
  return (
    <FormField
      control={controlToUse}
      name="status"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Status</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="planned" id="planned" />
                <label htmlFor="planned" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Planned
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value={isGrowthExperiment ? "running" : "in-progress"} id="in-progress" />
                <label htmlFor="in-progress" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  In Progress
                </label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <label htmlFor="completed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Completed
                </label>
              </div>
              {isGrowthExperiment && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="failed" id="failed" />
                  <label htmlFor="failed" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    Abandoned
                  </label>
                </div>
              )}
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StatusRadioGroup;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../ExperimentForm';

interface StatusRadioGroupProps {
  form: UseFormReturn<FormData>;
}

const StatusRadioGroup = ({ form }: StatusRadioGroupProps) => {
  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <FormLabel>Status</FormLabel>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="planned" id="planned" />
                <FormLabel htmlFor="planned" className="font-normal cursor-pointer">
                  Planned
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-progress" id="in-progress" />
                <FormLabel htmlFor="in-progress" className="font-normal cursor-pointer">
                  In Progress
                </FormLabel>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <FormLabel htmlFor="completed" className="font-normal cursor-pointer">
                  Completed
                </FormLabel>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StatusRadioGroup;

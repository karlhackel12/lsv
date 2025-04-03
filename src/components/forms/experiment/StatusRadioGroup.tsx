
import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { FormData } from '@/components/forms/ExperimentForm';

interface StatusRadioGroupProps {
  form: UseFormReturn<FormData>;
  isGrowthExperiment?: boolean;
}

const StatusRadioGroup: React.FC<StatusRadioGroupProps> = ({ 
  form,
  isGrowthExperiment = false 
}) => {
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
              className="flex flex-wrap space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="planned" id="planned" />
                <Label htmlFor="planned">
                  {isGrowthExperiment ? 'Planned' : 'Planned'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="in-progress" id="in-progress" />
                <Label htmlFor="in-progress">
                  {isGrowthExperiment ? 'Running' : 'In Progress'}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="completed" id="completed" />
                <Label htmlFor="completed">
                  {isGrowthExperiment ? 'Completed' : 'Completed'}
                </Label>
              </div>
              {isGrowthExperiment && (
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="failed" id="failed" />
                  <Label htmlFor="failed">Failed</Label>
                </div>
              )}
            </RadioGroup>
          </FormControl>
        </FormItem>
      )}
    />
  );
};

export default StatusRadioGroup;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Control } from 'react-hook-form';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatusFieldProps {
  control: Control<any>;
}

const StatusField = ({ control }: StatusFieldProps) => {
  return (
    <FormField
      control={control}
      name="status"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium">Status</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white text-gray-800 p-2 text-xs rounded shadow-md">
                  Track the current status of your hypothesis testing process.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-validation-blue-400 focus:ring focus:ring-validation-blue-200 focus:ring-opacity-50 transition-colors dark:bg-gray-800">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="not-started" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-gray-400 mr-2"></span>
                  Not Started
                </div>
              </SelectItem>
              <SelectItem value="validating" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-blue-500 mr-2"></span>
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="validated" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-green-500 mr-2"></span>
                  Validated
                </div>
              </SelectItem>
              <SelectItem value="invalid" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-red-500 mr-2"></span>
                  Invalidated
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <FormMessage className="text-xs text-red-500 mt-1" />
        </FormItem>
      )}
    />
  );
};

export default StatusField;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { UseFormReturn } from 'react-hook-form';
import { Hypothesis } from '@/types/database';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Control } from 'react-hook-form';

interface HypothesisStatementFieldProps {
  control: Control<any>;
}

const HypothesisStatementField = ({ control }: HypothesisStatementFieldProps) => {
  return (
    <FormField
      control={control}
      name="statement"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium m-0">Hypothesis Statement</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white text-gray-800 p-2 text-xs rounded shadow-md">
                  A good hypothesis statement follows this format: "We believe that [doing this] for [these people] will achieve [this outcome]"
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter your hypothesis statement..."
              className="min-h-[100px] w-full resize-none border-gray-300 dark:border-gray-600 focus:border-validation-blue-400 focus:ring focus:ring-validation-blue-200 focus:ring-opacity-50 transition-colors dark:bg-gray-800"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500" />
          <div className="text-xs text-gray-500 italic mt-1">
            Example: "We believe that [providing one-click checkout] for [online shoppers] will [increase conversion rates by 15%]"
          </div>
        </FormItem>
      )}
    />
  );
};

export default HypothesisStatementField;


import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Control } from 'react-hook-form';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TextFieldProps {
  name: string;
  label: string;
  placeholder: string;
  description?: string; // Make description optional
  control: Control<any>;
  height?: string;
  infoTooltip?: string;
}

const TextField = ({ 
  control, 
  name, 
  label, 
  placeholder,
  description,
  height = "min-h-[5rem]",
  infoTooltip 
}: TextFieldProps) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium">{label}</FormLabel>
            {infoTooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs bg-white text-gray-800 p-2 text-xs rounded shadow-md">
                    {infoTooltip}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mb-2">{description}</p>
          )}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              className={`${height} w-full resize-none border-gray-300 dark:border-gray-600 focus:border-validation-blue-400 focus:ring focus:ring-validation-blue-200 focus:ring-opacity-50 rounded-md transition-colors dark:bg-gray-800`}
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs text-red-500 mt-1" />
        </FormItem>
      )}
    />
  );
};

export default TextField;

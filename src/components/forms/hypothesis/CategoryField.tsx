
import React from 'react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { Hypothesis } from '@/types/database';
import { Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface CategoryFieldProps {
  form: UseFormReturn<Hypothesis>;
}

const CategoryField = ({ form }: CategoryFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center gap-2">
            <FormLabel className="text-sm font-medium">Category</FormLabel>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white text-gray-800 p-2 text-xs rounded shadow-md">
                  <p>Value hypotheses test whether your product delivers value to customers.</p>
                  <p className="mt-1">Growth hypotheses test whether your product can reach and acquire customers.</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Select onValueChange={field.onChange} defaultValue={field.value}>
            <FormControl>
              <SelectTrigger className="w-full border-gray-300 dark:border-gray-600 focus:border-validation-blue-400 focus:ring focus:ring-validation-blue-200 focus:ring-opacity-50 transition-colors dark:bg-gray-800">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="problem" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-red-500 mr-2"></span>
                  Problem Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="solution" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-orange-500 mr-2"></span>
                  Solution Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="customer" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-yellow-500 mr-2"></span>
                  Customer Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="market" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-purple-500 mr-2"></span>
                  Market Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="business-model" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-pink-500 mr-2"></span>
                  Business Model Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="value" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-green-500 mr-2"></span>
                  Value Hypothesis
                </div>
              </SelectItem>
              <SelectItem value="growth" className="cursor-pointer">
                <div className="flex items-center">
                  <span className="h-2 w-2 rounded-full bg-validation-blue-500 mr-2"></span>
                  Growth Hypothesis
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

export default CategoryField;

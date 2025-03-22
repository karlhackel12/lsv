
import React, { useState } from 'react';
import { Lightbulb, ChevronDown, X, Info } from 'lucide-react';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UseFormReturn } from 'react-hook-form';
import { Hypothesis } from '@/types/database';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface HypothesisStatementFieldProps {
  form: UseFormReturn<Hypothesis>;
  templates: string[];
  onApplyTemplate: (template: string) => void;
}

const HypothesisStatementField = ({ 
  form, 
  templates, 
  onApplyTemplate 
}: HypothesisStatementFieldProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <FormField
      control={form.control}
      name="statement"
      render={({ field }) => (
        <FormItem className="space-y-3">
          <div className="flex justify-between items-center">
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
            <DropdownMenu onOpenChange={setIsDropdownOpen} open={isDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 bg-white border-validation-blue-200 hover:bg-validation-blue-50 text-validation-blue-600"
                >
                  <Lightbulb className="h-4 w-4 mr-1 text-validation-yellow-400" />
                  Templates
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[400px] p-2 max-h-[300px] overflow-y-auto">
                <h4 className="px-2 py-1.5 text-sm font-medium text-gray-700">Select a template</h4>
                <DropdownMenuGroup className="space-y-1">
                  {templates.map((template, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => {
                        onApplyTemplate(template);
                        setIsDropdownOpen(false);
                      }}
                      className="cursor-pointer py-2 px-3 rounded-md hover:bg-validation-blue-50 focus:bg-validation-blue-50 transition-colors"
                    >
                      <div className="flex items-start">
                        <Lightbulb className="h-4 w-4 mr-2 text-validation-yellow-400 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{template}</span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
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

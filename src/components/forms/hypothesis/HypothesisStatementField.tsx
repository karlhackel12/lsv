
import React from 'react';
import { Lightbulb, ChevronDown } from 'lucide-react';
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
  return (
    <FormField
      control={form.control}
      name="statement"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>Hypothesis Statement</FormLabel>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="h-8">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Templates
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[400px]">
                <DropdownMenuGroup>
                  {templates.map((template, index) => (
                    <DropdownMenuItem
                      key={index}
                      onClick={() => onApplyTemplate(template)}
                      className="cursor-pointer py-2"
                    >
                      {template}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <FormControl>
            <Textarea
              placeholder="Enter your hypothesis statement..."
              className="h-24"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default HypothesisStatementField;


import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Hypothesis } from '@/types/database';
import {
  TEMPLATE_VALUE_HYPOTHESES,
  TEMPLATE_GROWTH_HYPOTHESES,
} from '@/types/pivot';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Lightbulb } from 'lucide-react';

export interface HypothesisFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: Hypothesis) => Promise<void>;
  hypothesis?: Hypothesis;
}

const HypothesisForm = ({ isOpen, onClose, onSave, hypothesis }: HypothesisFormProps) => {
  const isEditing = !!hypothesis;

  const form = useForm<Hypothesis>({
    defaultValues: hypothesis || {
      statement: '',
      category: 'value',
      criteria: '',
      experiment: '',
      status: 'not-started',
      evidence: '',
      result: '',
    },
  });

  const handleSubmit = async (data: Hypothesis) => {
    await onSave(data);
    onClose();
  };

  const applyHypothesisTemplate = (template: string) => {
    form.setValue('statement', template);
  };

  const getHypothesisTemplates = () => {
    const category = form.watch('category');
    return category === 'value' ? TEMPLATE_VALUE_HYPOTHESES : TEMPLATE_GROWTH_HYPOTHESES;
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Hypothesis' : 'Create New Hypothesis'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="value">Value Hypothesis</SelectItem>
                      <SelectItem value="growth">Growth Hypothesis</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                          {getHypothesisTemplates().map((template, index) => (
                            <DropdownMenuItem
                              key={index}
                              onClick={() => applyHypothesisTemplate(template)}
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

            <FormField
              control={form.control}
              name="criteria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Success Criteria</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What would make this hypothesis true?"
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="experiment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Experiment Plan</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="How will you test this hypothesis?"
                      className="h-20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {isEditing && (
              <>
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not-started">Not Started</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="validated">Validated</SelectItem>
                          <SelectItem value="invalidated">Invalidated</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="evidence"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Evidence</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What evidence did you collect?"
                          className="h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="result"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Result</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What was the outcome of testing this hypothesis?"
                          className="h-20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default HypothesisForm;


import React from 'react';
import { useForm } from 'react-hook-form';
import { ScalingPlanAction, ScalingReadinessMetric } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from 'lucide-react';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface ActionFormProps {
  action: ScalingPlanAction | null;
  scalingPlanId: string;
  metrics: ScalingReadinessMetric[];
  onCancel: () => void;
  onSubmit: (action: ScalingPlanAction) => Promise<void>;
}

const ActionForm: React.FC<ActionFormProps> = ({
  action,
  scalingPlanId,
  metrics,
  onCancel,
  onSubmit
}) => {
  const actionForm = useForm<ScalingPlanAction>({
    defaultValues: action || {
      id: '',
      scaling_plan_id: scalingPlanId,
      title: '',
      description: '',
      metric_id: null,
      priority: 'medium',
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScalingPlanAction,
  });

  return (
    <Form {...actionForm}>
      <form 
        onSubmit={actionForm.handleSubmit(onSubmit)} 
        className="space-y-4"
      >
        <FormField
          control={actionForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action Title</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Improve LTV:CAC Ratio" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={actionForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe what needs to be done" 
                  className="resize-none min-h-[80px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={actionForm.control}
            name="metric_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Related Metric (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value?.toString() || ''}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a metric" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {metrics.map(metric => (
                      <SelectItem key={metric.id} value={metric.id}>
                        {metric.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={actionForm.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={actionForm.control}
          name="due_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Due Date (Optional)</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(new Date(field.value), "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value) : undefined}
                    onSelect={(date) => field.onChange(date ? date.toISOString() : undefined)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2 pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit">
            {action ? 'Update Action' : 'Add Action'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ActionForm;

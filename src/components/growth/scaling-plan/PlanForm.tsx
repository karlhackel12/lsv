
import React from 'react';
import { useForm } from 'react-hook-form';
import { ScalingPlan } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface PlanFormProps {
  currentPlan: ScalingPlan | null;
  projectId: string;
  growthModelId: string;
  onCancel: () => void;
  onSubmit: (plan: ScalingPlan) => Promise<void>;
}

const PlanForm: React.FC<PlanFormProps> = ({
  currentPlan,
  projectId,
  growthModelId,
  onCancel,
  onSubmit
}) => {
  const planForm = useForm<ScalingPlan>({
    defaultValues: currentPlan || {
      id: '',
      project_id: projectId,
      growth_model_id: growthModelId,
      title: '',
      description: '',
      overall_readiness: 0,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as ScalingPlan,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{currentPlan ? 'Edit Scaling Plan' : 'Create New Scaling Plan'}</CardTitle>
        <CardDescription>
          Define your plan for scaling your startup
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...planForm}>
          <form 
            onSubmit={planForm.handleSubmit(onSubmit)} 
            className="space-y-6"
          >
            <FormField
              control={planForm.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Plan Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Q4 2023 Scaling Strategy" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={planForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe the goals and scope of this scaling plan" 
                      className="resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                {currentPlan ? 'Update Plan' : 'Create Plan'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default PlanForm;

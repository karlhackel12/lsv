import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthModel, GROWTH_FRAMEWORKS } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface GrowthModelFormProps {
  projectId: string;
  model?: GrowthModel | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

// Update the component to fix the property issues
const GrowthModelForm = ({ 
  projectId, 
  model, 
  onSave, 
  onClose 
}: GrowthModelFormProps) => {
  const { toast } = useToast();
  const isEditing = !!model;
  const [frameworkStages, setFrameworkStages] = useState<string[]>([]);

  const form = useForm<GrowthModel>({
    defaultValues: model || {
      name: '',
      description: '',
      framework: 'aarrr',
      project_id: projectId,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthModel,
  });

  const handleSubmit = async (data: GrowthModel) => {
    try {
      if (isEditing && model) {
        // Update existing model
        const { error } = await supabase
          .from('growth_models')
          .update({
            name: data.name,
            description: data.description,
            framework: data.framework,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', model.id);
          
        if (error) throw error;
        
        toast({
          title: 'Model updated',
          description: 'Your growth model has been successfully updated',
        });
      } else {
        // Create new model
        const { error } = await supabase
          .from('growth_models')
          .insert({
            name: data.name,
            description: data.description,
            framework: data.framework,
            project_id: projectId,
            status: data.status,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Model created',
          description: 'Your new growth model has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving growth model:', error);
      toast({
        title: 'Error',
        description: 'Failed to save growth model. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. AARRR Model"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. A growth model based on the AARRR framework"
                        className="resize-none min-h-[80px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="framework"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Framework</FormLabel>
                    <Select
                      onValueChange={(value) => {
                        field.onChange(value);
                        // Add optional description field if it's needed
                        const frameworkInfo = GROWTH_FRAMEWORKS[value as keyof typeof GROWTH_FRAMEWORKS];
                        if (frameworkInfo) {
                          setFrameworkStages(frameworkInfo.stages);
                        }
                      }}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a framework" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GROWTH_FRAMEWORKS).map(([key, framework]) => (
                          <SelectItem key={key} value={key}>{framework.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? 'Update Model' : 'Create Model'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GrowthModelForm;


import React from 'react';
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

const GrowthModelForm = ({ projectId, model, onSave, onClose }: GrowthModelFormProps) => {
  const { toast } = useToast();
  const isEditing = !!model;

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
          .eq('id', model.originalId || model.id);
          
        if (error) throw error;
        
        toast({
          title: 'Growth model updated',
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
            status: 'draft',
          });
          
        if (error) throw error;
        
        toast({
          title: 'Growth model created',
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
                        placeholder="e.g. Q2 Growth Strategy"
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
                        placeholder="Describe the purpose and goals of this growth model..."
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
                    <FormLabel>Growth Framework</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a framework" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.entries(GROWTH_FRAMEWORKS).map(([key, value]) => (
                          <SelectItem key={key} value={key}>
                            {value.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('framework') && (
                <div className="rounded bg-gray-50 p-3 text-sm">
                  <h4 className="font-medium mb-1">Framework Stages:</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-600">
                    {GROWTH_FRAMEWORKS[form.watch('framework') as keyof typeof GROWTH_FRAMEWORKS]?.stages.map((stage, index) => (
                      <li key={index}>{stage}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-gray-500">
                    {GROWTH_FRAMEWORKS[form.watch('framework') as keyof typeof GROWTH_FRAMEWORKS]?.description}
                  </p>
                </div>
              )}
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

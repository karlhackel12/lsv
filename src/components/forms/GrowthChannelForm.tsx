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
import { useForm } from 'react-hook-form';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { GrowthChannel, GrowthModel, GROWTH_CHANNEL_CATEGORIES } from '@/types/database';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

interface GrowthChannelFormProps {
  growthModel: GrowthModel;
  projectId: string;
  channel?: GrowthChannel | null;
  onSave: () => Promise<void>;
  onClose: () => void;
}

const GrowthChannelForm = ({ 
  growthModel, 
  projectId, 
  channel, 
  onSave, 
  onClose 
}: GrowthChannelFormProps) => {
  const { toast } = useToast();
  const isEditing = !!channel;

  const form = useForm<GrowthChannel>({
    defaultValues: channel || {
      name: '',
      category: 'organic',
      cac: undefined,
      conversion_rate: undefined,
      volume: undefined,
      status: 'testing',
      growth_model_id: growthModel.id,
      project_id: projectId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as GrowthChannel,
  });

  const handleSubmit = async (data: GrowthChannel) => {
    try {
      if (isEditing && channel) {
        const { error } = await supabase
          .from('growth_channels')
          .update({
            name: data.name,
            category: data.category,
            cac: data.cac,
            conversion_rate: data.conversion_rate,
            volume: data.volume,
            status: data.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', channel.originalId || channel.id);
          
        if (error) throw error;
        
        toast({
          title: 'Channel updated',
          description: 'Your channel has been successfully updated',
        });
      } else {
        const { error } = await supabase
          .from('growth_channels')
          .insert({
            name: data.name,
            category: data.category,
            cac: data.cac,
            conversion_rate: data.conversion_rate,
            volume: data.volume,
            status: data.status,
            growth_model_id: growthModel.id,
            project_id: projectId,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Channel created',
          description: 'Your new channel has been created',
        });
      }
      
      await onSave();
      onClose();
    } catch (error) {
      console.error('Error saving channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to save channel. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleChannelTemplateSelect = (channelName: string) => {
    form.setValue('name', channelName);
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem className="flex-1 mr-2">
                      <FormLabel>Category</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="organic">Organic</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="mt-7 whitespace-nowrap">
                      Examples <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-60 p-0" align="end">
                    <div className="p-4 border-b">
                      <h4 className="text-sm font-semibold mb-1">Channel Examples</h4>
                      <p className="text-xs text-gray-500">
                        Choose from common channels
                      </p>
                    </div>
                    <div className="max-h-60 overflow-y-auto p-2">
                      {Array.isArray(GROWTH_CHANNEL_CATEGORIES) && 
                        GROWTH_CHANNEL_CATEGORIES.map((channel, index) => (
                          <div 
                            key={index} 
                            className="px-2 py-1.5 hover:bg-gray-50 rounded cursor-pointer"
                            onClick={() => handleChannelTemplateSelect(channel)}
                          >
                            <span className="text-sm">{channel}</span>
                          </div>
                        ))
                      }
                    </div>
                  </PopoverContent>
                </Popover>
              </div>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Channel Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Google Search Ads"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="cac"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        CAC
                        <span className="text-xs text-gray-500 ml-1">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="$"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value !== undefined ? field.value : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="conversion_rate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Conv. Rate
                        <span className="text-xs text-gray-500 ml-1">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="%"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value !== undefined ? field.value : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="volume"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Volume
                        <span className="text-xs text-gray-500 ml-1">(optional)</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="any"
                          placeholder="#"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                          value={field.value !== undefined ? field.value : ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

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
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
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
                {isEditing ? 'Update Channel' : 'Add Channel'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default GrowthChannelForm;

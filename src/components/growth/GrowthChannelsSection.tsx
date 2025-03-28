
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  Megaphone,
  DollarSign
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GrowthChannel, GrowthModel } from '@/types/database';
import GrowthChannelForm from '@/components/forms/GrowthChannelForm';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import useGrowthModels from '@/hooks/growth/use-growth-models';

interface GrowthChannelsSectionProps {
  channels: GrowthChannel[];
  projectId: string;
  refreshData: () => Promise<void>;
}

const CATEGORY_COLORS = {
  'organic': 'bg-green-500',
  'paid': 'bg-blue-500',
  'partnership': 'bg-purple-500',
  'content': 'bg-yellow-500',
  'other': 'bg-gray-500'
};

const STATUS_BADGE_VARIANTS = {
  'active': 'default',
  'testing': 'outline',
  'inactive': 'secondary'
} as const;

const GrowthChannelsSection = ({ 
  channels, 
  projectId, 
  refreshData 
}: GrowthChannelsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingChannel, setEditingChannel] = useState<GrowthChannel | null>(null);
  const [channelToDelete, setChannelToDelete] = useState<GrowthChannel | null>(null);
  const { toast } = useToast();
  const { activeModelId } = useGrowthModels(projectId);

  const handleOpenForm = (channel?: GrowthChannel) => {
    setEditingChannel(channel || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingChannel(null);
  };

  const handleDeleteChannel = async () => {
    if (!channelToDelete) return;
    
    try {
      const { error } = await supabase
        .from('growth_channels')
        .delete()
        .eq('id', channelToDelete.originalId || channelToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Channel deleted',
        description: 'The channel has been successfully deleted',
      });
      
      refreshData();
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete channel',
        variant: 'destructive',
      });
    } finally {
      setChannelToDelete(null);
    }
  };

  const groupedChannels = channels.reduce((groups, channel) => {
    const category = channel.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(channel);
    return groups;
  }, {} as Record<string, GrowthChannel[]>);

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthChannelForm
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          channel={editingChannel}
          growthModel={activeModelId ? {
            id: activeModelId,
            name: 'Current Growth Model',
            description: '',
            framework: 'aarrr',
            status: 'active',
            project_id: projectId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as GrowthModel : undefined}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Acquisition Channels</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Channel
            </Button>
          </div>

          {channels.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <Megaphone className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Channels Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Add and track your acquisition channels to determine which ones deliver the best results.
                </p>
                <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add First Channel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedChannels).map(([category, categoryChannels]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}></div>
                    <h3 className="text-md font-medium capitalize">{category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryChannels.map((channel) => (
                      <Card key={channel.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base font-medium">{channel.name}</CardTitle>
                              <Badge variant={STATUS_BADGE_VARIANTS[channel.status]}>
                                {channel.status}
                              </Badge>
                            </div>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0" 
                                onClick={() => handleOpenForm(channel)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0" 
                                onClick={() => setChannelToDelete(channel)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="py-3">
                          <div className="grid grid-cols-3 gap-2 text-sm">
                            {channel.cac !== undefined && (
                              <div>
                                <p className="text-gray-500 text-xs">CAC</p>
                                <div className="flex items-center">
                                  <DollarSign className="h-3.5 w-3.5 mr-0.5" />
                                  <span className="font-medium">{channel.cac}</span>
                                </div>
                              </div>
                            )}
                            
                            {channel.conversion_rate !== undefined && (
                              <div>
                                <p className="text-gray-500 text-xs">Conv. Rate</p>
                                <span className="font-medium">{channel.conversion_rate}%</span>
                              </div>
                            )}
                            
                            {channel.volume !== undefined && (
                              <div>
                                <p className="text-gray-500 text-xs">Volume</p>
                                <span className="font-medium">{channel.volume}</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!channelToDelete} onOpenChange={(open) => !open && setChannelToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Channel</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this channel? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteChannel} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GrowthChannelsSection;

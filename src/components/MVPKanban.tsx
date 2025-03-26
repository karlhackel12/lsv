
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Plus, Edit, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MVPFeatureForm from './forms/MVPFeatureForm';
import StatusBadge from './StatusBadge';

interface MVPKanbanProps {
  mvpFeatures: any[];
  refreshData: () => void;
  projectId: string;
  isFormOpen?: boolean;
  onFormClose?: () => void;
  onFormOpen?: () => void;
  isLoading?: boolean;
}

const MVPKanban = ({
  mvpFeatures,
  refreshData,
  projectId,
  isFormOpen = false,
  onFormClose = () => {},
  onFormOpen = () => {},
  isLoading = false
}: MVPKanbanProps) => {
  const { toast } = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<any>(null);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [internalFormOpen, setInternalFormOpen] = useState(isFormOpen);

  React.useEffect(() => {
    setInternalFormOpen(isFormOpen);
  }, [isFormOpen]);

  const handleCreateNew = () => {
    setSelectedFeature(null);
    setInternalFormOpen(true);
    onFormOpen();
  };

  const handleEdit = (feature: any) => {
    const originalFeature = {
      ...feature,
      id: feature.originalId
    };
    setSelectedFeature(originalFeature);
    setInternalFormOpen(true);
    onFormOpen();
  };

  const handleCloseForm = () => {
    setInternalFormOpen(false);
    if (onFormClose) {
      onFormClose();
    }
  };

  const handleDelete = (feature: any) => {
    setFeatureToDelete({
      ...feature,
      id: feature.originalId
    });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!featureToDelete) return;
    try {
      const { error } = await supabase
        .from('mvp_features')
        .delete()
        .eq('id', featureToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Feature deleted',
        description: 'The MVP feature has been successfully deleted.'
      });
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setFeatureToDelete(null);
    }
  };

  function updateFeatureStatus(feature: any, newStatus: 'completed' | 'in-progress' | 'planned') {
    try {
      supabase
        .from('mvp_features')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', feature.originalId)
        .then(({ error }) => {
          if (error) throw error;
          toast({
            title: 'Status updated',
            description: `Feature status changed to ${newStatus}.`
          });
          refreshData();
        });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive'
      });
    }
  }

  function safeCapitalize(str: string | undefined | null): string {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 animate-pulse">
        <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
        <span className="text-lg font-medium text-gray-600">Loading features...</span>
      </div>
    );
  }

  // Group features by status
  const plannedFeatures = mvpFeatures.filter(f => f.status === 'planned');
  const inProgressFeatures = mvpFeatures.filter(f => f.status === 'in-progress');
  const completedFeatures = mvpFeatures.filter(f => f.status === 'completed');

  if (mvpFeatures.length === 0) {
    return (
      <Card className="p-12 text-center animate-fadeIn">
        <AlertCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-xl font-medium text-gray-900 mb-2">No MVP Features Defined</h3>
        <p className="text-gray-600 mb-6">Define the core features needed for your minimum viable product.</p>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Feature
        </Button>
      </Card>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">MVP Features</h2>
        <Button onClick={handleCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Feature
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Planned Column */}
        <Card className="h-full">
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="text-sm font-medium text-gray-700">Planned</CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-full overflow-auto">
            <div className="space-y-2 p-2 min-h-[200px]">
              {plannedFeatures.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No planned features</p>
              ) : (
                plannedFeatures.map(feature => (
                  <Card key={feature.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{feature.feature}</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEdit(feature)}>
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDelete(feature)}>
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {feature.notes && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{feature.notes}</p>}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        feature.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : feature.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {safeCapitalize(feature.priority)} Priority
                      </span>
                      
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        feature.effort === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : feature.effort === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {safeCapitalize(feature.effort)} Effort
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-1" 
                      variant="outline"
                      onClick={() => updateFeatureStatus(feature, 'in-progress')}
                    >
                      Start Development
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* In Progress Column */}
        <Card className="h-full">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-sm font-medium text-blue-700">In Progress</CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-full overflow-auto">
            <div className="space-y-2 p-2 min-h-[200px]">
              {inProgressFeatures.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No features in progress</p>
              ) : (
                inProgressFeatures.map(feature => (
                  <Card key={feature.id} className="p-3 shadow-sm hover:shadow-md transition-shadow border-l-2 border-l-blue-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{feature.feature}</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEdit(feature)}>
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDelete(feature)}>
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {feature.notes && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{feature.notes}</p>}
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        feature.priority === 'high' 
                          ? 'bg-red-100 text-red-700' 
                          : feature.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-green-100 text-green-700'
                      }`}>
                        {safeCapitalize(feature.priority)} Priority
                      </span>
                    </div>
                    
                    <Button 
                      size="sm" 
                      className="w-full mt-1" 
                      variant="outline"
                      onClick={() => updateFeatureStatus(feature, 'completed')}
                    >
                      Mark Completed
                    </Button>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Column */}
        <Card className="h-full">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-sm font-medium text-green-700">Completed</CardTitle>
          </CardHeader>
          <CardContent className="p-2 h-full overflow-auto">
            <div className="space-y-2 p-2 min-h-[200px]">
              {completedFeatures.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No completed features</p>
              ) : (
                completedFeatures.map(feature => (
                  <Card key={feature.id} className="p-3 shadow-sm hover:shadow-md transition-shadow border-l-2 border-l-green-500">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{feature.feature}</h3>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => handleEdit(feature)}>
                          <Edit className="h-3 w-3" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500" onClick={() => handleDelete(feature)}>
                          <Trash2 className="h-3 w-3" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </div>
                    
                    {feature.notes && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{feature.notes}</p>}
                    
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                        Completed
                      </span>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <MVPFeatureForm 
        isOpen={internalFormOpen} 
        onClose={handleCloseForm} 
        onSave={refreshData} 
        feature={selectedFeature} 
        projectId={projectId} 
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this MVP feature. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MVPKanban;

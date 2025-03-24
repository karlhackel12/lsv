import React, { useState } from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import { Target, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MVPFeatureForm from './forms/MVPFeatureForm';
import MVPTable from './MVPTable';
import CurrentlyWorkingOn from './CurrentlyWorkingOn';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import ProgressBar from './ProgressBar';
interface MVPSectionProps {
  mvpFeatures: any[];
  refreshData: () => void;
  projectId: string;
}
const MVPSection = ({
  mvpFeatures,
  refreshData,
  projectId
}: MVPSectionProps) => {
  const {
    toast
  } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const handleCreateNew = () => {
    setSelectedFeature(null);
    setIsFormOpen(true);
  };
  const handleEdit = (feature: any) => {
    // Find original feature with string ID for database operations
    const originalFeature = {
      ...feature,
      id: feature.originalId
    };
    setSelectedFeature(originalFeature);
    setIsFormOpen(true);
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
      const {
        error
      } = await supabase.from('mvp_features').delete().eq('id', featureToDelete.id);
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
  const updateFeatureStatus = async (feature: any, newStatus: 'completed' | 'in-progress' | 'planned') => {
    try {
      const {
        error
      } = await supabase.from('mvp_features').update({
        status: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', feature.originalId);
      if (error) throw error;
      toast({
        title: 'Status updated',
        description: `Feature status changed to ${newStatus}.`
      });
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive'
      });
    }
  };

  // Calculate MVP progress
  const calculateProgress = () => {
    if (mvpFeatures.length === 0) return 0;
    const completed = mvpFeatures.filter(f => f.status === 'completed').length;
    return Math.round(completed / mvpFeatures.length * 100);
  };
  const progress = calculateProgress();

  // Helper function to safely capitalize a string with null checks
  const safeCapitalize = (str: string | undefined | null): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };
  return <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Minimum Viable Product</h2>
        <div className="flex space-x-2">
          <Button variant="outline" className={`${viewMode === 'cards' ? 'bg-gray-100' : ''}`} onClick={() => setViewMode('cards')}>
            Card View
          </Button>
          <Button variant="outline" className={`${viewMode === 'table' ? 'bg-gray-100' : ''}`} onClick={() => setViewMode('table')}>
            Table View
          </Button>
          
        </div>
      </div>

      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">Define and track the essential features for your Minimum Viable Product.
Focus on features that deliver the most value with the least effort.</p>
      </Card>

      {mvpFeatures.length > 0 && <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-validation-gray-900">MVP Progress</h3>
            <span className="text-validation-gray-700 font-medium">{progress}% Complete</span>
          </div>
          <ProgressBar value={progress} variant={progress >= 70 ? 'success' : progress >= 30 ? 'warning' : 'error'} size="md" />
        </Card>}

      {mvpFeatures.filter(f => f.status === 'in-progress').length > 0 && <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-validation-gray-900">Currently Working On</h3>
            <p className="text-validation-gray-600 text-sm">Features currently in development</p>
          </div>
          <CurrentlyWorkingOn features={mvpFeatures} />
        </Card>}

      {mvpFeatures.length === 0 ? <Card className="p-12 text-center animate-slideUpFade">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No MVP Features Defined</h3>
          <p className="text-validation-gray-600 mb-6">Define the core features needed for your minimum viable product.</p>
          <Button className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white" onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Add First Feature
          </Button>
        </Card> : <div>
          {viewMode === 'table' ? <MVPTable features={mvpFeatures} onEdit={handleEdit} onDelete={handleDelete} /> : <div className="space-y-6">
              {mvpFeatures.map((feature, index) => <Card key={feature.id} className="p-6 animate-slideUpFade" style={{
          animationDelay: `${(index + 3) * 100}ms`
        }} hover={true}>
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="text-lg font-semibold text-validation-gray-900">{feature.feature}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <StatusBadge status={feature.status} />
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(feature)}>
                        <Edit className="h-3.5 w-3.5" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      <Button variant="outline" size="sm" className="h-7 w-7 p-0 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50" onClick={() => handleDelete(feature)}>
                        <Trash2 className="h-3.5 w-3.5" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </div>
                  
                  <p className="text-validation-gray-600 mb-4">{feature.notes}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-validation-gray-500 mr-2">Priority:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${feature.priority === 'high' ? 'bg-validation-red-100 text-validation-red-700' : feature.priority === 'medium' ? 'bg-validation-yellow-100 text-validation-yellow-700' : 'bg-validation-green-100 text-validation-green-700'}`}>
                        {safeCapitalize(feature.priority) || 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-validation-gray-500 mr-2">Effort:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${feature.effort === 'high' ? 'bg-validation-red-100 text-validation-red-700' : feature.effort === 'medium' ? 'bg-validation-yellow-100 text-validation-yellow-700' : feature.effort === 'low' ? 'bg-validation-green-100 text-validation-green-700' : 'bg-gray-100 text-gray-700'}`}>
                        {safeCapitalize(feature.effort) || 'Not set'}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className="text-sm font-medium text-validation-gray-500 mr-2">Impact:</span>
                      <span className={`text-sm font-medium px-2 py-1 rounded ${feature.impact === 'high' ? 'bg-validation-green-100 text-validation-green-700' : feature.impact === 'medium' ? 'bg-validation-yellow-100 text-validation-yellow-700' : feature.impact === 'low' ? 'bg-validation-red-100 text-validation-red-700' : 'bg-gray-100 text-gray-700'}`}>
                        {safeCapitalize(feature.impact) || 'Not set'}
                      </span>
                    </div>
                  </div>
                  
                  {feature.status === 'planned' && <Button className="mt-2 bg-validation-blue-600 hover:bg-validation-blue-700 text-white" onClick={() => updateFeatureStatus(feature, 'in-progress')}>
                      Start Development
                    </Button>}
                  
                  {feature.status === 'in-progress' && <Button className="mt-2 bg-validation-green-600 hover:bg-validation-green-700 text-white" onClick={() => updateFeatureStatus(feature, 'completed')}>
                      Mark as Completed
                    </Button>}
                </Card>)}
            </div>}
        </div>}

      {/* MVP Feature Form Dialog */}
      <MVPFeatureForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={refreshData} feature={selectedFeature} projectId={projectId} />

      {/* Delete Confirmation Dialog */}
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
            <AlertDialogAction className="bg-validation-red-600 hover:bg-validation-red-700 text-white" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>;
};
export default MVPSection;

import React, { useState } from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { Target, Plus, Edit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MVPFeatureForm from './forms/MVPFeatureForm';
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

interface MVPFeature {
  id: number;
  originalId?: string;
  feature: string;
  priority: 'high' | 'medium' | 'low';
  status: string;
  notes: string | null;
}

interface MVPSectionProps {
  mvpFeatures: MVPFeature[];
  refreshData: () => void;
  projectId: string;
}

const MVPSection = ({ mvpFeatures, refreshData, projectId }: MVPSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [featureToDelete, setFeatureToDelete] = useState<any>(null);

  const handleCreateNew = () => {
    setSelectedFeature(null);
    setIsFormOpen(true);
  };

  const handleEdit = (feature: MVPFeature) => {
    // Find original feature with string ID for database operations
    const originalFeature = {
      ...feature,
      id: feature.originalId
    };
    setSelectedFeature(originalFeature);
    setIsFormOpen(true);
  };

  const handleDelete = (feature: MVPFeature) => {
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
        description: 'The MVP feature has been successfully deleted.',
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setFeatureToDelete(null);
    }
  };

  // Calculate MVP progress based on feature statuses
  const calculateProgress = () => {
    if (mvpFeatures.length === 0) return 0;
    
    const completedCount = mvpFeatures.filter(f => f.status === 'completed').length;
    const inProgressCount = mvpFeatures.filter(f => f.status === 'in-progress').length;
    
    // Count in-progress as half complete
    return Math.round((completedCount + (inProgressCount * 0.5)) / mvpFeatures.length * 100);
  };

  // Group features by priority for display purposes
  const highPriorityFeatures = mvpFeatures.filter(f => f.priority === 'high');
  const mediumPriorityFeatures = mvpFeatures.filter(f => f.priority === 'medium');
  const lowPriorityFeatures = mvpFeatures.filter(f => f.priority === 'low');

  // Group features by status for progress tracking
  const plannedFeatures = mvpFeatures.filter(f => f.status === 'planned');
  const inProgressFeatures = mvpFeatures.filter(f => f.status === 'in-progress');
  const completedFeatures = mvpFeatures.filter(f => f.status === 'completed');
  const postMvpFeatures = mvpFeatures.filter(f => f.status === 'post-mvp');

  const totalProgress = calculateProgress();

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">MVP Development</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add MVP Feature
        </Button>
      </div>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          The Minimum Viable Product includes only the core features needed to validate your key hypotheses and deliver value to early adopters.
        </p>
      </Card>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-200">
        <h3 className="text-xl font-bold mb-5 text-validation-gray-900">MVP Definition</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Core Value Proposition</p>
            <p className="text-validation-gray-700">
              Extending English learning beyond the classroom through AI-enhanced spaced repetition and daily practice, while providing teachers with engagement insights.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-validation-gray-500 mb-1">Target Early Adopters</p>
            <p className="text-validation-gray-700">
              Tech-savvy independent English teachers in São Paulo and Rio with 5+ existing students seeking professional English skills.
            </p>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-validation-gray-500 mb-2">Success Metrics</p>
          <div className="flex flex-wrap gap-2">
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              65%+ daily student engagement
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              80%+ teacher satisfaction
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              70%+ student conversion to paid
            </span>
            <span className="bg-validation-gray-100 text-validation-gray-700 text-xs font-medium px-2.5 py-1.5 rounded-lg border border-validation-gray-200">
              30%+ vocabulary retention improvement
            </span>
          </div>
        </div>
      </Card>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Feature Prioritization</h3>
      
      {mvpFeatures.length === 0 ? (
        <Card className="p-12 text-center animate-slideUpFade mb-8">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No MVP Features Yet</h3>
          <p className="text-validation-gray-600 mb-6">Define the core features needed for your MVP.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Feature
          </Button>
        </Card>
      ) : (
        <Card className="mb-8 overflow-hidden animate-slideUpFade animate-delay-300">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-validation-gray-200">
              <thead>
                <tr className="bg-validation-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Feature</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Notes</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-validation-gray-200">
                {mvpFeatures.map((feature) => (
                  <tr key={feature.id} className="hover:bg-validation-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-validation-gray-900">{feature.feature}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                        feature.priority === 'high' ? 'bg-validation-red-50 text-validation-red-700 border border-validation-red-200' : 
                        feature.priority === 'medium' ? 'bg-validation-yellow-50 text-validation-yellow-700 border border-validation-yellow-200' : 
                        'bg-validation-blue-50 text-validation-blue-700 border border-validation-blue-200'
                      }`}>
                        {feature.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={feature.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-500">{feature.notes || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleEdit(feature)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                          onClick={() => handleDelete(feature)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
      
      {mvpFeatures.length > 0 && (
        <>
          <h3 className="text-xl font-bold mb-6 text-validation-gray-900">Development Progress</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="p-6 animate-slideUpFade animate-delay-400">
              <h4 className="font-bold text-lg mb-5 text-validation-gray-900">Overall MVP Progress</h4>
              <div className="mb-6">
                <ProgressBar 
                  value={totalProgress} 
                  label={`${totalProgress}% complete`} 
                  variant={totalProgress > 75 ? "success" : totalProgress > 30 ? "warning" : "info"} 
                  showValue={false}
                  size="md"
                  className="mb-6"
                />
              </div>
              
              <h5 className="font-medium mb-2 text-validation-gray-700">High Priority Features</h5>
              <ProgressBar 
                value={highPriorityFeatures.length > 0 ? 
                  (highPriorityFeatures.filter(f => f.status === 'completed').length / highPriorityFeatures.length) * 100 : 0} 
                label={highPriorityFeatures.length > 0 ? 
                  `${Math.round((highPriorityFeatures.filter(f => f.status === 'completed').length / highPriorityFeatures.length) * 100)}% complete` : 
                  "No high priority features"} 
                variant="danger" 
                showValue={false}
                size="sm"
                className="mb-6"
              />
              
              <h5 className="font-medium mb-2 text-validation-gray-700">Medium Priority Features</h5>
              <ProgressBar 
                value={mediumPriorityFeatures.length > 0 ? 
                  (mediumPriorityFeatures.filter(f => f.status === 'completed').length / mediumPriorityFeatures.length) * 100 : 0} 
                label={mediumPriorityFeatures.length > 0 ? 
                  `${Math.round((mediumPriorityFeatures.filter(f => f.status === 'completed').length / mediumPriorityFeatures.length) * 100)}% complete` : 
                  "No medium priority features"} 
                variant="warning" 
                showValue={false}
                size="sm"
                className="mb-6"
              />
              
              <h5 className="font-medium mb-2 text-validation-gray-700">Low Priority Features</h5>
              <ProgressBar 
                value={lowPriorityFeatures.length > 0 ? 
                  (lowPriorityFeatures.filter(f => f.status === 'completed').length / lowPriorityFeatures.length) * 100 : 0} 
                label={lowPriorityFeatures.length > 0 ? 
                  `${Math.round((lowPriorityFeatures.filter(f => f.status === 'completed').length / lowPriorityFeatures.length) * 100)}% complete` : 
                  "No low priority features"} 
                variant="info" 
                showValue={false}
                size="sm"
              />
            </Card>
            
            <div className="flex flex-col">
              <h4 className="font-bold text-lg mb-5 text-validation-gray-900">Currently Working On</h4>
              
              {inProgressFeatures.length === 0 ? (
                <Card className="bg-validation-gray-50 border border-validation-gray-200 p-5 mb-5 animate-slideUpFade animate-delay-500">
                  <p className="text-validation-gray-700 text-center py-8">No features are currently in progress.</p>
                </Card>
              ) : (
                inProgressFeatures.slice(0, 2).map((feature, idx) => (
                  <Card 
                    key={feature.id}
                    className="bg-validation-yellow-50 border border-validation-yellow-200 p-5 mb-5 animate-slideUpFade animate-delay-500"
                  >
                    <h5 className="font-bold text-validation-gray-900">{feature.feature}</h5>
                    <p className="text-sm text-validation-gray-600 mb-4">{feature.notes || 'No additional notes'}</p>
                    <div className="flex justify-between">
                      <span className={`bg-validation-${feature.priority === 'high' ? 'red' : feature.priority === 'medium' ? 'yellow' : 'blue'}-50 
                        text-validation-${feature.priority === 'high' ? 'red' : feature.priority === 'medium' ? 'yellow' : 'blue'}-700 
                        border border-validation-${feature.priority === 'high' ? 'red' : feature.priority === 'medium' ? 'yellow' : 'blue'}-200 
                        text-xs font-medium px-2.5 py-1 rounded-full`}
                      >
                        {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-white"
                        onClick={() => handleEdit(feature)}
                      >
                        Update Status
                      </Button>
                    </div>
                  </Card>
                ))
              )}
              
              <div className="flex justify-between mt-auto">
                <span className="text-sm text-validation-gray-500">
                  {plannedFeatures.length} planned, {inProgressFeatures.length} in progress, {completedFeatures.length} completed
                </span>
                <Button 
                  variant="outline"
                  onClick={handleCreateNew}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feature
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* MVP Feature Form Dialog */}
      <MVPFeatureForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        feature={selectedFeature}
        projectId={projectId}
      />

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
            <AlertDialogAction 
              className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MVPSection;

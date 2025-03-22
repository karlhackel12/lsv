
import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import Card from '@/components/Card';
import HypothesisList from '@/components/hypotheses/HypothesisList';
import HypothesisForm from '@/components/forms/HypothesisForm';
import { Hypothesis } from '@/types/database';
import { useProject } from '@/hooks/use-project';
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
import MainLayout from '@/components/MainLayout';

const HypothesesPage = () => {
  const { toast } = useToast();
  const { project } = useProject();
  const projectId = project?.id || '';
  
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [hypothesisToDelete, setHypothesisToDelete] = useState<Hypothesis | null>(null);

  useEffect(() => {
    if (projectId) {
      fetchHypotheses();
    }
  }, [projectId]);

  const fetchHypotheses = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform UUID strings to be compatible with our component interfaces
      const transformedData = data.map(item => ({
        ...item,
        originalId: item.id, // Keep the original UUID string for database operations
        id: item.id // Keep id as string
      }));
      
      setHypotheses(transformedData);
    } catch (error: any) {
      toast({
        title: 'Error fetching hypotheses',
        description: error.message || 'An error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateNew = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleEdit = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setIsFormOpen(true);
  };

  const handleDelete = (hypothesis: Hypothesis) => {
    setHypothesisToDelete(hypothesis);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!hypothesisToDelete) return;
    
    try {
      const { error } = await supabase
        .from('hypotheses')
        .delete()
        .eq('id', hypothesisToDelete.originalId || hypothesisToDelete.id);
      
      if (error) throw error;
      
      toast({
        title: 'Hypothesis deleted',
        description: 'The hypothesis has been successfully deleted.',
      });
      
      fetchHypotheses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setHypothesisToDelete(null);
    }
  };

  const handleStatusChange = async (hypothesis: Hypothesis, newStatus: 'validated' | 'validating' | 'not-started' | 'invalid') => {
    try {
      const { error } = await supabase
        .from('hypotheses')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', hypothesis.originalId || hypothesis.id);
      
      if (error) throw error;
      
      toast({
        title: 'Status updated',
        description: `Hypothesis status changed to ${newStatus}.`,
      });
      
      fetchHypotheses();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while updating status.',
        variant: 'destructive',
      });
    }
  };

  return (
    <MainLayout>
      <div className="container px-4 py-8 mx-auto max-w-7xl animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-validation-gray-900">Hypothesis Testing</h1>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Hypothesis
          </Button>
        </div>

        <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
          <p className="text-validation-gray-600 text-lg">
            Track and validate key business assumptions using the Build-Measure-Learn cycle. 
            Hypotheses should be specific, testable, and have clear success criteria.
          </p>
        </Card>

        {loading ? (
          <div className="flex justify-center p-12">
            <p>Loading hypotheses...</p>
          </div>
        ) : hypotheses.length === 0 ? (
          <Card className="p-12 text-center animate-slideUpFade">
            <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Hypotheses Yet</h3>
            <p className="text-validation-gray-600 mb-6">Start by adding your first business hypothesis to test.</p>
            <Button 
              className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
              onClick={handleCreateNew}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Hypothesis
            </Button>
          </Card>
        ) : (
          <HypothesisList 
            hypotheses={hypotheses}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={handleStatusChange}
          />
        )}

        {/* Hypothesis Form Dialog */}
        <HypothesisForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchHypotheses}
          hypothesis={selectedHypothesis || undefined}
          projectId={projectId}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete this hypothesis and all associated data. 
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
    </MainLayout>
  );
};

export default HypothesesPage;

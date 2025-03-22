
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HypothesisList from '@/components/hypotheses/HypothesisList';
import HypothesisForm from '@/components/forms/HypothesisForm';
import { Loader2 } from 'lucide-react';

const HypothesesPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [hypotheses, setHypotheses] = useState<Hypothesis[]>([]);
  const [isLoadingHypotheses, setIsLoadingHypotheses] = useState(true);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { toast } = useToast();

  const fetchHypotheses = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingHypotheses(true);
      const { data, error } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      setHypotheses(data);
    } catch (err) {
      console.error('Error fetching hypotheses:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load hypotheses',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingHypotheses(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchHypotheses();
    }
  }, [currentProject]);

  const handleEditHypothesis = (hypothesis: Hypothesis) => {
    setSelectedHypothesis(hypothesis);
    setIsFormOpen(true);
  };

  const handleCreateHypothesis = () => {
    setSelectedHypothesis(null);
    setIsFormOpen(true);
  };

  const handleSaveHypothesis = async (formData: Hypothesis) => {
    try {
      if (selectedHypothesis) {
        // Update existing hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .update({
            statement: formData.statement,
            category: formData.category,
            status: formData.status,
            criteria: formData.criteria,
            experiment: formData.experiment,
            evidence: formData.evidence,
            result: formData.result,
            updated_at: new Date().toISOString(),
          })
          .eq('id', selectedHypothesis.id);
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'Hypothesis updated successfully',
        });
      } else {
        // Create new hypothesis
        const { error } = await supabase
          .from('hypotheses')
          .insert({
            statement: formData.statement,
            category: formData.category,
            status: 'not-started',
            criteria: formData.criteria,
            experiment: formData.experiment,
            project_id: currentProject?.id,
          });
          
        if (error) throw error;
        
        toast({
          title: 'Success',
          description: 'New hypothesis created successfully',
        });
      }
      
      await fetchHypotheses();
    } catch (err) {
      console.error('Error saving hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to save hypothesis',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteHypothesis = async (hypothesis: Hypothesis) => {
    try {
      const { error } = await supabase
        .from('hypotheses')
        .delete()
        .eq('id', hypothesis.id);
        
      if (error) throw error;
      
      setHypotheses(prevHypotheses => 
        prevHypotheses.filter(h => h.id !== hypothesis.id)
      );
      
      toast({
        title: 'Success',
        description: 'Hypothesis deleted successfully',
      });
    } catch (err) {
      console.error('Error deleting hypothesis:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete hypothesis',
        variant: 'destructive',
      });
    }
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setSelectedHypothesis(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error instanceof Error ? error.message : 'Failed to load project'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Hypothesis form dialog */}
      {isFormOpen && (
        <HypothesisForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          onSave={handleSaveHypothesis}
          hypothesis={selectedHypothesis || undefined}
        />
      )}
      
      {/* Main content */}
      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list">Hypothesis List</TabsTrigger>
          <TabsTrigger value="create">Create Hypothesis</TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <HypothesisList 
            hypotheses={hypotheses}
            onEdit={handleEditHypothesis}
            onDelete={handleDeleteHypothesis}
            onCreateNew={handleCreateHypothesis}
            isLoading={isLoadingHypotheses}
          />
        </TabsContent>
        <TabsContent value="create" className="mt-6">
          <div className="flex items-center justify-center p-12">
            <button
              onClick={handleCreateHypothesis}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Create New Hypothesis
            </button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HypothesesPage;

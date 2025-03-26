import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2, GitBranch } from 'lucide-react';
import { PivotOption } from '@/types/pivot';
import PageIntroduction from '@/components/PageIntroduction';
import PivotOptionsTable from '@/components/pivot/PivotOptionsTable';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PivotOptionForm from '@/components/forms/PivotOptionForm';

const PivotPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [isLoadingPivotOptions, setIsLoadingPivotOptions] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPivotOption, setSelectedPivotOption] = useState<PivotOption | null>(null);
  const [pivotToDelete, setPivotToDelete] = useState<PivotOption | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchPivotOptions = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingPivotOptions(true);
      const { data, error } = await supabase
        .from('pivot_options')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('updated_at', { ascending: false });
        
      if (error) throw error;
      
      const transformedData: PivotOption[] = data.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
        type: item.type || '',
        description: item.description || '',
        trigger: item.trigger || '',
        likelihood: (item.likelihood as 'high' | 'medium' | 'low') || 'medium',
        project_id: item.project_id || '',
        created_at: item.created_at || '',
        updated_at: item.updated_at || ''
      }));
      
      setPivotOptions(transformedData);
    } catch (err) {
      console.error('Error fetching pivot options:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load pivot options',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingPivotOptions(false);
    }
  };

  const deletePivotOption = async (id: string) => {
    return supabase
      .from('pivot_options')
      .delete()
      .eq('id', id);
  };

  const refreshPivotOptions = () => {
    fetchPivotOptions();
  };

  const confirmDelete = () => {
    if (!pivotToDelete) return;
    
    deletePivotOption(pivotToDelete.id)
      .then(() => {
        toast({
          title: 'Pivot option deleted',
          description: 'The pivot option has been successfully deleted.'
        });
        refreshPivotOptions();
      })
      .catch((error) => {
        console.error('Error deleting pivot option:', error);
        toast({
          title: 'Error',
          description: 'Failed to delete pivot option.',
          variant: 'destructive'
        });
      })
      .finally(() => {
        setIsDeleteDialogOpen(false);
        setPivotToDelete(null);
      });
  };

  useEffect(() => {
    if (currentProject) {
      fetchPivotOptions();
    }
  }, [currentProject]);
  
  const handleCreateNew = () => {
    setSelectedPivotOption(null);
    setIsFormOpen(true);
  };

  const handleEdit = (option: PivotOption) => {
    setSelectedPivotOption(option);
    setIsFormOpen(true);
  };

  const handleDelete = (option: PivotOption) => {
    setPivotToDelete(option);
    setIsDeleteDialogOpen(true);
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
      <PageIntroduction
        title="Pivot Planning and Framework"
        icon={<GitBranch className="h-5 w-5 text-blue-500" />}
        description={
          <p>
            A pivot is a structured course correction designed to test a new fundamental hypothesis about your product,
            business model, or growth strategy when metrics indicate your current approach isn't working.
          </p>
        }
        storageKey="pivot-page"
      />
      
      <div className="flex justify-between items-center mb-6 mt-8">
        <h2 className="text-2xl font-bold">Pivot Options</h2>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Pivot Option
        </Button>
      </div>

      {currentProject && !isLoadingPivotOptions ? (
        <PivotOptionsTable
          pivotOptions={pivotOptions}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      ) : (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pivot options...</span>
        </div>
      )}
      
      {isFormOpen && currentProject && (
        <PivotOptionForm
          isOpen={isFormOpen}
          pivotOption={selectedPivotOption}
          projectId={currentProject.id}
          metrics={[]}
          onSave={fetchPivotOptions}
          onClose={() => setIsFormOpen(false)}
        />
      )}
      
      {isDeleteDialogOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <p>Are you sure you want to delete this pivot option?</p>
            <div className="flex justify-end mt-4">
              <Button 
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={confirmDelete}
              >
                Delete
              </Button>
              <Button 
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 ml-2"
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PivotPage;

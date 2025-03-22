
import React, { useEffect, useState } from 'react';
import { useProject } from '@/hooks/use-project';
import MainLayout from '@/components/MainLayout';
import { Experiment } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ExperimentsSection from '@/components/ExperimentsSection';

const ExperimentsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const { toast } = useToast();
  const [experiments, setExperiments] = useState<Experiment[]>([]);
  const [loadingExperiments, setLoadingExperiments] = useState(true);

  const fetchExperiments = async () => {
    if (!currentProject?.id) return;
    
    try {
      setLoadingExperiments(true);
      
      const { data, error } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const transformedData = data.map(item => ({
        ...item,
        originalId: item.id,
        id: item.id
      }));
      
      setExperiments(transformedData);
    } catch (err: any) {
      toast({
        title: 'Error fetching experiments',
        description: err.message || 'Failed to load experiments',
        variant: 'destructive',
      });
    } finally {
      setLoadingExperiments(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchExperiments();
    } else {
      setLoadingExperiments(false);
    }
  }, [currentProject]);

  if (isLoading || loadingExperiments) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center">Loading experiments data...</p>
        </div>
      </MainLayout>
    );
  }

  if (error || !currentProject) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p className="text-center text-validation-red-500">
            {error instanceof Error ? error.message : 'Project not found'}
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <ExperimentsSection 
          experiments={experiments} 
          refreshData={fetchExperiments} 
          projectId={currentProject.id} 
        />
      </div>
    </MainLayout>
  );
};

export default ExperimentsPage;


import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { PivotOption } from '@/types/database';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PivotSection from '@/components/PivotSection';

const PivotPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [pivotOptions, setPivotOptions] = useState<PivotOption[]>([]);
  const [isLoadingPivotOptions, setIsLoadingPivotOptions] = useState(true);
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
      
      // Transform the data to include numeric ID for easier handling in UI
      const transformedData = data.map((item, index) => ({
        ...item,
        id: index + 1,
        originalId: item.id,
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

  useEffect(() => {
    if (currentProject) {
      fetchPivotOptions();
    }
  }, [currentProject]);

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
      {currentProject && !isLoadingPivotOptions && (
        <PivotSection
          pivotOptions={pivotOptions}
          refreshData={fetchPivotOptions}
          projectId={currentProject.id}
        />
      )}
      
      {isLoadingPivotOptions && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading pivot options...</span>
        </div>
      )}
    </div>
  );
};

export default PivotPage;

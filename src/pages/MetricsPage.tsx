
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MetricsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const { toast } = useToast();

  const fetchMetrics = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingMetrics(true);
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      // Transform the data to include numeric ID for easier handling in UI
      const transformedData = data.map((item, index) => ({
        ...item,
        id: index + 1,
        originalId: item.id,
      }));
      
      setMetrics(transformedData);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to load metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingMetrics(false);
    }
  };

  useEffect(() => {
    if (currentProject) {
      fetchMetrics();
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
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="dashboard">Metrics Dashboard</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          {currentProject && !isLoadingMetrics && (
            <MetricsSection 
              metrics={metrics} 
              refreshData={fetchMetrics}
              projectId={currentProject.id}
            />
          )}
          
          {isLoadingMetrics && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading metrics...</span>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="charts" className="mt-6">
          {currentProject && !isLoadingMetrics && (
            <MetricCharts 
              metrics={metrics}
            />
          )}
          
          {isLoadingMetrics && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading metrics...</span>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MetricsPage;

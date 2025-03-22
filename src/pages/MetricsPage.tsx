
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const MetricsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [pivotTriggers, setPivotTriggers] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

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
      
      // For demo purposes, simulate pivot triggers that are close to being triggered
      const atRiskMetrics = transformedData.filter(m => 
        m.status === 'warning' || m.status === 'error'
      ).slice(0, 2);
      
      if (atRiskMetrics.length > 0) {
        setPivotTriggers(atRiskMetrics.map(metric => ({
          id: metric.id,
          metricName: metric.name,
          current: metric.current,
          target: metric.target,
          status: metric.status,
          triggerPoint: metric.status === 'error' ? 'Exceeded' : 'Approaching',
        })));
      }
      
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
      {pivotTriggers.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-yellow-800 flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5" />
              Pivot Triggers Approaching
            </CardTitle>
            <CardDescription className="text-yellow-700">
              {pivotTriggers.length} metrics are approaching or exceeding defined pivot trigger points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pivotTriggers.map(trigger => (
                <div key={trigger.id} className="flex justify-between items-center p-3 bg-white rounded-md border border-yellow-200">
                  <div>
                    <h4 className="font-medium">{trigger.metricName}</h4>
                    <p className="text-sm text-gray-600">
                      Current: {trigger.current} / Target: {trigger.target}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`px-2 py-1 rounded text-xs font-medium mr-3 ${
                      trigger.status === 'error' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {trigger.triggerPoint}
                    </span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate('/pivot')}
                    >
                      Review
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/pivot')}
              >
                View Pivot Planning
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
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

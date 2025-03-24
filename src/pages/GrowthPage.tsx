
import React, { useState } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, BarChart2, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import ScalingReadinessMetrics from '@/components/growth/ScalingReadinessMetrics';
import GrowthMetricsSection from '@/components/growth/GrowthMetricsSection';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

const GrowthPage = () => {
  const {
    currentProject,
    isLoading,
    error
  } = useProject();
  const [activeTab, setActiveTab] = useState('metrics');
  const { toast } = useToast();
  const location = useLocation();
  const {
    growthMetrics,
    growthChannels,
    growthExperiments,
    scalingMetrics,
    isLoading: isLoadingData,
    fetchGrowthData,
    fetchModelData
  } = useGrowthModels(currentProject?.id || '');
  
  React.useEffect(() => {
    const state = location.state as { tab?: string } | null;
    if (state?.tab) {
      setActiveTab(state.tab);
    }
  }, [location.state]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
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
        title="Growth & Scaling" 
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />} 
        description={
          <p>
            Track key metrics, optimize acquisition channels, and evaluate your startup's readiness to scale using Lean Startup principles.
          </p>
        }
        storageKey="growth-page"
      />
      
      {currentProject && (
        <div className="mt-6 space-y-6">
          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
                <TabsList className="w-full flex justify-start p-1">
                  <TabsTrigger value="metrics" className="flex items-center gap-2">
                    <BarChart2 className="h-4 w-4" />
                    <span>Metrics</span>
                  </TabsTrigger>
                  <TabsTrigger value="scaling_readiness" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Scaling Readiness</span>
                  </TabsTrigger>
                  <TabsTrigger value="channels" className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Channels</span>
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="flex items-center gap-2">
                    <Layers className="h-4 w-4" />
                    <span>Experiments</span>
                  </TabsTrigger>
                </TabsList>
                
                <div className="mt-6 px-4 pb-4">
                  <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                      <BreadcrumbItem>
                        <BreadcrumbLink href="#">Growth</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                      <BreadcrumbItem>
                        <BreadcrumbLink>
                          {activeTab === 'metrics' ? 'Growth Metrics' : 
                           activeTab === 'scaling_readiness' ? 'Scaling Readiness' :
                           activeTab === 'channels' ? 'Acquisition Channels' : 'Growth Experiments'}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  
                  <TabsContent value="metrics" className="mt-0">
                    <GrowthMetricsSection 
                      metrics={growthMetrics} 
                      projectId={currentProject.id} 
                      refreshData={() => fetchModelData(currentProject.id)} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="scaling_readiness" className="mt-0">
                    <ScalingReadinessMetrics 
                      projectId={currentProject.id}
                      refreshData={() => fetchModelData(currentProject.id)}
                      growthMetrics={growthMetrics}
                    />
                  </TabsContent>
                  
                  <TabsContent value="channels" className="mt-0">
                    <GrowthChannelsSection 
                      channels={growthChannels}
                      projectId={currentProject.id} 
                      refreshData={() => fetchModelData(currentProject.id)} 
                    />
                  </TabsContent>
                  
                  <TabsContent value="experiments" className="mt-0">
                    <GrowthExperimentsSection 
                      experiments={growthExperiments} 
                      metrics={growthMetrics}
                      projectId={currentProject.id} 
                      refreshData={() => fetchModelData(currentProject.id)} 
                    />
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
          
          {isLoadingData && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading growth data...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GrowthPage;

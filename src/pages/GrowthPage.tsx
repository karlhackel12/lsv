
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthModelSection from '@/components/growth/GrowthModelSection';
import GrowthMetricsSection from '@/components/growth/GrowthMetricsSection';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import GrowthTypesPanel from '@/components/growth/GrowthTypesPanel';
import ScalingReadinessSection from '@/components/growth/ScalingReadinessSection';
import { useGrowthModels } from '@/hooks/use-growth-models';

const GrowthPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [activeTab, setActiveTab] = useState('metrics');
  const [activePanelTab, setActivePanelTab] = useState('detail-view');
  const { toast } = useToast();
  const {
    growthModels,
    growthMetrics,
    growthChannels,
    growthExperiments,
    isLoading: isLoadingModels,
    getActiveModel,
    setActiveModel,
    fetchGrowthModels,
    fetchGrowthModelData
  } = useGrowthModels(currentProject?.id || '');

  const activeModel = getActiveModel();

  useEffect(() => {
    if (currentProject) {
      fetchGrowthModels();
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
      <PageIntroduction
        title="Growth Model & Scale Validation"
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              Develop and validate your growth model to scale your startup effectively. Track key metrics, experiment with channels, and optimize your growth strategy.
            </p>
            <ul className="list-disc pl-5 mt-2">
              <li><strong>Growth Framework:</strong> Structure your approach using proven models like AARRR (Pirate Metrics) or create your own</li>
              <li><strong>Growth Metrics:</strong> Define and track the key metrics that matter for your business's growth</li>
              <li><strong>Channels:</strong> Experiment with different acquisition channels and track their performance</li>
              <li><strong>Growth Experiments:</strong> Run and document experiments to improve key metrics</li>
            </ul>
            <p className="mt-2">
              As you validate your growth model, you'll identify the most effective channels, optimize your conversion funnel, and build a scalable approach to acquiring and retaining customers.
            </p>
          </>
        }
      />

      {currentProject && !isLoadingModels && (
        <>
          <GrowthModelSection 
            growthModels={growthModels}
            activeModel={activeModel}
            projectId={currentProject.id}
            refreshData={fetchGrowthModels}
            onModelChange={(model) => setActiveModel(model.id)}
          />
          
          {activeModel && (
            <div className="mt-8">
              <Tabs defaultValue={activePanelTab} value={activePanelTab} onValueChange={setActivePanelTab} className="w-full">
                <TabsList className="grid w-full max-w-md grid-cols-2">
                  <TabsTrigger value="detail-view">Detail View</TabsTrigger>
                  <TabsTrigger value="growth-types">Growth Types</TabsTrigger>
                </TabsList>
                
                <TabsContent value="detail-view" className="mt-6">
                  <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-3">
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                      <TabsTrigger value="channels">Channels</TabsTrigger>
                      <TabsTrigger value="experiments">Experiments</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="metrics" className="mt-6">
                      <GrowthMetricsSection
                        metrics={growthMetrics}
                        growthModel={activeModel}
                        projectId={currentProject.id}
                        refreshData={() => fetchGrowthModelData(activeModel.id)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="channels" className="mt-6">
                      <GrowthChannelsSection
                        channels={growthChannels}
                        growthModel={activeModel}
                        projectId={currentProject.id}
                        refreshData={() => fetchGrowthModelData(activeModel.id)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="experiments" className="mt-6">
                      <GrowthExperimentsSection
                        experiments={growthExperiments}
                        metrics={growthMetrics}
                        growthModel={activeModel}
                        projectId={currentProject.id}
                        refreshData={() => fetchGrowthModelData(activeModel.id)}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
                
                <TabsContent value="growth-types" className="mt-6">
                  <GrowthTypesPanel 
                    growthModel={activeModel}
                    projectId={currentProject.id}
                    metrics={growthMetrics}
                    channels={growthChannels}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="mt-10">
                <ScalingReadinessSection 
                  growthModel={activeModel}
                  projectId={currentProject.id}
                  metrics={growthMetrics}
                  channels={growthChannels}
                />
              </div>
            </div>
          )}
        </>
      )}
      
      {isLoadingModels && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading growth models...</span>
        </div>
      )}
    </div>
  );
};

export default GrowthPage;

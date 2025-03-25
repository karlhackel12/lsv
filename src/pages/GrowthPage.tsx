
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, Layers, ArrowRight, CheckCircle2, Lightbulb, GitFork, FlaskConical } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import ScalingReadinessChecklist from '@/components/growth/ScalingReadinessChecklist';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import PivotDecisionSection from '@/components/PivotDecisionSection';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';

const GrowthPage = () => {
  const {
    currentProject,
    isLoading,
    error
  } = useProject();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || 'scaling_readiness');
  const [defaultGrowthModelId, setDefaultGrowthModelId] = useState<string | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const {
    growthMetrics,
    growthChannels,
    growthExperiments,
    scalingMetrics,
    isLoading: isLoadingData,
    fetchGrowthData,
    fetchModelData
  } = useGrowthModels(currentProject?.id || '');
  
  // Fetch a default growth model ID when project loads
  useEffect(() => {
    const fetchDefaultGrowthModel = async () => {
      if (!currentProject?.id) return;
      
      try {
        const { data, error } = await supabase
          .from('growth_models')
          .select('id')
          .eq('project_id', currentProject.id)
          .order('created_at', { ascending: false })
          .limit(1);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          setDefaultGrowthModelId(data[0].id);
        } else {
          // Create a default growth model if none exists
          const { data: newModel, error: createError } = await supabase
            .from('growth_models')
            .insert({
              name: 'Default Growth Model',
              description: 'Automatically created growth model',
              framework: 'aarrr',
              project_id: currentProject.id,
              status: 'active'
            })
            .select();
            
          if (createError) throw createError;
          
          if (newModel && newModel.length > 0) {
            setDefaultGrowthModelId(newModel[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching or creating default growth model:', err);
        toast({
          title: 'Error',
          description: 'Could not set up a growth model. Some features may not work.',
          variant: 'destructive'
        });
      }
    };
    
    fetchDefaultGrowthModel();
  }, [currentProject?.id]);

  // Use URL parameter for active tab
  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    navigate(`/growth?tab=${value}`, { replace: true });
  };

  const navigateToGrowthExperiments = () => {
    navigate('/experiments?type=growth');
  };

  const handleAddScalingMetric = () => {
    navigate('/growth?tab=scaling_readiness', { state: { openForm: true } });
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
            Track acquisition channels, and evaluate your startup's readiness to scale using Lean Startup principles.
          </p>
        }
        storageKey="growth-page"
      />
      
      {currentProject && (
        <div className="mt-6 space-y-6">
          <ValidationPhaseIntro 
            phase="growth"
            onCreateNew={handleAddScalingMetric}
            createButtonText="Add Scaling Metric"
          />
          
          <PivotDecisionSection />
          
          <Card>
            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <TabsList className="w-full flex justify-start p-1">
                  <TabsTrigger value="scaling_readiness" className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Scaling Readiness</span>
                  </TabsTrigger>
                  <TabsTrigger value="channels" className="flex items-center gap-2">
                    <ArrowRight className="h-4 w-4" />
                    <span>Channels</span>
                  </TabsTrigger>
                  <TabsTrigger value="experiments" className="flex items-center gap-2">
                    <FlaskConical className="h-4 w-4" />
                    <span>Experiments</span>
                  </TabsTrigger>
                  <TabsTrigger value="pivot" className="flex items-center gap-2">
                    <GitFork className="h-4 w-4" />
                    <span>Pivot</span>
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
                          {activeTab === 'scaling_readiness' ? 'Scaling Readiness' :
                           activeTab === 'channels' ? 'Acquisition Channels' : 
                           activeTab === 'experiments' ? 'Growth Experiments' :
                           'Pivot Decision'}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    </BreadcrumbList>
                  </Breadcrumb>
                  
                  <TabsContent value="scaling_readiness" className="mt-0">
                    <ScalingReadinessChecklist 
                      projectId={currentProject.id}
                      refreshData={() => fetchModelData(currentProject.id)}
                      growthMetrics={growthMetrics}
                      growthExperiments={growthExperiments}
                      growthChannels={growthChannels}
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
                    <div className="space-y-6">
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 flex flex-col items-center text-center">
                        <FlaskConical className="h-12 w-12 text-blue-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Growth Experiments</h3>
                        <p className="text-gray-600 mb-6 max-w-lg">
                          Growth experiments help you optimize your key metrics and acquisition channels. 
                          They are now managed in the centralized experiments section.
                        </p>
                        <Button 
                          onClick={navigateToGrowthExperiments}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          Go to Growth Experiments
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="pivot" className="mt-0">
                    <div className="space-y-6">
                      <div className="text-center p-8">
                        <GitFork className="mx-auto h-12 w-12 text-orange-500 mb-4" />
                        <h3 className="text-xl font-bold mb-2">Pivot Decision Framework</h3>
                        <p className="text-gray-600 mb-6">
                          When your metrics indicate that your current approach isn't working, 
                          it may be time to consider a strategic pivot.
                        </p>
                        <Button 
                          onClick={() => navigate('/pivot')}
                          className="bg-orange-600 hover:bg-orange-700"
                        >
                          View Full Pivot Framework
                        </Button>
                      </div>
                    </div>
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

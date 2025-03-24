import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, CheckCircle2, Beaker, BarChart2, Target, ArrowRight } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthModelSection from '@/components/growth/GrowthModelSection';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import GrowthHypothesesSection from '@/components/growth/GrowthHypothesesSection';
import ScalingReadinessMetrics from '@/components/growth/ScalingReadinessMetrics';
import ScalingPlanManager from '@/components/growth/ScalingPlanManager';
import GrowthMetricsSection from '@/components/growth/GrowthMetricsSection';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';
import { Card, CardContent } from '@/components/ui/card';
import { useLocation } from 'react-router-dom';
import TabNavigation, { TabItem } from '@/components/TabNavigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { ScalingReadinessMetric } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

const GrowthPage = () => {
  const {
    currentProject,
    isLoading,
    error
  } = useProject();
  const [activeSection, setActiveSection] = useState('scaling_readiness');
  const { toast } = useToast();
  const location = useLocation();
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
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const activeModel = getActiveModel();
  
  const mainNavigationTabs: TabItem[] = [
    {
      id: 'scaling_readiness',
      label: 'Scaling Readiness',
      icon: CheckCircle2
    },
    {
      id: 'scaling_plan',
      label: 'Scaling Plan',
      icon: Target
    },
    {
      id: 'metrics',
      label: 'Growth Metrics',
      icon: BarChart2
    },
    {
      id: 'channels',
      label: 'Channels',
      icon: ArrowRight
    },
    {
      id: 'hypotheses',
      label: 'Hypotheses',
      icon: Beaker
    },
    {
      id: 'experiments',
      label: 'Experiments',
      icon: TrendingUp
    }
  ];
  
  useEffect(() => {
    if (currentProject) {
      fetchGrowthModels();
    }
  }, [currentProject]);
  
  useEffect(() => {
    if (activeModel) {
      fetchScalingMetrics();
    }
  }, [activeModel]);

  useEffect(() => {
    const state = location.state as {
      tab?: string;
      metricId?: string;
    } | null;
    
    if (state) {
      if (state.tab === 'metrics') {
        setActiveSection('metrics');
      } else if (state.tab === 'channels') {
        setActiveSection('channels');
      } else if (state.tab === 'hypotheses') {
        setActiveSection('hypotheses');
      } else if (state.tab === 'experiments') {
        setActiveSection('experiments');
      }
    }
  }, [location.state]);
  
  const fetchScalingMetrics = async () => {
    if (!currentProject || !activeModel) return;
    
    try {
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setScalingMetrics(data || []);
    } catch (err) {
      console.error('Error fetching scaling metrics:', err);
      toast({
        title: 'Error',
        description: 'Failed to fetch scaling metrics',
        variant: 'destructive',
      });
    }
  };

  const getBreadcrumb = () => {
    switch (activeSection) {
      case 'scaling_readiness':
        return 'Scaling Readiness';
      case 'scaling_plan':
        return 'Scaling Plan';
      case 'metrics':
        return 'Growth Metrics';
      case 'channels':
        return 'Acquisition Channels';
      case 'hypotheses':
        return 'Growth Hypotheses';
      case 'experiments':
        return 'Growth Experiments';
      default:
        return '';
    }
  };

  const handleNavigationChange = (sectionId: string) => {
    setActiveSection(sectionId);
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
        title="Scaling Readiness Assessment" 
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />} 
        description={<>
          <p>
            Assess and improve your startup's readiness to scale. Track key metrics,
            create action plans, and validate your growth model.
          </p>
        </>} 
      />
      
      {currentProject && !isLoadingModels && (
        <>
          <GrowthModelSection 
            growthModels={growthModels} 
            activeModel={activeModel} 
            projectId={currentProject.id} 
            refreshData={fetchGrowthModels} 
            onModelChange={model => setActiveModel(model.id)} 
          />
          
          {activeModel && (
            <div className="mt-8 space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <TabNavigation 
                    tabs={mainNavigationTabs} 
                    activeTab={activeSection} 
                    onChange={handleNavigationChange} 
                    className="p-1" 
                  />
                </CardContent>
              </Card>
              
              <div className="mb-6">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Growth</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink>{getBreadcrumb()}</BreadcrumbLink>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              
              {activeSection === 'scaling_readiness' && (
                <ScalingReadinessMetrics 
                  projectId={currentProject.id}
                  growthModel={activeModel}
                  refreshData={fetchScalingMetrics}
                />
              )}
              
              {activeSection === 'scaling_plan' && (
                <ScalingPlanManager
                  projectId={currentProject.id}
                  growthModel={activeModel}
                  metrics={scalingMetrics}
                  refreshData={fetchScalingMetrics}
                />
              )}
              
              {activeSection === 'metrics' && (
                <GrowthMetricsSection 
                  metrics={growthMetrics} 
                  growthModel={activeModel} 
                  projectId={currentProject.id} 
                  refreshData={() => fetchGrowthModelData(activeModel.id)} 
                />
              )}
              
              {activeSection === 'channels' && (
                <GrowthChannelsSection 
                  channels={growthChannels} 
                  growthModel={activeModel} 
                  projectId={currentProject.id} 
                  refreshData={() => fetchGrowthModelData(activeModel.id)} 
                />
              )}
              
              {activeSection === 'hypotheses' && (
                <GrowthHypothesesSection 
                  growthModel={activeModel} 
                  projectId={currentProject.id} 
                  metrics={growthMetrics} 
                  refreshData={() => fetchGrowthModelData(activeModel.id)} 
                />
              )}
              
              {activeSection === 'experiments' && (
                <GrowthExperimentsSection 
                  experiments={growthExperiments} 
                  metrics={growthMetrics} 
                  growthModel={activeModel} 
                  projectId={currentProject.id} 
                  refreshData={() => fetchGrowthModelData(activeModel.id)} 
                />
              )}
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-6 gap-4">
                {mainNavigationTabs.map(tab => {
                  const Icon = tab.icon;
                  const isActive = activeSection === tab.id;
                  if (tab.id === activeSection) return null;
                  return (
                    <Card 
                      key={tab.id} 
                      className={`cursor-pointer hover:border-blue-200 transition-all ${
                        isActive ? 'border-blue-400' : ''
                      }`}
                      onClick={() => setActiveSection(tab.id)}
                    >
                      <CardContent className="flex flex-col items-center justify-center py-6">
                        <Icon className="h-6 w-6 mb-2 text-gray-500" />
                        <span className="text-sm font-medium">{tab.label}</span>
                      </CardContent>
                    </Card>
                  );
                })}
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

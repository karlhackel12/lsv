import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, CheckCircle2, Beaker, BarChart2, Target, ArrowRight } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthModelSection from '@/components/growth/GrowthModelSection';
import GrowthMetricsSection from '@/components/growth/GrowthMetricsSection';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import GrowthHypothesesSection from '@/components/growth/GrowthHypothesesSection';
import GrowthTypesPanel from '@/components/growth/GrowthTypesPanel';
import ScalingReadinessSection from '@/components/growth/ScalingReadinessSection';
import { useGrowthModels } from '@/hooks/use-growth-models';
import { Card, CardContent } from '@/components/ui/card';
import ValidationStageCard from '@/components/growth/ValidationStageCard';
import { useLocation } from 'react-router-dom';
import TabNavigation, { TabItem } from '@/components/TabNavigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
const VALIDATION_STAGES = [{
  id: 'channel',
  title: 'Channel Validation',
  description: 'Test acquisition channels for your specific market, validate CAC targets, and measure conversion rates.',
  criteria: ['At least 3 channels tested', 'CAC below target for at least 1 channel', 'Conversion rates above minimum threshold']
}, {
  id: 'activation',
  title: 'Activation Optimization',
  description: 'Improve user onboarding completion rates, reduce time to first value, and increase early engagement.',
  criteria: ['Onboarding completion rate > 70%', 'Time to value < industry benchmark', 'Initial engagement metrics meet targets']
}, {
  id: 'monetization',
  title: 'Monetization Testing',
  description: 'Validate price points and willingness to pay, test various revenue models, and measure conversion rates.',
  criteria: ['Price sensitivity determined', 'Revenue model validated', 'Conversion rate at optimal price point validated']
}, {
  id: 'retention',
  title: 'Retention Engineering',
  description: 'Identify key retention drivers, test engagement loops, and measure cohort retention curves.',
  criteria: ['Core retention drivers identified', 'Engagement loops implemented', 'Cohort retention meets industry benchmarks']
}, {
  id: 'referral',
  title: 'Referral Engine Development',
  description: 'Implement user referral mechanisms, test viral loops, and measure viral coefficient.',
  criteria: ['Referral mechanism implemented', 'Viral loop tested', 'Viral coefficient measured']
}, {
  id: 'scaling',
  title: 'Scaling Readiness Assessment',
  description: 'Validate unit economics, verify retention metrics meet targets, and confirm multiple reliable acquisition channels.',
  criteria: ['LTV:CAC > 3:1', 'Retention metrics meet targets', 'Multiple reliable acquisition channels confirmed']
}];
const GrowthPage = () => {
  const {
    currentProject,
    isLoading,
    error
  } = useProject();
  const [activeSection, setActiveSection] = useState('metrics');
  const [validationTab, setValidationTab] = useState('stages');
  const {
    toast
  } = useToast();
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
  const activeModel = getActiveModel();
  const mainNavigationTabs: TabItem[] = [{
    id: 'metrics',
    label: 'Metrics',
    icon: BarChart2
  }, {
    id: 'channels',
    label: 'Channels',
    icon: Target
  }, {
    id: 'hypotheses',
    label: 'Hypotheses',
    icon: Beaker
  }, {
    id: 'experiments',
    label: 'Experiments',
    icon: TrendingUp
  }, {
    id: 'validation',
    label: 'Scaling Readiness',
    icon: CheckCircle2
  }];
  useEffect(() => {
    if (currentProject) {
      fetchGrowthModels();
    }
  }, [currentProject]);
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
  const getBreadcrumb = () => {
    switch (activeSection) {
      case 'metrics':
        return 'Growth Metrics';
      case 'channels':
        return 'Acquisition Channels';
      case 'hypotheses':
        return 'Growth Hypotheses';
      case 'experiments':
        return 'Growth Experiments';
      case 'validation':
        return 'Scaling Readiness';
      default:
        return '';
    }
  };
  const handleNavigationChange = (sectionId: string) => {
    setActiveSection(sectionId);
  };
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading project...</span>
      </div>;
  }
  if (error) {
    return <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>Error: {error instanceof Error ? error.message : 'Failed to load project'}</p>
        </div>
      </div>;
  }
  return <div className="p-6">
      <PageIntroduction title="Growth Model & Scale Validation" icon={<TrendingUp className="h-5 w-5 text-blue-500" />} description={<>
            <p>
              Develop and validate your growth model to scale your startup effectively.
              Follow these steps to build a scalable approach to acquiring and retaining customers.
            </p>
          </>} />
      
      {currentProject && !isLoadingModels && <>
          <GrowthModelSection growthModels={growthModels} activeModel={activeModel} projectId={currentProject.id} refreshData={fetchGrowthModels} onModelChange={model => setActiveModel(model.id)} />
          
          {activeModel && <div className="mt-8 space-y-6">
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <TabNavigation tabs={mainNavigationTabs} activeTab={activeSection} onChange={handleNavigationChange} className="p-1" />
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
              
              {activeSection === 'metrics' && <GrowthMetricsSection metrics={growthMetrics} growthModel={activeModel} projectId={currentProject.id} refreshData={() => fetchGrowthModelData(activeModel.id)} />}
              
              {activeSection === 'channels' && <GrowthChannelsSection channels={growthChannels} growthModel={activeModel} projectId={currentProject.id} refreshData={() => fetchGrowthModelData(activeModel.id)} />}
              
              {activeSection === 'hypotheses' && <GrowthHypothesesSection growthModel={activeModel} projectId={currentProject.id} metrics={growthMetrics} refreshData={() => fetchGrowthModelData(activeModel.id)} />}
              
              {activeSection === 'experiments' && <>
                  <GrowthExperimentsSection experiments={growthExperiments} metrics={growthMetrics} growthModel={activeModel} projectId={currentProject.id} refreshData={() => fetchGrowthModelData(activeModel.id)} />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Growth Types Overview</h3>
                    <GrowthTypesPanel growthModel={activeModel} projectId={currentProject.id} metrics={growthMetrics} channels={growthChannels} />
                  </div>
                </>}
              
              {activeSection === 'validation' && <>
                  <div className="flex flex-col gap-6">
                    <div className="space-y-6">
                      <h2 className="text-xl font-semibold">Scaling Readiness Assessment</h2>
                      
                      <p className="text-gray-600">
                        Track your progress through the key validation stages of the Lean Startup Growth Model.
                        Each stage must be validated before moving to the next.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {VALIDATION_STAGES.map(stage => <ValidationStageCard key={stage.id} stage={stage} model={activeModel} projectId={currentProject.id} />)}
                      </div>
                    </div>
                    
                    <div className="space-y-6 mt-8">
                      <h2 className="text-xl font-semibold">Growth Scaling Checklist</h2>
                      
                      <p className="text-gray-600 mb-4">
                        Review your scaling readiness to determine if your growth model is validated and ready for scaling.
                      </p>
                      
                      <ScalingReadinessSection growthModel={activeModel} projectId={currentProject.id} metrics={growthMetrics} channels={growthChannels} />
                    </div>
                  </div>
                </>}
              
              <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
                {mainNavigationTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeSection === tab.id;
            if (tab.id === activeSection) return null;
            return <Card key={tab.id} className={`cursor-pointer hover:border-blue-200 transition-all ${isActive ? 'border-blue-400' : ''}`} onClick={() => setActiveSection(tab.id)}>
                      
                    </Card>;
          })}
              </div>
            </div>}
        </>}
      
      {isLoadingModels && <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading growth models...</span>
        </div>}
    </div>;
};
export default GrowthPage;

import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import PageIntroduction from '@/components/PageIntroduction';
import GrowthModelSection from '@/components/growth/GrowthModelSection';
import GrowthMetricsSection from '@/components/growth/GrowthMetricsSection';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import GrowthTypesPanel from '@/components/growth/GrowthTypesPanel';
import ScalingReadinessSection from '@/components/growth/ScalingReadinessSection';
import { useGrowthModels } from '@/hooks/use-growth-models';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import StepJourney, { Step } from '@/components/StepJourney';

// Define the steps in the growth journey
const GROWTH_JOURNEY_STEPS: Step[] = [
  { 
    id: 'setup', 
    label: 'Define Channels & Metrics',
    description: 'Set up your growth metrics and acquisition channels'
  },
  { 
    id: 'experiments', 
    label: 'Define Experiments',
    description: 'Design experiments to test your growth hypotheses'
  },
  { 
    id: 'validation', 
    label: 'Scaling Checklist',
    description: 'Validate your growth model readiness'
  },
  { 
    id: 'followup', 
    label: 'Follow Up Actions',
    description: 'Plan next steps based on your findings'
  }
];

const GrowthPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [currentStep, setCurrentStep] = useState('setup');
  const [setupTab, setSetupTab] = useState('metrics');
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
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  useEffect(() => {
    if (currentProject) {
      fetchGrowthModels();
    }
  }, [currentProject]);

  // Helper to check if a step can be accessed
  const canAccessStep = (stepId: string) => {
    if (stepId === 'setup') return true;
    if (stepId === 'experiments') return growthMetrics.length > 0 && growthChannels.length > 0;
    if (stepId === 'validation') return growthExperiments.length > 0;
    if (stepId === 'followup') return true; // Always allow follow-up
    return false;
  };

  // Navigate to next step if possible
  const goToNextStep = () => {
    const currentIndex = GROWTH_JOURNEY_STEPS.findIndex(step => step.id === currentStep);
    if (currentIndex < GROWTH_JOURNEY_STEPS.length - 1) {
      const nextStep = GROWTH_JOURNEY_STEPS[currentIndex + 1].id;
      if (canAccessStep(nextStep)) {
        // Mark the current step as completed
        if (!completedSteps.includes(currentStep)) {
          setCompletedSteps([...completedSteps, currentStep]);
        }
        setCurrentStep(nextStep);
      } else {
        toast({
          title: "Can't proceed yet",
          description: "You need to complete the current step first.",
          variant: "destructive" // Fixed the type error by using a valid variant
        });
      }
    }
  };

  // Handle step change from the StepJourney component
  const handleStepChange = (stepId: string) => {
    if (canAccessStep(stepId)) {
      setCurrentStep(stepId);
    }
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
        title="Growth Model & Scale Validation"
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />}
        description={
          <>
            <p>
              Develop and validate your growth model to scale your startup effectively.
              Follow these steps to build a scalable approach to acquiring and retaining customers.
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
              <Card className="mb-6">
                <CardContent className="pt-6">
                  <StepJourney
                    steps={GROWTH_JOURNEY_STEPS}
                    currentStepId={currentStep}
                    onStepChange={handleStepChange}
                    completedStepIds={completedSteps}
                  />
                </CardContent>
              </Card>

              {/* Step 1: Setup - Define Channels & Metrics */}
              {currentStep === 'setup' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">1. Define Your Channels & Metrics</h2>
                    <Button 
                      onClick={goToNextStep} 
                      disabled={!canAccessStep('experiments')}
                      className="ml-auto"
                    >
                      Next Step
                    </Button>
                  </div>
                  
                  <Tabs defaultValue={setupTab} value={setupTab} onValueChange={setSetupTab} className="w-full">
                    <TabsList className="grid w-full max-w-md grid-cols-2">
                      <TabsTrigger value="metrics">Metrics</TabsTrigger>
                      <TabsTrigger value="channels">Channels</TabsTrigger>
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
                  </Tabs>
                </div>
              )}

              {/* Step 2: Define Experiments */}
              {currentStep === 'experiments' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">2. Define Experiments</h2>
                    <Button 
                      onClick={goToNextStep} 
                      disabled={!canAccessStep('validation')}
                      className="ml-auto"
                    >
                      Next Step
                    </Button>
                  </div>

                  <p className="text-gray-600">
                    Design experiments to test your growth hypotheses. Each experiment should target a specific metric
                    and have a clear expected outcome.
                  </p>
                  
                  <GrowthExperimentsSection
                    experiments={growthExperiments}
                    metrics={growthMetrics}
                    growthModel={activeModel}
                    projectId={currentProject.id}
                    refreshData={() => fetchGrowthModelData(activeModel.id)}
                  />
                  
                  <div className="mt-8">
                    <h3 className="text-lg font-medium mb-4">Growth Types Overview</h3>
                    <GrowthTypesPanel 
                      growthModel={activeModel}
                      projectId={currentProject.id}
                      metrics={growthMetrics}
                      channels={growthChannels}
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Scaling Checklist */}
              {currentStep === 'validation' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">3. Scaling Readiness Checklist</h2>
                    <Button 
                      onClick={goToNextStep} 
                      className="ml-auto"
                    >
                      Next Step
                    </Button>
                  </div>
                  
                  <p className="text-gray-600">
                    Review your scaling readiness to determine if your growth model is validated and ready for scaling.
                  </p>
                  
                  <ScalingReadinessSection 
                    growthModel={activeModel}
                    projectId={currentProject.id}
                    metrics={growthMetrics}
                    channels={growthChannels}
                  />
                </div>
              )}

              {/* Step 4: Follow Up Actions */}
              {currentStep === 'followup' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">4. Follow Up Actions</h2>
                  </div>
                  
                  <p className="text-gray-600">
                    Based on your growth model validation, here are the recommended next steps:
                  </p>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="text-lg font-medium mb-4">Recommended Actions</h3>
                      
                      <ul className="space-y-4">
                        {growthMetrics.filter(m => m.status === 'off-track').length > 0 && (
                          <li className="flex items-start">
                            <div className="mr-3 mt-0.5 bg-amber-100 text-amber-800 p-1 rounded">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Improve Off-Track Metrics</p>
                              <p className="text-gray-600 text-sm">
                                Focus on improving your {growthMetrics.filter(m => m.status === 'off-track').length} off-track metrics
                                through targeted experiments.
                              </p>
                            </div>
                          </li>
                        )}
                        
                        {growthChannels.filter(c => c.category === 'paid' && c.status === 'active').length > 0 && (
                          <li className="flex items-start">
                            <div className="mr-3 mt-0.5 bg-blue-100 text-blue-800 p-1 rounded">
                              <TrendingUp className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium">Optimize Paid Channels</p>
                              <p className="text-gray-600 text-sm">
                                Review and optimize your active paid channels to improve CAC and conversion rates.
                              </p>
                            </div>
                          </li>
                        )}
                        
                        <li className="flex items-start">
                          <div className="mr-3 mt-0.5 bg-green-100 text-green-800 p-1 rounded">
                            <TrendingUp className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium">Run More Experiments</p>
                            <p className="text-gray-600 text-sm">
                              Continue running experiments to validate your growth model and improve key metrics.
                            </p>
                          </div>
                        </li>
                      </ul>
                      
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium mb-4">Update Schedule</h3>
                        <p className="text-gray-600">
                          Set a regular cadence to update your growth metrics and review experiments.
                          Weekly updates are recommended during active experimentation.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
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

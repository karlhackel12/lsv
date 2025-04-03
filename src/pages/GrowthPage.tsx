import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, TrendingUp, ArrowRight, CheckCircle2, ArrowUpRight, 
  ArrowDownRight, Calendar, Users, DollarSign, LineChart,
  PlusCircle, Edit2, Trash2, Megaphone, FlaskConical,
  CheckCircle, BarChart2, PieChart, ChartBar
} from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import ScalingReadinessMetrics from '@/components/growth/ScalingReadinessMetrics';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import { useNavigate } from 'react-router-dom';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';
import GrowthMetricsPanel from '@/components/dashboard/GrowthMetricsPanel';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import InfoTooltip from '@/components/InfoTooltip';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';
import { Project } from '@/types/database';

interface GrowthTracking {
  channels_identified: boolean;
  growth_experiments_setup: boolean;
  funnel_optimized: boolean;
  repeatable_growth: boolean;
}

const GrowthPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [showAddScalingMetricForm, setShowAddScalingMetricForm] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const {
    growthMetrics, 
    growthChannels, 
    growthExperiments, 
    scalingMetrics,
    activeModelId, 
    isLoading: isLoadingData,
    fetchGrowthData,
    fetchModelData
  } = useGrowthModels(currentProject?.id || '');
  
  const [growthTracking, setGrowthTracking] = useState<GrowthTracking>({
    channels_identified: false,
    growth_experiments_setup: false,
    funnel_optimized: false,
    repeatable_growth: false
  });
  
  useEffect(() => {
    if (currentProject?.id) {
      fetchGrowthData();
      fetchGrowthTrackingData();
    }
  }, [currentProject?.id]);

  const fetchGrowthTrackingData = async () => {
    if (!currentProject) return;
    
    try {
      // Fetch project growth tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
      
      if (projectError) {
        console.error('Error fetching project data:', projectError);
        return;
      }
      
      if (projectData) {
        // Use type assertion to safely access growth_tracking
        const trackingData = (projectData as any).growth_tracking as GrowthTracking | null;
        if (trackingData) {
          setGrowthTracking(trackingData);
        }
      }
    } catch (err) {
      console.error('Error fetching growth tracking data:', err);
    }
  };
  
  // Update growth tracking state
  const updateGrowthTracking = async (field: keyof GrowthTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...growthTracking, [field]: value };
      
      // Optimistically update the UI
      setGrowthTracking(updatedTracking);
      
      // Update the database with type assertion to Project interface
      const { error } = await supabase
        .from('projects')
        .update({ 
          growth_tracking: updatedTracking 
        } as Partial<Project>)
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Growth Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating growth tracking:', err);
      
      // Revert the local state change on error
      setGrowthTracking(growthTracking);
    }
  };

  const handleAddScalingMetric = () => {
    setShowAddScalingMetricForm(true);
  };

  const handleViewAllMetrics = () => {
    navigate('/metrics');
  };
  
  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <Megaphone />,
      title: 'Test Multiple Channels',
      description: 'Try different acquisition channels to find what works best for your customers.'
    },
    {
      icon: <FlaskConical />,
      title: 'Run Growth Experiments',
      description: 'Create structured experiments to optimize your growth funnel.'
    },
    {
      icon: <LineChart />,
      title: 'Measure Economics',
      description: 'Track Customer Acquisition Cost (CAC) and Customer Lifetime Value (LTV).'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'channels_identified',
      label: 'Growth Channels Identified',
      description: 'Automatically tracked when adding growth channels',
      icon: <Megaphone />,
      checked: growthTracking.channels_identified,
      disabled: true
    },
    {
      key: 'growth_experiments_setup',
      label: 'Growth Experiments Setup',
      description: 'Toggle when you\'ve set up experiments to test acquisition channels',
      icon: <FlaskConical />,
      checked: growthTracking.growth_experiments_setup,
      onCheckedChange: (checked) => updateGrowthTracking('growth_experiments_setup', checked)
    },
    {
      key: 'funnel_optimized',
      label: 'Conversion Funnel Optimized',
      description: 'Toggle when you\'ve made improvements to your conversion funnel',
      icon: <LineChart />,
      checked: growthTracking.funnel_optimized,
      onCheckedChange: (checked) => updateGrowthTracking('funnel_optimized', checked)
    },
    {
      key: 'repeatable_growth',
      label: 'Repeatable, Sustainable Growth',
      description: 'Toggle when you\'ve established consistent growth mechanisms',
      icon: <TrendingUp />,
      checked: growthTracking.repeatable_growth,
      onCheckedChange: (checked) => updateGrowthTracking('repeatable_growth', checked)
    }
  ];

  const renderPivotCTA = () => {
    // Check if any metrics are at risk or failing
    const hasMetricsAtRisk = growthMetrics.some(m => m.status === 'off-track' || m.status === 'at-risk');
    
    if (hasMetricsAtRisk) {
      return (
        <Card className="mt-6 bg-red-50 border-red-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-red-700">Warning: Growth Metrics at Risk</h3>
                <p className="text-sm text-red-600 mt-1">
                  Some of your metrics are not on track. You might need to consider a pivot in your strategy.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/pivot')}
                className="bg-red-600 hover:bg-red-700 text-white whitespace-nowrap"
              >
                Evaluate Pivot Options
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
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
    <div className="space-y-6">
      <PageIntroduction 
        title="Growth & Scaling" 
        icon={<TrendingUp className="h-5 w-5 text-indigo-500" />} 
        description="Track acquisition channels and metrics to evaluate your startup's readiness to scale."
        showDescription={false}
      />
      
      {renderPivotCTA()}
      
      <BestPracticesCard 
        title="Best Practices for Growth Strategy"
        color="indigo"
        tooltip="These practices help you develop and optimize your growth strategy effectively."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Growth Validation Checklist"
        color="indigo"
        items={checklistItems}
      />
      
      {/* Add ValidationPhaseIntro for consistency */}
      <ValidationPhaseIntro 
        phase="growth" 
        onCreateNew={() => navigate('/metrics?create=true')}
        createButtonText="Add Growth Metric"
      />
      
      {currentProject && (
        <div className="space-y-6">
          {/* Analytics & Functional Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Acquisition Channels */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <Megaphone className="h-5 w-5 mr-2 text-blue-500" />
                  Acquisition Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {currentProject && (
                  <GrowthChannelsSection 
                    channels={growthChannels}
                    projectId={currentProject.id} 
                    refreshData={() => fetchModelData(currentProject.id)} 
                  />
                )}
              </CardContent>
            </Card>
            
            {/* Growth Experiments */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xl flex items-center">
                  <FlaskConical className="h-5 w-5 mr-2 text-yellow-500" />
                  Growth Experiments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {activeModelId && currentProject && (
                  <GrowthExperimentsSection
                    projectId={currentProject.id}
                    growthModelId={activeModelId}
                    growthModel={{
                      id: activeModelId,
                      name: 'Default Growth Model',
                      description: '',
                      framework: 'aarrr',
                      status: 'active',
                      project_id: currentProject.id,
                      created_at: '',
                      updated_at: '',
                      originalId: activeModelId
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>
          
          {/* Metrics Dashboard */}
          <Card>
            <CardHeader className="pb-2 flex flex-row justify-between items-center">
              <CardTitle className="text-xl flex items-center">
                <LineChart className="h-5 w-5 mr-2 text-green-500" />
                Growth Metrics Dashboard
              </CardTitle>
              <Button 
                onClick={handleViewAllMetrics}
                variant="outline"
                className="flex items-center gap-2"
              >
                View All Metrics
                <ArrowRight className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6">
              <GrowthMetricsPanel />
            </CardContent>
          </Card>
          
          {/* Scaling Readiness Section */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500" />
                Scaling Readiness
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              {currentProject && (
                <ScalingReadinessMetrics 
                  projectId={currentProject.id} 
                  refreshData={() => fetchModelData(currentProject.id)} 
                  growthMetrics={growthMetrics}
                  isFormOpen={showAddScalingMetricForm}
                  onFormClose={() => setShowAddScalingMetricForm(false)}
                />
              )}
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

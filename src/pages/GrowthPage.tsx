
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { Loader2, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import ScalingReadinessMetrics from '@/components/growth/ScalingReadinessMetrics';
import { useNavigate } from 'react-router-dom';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';

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
    isLoading: isLoadingData,
    fetchGrowthData,
    fetchModelData
  } = useGrowthModels(currentProject?.id || '');
  
  useEffect(() => {
    if (currentProject?.id) {
      fetchGrowthData();
    }
  }, [currentProject?.id]);

  const handleAddScalingMetric = () => {
    setShowAddScalingMetricForm(true);
  };

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
    <div className="p-6">
      <PageIntroduction 
        title="Growth & Scaling" 
        icon={<TrendingUp className="h-5 w-5 text-blue-500" />} 
        description={
          <p>
            Track acquisition channels and metrics to evaluate your startup's readiness to scale.
          </p>
        }
        storageKey="growth-page"
      />
      
      {renderPivotCTA()}
      
      {currentProject && (
        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Acquisition Channels Card */}
            <Card>
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-lg flex items-center">
                  <ArrowRight className="h-5 w-5 mr-2 text-blue-500" />
                  Acquisition Channels
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <GrowthChannelsSection 
                  channels={growthChannels}
                  projectId={currentProject.id} 
                  refreshData={() => fetchModelData(currentProject.id)} 
                />
              </CardContent>
            </Card>
            
            {/* Growth Metrics Card */}
            <Card>
              <CardHeader className="bg-green-50">
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Track key metrics related to your product's growth and market performance.
                  </p>
                  <Button 
                    onClick={() => navigate('/metrics')} 
                    className="w-full"
                  >
                    View All Metrics
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Scaling Readiness Card */}
            <Card>
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-lg flex items-center">
                  <CheckCircle2 className="h-5 w-5 mr-2 text-purple-500" />
                  Scaling Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScalingReadinessMetrics 
                  projectId={currentProject.id} 
                  refreshData={() => fetchModelData(currentProject.id)} 
                  growthMetrics={growthMetrics}
                  isFormOpen={showAddScalingMetricForm}
                  onFormClose={() => setShowAddScalingMetricForm(false)}
                />
              </CardContent>
            </Card>
          </div>
          
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

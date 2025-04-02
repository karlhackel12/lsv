
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { useToast } from '@/hooks/use-toast';
import { 
  Loader2, TrendingUp, ArrowRight, CheckCircle2, ArrowUpRight, 
  ArrowDownRight, Calendar, Users, DollarSign, LineChart,
  PlusCircle, Edit2, Trash2, Megaphone, FlaskConical 
} from 'lucide-react';
import PageIntroduction from '@/components/PageIntroduction';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import GrowthChannelsSection from '@/components/growth/GrowthChannelsSection';
import ScalingReadinessMetrics from '@/components/growth/ScalingReadinessMetrics';
import GrowthExperimentsSection from '@/components/growth/GrowthExperimentsSection';
import { useNavigate } from 'react-router-dom';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  progress: number;
  progressColor: 'success' | 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive',
  progress,
  progressColor,
  icon
}) => {
  return (
    <Card className="rounded-lg border shadow">
      <CardContent className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-500">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          {icon}
        </div>
        <Progress
          value={progress}
          className="h-2 bg-gray-200"
          indicatorClassName={`h-2 ${
            progressColor === 'success' ? 'bg-green-600' :
            progressColor === 'warning' ? 'bg-yellow-500' :
            progressColor === 'error' ? 'bg-red-600' :
            'bg-blue-600'
          }`}
        />
      </CardContent>
    </Card>
  );
};

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

  // Calculate metrics for cards
  const userMetric = growthMetrics.find(m => m.category === 'acquisition') || {
    name: 'User Acquisition',
    current_value: 1247,
    status: 'on-track'
  };

  const retentionMetric = growthMetrics.find(m => m.category === 'retention') || {
    name: 'Retention Rate',
    current_value: 68,
    status: 'at-risk'
  };

  const feedbackMetric = growthMetrics.find(m => m.category === 'satisfaction') || {
    name: 'Customer Feedback',
    current_value: 4.8,
    status: 'on-track'
  };

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
          {/* Metrics Overview Cards */}
          <h2 className="text-3xl font-bold tracking-tight text-gray-800">Growth Metrics Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            <MetricCard 
              title="User Acquisition" 
              value={userMetric.current_value}
              change="+12.5%" 
              changeType="positive"
              progress={75}
              progressColor="success"
              icon={<Users className="h-8 w-8 text-green-500" />}
            />
            <MetricCard 
              title="Retention Rate" 
              value={`${retentionMetric.current_value}%`}
              change="-2.3%" 
              changeType="negative"
              progress={68}
              progressColor="warning"
              icon={<LineChart className="h-8 w-8 text-yellow-500" />}
            />
            <Card className="rounded-lg border shadow">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500">Customer Feedback</p>
                    <h3 className="text-2xl font-bold">{feedbackMetric.current_value}/5.0</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <ArrowUpRight className="h-3 w-3 mr-1 inline" />
                    +0.3
                  </Badge>
                </div>
                <div className="flex items-center mt-4">
                  {[1, 2, 3, 4].map((star) => (
                    <svg
                      key={star}
                      className="text-yellow-300 w-5 h-5 ms-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 22 20"
                    >
                      <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                    </svg>
                  ))}
                  <svg
                    className="w-5 h-5 text-gray-300 ms-1"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="currentColor"
                    viewBox="0 0 22 20"
                  >
                    <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z" />
                  </svg>
                </div>
              </CardContent>
            </Card>
          </div>
          
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
          
          {/* Scaling Readiness Section */}
          <Card>
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-lg flex items-center">
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

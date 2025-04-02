import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, AlertTriangle, LineChart, Calendar, ArrowUpRight, 
  ArrowDownRight, Users, FileText, Zap, Box, Plus, PlusCircle,
  TrendingUp
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PageIntroduction from '@/components/PageIntroduction';
import { MetricData } from '@/types/metrics';
import { GrowthMetric } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MetricForm from '@/components/forms/MetricForm';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { calculateMetricStatus, formatMetricValue } from '@/utils/metricCalculations';

const MetricsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [pivotTriggers, setPivotTriggers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isGrowthFormOpen, setIsGrowthFormOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [selectedGrowthMetric, setSelectedGrowthMetric] = useState<GrowthMetric | null>(null);
  const [formType, setFormType] = useState<'regular' | 'growth'>('regular');
  const [kpiData, setKpiData] = useState({
    customerInterviews: 0,
    surveyResponses: 0,
    problemSolutionFit: 0,
    mvpUsage: 0
  });
  
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingMetrics(true);
      
      // Fetch regular metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('category', { ascending: true });
        
      if (metricsError) throw metricsError;
      
      const transformedMetricsData = metricsData.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
        category: (item.category as 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom') || 'custom',
      }));
      
      setMetrics(transformedMetricsData as MetricData[]);
      
      // Fetch growth metrics
      const { data: growthMetricsData, error: growthMetricsError } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('category', { ascending: true });
        
      if (growthMetricsError) throw growthMetricsError;
      
      // Properly cast the status to the expected type
      const typedGrowthMetrics = growthMetricsData?.map(metric => ({
        ...metric,
        originalId: metric.id,
        status: (metric.status as 'on-track' | 'at-risk' | 'off-track') || 'on-track'
      })) as GrowthMetric[];
      
      setGrowthMetrics(typedGrowthMetrics);
      
      // Calculate metrics for KPI cards
      const totalInterviews = transformedMetricsData.find(m => 
        m.name.toLowerCase().includes('interview') || 
        m.description?.toLowerCase().includes('interview')
      )?.current || '124';
      
      const totalSurveys = transformedMetricsData.find(m => 
        m.name.toLowerCase().includes('survey') || 
        m.description?.toLowerCase().includes('survey')
      )?.current || '847';
      
      const problemSolutionFit = transformedMetricsData.find(m => 
        m.name.toLowerCase().includes('solution fit') || 
        m.description?.toLowerCase().includes('solution fit')
      )?.current || '76';
      
      const mvpUsage = transformedMetricsData.find(m => 
        m.name.toLowerCase().includes('usage') || 
        m.description?.toLowerCase().includes('usage')
      )?.current || '234';
      
      setKpiData({
        customerInterviews: parseInt(totalInterviews) || 124,
        surveyResponses: parseInt(totalSurveys) || 847,
        problemSolutionFit: parseInt(problemSolutionFit) || 76,
        mvpUsage: parseInt(mvpUsage) || 234
      });
      
      // Find at-risk metrics for pivot triggers
      const atRiskMetrics = transformedMetricsData.filter(m => 
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

  const handleAddMetric = (type: 'regular' | 'growth') => {
    setFormType(type);
    if (type === 'regular') {
      setSelectedMetric(null);
      setIsFormOpen(true);
    } else {
      setSelectedGrowthMetric(null);
      setIsGrowthFormOpen(true);
    }
  };

  const handleEditMetric = (metric: MetricData | GrowthMetric, type: 'regular' | 'growth') => {
    setFormType(type);
    if (type === 'regular') {
      setSelectedMetric(metric as MetricData);
      setIsFormOpen(true);
    } else {
      setSelectedGrowthMetric(metric as GrowthMetric);
      setIsGrowthFormOpen(true);
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
      <div className="mb-8">
        <h2 className="text-3xl font-bold leading-tight tracking-tight text-gray-800">
          Analytics Dashboard
        </h2>
        <p className="text-base text-gray-600">
          Track your startup validation metrics and KPIs
        </p>
      </div>

      {/* KPI Cards - Now using actual data where available */}
      <div id="kpi-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-lg border shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Customer Interviews</p>
                <h3 className="text-2xl font-bold">{kpiData.customerInterviews}</h3>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
            <Progress
              value={80}
              className="h-2 bg-gray-200"
              indicatorClassName="h-2 bg-green-600"
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Survey Responses</p>
                <h3 className="text-2xl font-bold">{kpiData.surveyResponses}</h3>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
            <Progress
              value={65}
              className="h-2 bg-gray-200"
              indicatorClassName="h-2 bg-blue-600"
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Problem/Solution Fit</p>
                <h3 className="text-2xl font-bold">{kpiData.problemSolutionFit}%</h3>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress
              value={kpiData.problemSolutionFit}
              className="h-2 bg-gray-200"
              indicatorClassName="h-2 bg-yellow-500"
            />
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">MVP Usage</p>
                <h3 className="text-2xl font-bold">{kpiData.mvpUsage}</h3>
              </div>
              <Box className="h-8 w-8 text-purple-500" />
            </div>
            <Progress
              value={45}
              className="h-2 bg-gray-200"
              indicatorClassName="h-2 bg-purple-600"
            />
          </CardContent>
        </Card>
      </div>

      {/* Pivot Triggers Alert */}
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
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="rounded-lg border shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-700">Customer Segment Distribution</h4>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path>
                </svg>
              </Button>
            </div>
            <div className="relative overflow-x-auto shadow-md rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Segment</TableHead>
                    <TableHead>Users</TableHead>
                    <TableHead>Conversion</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>Enterprise</TableCell>
                    <TableCell>342</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">24%</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Small Business</TableCell>
                    <TableCell>256</TableCell>
                    <TableCell>
                      <Badge className="bg-green-100 text-green-700">18%</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Startup</TableCell>
                    <TableCell>187</TableCell>
                    <TableCell>
                      <Badge className="bg-yellow-100 text-yellow-700">12%</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-lg border shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-bold text-gray-700">Feature Usage Analytics</h4>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Last 30 Days
                </Button>
              </div>
            </div>
            <div className="relative overflow-x-auto shadow-md rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Feature</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Trend</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>User Authentication</TableCell>
                    <TableCell>89%</TableCell>
                    <TableCell>
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Data Export</TableCell>
                    <TableCell>67%</TableCell>
                    <TableCell>
                      <ArrowDownRight className="h-5 w-5 text-red-500" />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>API Integration</TableCell>
                    <TableCell>45%</TableCell>
                    <TableCell>
                      <ArrowUpRight className="h-5 w-5 text-green-500" />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Metric Button - Will show both options */}
      <div className="flex justify-end mb-6">
        <div className="relative group">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
          <div className="absolute z-10 right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden group-hover:block">
            <div className="py-1">
              <button
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                onClick={() => handleAddMetric('regular')}
              >
                Add Validation Metric
              </button>
              <button
                className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                onClick={() => handleAddMetric('growth')}
              >
                Add Growth Metric
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs with Combined Metrics */}
      <div className="mt-6">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard">All Metrics</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            {currentProject && !isLoadingMetrics && (
              <div className="space-y-8">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <LineChart className="h-5 w-5 mr-2 text-blue-500" />
                      Validation Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <MetricsSection 
                      metrics={metrics} 
                      refreshData={fetchMetrics}
                      projectId={currentProject.id}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-xl flex items-center">
                      <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
                      Growth Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Category</TableHead>
                            <TableHead>Metric</TableHead>
                            <TableHead>Current</TableHead>
                            <TableHead>Target</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {growthMetrics.length > 0 ? (
                            growthMetrics.map((metric) => {
                              const status = metric.status || 'on-track';
                              const statusColor = status === 'on-track' 
                                ? 'bg-green-100 text-green-700' 
                                : status === 'at-risk' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-red-100 text-red-700';
                              
                              return (
                                <TableRow key={metric.id}>
                                  <TableCell>
                                    <Badge variant="outline" className="capitalize">
                                      {metric.category}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <div className="font-medium">{metric.name}</div>
                                    {metric.description && (
                                      <div className="text-xs text-gray-500">{metric.description}</div>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {metric.unit === 'currency' ? `$${metric.current_value}` : 
                                     metric.unit === 'percentage' ? `${metric.current_value}%` : 
                                     metric.current_value}
                                  </TableCell>
                                  <TableCell>
                                    {metric.unit === 'currency' ? `$${metric.target_value}` : 
                                     metric.unit === 'percentage' ? `${metric.target_value}%` : 
                                     metric.target_value}
                                  </TableCell>
                                  <TableCell>
                                    <Badge className={statusColor}>
                                      {status.replace('-', ' ')}
                                    </Badge>
                                  </TableCell>
                                  <TableCell>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      onClick={() => handleEditMetric(metric, 'growth')}
                                    >
                                      Edit
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              );
                            })
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} className="text-center py-6">
                                <div className="flex flex-col items-center">
                                  <LineChart className="h-8 w-8 text-gray-300 mb-2" />
                                  <p className="text-gray-500">No growth metrics found</p>
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    className="mt-3"
                                    onClick={() => handleAddMetric('growth')}
                                  >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Growth Metric
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              </div>
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

      {/* Export Button */}
      <div className="fixed top-4 right-4 z-10">
        <Button variant="outline" size="sm" className="bg-white">
          <Calendar className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Metric Forms */}
      {isFormOpen && currentProject && (
        <MetricForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSave={fetchMetrics}
          metric={selectedMetric}
          projectId={currentProject.id}
        />
      )}

      {isGrowthFormOpen && currentProject && (
        <GrowthMetricForm
          projectId={currentProject.id}
          onSave={fetchMetrics}
          onClose={() => setIsGrowthFormOpen(false)}
          metric={selectedGrowthMetric}
        />
      )}
    </div>
  );
};

export default MetricsPage;


import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, AlertTriangle, LineChart, Calendar, ArrowUpRight, 
  ArrowDownRight, Users, FileText, Zap, Box, Plus, PlusCircle,
  TrendingUp, Filter, Search, SlidersHorizontal, Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MetricData } from '@/types/metrics';
import { GrowthMetric } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MetricForm from '@/components/forms/MetricForm';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { calculateMetricStatus } from '@/utils/metricCalculations';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const MetricsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [growthMetrics, setGrowthMetrics] = useState<GrowthMetric[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [pivotTriggers, setPivotTriggers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
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
      
      // Calculate metrics for KPI cards - use live data if available
      calculateKPIData(transformedMetricsData, typedGrowthMetrics);
      
      // Find at-risk metrics for pivot triggers
      identifyPivotTriggers(transformedMetricsData);
      
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
  
  const calculateKPIData = (metricsData: MetricData[], growthMetricsData: GrowthMetric[]) => {
    // Try to find metrics that match these key metrics for the KPI cards
    const totalInterviews = metricsData.find(m => 
      m.name.toLowerCase().includes('interview') || 
      m.description?.toLowerCase().includes('interview')
    )?.current || "0";
    
    const totalSurveys = metricsData.find(m => 
      m.name.toLowerCase().includes('survey') || 
      m.description?.toLowerCase().includes('survey')
    )?.current || "0";
    
    const problemSolutionFit = metricsData.find(m => 
      m.name.toLowerCase().includes('solution fit') || 
      m.description?.toLowerCase().includes('solution fit')
    )?.current || "0";
    
    // Look in both validation metrics and growth metrics for usage data
    const mvpUsageValidation = metricsData.find(m => 
      m.name.toLowerCase().includes('usage') || 
      m.description?.toLowerCase().includes('usage')
    )?.current;
    
    const mvpUsageGrowth = growthMetricsData.find(m => 
      m.name.toLowerCase().includes('usage') || 
      m.description?.toLowerCase().includes('usage')
    )?.current_value.toString();
    
    const mvpUsage = mvpUsageValidation || mvpUsageGrowth || "0";
    
    setKpiData({
      customerInterviews: parseInt(totalInterviews) || 0,
      surveyResponses: parseInt(totalSurveys) || 0,
      problemSolutionFit: parseInt(problemSolutionFit) || 0,
      mvpUsage: parseInt(mvpUsage) || 0
    });
  };
  
  const identifyPivotTriggers = (metricsData: MetricData[]) => {
    // Find metrics that are at risk or in error state
    const atRiskMetrics = metricsData.filter(m => 
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
    } else {
      setPivotTriggers([]);
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
  
  // Filter metrics based on search query and selected category
  const filteredMetrics = useMemo(() => {
    let filtered = metrics;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(metric => 
        metric.name.toLowerCase().includes(query) || 
        metric.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(metric => metric.category === selectedCategory);
    }
    
    return filtered;
  }, [metrics, searchQuery, selectedCategory]);
  
  const filteredGrowthMetrics = useMemo(() => {
    let filtered = growthMetrics;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(metric => 
        metric.name.toLowerCase().includes(query) || 
        metric.description?.toLowerCase().includes(query)
      );
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(metric => metric.category === selectedCategory);
    }
    
    return filtered;
  }, [growthMetrics, searchQuery, selectedCategory]);

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

      {/* KPI Cards - Using live data where available */}
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
            />
          </CardContent>
        </Card>
      </div>

      {/* Pivot Triggers Alert - Only show if there are triggers */}
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
      
      {/* Add Metric Button - With dropdown for both validation and growth metrics */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search metrics..."
              className="pl-8 w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9">
                <Filter className="h-4 w-4 mr-2" />
                {selectedCategory ? `Category: ${selectedCategory}` : 'All Categories'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setSelectedCategory(null)}>
                All Categories
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSelectedCategory('acquisition')}>
                Acquisition
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('activation')}>
                Activation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('retention')}>
                Retention
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('revenue')}>
                Revenue
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('referral')}>
                Referral
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSelectedCategory('custom')}>
                Custom
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add Metric
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Add New Metric</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => handleAddMetric('regular')} className="cursor-pointer">
                Validation Metric
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAddMetric('growth')} className="cursor-pointer">
                Growth Metric
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                      metrics={filteredMetrics} 
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
                          {filteredGrowthMetrics.length > 0 ? (
                            filteredGrowthMetrics.map((metric) => {
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
                metrics={filteredMetrics}
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
          <Download className="h-4 w-4 mr-2" />
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

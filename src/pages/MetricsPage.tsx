
import React, { useState, useEffect } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertTriangle, LineChart, Calendar, ArrowUpRight, ArrowDownRight, Users, FileText, Zap, Cube } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import PageIntroduction from '@/components/PageIntroduction';
import { MetricData } from '@/types/metrics';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const MetricsPage = () => {
  const { currentProject, isLoading, error } = useProject();
  const [metrics, setMetrics] = useState<MetricData[]>([]);
  const [isLoadingMetrics, setIsLoadingMetrics] = useState(true);
  const [pivotTriggers, setPivotTriggers] = useState<any[]>([]);
  const { toast } = useToast();
  const navigate = useNavigate();

  const fetchMetrics = async () => {
    if (!currentProject) return;
    
    try {
      setIsLoadingMetrics(true);
      const { data, error } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', currentProject.id)
        .order('category', { ascending: true });
        
      if (error) throw error;
      
      const transformedData = data.map((item) => ({
        ...item,
        id: item.id,
        originalId: item.id,
        category: (item.category as 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom') || 'custom',
      }));
      
      setMetrics(transformedData as MetricData[]);
      
      const atRiskMetrics = transformedData.filter(m => 
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

      {/* KPI Cards */}
      <div id="kpi-cards" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="rounded-lg border shadow">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500">Customer Interviews</p>
                <h3 className="text-2xl font-bold">124</h3>
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
                <h3 className="text-2xl font-bold">847</h3>
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
                <h3 className="text-2xl font-bold">76%</h3>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
            <Progress
              value={76}
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
                <h3 className="text-2xl font-bold">234</h3>
              </div>
              <Cube className="h-8 w-8 text-purple-500" />
            </div>
            <Progress
              value={45}
              className="h-2 bg-gray-200"
              indicatorClassName="h-2 bg-purple-600"
            />
          </CardContent>
        </Card>
      </div>

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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

      {/* Original Tabs Content - Hidden by Default */}
      <div className="hidden mt-6">
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="dashboard">Metrics Dashboard</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="dashboard" className="mt-6">
            {currentProject && !isLoadingMetrics && (
              <MetricsSection 
                metrics={metrics} 
                refreshData={fetchMetrics}
                projectId={currentProject.id}
              />
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

      {/* Export Button at the top right */}
      <div className="fixed top-4 right-4 z-10">
        <Button variant="outline" size="sm" className="bg-white">
          <Calendar className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>
    </div>
  );
};

export default MetricsPage;

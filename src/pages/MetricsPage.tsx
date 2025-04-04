import React, { useState, useEffect, useMemo } from 'react';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { 
  Loader2, AlertTriangle, LineChart, Calendar, ArrowUpRight, 
  ArrowDownRight, Users, FileText, Zap, Box, Plus, PlusCircle,
  TrendingUp, Filter, Search, SlidersHorizontal, Download,
  CheckCircle, Database, BarChart2, BrainCircuit
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MetricsSection from '@/components/MetricsSection';
import MetricCharts from '@/components/MetricCharts';
import EnhancedMetricsChart from '@/components/metrics/EnhancedMetricsChart';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { MetricData } from '@/types/metrics';
import { GrowthMetric, Project } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import MetricForm from '@/components/forms/MetricForm';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { calculateMetricStatus, getDefaultMetricConfig } from '@/utils/metricCalculations';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import PageIntroduction from '@/components/PageIntroduction';
import ValidationPhaseIntro from '@/components/ValidationPhaseIntro';
import InfoTooltip from '@/components/InfoTooltip';
import BestPracticesCard, { BestPractice } from '@/components/ui/best-practices-card';
import ChecklistCard, { ChecklistItem } from '@/components/ui/checklist-card';

interface MetricsTracking {
  key_metrics_established: boolean;
  tracking_systems_setup: boolean;
  dashboards_created: boolean;
  data_driven_decisions: boolean;
}

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
  const [quickAddMetricType, setQuickAddMetricType] = useState<'customer-interviews' | 'survey-responses' | 'problem-solution-fit' | 'mvp-usage' | null>(null);
  const [kpiData, setKpiData] = useState({
    customerInterviews: 0,
    surveyResponses: 0,
    problemSolutionFit: 0,
    mvpUsage: 0
  });
  const [metricsTracking, setMetricsTracking] = useState<MetricsTracking>({
    key_metrics_established: false,
    tracking_systems_setup: false,
    dashboards_created: false,
    data_driven_decisions: false
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
      
      // Fetch metrics tracking data
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', currentProject.id)
        .single();
      
      if (projectError) {
        console.error('Error fetching project data:', projectError);
      } else if (projectData) {
        // Use type assertion to safely access metrics_tracking
        const trackingData = (projectData as any).metrics_tracking as MetricsTracking | null;
        if (trackingData) {
          setMetricsTracking(trackingData);
        }
      }
      
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

  // Handle opening the add metric form
  const handleAddMetric = (type: 'regular' | 'growth') => {
    setFormType(type);
    if (type === 'regular') {
      setSelectedMetric(null);
      setQuickAddMetricType(null);
      setIsFormOpen(true);
    } else {
      setSelectedGrowthMetric(null);
      setIsGrowthFormOpen(true);
    }
  };

  // Handle quick-add for KPI metrics
  const handleQuickAddMetric = (type: 'customer-interviews' | 'survey-responses' | 'problem-solution-fit' | 'mvp-usage') => {
    setFormType('regular');
    setQuickAddMetricType(type);
    setSelectedMetric(null);
    setIsFormOpen(true);
  };

  const handleEditMetric = (metric: MetricData | GrowthMetric, type: 'regular' | 'growth') => {
    setFormType(type);
    if (type === 'regular') {
      setSelectedMetric(metric as MetricData);
      setQuickAddMetricType(null);
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

  // Generate chart data for KPIs
  const generateChartData = () => {
    const kpiChartData = [
      { name: 'Customer Interviews', value: kpiData.customerInterviews },
      { name: 'Survey Responses', value: kpiData.surveyResponses },
      { name: 'Problem-Solution Fit', value: kpiData.problemSolutionFit },
      { name: 'MVP Usage', value: kpiData.mvpUsage }
    ];
    
    // Category distribution
    const metricsByCategory = [
      { name: 'Acquisition', value: metrics.filter(m => m.category === 'acquisition').length },
      { name: 'Activation', value: metrics.filter(m => m.category === 'activation').length },
      { name: 'Retention', value: metrics.filter(m => m.category === 'retention').length },
      { name: 'Revenue', value: metrics.filter(m => m.category === 'revenue').length },
      { name: 'Referral', value: metrics.filter(m => m.category === 'referral').length },
      { name: 'Custom', value: metrics.filter(m => m.category === 'custom').length }
    ].filter(item => item.value > 0); // Only include categories with metrics
    
    // Status distribution
    const metricsByStatus = [
      { name: 'On Track', value: metrics.filter(m => m.status === 'success').length },
      { name: 'Warning', value: metrics.filter(m => m.status === 'warning').length },
      { name: 'Off Track', value: metrics.filter(m => m.status === 'error').length },
      { name: 'No Data', value: metrics.filter(m => !m.status).length }
    ].filter(item => item.value > 0);
    
    return {
      kpiChartData,
      metricsByCategory,
      metricsByStatus
    };
  };

  // Update metrics tracking state
  const updateMetricsTracking = async (field: keyof MetricsTracking, value: boolean) => {
    if (!currentProject) return;
    
    try {
      // Create a copy of the current tracking state
      const updatedTracking = { ...metricsTracking, [field]: value };
      
      // Optimistically update the UI
      setMetricsTracking(updatedTracking);
      
      // Update the database
      const { error } = await supabase
        .from('projects')
        .update({ 
          metrics_tracking: updatedTracking 
        } as Partial<Project>)
        .eq('id', currentProject.id);
        
      if (error) throw error;
      
      // Dispatch custom event to notify ValidationProgressSummary to refresh
      window.dispatchEvent(new CustomEvent('validation-progress-update'));
      
      toast({
        title: 'Metrics Progress Updated',
        description: `${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} ${value ? 'completed' : 'marked as incomplete'}.`
      });
    } catch (err) {
      console.error('Error updating metrics tracking:', err);
      
      // Revert the local state change on error
      setMetricsTracking(metricsTracking);
    }
  };

  // Generate best practices for the BestPracticesCard component
  const bestPractices: BestPractice[] = [
    {
      icon: <BarChart2 />,
      title: 'Focus on Key Metrics',
      description: 'Track a few critical metrics rather than too many at once.'
    },
    {
      icon: <TrendingUp />,
      title: 'Measure What Matters',
      description: 'Focus on metrics that drive real business decisions.'
    },
    {
      icon: <BrainCircuit />,
      title: 'Data-Driven Decisions',
      description: 'Use metrics to guide product and business decisions.'
    }
  ];
  
  // Generate checklist items for the ChecklistCard component
  const checklistItems: ChecklistItem[] = [
    {
      key: 'key_metrics_established',
      label: 'Key Metrics Established',
      description: 'Automatically tracked when you create metrics',
      icon: <BarChart2 />,
      checked: metricsTracking.key_metrics_established,
      disabled: true
    },
    {
      key: 'tracking_systems_setup',
      label: 'Tracking Systems Implemented',
      description: 'Toggle when you\'ve set up systems to collect metrics data',
      icon: <Database />,
      checked: metricsTracking.tracking_systems_setup,
      onCheckedChange: (checked) => updateMetricsTracking('tracking_systems_setup', checked)
    },
    {
      key: 'dashboards_created',
      label: 'Dashboards Created',
      description: 'Toggle when you\'ve created dashboards to visualize metrics',
      icon: <LineChart />,
      checked: metricsTracking.dashboards_created,
      onCheckedChange: (checked) => updateMetricsTracking('dashboards_created', checked)
    },
    {
      key: 'data_driven_decisions',
      label: 'Data-Driven Decisions',
      description: 'Toggle when you\'re regularly using data for business decisions',
      icon: <BrainCircuit />,
      checked: metricsTracking.data_driven_decisions,
      onCheckedChange: (checked) => updateMetricsTracking('data_driven_decisions', checked)
    }
  ];

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

  const { kpiChartData, metricsByCategory, metricsByStatus } = generateChartData();

  // Function to check if a KPI metric exists
  const hasKpiMetric = (type: 'customer-interviews' | 'survey-responses' | 'problem-solution-fit' | 'mvp-usage') => {
    switch (type) {
      case 'customer-interviews':
        return metrics.some(m => 
          m.name.toLowerCase().includes('interview') || 
          m.description?.toLowerCase().includes('interview')
        );
      case 'survey-responses':
        return metrics.some(m => 
          m.name.toLowerCase().includes('survey') || 
          m.description?.toLowerCase().includes('survey')
        );
      case 'problem-solution-fit':
        return metrics.some(m => 
          m.name.toLowerCase().includes('solution fit') || 
          m.description?.toLowerCase().includes('solution fit')
        );
      case 'mvp-usage':
        return metrics.some(m => 
          m.name.toLowerCase().includes('usage') || 
          m.description?.toLowerCase().includes('usage')
        );
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header and intro */}
      <PageIntroduction 
        title="Metrics Dashboard" 
        icon={<LineChart className="h-5 w-5 text-cyan-500" />}
        description="Track and analyze key metrics for your startup"
        showDescription={false}
      />
      
      <BestPracticesCard 
        title="Best Practices for Metrics Tracking"
        color="cyan"
        tooltip="These practices help you establish and use metrics effectively for your startup."
        practices={bestPractices}
      />
      
      <ChecklistCard 
        title="Metrics Validation Checklist"
        color="cyan"
        items={checklistItems}
      />
      
      {/* Add ValidationPhaseIntro for consistency */}
      <ValidationPhaseIntro 
        phase="metrics" 
        onCreateNew={() => handleAddMetric('regular')}
        createButtonText="Add Metric"
      />
      
      {/* Buttons for different metric types */}
      <div className="flex justify-end space-x-2">
        <Button variant="outline" className="bg-green-50" onClick={() => handleAddMetric('growth')}>
          <TrendingUp className="h-4 w-4 mr-2" />
          Add Growth Metric
        </Button>
      </div>
      
      {/* Rest of your component */}
    </div>
  );
};

export default MetricsPage;

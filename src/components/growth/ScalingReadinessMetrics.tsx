import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScalingReadinessMetric } from '@/types/database';
import { AlertTriangle, Check, PlusCircle, AlertCircle, BarChart3, Plus } from 'lucide-react';
import ScalingReadinessMetricForm from '@/components/forms/ScalingReadinessMetricForm';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ScalingReadinessMetricsProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: any[];
  isFormOpen?: boolean;
  onFormClose?: () => void;
}

const METRIC_TYPE_LABELS = {
  'product-market_fit': 'Product-Market Fit',
  'unit_economics': 'Unit Economics',
  'growth_engine': 'Growth Engine',
  'team_capacity': 'Team Capacity',
  'operational_scalability': 'Operational Scalability',
  'financial_readiness': 'Financial Readiness',
  'market_opportunity': 'Market Opportunity'
};

const STATUS_ICONS = {
  'achieved': <Check className="h-5 w-5 text-green-500" />,
  'on-track': <BarChart3 className="h-5 w-5 text-blue-500" />,
  'needs-improvement': <AlertTriangle className="h-5 w-5 text-amber-500" />,
  'critical': <AlertCircle className="h-5 w-5 text-red-500" />,
  'pending': <BarChart3 className="h-5 w-5 text-gray-500" />
};

const STATUS_CLASSES = {
  'achieved': 'bg-green-100 text-green-800 border-green-200',
  'on-track': 'bg-blue-100 text-blue-800 border-blue-200',
  'needs-improvement': 'bg-amber-100 text-amber-800 border-amber-200',
  'critical': 'bg-red-100 text-red-800 border-red-200',
  'pending': 'bg-gray-100 text-gray-800 border-gray-200'
};

const ScalingReadinessMetrics: React.FC<ScalingReadinessMetricsProps> = ({ 
  projectId, 
  refreshData, 
  growthMetrics,
  isFormOpen = false,
  onFormClose = () => {}
}) => {
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpenInternal, setIsFormOpenInternal] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ScalingReadinessMetric | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<ScalingReadinessMetric | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setIsFormOpenInternal(isFormOpen);
  }, [isFormOpen]);

  const fetchScalingMetrics = async () => {
    try {
      setIsLoading(true);
      
      if (!projectId) return;
      
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setScalingMetrics(data as ScalingReadinessMetric[]);
    } catch (err) {
      console.error('Error fetching scaling metrics:', err);
      toast({
        title: 'Error',
        description: 'Failed to load scaling readiness metrics',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchScalingMetrics();
    }
  }, [projectId]);
  
  const handleOpenForm = (metric?: ScalingReadinessMetric) => {
    setSelectedMetric(metric || null);
    setIsFormOpenInternal(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpenInternal(false);
    setSelectedMetric(null);
    if (onFormClose) onFormClose();
  };
  
  const handleSaveMetric = async () => {
    await fetchScalingMetrics();
    if (refreshData) {
      await refreshData();
    }
    handleCloseForm();
  };
  
  const handleDeleteMetric = async (id: string) => {
    try {
      const { error } = await supabase
        .from('scaling_readiness_metrics')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The scaling readiness metric has been deleted',
      });
      
      await fetchScalingMetrics();
      if (refreshData) {
        await refreshData();
      }
      
      if (isDetailsOpen) {
        setIsDetailsOpen(false);
      }
    } catch (err) {
      console.error('Error deleting metric:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete the metric',
        variant: 'destructive',
      });
    }
  };
  
  const openMetricDetails = async (metric: ScalingReadinessMetric) => {
    setSelectedDetails(metric);
    setIsDetailsOpen(true);
  };
  
  const getStatusPercentage = (current: number, target: number) => {
    if (target === 0) return 0;
    const percentage = (current / target) * 100;
    return Math.min(Math.max(percentage, 0), 100);
  };
  
  const getFormattedMetricValue = (metric: ScalingReadinessMetric) => {
    if (metric.unit === 'percentage') {
      return `${metric.current_value}% / ${metric.target_value}%`;
    } else if (metric.unit === 'currency') {
      return `$${metric.current_value} / $${metric.target_value}`;
    } else if (metric.unit === 'ratio') {
      return `${metric.current_value}:1 / ${metric.target_value}:1`;
    } else if (metric.unit === 'time') {
      return `${metric.current_value} / ${metric.target_value} days`;
    } else {
      return `${metric.current_value} / ${metric.target_value}`;
    }
  };
  
  const calculateReadinessScore = () => {
    if (scalingMetrics.length === 0) return 0;
    
    let totalWeight = 0;
    let achievedWeight = 0;
    
    scalingMetrics.forEach(metric => {
      const weight = metric.importance || 1;
      totalWeight += weight;
      
      if (metric.status === 'achieved') {
        achievedWeight += weight;
      } else if (metric.status === 'on-track') {
        achievedWeight += (weight * 0.75);
      } else if (metric.status === 'needs-improvement') {
        achievedWeight += (weight * 0.25);
      }
    });
    
    return Math.round((achievedWeight / totalWeight) * 100);
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Scaling Readiness Assessment</h2>
          <Button 
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1"
            id="add-scaling-metric-button"
          >
            <Plus className="h-4 w-4" />
            <span>Add Readiness Metric</span>
          </Button>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-2">
              <h3 className="text-lg font-medium mb-1">Overall Scaling Readiness</h3>
              <div className="text-4xl font-bold mb-2">{calculateReadinessScore()}%</div>
              <Progress value={calculateReadinessScore()} className="w-full h-3" />
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-6 w-20" />
                  </div>
                  <Skeleton className="h-4 w-full mt-4" />
                  <div className="mt-4">
                    <Skeleton className="h-8 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {scalingMetrics.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    No scaling readiness metrics defined yet. Add metrics to track your startup's readiness to scale.
                  </p>
                  <Button onClick={() => handleOpenForm()}>Add Your First Readiness Metric</Button>
                </CardContent>
              </Card>
            ) : (
              scalingMetrics.map(metric => (
                <Card key={metric.id} className="hover:border-gray-300 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className={STATUS_CLASSES[metric.status]}>
                            {metric.status.charAt(0).toUpperCase() + metric.status.slice(1).replace('-', ' ')}
                          </Badge>
                          <Badge variant="outline">
                            {METRIC_TYPE_LABELS[metric.category] || metric.category}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium">{metric.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{metric.description}</p>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium">{getFormattedMetricValue(metric)}</span>
                          {STATUS_ICONS[metric.status]}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenForm(metric)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => handleDeleteMetric(metric.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Current: {metric.current_value}{metric.unit === 'percentage' ? '%' : ''}</span>
                        <span>Target: {metric.target_value}{metric.unit === 'percentage' ? '%' : ''}</span>
                      </div>
                      <Progress 
                        value={getStatusPercentage(metric.current_value, metric.target_value)} 
                        className="h-2" 
                      />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>

      {(isFormOpenInternal || isFormOpen) && (
        <ScalingReadinessMetricForm
          projectId={projectId}
          metric={selectedMetric}
          onSave={handleSaveMetric}
          onClose={handleCloseForm}
          isOpen={isFormOpenInternal || isFormOpen}
        />
      )}
    </>
  );
};

export default ScalingReadinessMetrics;

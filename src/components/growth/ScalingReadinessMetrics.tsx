
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ScalingReadinessMetric, SCALING_METRIC_CATEGORIES } from '@/types/database';
import { AlertTriangle, Check, PlusCircle, AlertCircle, BarChart3 } from 'lucide-react';
import ScalingMetricForm from './ScalingMetricForm';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface ScalingReadinessMetricsProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: any[];
}

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

const ScalingReadinessMetrics: React.FC<ScalingReadinessMetricsProps> = ({ projectId, refreshData, growthMetrics }) => {
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categoryBreakdown, setCategoryBreakdown] = useState<{ [key: string]: { achieved: number, total: number } }>({});
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<ScalingReadinessMetric | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedDetails, setSelectedDetails] = useState<ScalingReadinessMetric | null>(null);
  const [relatedEntities, setRelatedEntities] = useState<any[]>([]);
  const { toast } = useToast();

  const calculateCategoryBreakdown = (metrics: ScalingReadinessMetric[]) => {
    const breakdown: { [key: string]: { achieved: number, total: number } } = {};
    
    // Initialize categories
    Object.keys(SCALING_METRIC_CATEGORIES).forEach(category => {
      breakdown[category] = { achieved: 0, total: 0 };
    });
    
    // Count metrics by category
    metrics.forEach(metric => {
      if (metric.category && breakdown[metric.category]) {
        breakdown[metric.category].total += 1;
        if (metric.status === 'achieved') {
          breakdown[metric.category].achieved += 1;
        }
      }
    });
    
    setCategoryBreakdown(breakdown);
  };
  
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
      calculateCategoryBreakdown(data as ScalingReadinessMetric[]);
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
  
  const fetchRelatedEntities = async (metricId: string) => {
    try {
      // Get entity dependencies where this metric is the target
      const { data: dependencies, error } = await supabase
        .from('entity_dependencies')
        .select('*')
        .eq('target_id', metricId);
        
      if (error) throw error;
      
      if (dependencies && dependencies.length > 0) {
        const relatedItems = [];
        
        // Fetch related entities based on their type
        for (const dep of dependencies) {
          let entityData;
          
          if (dep.source_type === 'mvp_feature') {
            const { data, error } = await supabase
              .from('mvp_features')
              .select('*')
              .eq('id', dep.source_id)
              .single();
              
            if (!error && data) {
              entityData = {
                ...data,
                type: 'MVP Feature',
                typeIcon: 'puzzle-piece',
                relationshipStrength: dep.strength
              };
            }
          } else if (dep.source_type === 'growth_metric') {
            const { data, error } = await supabase
              .from('growth_metrics')
              .select('*')
              .eq('id', dep.source_id)
              .single();
              
            if (!error && data) {
              entityData = {
                ...data,
                type: 'Growth Metric',
                typeIcon: 'chart-line',
                relationshipStrength: dep.strength
              };
            }
          } else if (dep.source_type === 'growth_experiment') {
            const { data, error } = await supabase
              .from('growth_experiments')
              .select('*')
              .eq('id', dep.source_id)
              .single();
              
            if (!error && data) {
              entityData = {
                ...data,
                type: 'Growth Experiment',
                typeIcon: 'flask',
                relationshipStrength: dep.strength
              };
            }
          }
          
          if (entityData) {
            relatedItems.push(entityData);
          }
        }
        
        setRelatedEntities(relatedItems);
      } else {
        setRelatedEntities([]);
      }
    } catch (err) {
      console.error('Error fetching related entities:', err);
      setRelatedEntities([]);
    }
  };
  
  useEffect(() => {
    if (projectId) {
      fetchScalingMetrics();
    }
  }, [projectId]);
  
  const handleOpenForm = (metric?: ScalingReadinessMetric) => {
    setSelectedMetric(metric || null);
    setIsFormOpen(true);
  };
  
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedMetric(null);
  };
  
  const handleSaveMetric = async () => {
    await fetchScalingMetrics();
    if (refreshData) {
      await refreshData();
    }
  };
  
  const handleDeleteMetric = async (id: string) => {
    try {
      // First, delete any dependencies
      await supabase
        .from('entity_dependencies')
        .delete()
        .or(`source_id.eq.${id},target_id.eq.${id}`);
      
      // Then delete the metric
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
    await fetchRelatedEntities(metric.id);
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
  
  // Calculate overall readiness score
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
      // critical and pending contribute 0
    });
    
    return Math.round((achievedWeight / totalWeight) * 100);
  };
  
  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Scaling Readiness Assessment</h2>
          <Button 
            variant="outline"
            onClick={() => handleOpenForm()}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Add Metric</span>
          </Button>
        </div>

        {/* Overall readiness score */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center mb-2">
              <h3 className="text-lg font-medium mb-1">Overall Scaling Readiness</h3>
              <div className="text-4xl font-bold mb-2">{calculateReadinessScore()}%</div>
              <Progress value={calculateReadinessScore()} className="w-full h-3" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
              {Object.entries(categoryBreakdown).map(([category, data]) => (
                <div key={category} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="text-sm font-medium mb-1">{SCALING_METRIC_CATEGORIES[category]}</div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold">
                      {data.achieved}/{data.total}
                    </span>
                    <span className="text-sm text-gray-500">
                      {data.total > 0 ? Math.round((data.achieved / data.total) * 100) : 0}%
                    </span>
                  </div>
                  <Progress 
                    value={data.total > 0 ? (data.achieved / data.total) * 100 : 0} 
                    className="h-2 mt-1" 
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          // Skeleton loading state
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
                  <Button onClick={() => handleOpenForm()}>Add Your First Metric</Button>
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
                            {SCALING_METRIC_CATEGORIES[metric.category]}
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
                            onClick={() => openMetricDetails(metric)}
                          >
                            Details
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleOpenForm(metric)}
                          >
                            Edit
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

      {/* Metric Detail Sheet */}
      <Sheet open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle>{selectedDetails?.name}</SheetTitle>
            <SheetDescription>
              {selectedDetails?.description}
            </SheetDescription>
          </SheetHeader>
          
          <div className="py-6">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Category</div>
                <div className="font-medium">
                  {selectedDetails && SCALING_METRIC_CATEGORIES[selectedDetails.category]}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Status</div>
                <div className="font-medium flex items-center gap-2">
                  {selectedDetails && STATUS_ICONS[selectedDetails.status]}
                  <span>
                    {selectedDetails && selectedDetails.status.charAt(0).toUpperCase() + selectedDetails.status.slice(1).replace('-', ' ')}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Current Value</div>
                <div className="font-medium">
                  {selectedDetails?.current_value}
                  {selectedDetails?.unit === 'percentage' ? '%' : 
                   selectedDetails?.unit === 'currency' ? '$' : 
                   selectedDetails?.unit === 'ratio' ? ':1' : ''}
                </div>
              </div>
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm text-gray-500 mb-1">Target Value</div>
                <div className="font-medium">
                  {selectedDetails?.target_value}
                  {selectedDetails?.unit === 'percentage' ? '%' : 
                   selectedDetails?.unit === 'currency' ? '$' : 
                   selectedDetails?.unit === 'ratio' ? ':1' : ''}
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Related Entities</h3>
              
              {relatedEntities.length === 0 ? (
                <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500 border border-gray-200">
                  No related entities found for this metric
                </div>
              ) : (
                <div className="space-y-3">
                  {relatedEntities.map(entity => (
                    <div key={entity.id} className="border rounded-md p-3">
                      <div className="flex justify-between">
                        <div>
                          <Badge variant="outline">
                            {entity.type}
                          </Badge>
                          <div className="font-medium mt-1">
                            {entity.name || entity.title || entity.feature}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
                          Impact: {entity.relationshipStrength >= 3 ? 'High' : 
                                entity.relationshipStrength >= 2 ? 'Medium' : 'Low'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (selectedDetails) {
                    handleDeleteMetric(selectedDetails.id);
                    setIsDetailsOpen(false);
                  }
                }}
              >
                Delete Metric
              </Button>
              <Button 
                onClick={() => {
                  setIsDetailsOpen(false);
                  if (selectedDetails) {
                    handleOpenForm(selectedDetails);
                  }
                }}
              >
                Edit Metric
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Metric Form */}
      {isFormOpen && (
        <ScalingMetricForm
          projectId={projectId}
          metric={selectedMetric}
          onSave={handleSaveMetric}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default ScalingReadinessMetrics;

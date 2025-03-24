
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, AlertTriangle, HelpCircle, Plus, Edit } from 'lucide-react';
import { GrowthMetric, GrowthExperiment, GrowthChannel, ScalingReadinessMetric } from '@/types/database';
import { Button } from '@/components/ui/button';
import ScalingReadinessMetricForm from '@/components/forms/ScalingReadinessMetricForm';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

interface ScalingReadinessChecklistProps {
  projectId: string;
  refreshData: () => Promise<void>;
  growthMetrics: GrowthMetric[];
  growthExperiments: GrowthExperiment[];
  growthChannels: GrowthChannel[];
}

interface ChecklistItem {
  id: string;
  title: string;
  description: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  value: string | number;
  target: string | number;
  progress: number;
}

const ScalingReadinessChecklist: React.FC<ScalingReadinessChecklistProps> = ({
  projectId,
  refreshData,
  growthMetrics,
  growthExperiments,
  growthChannels
}) => {
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [overallProgress, setOverallProgress] = useState(0);
  const [manualMetrics, setManualMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [isAddingMetric, setIsAddingMetric] = useState(false);
  const [editingMetric, setEditingMetric] = useState<ScalingReadinessMetric | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (projectId) {
      fetchManualMetrics();
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      generateChecklist();
    }
  }, [projectId, growthMetrics, growthExperiments, growthChannels, manualMetrics]);

  const fetchManualMetrics = async () => {
    try {
      const { data, error } = await supabase
        .from('scaling_readiness_metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('importance', { ascending: false });
        
      if (error) throw error;
      
      setManualMetrics(data || []);
    } catch (err) {
      console.error('Error fetching manual metrics:', err);
    }
  };

  const generateChecklist = async () => {
    try {
      setIsLoading(true);
      
      const newChecklist: ChecklistItem[] = [];
      
      // 1. First check if we have manual metrics for any of these categories
      const manualUnitEconomics = manualMetrics.find(m => m.category === 'unit_economics');
      const manualAcquisition = manualMetrics.find(m => m.category === 'acquisition');
      const manualRetention = manualMetrics.find(m => m.category === 'retention');
      const manualGrowthModel = manualMetrics.find(m => m.category === 'growth_model');
      
      // 1. Validated Unit Economics - LTV:CAC Ratio (use manual if available)
      if (manualUnitEconomics) {
        const progress = Math.min((manualUnitEconomics.current_value / manualUnitEconomics.target_value) * 100, 100);
        
        newChecklist.push({
          id: 'unit-economics',
          title: manualUnitEconomics.name,
          description: manualUnitEconomics.description || 'Unit economics metric',
          status: manualUnitEconomics.status as 'passed' | 'failed' | 'warning' | 'pending',
          value: manualUnitEconomics.current_value.toString(),
          target: manualUnitEconomics.target_value.toString(),
          progress
        });
      } else {
        // Calculate from growthMetrics if available
        const ltvMetric = growthMetrics.find(m => 
          m.name.toLowerCase().includes('ltv') || 
          (m.category === 'revenue' && m.name.toLowerCase().includes('lifetime value'))
        );
        
        const cacMetric = growthMetrics.find(m => 
          m.name.toLowerCase().includes('cac') || 
          (m.category === 'acquisition' && m.name.toLowerCase().includes('acquisition cost'))
        );
        
        if (ltvMetric && cacMetric && cacMetric.current_value > 0) {
          const ltvCacRatio = ltvMetric.current_value / cacMetric.current_value;
          const progress = Math.min((ltvCacRatio / 3) * 100, 100);
          
          newChecklist.push({
            id: 'ltv-cac-ratio',
            title: 'Validated Unit Economics',
            description: 'LTV:CAC Ratio should be 3:1 or better',
            status: ltvCacRatio >= 3 ? 'passed' : ltvCacRatio >= 2 ? 'warning' : 'failed',
            value: ltvCacRatio.toFixed(1) + ':1',
            target: '3:1',
            progress
          });
        } else {
          newChecklist.push({
            id: 'ltv-cac-ratio',
            title: 'Validated Unit Economics',
            description: 'LTV:CAC Ratio should be 3:1 or better',
            status: 'pending',
            value: 'Not set',
            target: '3:1',
            progress: 0
          });
        }
      }
      
      // 2. Acquisition Channels (use manual if available)
      if (manualAcquisition) {
        const progress = Math.min((manualAcquisition.current_value / manualAcquisition.target_value) * 100, 100);
        
        newChecklist.push({
          id: 'acquisition-channels',
          title: manualAcquisition.name,
          description: manualAcquisition.description || 'Validated acquisition channels',
          status: manualAcquisition.status as 'passed' | 'failed' | 'warning' | 'pending',
          value: manualAcquisition.current_value.toString(),
          target: manualAcquisition.target_value.toString(),
          progress
        });
      } else {
        const validatedChannels = growthChannels.filter(channel => 
          channel.status === 'active' && 
          channel.conversion_rate !== null && 
          channel.cac !== null
        );
        
        const channelsProgress = Math.min((validatedChannels.length / 3) * 100, 100);
        
        newChecklist.push({
          id: 'acquisition-channels',
          title: 'Validated Acquisition Channels',
          description: 'At least 3 channels with stable conversion rate and CAC over 30 days',
          status: validatedChannels.length >= 3 ? 'passed' : validatedChannels.length >= 1 ? 'warning' : 'failed',
          value: `${validatedChannels.length} ${validatedChannels.length === 1 ? 'channel' : 'channels'}`,
          target: '3 channels',
          progress: channelsProgress
        });
      }
      
      // 3. Retention Metrics (use manual if available)
      if (manualRetention) {
        const progress = Math.min((manualRetention.current_value / manualRetention.target_value) * 100, 100);
        
        newChecklist.push({
          id: 'retention',
          title: manualRetention.name,
          description: manualRetention.description || 'User retention metric',
          status: manualRetention.status as 'passed' | 'failed' | 'warning' | 'pending',
          value: manualRetention.current_value.toString() + (manualRetention.unit === 'percentage' ? '%' : ''),
          target: manualRetention.target_value.toString() + (manualRetention.unit === 'percentage' ? '%' : ''),
          progress
        });
      } else {
        const retentionMetric = growthMetrics.find(m => 
          m.name.toLowerCase().includes('retention') && 
          m.category === 'retention'
        );
        
        if (retentionMetric) {
          const retentionValue = retentionMetric.current_value;
          const retentionProgress = Math.min((retentionValue / 30) * 100, 100);
          
          newChecklist.push({
            id: 'retention',
            title: 'Retention Metrics',
            description: '30% Retention in 60 days',
            status: retentionValue >= 30 ? 'passed' : retentionValue >= 20 ? 'warning' : 'failed',
            value: `${retentionValue}%`,
            target: '30%',
            progress: retentionProgress
          });
        } else {
          // Fetch a generic cohort retention metric from database if it exists
          try {
            const { data: retentionData, error: retentionError } = await supabase
              .from('growth_metrics')
              .select('*')
              .eq('project_id', projectId)
              .eq('category', 'retention')
              .order('created_at', { ascending: false })
              .limit(1);
              
            if (!retentionError && retentionData && retentionData.length > 0) {
              const retentionDbMetric = retentionData[0];
              const retentionValue = retentionDbMetric.current_value;
              const retentionProgress = Math.min((retentionValue / 30) * 100, 100);
              
              newChecklist.push({
                id: 'retention',
                title: 'Retention Metrics',
                description: '30% Retention in 60 days',
                status: retentionValue >= 30 ? 'passed' : retentionValue >= 20 ? 'warning' : 'failed',
                value: `${retentionValue}%`,
                target: '30%',
                progress: retentionProgress
              });
            } else {
              newChecklist.push({
                id: 'retention',
                title: 'Retention Metrics',
                description: '30% Retention in 60 days',
                status: 'pending',
                value: 'Not tracking',
                target: '30%',
                progress: 0
              });
            }
          } catch (err) {
            console.error('Error fetching retention metrics:', err);
            newChecklist.push({
              id: 'retention',
              title: 'Retention Metrics',
              description: '30% Retention in 60 days',
              status: 'pending',
              value: 'Not tracking',
              target: '30%',
              progress: 0
            });
          }
        }
      }
      
      // 4. Repeatable Growth Model (use manual if available)
      if (manualGrowthModel) {
        const progress = Math.min((manualGrowthModel.current_value / manualGrowthModel.target_value) * 100, 100);
        
        newChecklist.push({
          id: 'growth-model',
          title: manualGrowthModel.name,
          description: manualGrowthModel.description || 'Repeatable growth model',
          status: manualGrowthModel.status as 'passed' | 'failed' | 'warning' | 'pending',
          value: manualGrowthModel.current_value.toString(),
          target: manualGrowthModel.target_value.toString(),
          progress
        });
      } else {
        const completedExperiments = growthExperiments.filter(exp => 
          exp.status === 'completed' && 
          exp.actual_lift !== null && 
          exp.actual_lift > 0
        );
        
        const experimentsProgress = Math.min((completedExperiments.length / 2) * 100, 100);
        
        newChecklist.push({
          id: 'growth-experiments',
          title: 'Repeatable Growth Model',
          description: '2 Validated Growth Experiments',
          status: completedExperiments.length >= 2 ? 'passed' : completedExperiments.length >= 1 ? 'warning' : 'failed',
          value: `${completedExperiments.length} ${completedExperiments.length === 1 ? 'experiment' : 'experiments'}`,
          target: '2 experiments',
          progress: experimentsProgress
        });
      }
      
      // Add any other manual metrics that don't fit into the standard categories
      manualMetrics.forEach(metric => {
        if (
          metric.category !== 'unit_economics' && 
          metric.category !== 'acquisition' && 
          metric.category !== 'retention' && 
          metric.category !== 'growth_model'
        ) {
          const progress = Math.min((metric.current_value / metric.target_value) * 100, 100);
          
          newChecklist.push({
            id: metric.id,
            title: metric.name,
            description: metric.description || `${metric.category.charAt(0).toUpperCase() + metric.category.slice(1)} metric`,
            status: metric.status as 'passed' | 'failed' | 'warning' | 'pending',
            value: `${metric.current_value}${metric.unit === 'percentage' ? '%' : ''}`,
            target: `${metric.target_value}${metric.unit === 'percentage' ? '%' : ''}`,
            progress
          });
        }
      });
      
      setChecklist(newChecklist);
      
      // Calculate overall progress
      const totalProgress = newChecklist.reduce((acc, item) => acc + item.progress, 0);
      setOverallProgress(Math.round(totalProgress / newChecklist.length));
      
    } catch (err) {
      console.error('Error generating checklist:', err);
      toast({
        title: 'Error',
        description: 'Failed to generate scaling readiness checklist',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMetric = async () => {
    await fetchManualMetrics();
    refreshData();
  };

  const handleEditMetric = (metric: ScalingReadinessMetric) => {
    setEditingMetric(metric);
    setIsAddingMetric(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'failed':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <HelpCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Scaling Readiness Assessment</h2>
        <Dialog open={isAddingMetric} onOpenChange={setIsAddingMetric}>
          <DialogTrigger asChild>
            <Button size="sm" className="flex items-center gap-1.5" onClick={() => {
              setEditingMetric(null);
              setIsAddingMetric(true);
            }}>
              <Plus className="h-4 w-4" />
              <span>Add Manual Metric</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <ScalingReadinessMetricForm 
              projectId={projectId}
              metric={editingMetric}
              onSave={handleSaveMetric}
              onClose={() => setIsAddingMetric(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overall readiness score */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center mb-2">
            <h3 className="text-lg font-medium mb-1">Overall Scaling Readiness</h3>
            <div className="text-4xl font-bold mb-2">{overallProgress}%</div>
            <Progress value={overallProgress} className="w-full h-3" />
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {checklist.map((item) => (
              <div key={item.id} className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <div className="text-sm font-medium mb-1">{item.title}</div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm font-medium ${
                    item.status === 'passed' ? 'text-green-600' : 
                    item.status === 'warning' ? 'text-amber-600' : 
                    item.status === 'failed' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(item.progress)}%
                  </span>
                </div>
                <Progress 
                  value={item.progress} 
                  className={`h-2 mt-1 ${
                    item.status === 'passed' ? 'bg-green-100' : 
                    item.status === 'warning' ? 'bg-amber-100' : 
                    item.status === 'failed' ? 'bg-red-100' : 'bg-gray-100'
                  }`} 
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        // Skeleton loading state
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
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
          {checklist.map((item) => {
            // Find if this is a manual metric
            const isManualMetric = manualMetrics.some(m => m.id === item.id || 
              (m.category === 'unit_economics' && item.id === 'ltv-cac-ratio') ||
              (m.category === 'acquisition' && item.id === 'acquisition-channels') ||
              (m.category === 'retention' && item.id === 'retention') ||
              (m.category === 'growth_model' && item.id === 'growth-experiments')
            );
            
            // Find the manual metric
            const manualMetric = manualMetrics.find(m => m.id === item.id || 
              (m.category === 'unit_economics' && item.id === 'ltv-cac-ratio') ||
              (m.category === 'acquisition' && item.id === 'acquisition-channels') ||
              (m.category === 'retention' && item.id === 'retention') ||
              (m.category === 'growth_model' && item.id === 'growth-experiments')
            );
            
            return (
              <Card key={item.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                        </Badge>
                        {isManualMetric && <Badge variant="outline">Manual</Badge>}
                      </div>
                      <h3 className="text-lg font-medium">{item.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium">{item.value} / {item.target}</span>
                        {getStatusIcon(item.status)}
                      </div>
                      {isManualMetric && manualMetric && (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="flex items-center gap-1.5"
                              onClick={() => handleEditMetric(manualMetric)}
                            >
                              <Edit className="h-3.5 w-3.5" />
                              <span>Edit</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <ScalingReadinessMetricForm 
                              projectId={projectId}
                              metric={manualMetric}
                              onSave={handleSaveMetric}
                              onClose={() => setIsAddingMetric(false)}
                            />
                          </DialogContent>
                        </Dialog>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span>Current: {item.value}</span>
                      <span>Target: {item.target}</span>
                    </div>
                    <Progress 
                      value={item.progress} 
                      className="h-2" 
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScalingReadinessChecklist;

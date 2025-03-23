
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  PlusCircle, 
  Edit2, 
  Trash2, 
  TrendingUp,
  TrendingDown,
  BarChart2,
  User,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { GrowthMetric, GrowthModel } from '@/types/database';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface GrowthMetricsSectionProps {
  metrics: GrowthMetric[];
  growthModel: GrowthModel;
  projectId: string;
  refreshData: () => Promise<void>;
}

const CATEGORY_ICONS = {
  'acquisition': <User className="h-4 w-4" />,
  'activation': <BarChart2 className="h-4 w-4" />,
  'retention': <RefreshCw className="h-4 w-4" />,
  'referral': <TrendingUp className="h-4 w-4" />,
  'revenue': <DollarSign className="h-4 w-4" />,
  'custom': <BarChart2 className="h-4 w-4" />
};

const CATEGORY_COLORS = {
  'acquisition': 'bg-blue-500',
  'activation': 'bg-green-500',
  'retention': 'bg-purple-500',
  'referral': 'bg-yellow-500',
  'revenue': 'bg-red-500',
  'custom': 'bg-gray-500'
};

const STATUS_COLORS = {
  'on-track': 'bg-green-500',
  'at-risk': 'bg-yellow-500',
  'off-track': 'bg-red-500'
};

const GrowthMetricsSection = ({ 
  metrics, 
  growthModel, 
  projectId, 
  refreshData 
}: GrowthMetricsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<GrowthMetric | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (metric?: GrowthMetric) => {
    setEditingMetric(metric || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingMetric(null);
  };

  const handleDeleteMetric = async () => {
    if (!metricToDelete) return;
    
    try {
      const { error } = await supabase
        .from('growth_metrics')
        .delete()
        .eq('id', metricToDelete.originalId || metricToDelete.id);
        
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The metric has been successfully deleted',
      });
      
      refreshData();
    } catch (error) {
      console.error('Error deleting metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete metric',
        variant: 'destructive',
      });
    } finally {
      setMetricToDelete(null);
    }
  };

  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'ratio':
        return value.toFixed(2);
      case 'time':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  const groupedMetrics = metrics.reduce((groups, metric) => {
    const category = metric.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(metric);
    return groups;
  }, {} as Record<string, GrowthMetric[]>);

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthMetricForm
          growthModel={growthModel}
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          metric={editingMetric}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Metrics</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              Add Metric
            </Button>
          </div>

          {metrics.length === 0 ? (
            <Card className="bg-gray-50 border-dashed border-2 border-gray-300">
              <CardContent className="pt-6 pb-8 px-6 flex flex-col items-center text-center">
                <BarChart2 className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Metrics Yet</h3>
                <p className="text-gray-500 mb-4 max-w-md">
                  Add metrics to track your growth performance and measure progress towards your goals.
                </p>
                <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Add First Metric
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`h-3 w-3 rounded-full ${CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || 'bg-gray-500'}`}></div>
                    <h3 className="text-md font-medium capitalize">{category}</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryMetrics.map((metric) => (
                      <Card key={metric.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-base font-medium">{metric.name}</CardTitle>
                            <div className="flex space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0" 
                                onClick={() => handleOpenForm(metric)}
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-7 w-7 p-0" 
                                onClick={() => setMetricToDelete(metric)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </div>
                          </div>
                          {metric.description && (
                            <CardDescription className="text-xs">{metric.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent className="pb-2 pt-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <div className="text-2xl font-semibold">
                              {formatValue(metric.current_value, metric.unit)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Target: {formatValue(metric.target_value, metric.unit)}
                            </div>
                          </div>
                          <Progress 
                            value={calculateProgress(metric.current_value, metric.target_value)} 
                            className="h-2" 
                          />
                        </CardContent>
                        <CardFooter className="pt-2 pb-3">
                          <div className="flex items-center gap-1 text-xs">
                            <div className={`h-2 w-2 rounded-full ${STATUS_COLORS[metric.status]}`}></div>
                            <span className="capitalize">{metric.status}</span>
                            {metric.current_value < metric.target_value ? (
                              <TrendingUp className="h-3 w-3 ml-auto text-green-500" />
                            ) : (
                              <TrendingDown className="h-3 w-3 ml-auto text-gray-400" />
                            )}
                          </div>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <AlertDialog open={!!metricToDelete} onOpenChange={(open) => !open && setMetricToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Metric</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this metric? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMetric} className="bg-red-500 hover:bg-red-600">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GrowthMetricsSection;

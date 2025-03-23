
import React, { useState } from 'react';
import Card from './Card';
import StatusBadge from './StatusBadge';
import ProgressBar from './ProgressBar';
import { Gauge, Plus, Edit, Trash2, AlertCircle, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import MetricForm from './forms/MetricForm';
import { MetricData } from '@/types/metrics';
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
import { Badge } from '@/components/ui/badge';

interface MetricsSectionProps {
  metrics: MetricData[];
  refreshData: () => void;
  projectId: string;
}

const MetricsSection = ({ metrics, refreshData, projectId }: MetricsSectionProps) => {
  const { toast } = useToast();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [metricToDelete, setMetricToDelete] = useState<MetricData | null>(null);

  const handleCreateNew = () => {
    setSelectedMetric(null);
    setIsFormOpen(true);
  };

  const handleEdit = (metric: MetricData) => {
    // Ensure we're using the original string ID for database operations
    setSelectedMetric(metric);
    setIsFormOpen(true);
  };

  const handleDelete = (metric: MetricData) => {
    setMetricToDelete(metric);
    setIsDeleteDialogOpen(true);
  };

  const handleCardUpdate = (metric: MetricData) => {
    setSelectedMetric(metric);
    setIsFormOpen(true);
  };

  const confirmDelete = async () => {
    if (!metricToDelete) return;
    
    try {
      // Use originalId if available
      const metricId = metricToDelete.originalId || metricToDelete.id;
      
      const { error } = await supabase
        .from('metrics')
        .delete()
        .eq('id', metricId);
      
      if (error) throw error;
      
      toast({
        title: 'Metric deleted',
        description: 'The metric has been successfully deleted.',
      });
      
      refreshData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while deleting.',
        variant: 'destructive',
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setMetricToDelete(null);
    }
  };

  // Group metrics by category
  const acquisitionMetrics = metrics.filter(m => m.category === 'acquisition');
  const activationMetrics = metrics.filter(m => m.category === 'activation');
  const retentionMetrics = metrics.filter(m => m.category === 'retention');
  const revenueMetrics = metrics.filter(m => m.category === 'revenue');
  const referralMetrics = metrics.filter(m => m.category === 'referral');
  const customMetrics = metrics.filter(m => m.category === 'custom');

  // Helper function to get display values for a category
  const getCategoryDisplayValues = (categoryMetrics: MetricData[], categoryName: string) => {
    if (categoryMetrics.length === 0) {
      return {
        value: '-',
        description: 'No metrics',
        targetDescription: 'N/A',
        progress: 0,
        status: 'default',
      };
    }

    // Use the first metric in the category for display
    const primaryMetric = categoryMetrics[0];
    return {
      value: primaryMetric.current || '-',
      description: primaryMetric.name,
      targetDescription: `Target: ${primaryMetric.target}`,
      progress: primaryMetric.status === 'success' ? 100 : 
               primaryMetric.status === 'warning' ? 90 : 
               primaryMetric.status === 'error' ? 50 : 0,
      status: primaryMetric.status,
    };
  };

  const acquisition = getCategoryDisplayValues(acquisitionMetrics, 'Acquisition');
  const activation = getCategoryDisplayValues(activationMetrics, 'Activation');
  const retention = getCategoryDisplayValues(retentionMetrics, 'Retention');
  const revenue = getCategoryDisplayValues(revenueMetrics, 'Revenue');
  const referral = getCategoryDisplayValues(referralMetrics, 'Referral');

  // Render a metric card with proper editing capabilities
  const renderMetricCard = (categoryName: string, displayValues: any, metrics: MetricData[]) => (
    <Card className="p-5 flex flex-col items-center text-center animate-slideUpFade animate-delay-200" hover={true}>
      <h3 className="font-semibold mb-2 text-validation-gray-900">{categoryName}</h3>
      <p className="text-3xl font-bold text-validation-blue-600 mb-1">{displayValues.value}</p>
      <p className="text-sm text-validation-gray-600 mb-1">{displayValues.description}</p>
      <p className="text-xs text-validation-gray-500 mb-3">{displayValues.targetDescription}</p>
      <ProgressBar 
        value={displayValues.progress} 
        variant={displayValues.status as any} 
        size="sm" 
        className="w-full mt-auto" 
      />
      {metrics.length > 0 ? (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={() => handleCardUpdate(metrics[0])}
        >
          Update
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-3"
          onClick={handleCreateNew}
        >
          Add Metric
        </Button>
      )}
    </Card>
  );

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-validation-gray-900">Key Metrics</h2>
        <Button 
          className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors duration-300 shadow-subtle"
          onClick={handleCreateNew}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add New Metric
        </Button>
      </div>
      
      <Card className="mb-8 p-6 animate-slideUpFade animate-delay-100">
        <p className="text-validation-gray-600 text-lg">
          Track and measure your progress using the AARRR framework (Acquisition, Activation, Retention, Revenue, Referral).
        </p>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
        {renderMetricCard('Acquisition', acquisition, acquisitionMetrics)}
        {renderMetricCard('Activation', activation, activationMetrics)}
        {renderMetricCard('Retention', retention, retentionMetrics)}
        {renderMetricCard('Revenue', revenue, revenueMetrics)}
        {renderMetricCard('Referral', referral, referralMetrics)}
      </div>
      
      <h3 className="text-xl font-bold mb-6 text-validation-gray-900">All Metrics</h3>
      {metrics.length === 0 ? (
        <Card className="p-12 text-center animate-slideUpFade">
          <AlertCircle className="mx-auto h-12 w-12 text-validation-gray-400 mb-4" />
          <h3 className="text-xl font-medium text-validation-gray-900 mb-2">No Metrics Yet</h3>
          <p className="text-validation-gray-600 mb-6">Start tracking key metrics for your business.</p>
          <Button 
            className="bg-validation-blue-600 hover:bg-validation-blue-700 text-white"
            onClick={handleCreateNew}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add First Metric
          </Button>
        </Card>
      ) : (
        <Card className="overflow-hidden animate-slideUpFade animate-delay-500">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-validation-gray-200">
              <thead>
                <tr className="bg-validation-gray-50">
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Category</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Metric</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Target</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Current</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">History</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-validation-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-validation-gray-200">
                {metrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-validation-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-validation-gray-900">
                      {metric.category.charAt(0).toUpperCase() + metric.category.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">
                      <div>
                        <div>{metric.name}</div>
                        {metric.description && (
                          <div className="text-xs text-gray-500 mt-1">{metric.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">{metric.target}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-validation-gray-600">{metric.current || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={metric.status as any} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <Badge variant="outline" className="flex items-center gap-1 cursor-pointer">
                        <TrendingUp className="h-3 w-3" />
                        View Trend
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => handleEdit(metric)}
                        >
                          <Edit className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-7 px-2 text-validation-red-500 hover:text-validation-red-600 hover:bg-validation-red-50"
                          onClick={() => handleDelete(metric)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Metric Form Dialog */}
      <MetricForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={refreshData}
        metric={selectedMetric}
        projectId={projectId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this metric. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-validation-red-600 hover:bg-validation-red-700 text-white"
              onClick={confirmDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default MetricsSection;

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Link2, Filter, Info, BarChart2, TrendingUp, DollarSign, LineChart } from 'lucide-react';
import { GrowthMetric, ScalingReadinessMetric } from '@/types/database';
import GrowthMetricForm from '@/components/forms/GrowthMetricForm';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import EmptyMetricState from './metrics/EmptyMetricState';
import MetricCategoryGroup from './metrics/MetricCategoryGroup';
import DeleteMetricDialog from './metrics/DeleteMetricDialog';
import {
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

interface GrowthMetricsSectionProps {
  metrics: GrowthMetric[];
  projectId: string;
  refreshData: () => Promise<void>;
}

const GrowthMetricsSection = ({ 
  metrics, 
  projectId, 
  refreshData 
}: GrowthMetricsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [editingMetric, setEditingMetric] = useState<GrowthMetric | null>(null);
  const [metricToDelete, setMetricToDelete] = useState<GrowthMetric | null>(null);
  const [scalingMetrics, setScalingMetrics] = useState<ScalingReadinessMetric[]>([]);
  const [filterLinked, setFilterLinked] = useState(false);
  const { toast } = useToast();
  const [showCoreMetricsOnly, setShowCoreMetricsOnly] = useState(false);

  const coreMetricNames = ['CAC', 'LTV', 'Conversion Rate'];
  const coreMetricCategories = ['acquisition', 'revenue', 'conversion'];

  const [derivedMetrics, setDerivedMetrics] = useState<GrowthMetric[]>([]);
  
  useEffect(() => {
    const fetchScalingMetrics = async () => {
      try {
        const { data, error } = await supabase
          .from('scaling_readiness_metrics')
          .select('*')
          .eq('project_id', projectId);
          
        if (error) throw error;
        
        setScalingMetrics(data || []);
      } catch (error) {
        console.error('Error fetching scaling metrics:', error);
      }
    };

    fetchScalingMetrics();
    calculateDerivedMetrics();
  }, [projectId, metrics]);

  const calculateDerivedMetrics = () => {
    const cac = metrics.find(m => 
      m.name.toLowerCase().includes('cac') || 
      (m.category === 'acquisition' && m.name.includes('Acquisition Cost'))
    );
    
    const ltv = metrics.find(m => 
      m.name.toLowerCase().includes('ltv') || 
      (m.category === 'revenue' && m.name.includes('Lifetime Value'))
    );
    
    if (cac && ltv && cac.current_value > 0) {
      const ratio = ltv.current_value / cac.current_value;
      
      const ltvCacMetric: GrowthMetric = {
        id: 'ltv-cac-ratio',
        originalId: 'ltv-cac-ratio',
        name: 'LTV:CAC Ratio',
        description: 'Lifetime Value to Customer Acquisition Cost ratio',
        category: 'derived',
        current_value: ratio,
        target_value: 3, // Standard benchmark
        unit: 'ratio',
        status: ratio >= 3 ? 'on-track' : ratio >= 2 ? 'at-risk' : 'off-track',
        project_id: projectId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      setDerivedMetrics([ltvCacMetric]);
    } else {
      setDerivedMetrics([]);
    }
  };

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

  const areCoreMetricsPresent = () => {
    const hasCac = metrics.some(m => 
      m.name.toLowerCase().includes('cac') || 
      (m.category === 'acquisition' && m.name.includes('Acquisition Cost'))
    );
    
    const hasLtv = metrics.some(m => 
      m.name.toLowerCase().includes('ltv') || 
      (m.category === 'revenue' && m.name.includes('Lifetime Value'))
    );
    
    const hasConversion = metrics.some(m => 
      m.name.toLowerCase().includes('conversion rate') || 
      m.category === 'conversion'
    );
    
    return hasCac && hasLtv && hasConversion;
  };

  const filteredMetrics = () => {
    let results = [...metrics];
    
    if (showCoreMetricsOnly) {
      results = results.filter(metric => 
        coreMetricNames.some(name => metric.name.toLowerCase().includes(name.toLowerCase())) ||
        coreMetricCategories.includes(metric.category)
      );
    }
    
    if (filterLinked) {
      results = results.filter(metric => metric.scaling_metric_id);
    }
    
    return results.concat(derivedMetrics);
  };

  const groupedMetrics = filteredMetrics().reduce((groups, metric) => {
    const category = metric.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(metric);
    return groups;
  }, {} as Record<string, GrowthMetric[]>);

  const getScalingMetricForGrowthMetric = (growthMetric: GrowthMetric) => {
    if (!growthMetric.scaling_metric_id) return null;
    return scalingMetrics.find(sm => sm.id === growthMetric.scaling_metric_id) || null;
  };

  const createCoreMetric = async (metricType: 'cac' | 'ltv' | 'conversion') => {
    let name = '', category = '', description = '', unit = '';
    let current_value = 0, target_value = 0;
    
    switch (metricType) {
      case 'cac':
        name = 'Customer Acquisition Cost (CAC)';
        category = 'acquisition';
        description = 'Average cost to acquire a new customer';
        current_value = 0;
        target_value = 0;
        unit = 'currency';
        break;
      case 'ltv':
        name = 'Lifetime Value (LTV)';
        category = 'revenue';
        description = 'Average revenue from a customer over their lifetime';
        current_value = 0;
        target_value = 0;
        unit = 'currency';
        break;
      case 'conversion':
        name = 'Conversion Rate';
        category = 'conversion';
        description = 'Percentage of visitors who become customers';
        current_value = 0;
        target_value = 0;
        unit = 'percentage';
        break;
    }
    
    try {
      const { data, error } = await supabase
        .from('growth_metrics')
        .insert({
          name,
          category,
          description,
          current_value,
          target_value,
          unit,
          project_id: projectId,
          status: 'on-track'
        })
        .select();
        
      if (error) throw error;
      
      toast({
        title: 'Core metric created',
        description: `${name} has been added to your metrics`
      });
      
      refreshData();
    } catch (error) {
      console.error('Error creating core metric:', error);
      toast({
        title: 'Error',
        description: 'Failed to create the core metric',
        variant: 'destructive'
      });
    }
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthMetricForm
          projectId={projectId}
          onSave={refreshData}
          onClose={handleCloseForm}
          metric={editingMetric}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Growth Metrics</h2>
              <p className="text-gray-500 mt-1">Track key metrics related to your growth model</p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuCheckboxItem
                    checked={showCoreMetricsOnly}
                    onCheckedChange={setShowCoreMetricsOnly}
                  >
                    Show only core metrics
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filterLinked}
                    onCheckedChange={setFilterLinked}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Show only metrics linked to scaling
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Add Metric
              </Button>
            </div>
          </div>

          {!areCoreMetricsPresent() && (
            <Card className="bg-amber-50 border-amber-100 mb-4">
              <CardContent className="p-4">
                <div className="flex items-start">
                  <Info className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800">Core Metrics Missing</h3>
                    <p className="text-sm text-amber-700 mt-1">
                      To properly assess your growth and scaling readiness, you should track the following core metrics:
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {!metrics.some(m => m.name.toLowerCase().includes('cac') || m.category === 'acquisition') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                          onClick={() => createCoreMetric('cac')}
                        >
                          <DollarSign className="h-3.5 w-3.5 mr-1" />
                          Add CAC Metric
                        </Button>
                      )}
                      {!metrics.some(m => m.name.toLowerCase().includes('ltv') || (m.category === 'revenue' && m.name.includes('Lifetime'))) && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                          onClick={() => createCoreMetric('ltv')}
                        >
                          <TrendingUp className="h-3.5 w-3.5 mr-1" />
                          Add LTV Metric
                        </Button>
                      )}
                      {!metrics.some(m => m.name.toLowerCase().includes('conversion') || m.category === 'conversion') && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="bg-white border-amber-200 text-amber-700 hover:bg-amber-100"
                          onClick={() => createCoreMetric('conversion')}
                        >
                          <LineChart className="h-3.5 w-3.5 mr-1" />
                          Add Conversion Rate
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {derivedMetrics.length > 0 && (
            <Card className="mb-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
                  Key Growth Indicators
                </CardTitle>
                <CardDescription>
                  Essential metrics for assessing your growth model
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {metrics
                    .filter(m => 
                      m.name.toLowerCase().includes('cac') || 
                      m.name.toLowerCase().includes('ltv') || 
                      m.name.toLowerCase().includes('conversion rate')
                    )
                    .map(metric => (
                      <div 
                        key={metric.id} 
                        className="p-3 bg-gray-50 rounded-lg border border-gray-100"
                      >
                        <div className="text-sm text-gray-500 mb-1">{metric.name}</div>
                        <div className="text-xl font-semibold">
                          {metric.unit === 'currency' && '$'}
                          {metric.current_value}
                          {metric.unit === 'percentage' && '%'}
                        </div>
                        <div className={`text-xs mt-1 font-medium ${
                          metric.current_value >= metric.target_value ? 'text-green-600' : 'text-amber-600'
                        }`}>
                          Target: {metric.unit === 'currency' && '$'}{metric.target_value}{metric.unit === 'percentage' && '%'}
                        </div>
                      </div>
                    ))}
                  
                  {derivedMetrics.map(metric => (
                    <div 
                      key={metric.id}
                      className="p-3 bg-blue-50 rounded-lg border border-blue-100"
                    >
                      <div className="text-sm text-blue-500 mb-1">{metric.name}</div>
                      <div className="text-xl font-semibold">
                        {metric.current_value.toFixed(1)}:1
                      </div>
                      <div className={`text-xs mt-1 font-medium ${
                        metric.current_value >= 3 ? 'text-green-600' : 
                        metric.current_value >= 2 ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {metric.current_value >= 3 ? 'Excellent' : 
                         metric.current_value >= 2 ? 'Good' : 'Needs Improvement'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 text-xs text-gray-500">
                Derived metrics like LTV:CAC ratio are calculated automatically from your core metrics
              </CardFooter>
            </Card>
          )}

          {Object.keys(groupedMetrics).length === 0 ? (
            <EmptyMetricState onAddMetric={() => handleOpenForm()} />
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedMetrics).map(([category, categoryMetrics]) => (
                <MetricCategoryGroup
                  key={category}
                  category={category}
                  metrics={categoryMetrics}
                  onEdit={handleOpenForm}
                  onDelete={setMetricToDelete}
                  scalingMetrics={scalingMetrics}
                  getScalingMetric={getScalingMetricForGrowthMetric}
                />
              ))}
            </div>
          )}
        </>
      )}

      <DeleteMetricDialog 
        metricToDelete={metricToDelete}
        onClose={() => setMetricToDelete(null)}
        onConfirm={handleDeleteMetric}
      />
    </div>
  );
};

export default GrowthMetricsSection;


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, ArrowRight, GitBranch, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { Metric, ScalingReadinessMetric } from '@/types/database';

const PivotDecisionSection: React.FC = () => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  const [metricsAtRisk, setMetricsAtRisk] = useState<ScalingReadinessMetric[]>([]);
  const [regularMetricsAtRisk, setRegularMetricsAtRisk] = useState<Metric[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetricsData = async () => {
      if (!currentProject?.id) return;
      
      setIsLoading(true);
      try {
        // Fetch scaling readiness metrics that are in warning or failure state
        const { data: scalingData, error: scalingError } = await supabase
          .from('scaling_readiness_metrics')
          .select('*')
          .eq('project_id', currentProject.id)
          .in('status', ['warning', 'failed']);
        
        if (scalingError) throw scalingError;
        
        // Fetch regular metrics that are in warning or error state
        const { data: metricsData, error: metricsError } = await supabase
          .from('metrics')
          .select('*')
          .eq('project_id', currentProject.id)
          .in('status', ['warning', 'error']);
          
        if (metricsError) throw metricsError;
        
        setMetricsAtRisk(scalingData || []);
        setRegularMetricsAtRisk(metricsData || []);
      } catch (error) {
        console.error('Error fetching metrics data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchMetricsData();
  }, [currentProject?.id]);
  
  const totalMetricsAtRisk = metricsAtRisk.length + regularMetricsAtRisk.length;
  
  const getStatusColor = (status: string) => {
    if (status === 'failed' || status === 'error') {
      return 'bg-red-100 text-red-800 border-red-200';
    } else if (status === 'warning') {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  return (
    <Card className="mb-8 p-6 border-orange-200 bg-orange-50">
      <div className="flex items-start">
        <div className="flex-grow">
          <div className="flex items-center mb-4">
            <GitBranch className="h-5 w-5 text-orange-600 mr-2" />
            <h3 className="text-lg font-semibold text-orange-800">Pivot Decision Framework</h3>
          </div>
          
          {totalMetricsAtRisk > 0 ? (
            <>
              <Alert className="mb-4 bg-yellow-50 border-yellow-200 text-yellow-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Potential Pivot Signals Detected</AlertTitle>
                <AlertDescription>
                  {totalMetricsAtRisk} {totalMetricsAtRisk === 1 ? 'metric is' : 'metrics are'} not meeting targets, 
                  which may indicate it's time to consider your pivot options.
                </AlertDescription>
              </Alert>
              
              <div className="space-y-4">
                {metricsAtRisk.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Scaling Readiness Metrics at Risk:</h4>
                    <div className="flex flex-wrap gap-2">
                      {metricsAtRisk.map(metric => (
                        <Badge 
                          key={metric.id} 
                          variant="outline"
                          className={getStatusColor(metric.status)}
                        >
                          {metric.name}: {metric.current_value} vs target {metric.target_value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {regularMetricsAtRisk.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">Business Metrics at Risk:</h4>
                    <div className="flex flex-wrap gap-2">
                      {regularMetricsAtRisk.map(metric => (
                        <Badge 
                          key={metric.id} 
                          variant="outline"
                          className={getStatusColor(metric.status)}
                        >
                          {metric.name}: {metric.current} vs target {metric.target}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-orange-700 mb-4">
              No metrics are currently indicating pivot signals. Continue monitoring your key metrics for potential pivot indicators.
            </p>
          )}
          
          <div className="mt-6 flex items-center">
            <Button 
              variant="outline" 
              className="border-orange-300 hover:bg-orange-100 text-orange-700"
              onClick={() => navigate('/growth/scaling_readiness')}
            >
              View Scaling Readiness
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            {totalMetricsAtRisk > 0 && (
              <Button 
                className="ml-4 bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => navigate('/pivot')}
              >
                <TrendingDown className="mr-2 h-4 w-4" />
                Evaluate Pivot Options
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PivotDecisionSection;

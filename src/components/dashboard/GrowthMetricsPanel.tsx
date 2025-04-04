
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, ArrowRight, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useProject } from '@/hooks/use-project';
import { Button } from '@/components/ui/button';
import InfoTooltip from '@/components/InfoTooltip'; // Updated import path
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface GrowthMetricsPanelProps {
  projectId: string;
}

const GrowthMetricsPanel: React.FC<GrowthMetricsPanelProps> = ({ projectId }) => {
  const [growthMetrics, setGrowthMetrics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchGrowthMetrics();
  }, [projectId]);

  const fetchGrowthMetrics = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('growth_metrics')
        .select('*')
        .eq('project_id', projectId);

      if (error) {
        console.error('Error fetching growth metrics:', error);
        return;
      }

      setGrowthMetrics(data || []);
    } catch (error) {
      console.error('Error fetching growth metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return 'bg-green-100 text-green-800';
      case 'at-risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'off-track':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddMetric = () => {
    navigate('/metrics?create=true');
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <CardTitle><Skeleton className="h-5 w-32" /></CardTitle>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-8 w-full mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {growthMetrics.length > 0 ? (
            growthMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium leading-none flex items-center">
                    {metric.name}
                    <InfoTooltip content={metric.description || 'No description provided'} className="ml-2" />
                  </CardTitle>
                  {metric.status === 'on-track' ? (
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500" />
                  )}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {metric.current_value} / {metric.target_value} {metric.unit}
                  </div>
                  <Badge className={getStatusColor(metric.status || '')}>{metric.status}</Badge>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-sm text-gray-500 mb-4">No growth metrics defined yet.</p>
                <Button onClick={handleAddMetric} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Metric
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default GrowthMetricsPanel;

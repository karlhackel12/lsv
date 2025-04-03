
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, Plus, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { InfoTooltip } from '@/components';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { GrowthMetric } from '@/types/database';

interface GrowthMetricsPanelProps {
  projectId: string;
  metrics?: GrowthMetric[];
  isLoading?: boolean;
}

const GrowthMetricsPanel = ({ projectId, metrics = [], isLoading = false }: GrowthMetricsPanelProps) => {
  const navigate = useNavigate();
  const { currentProject } = useProject();
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            <CardTitle className="text-lg">Growth Metrics</CardTitle>
            <InfoTooltip 
              content="Track key metrics that indicate your business growth"
              className="ml-1" 
            />
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-xs"
            onClick={() => navigate('/growth/metrics')}
          >
            View All
            <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
        <CardDescription>
          {metrics.length > 0 
            ? "Your key growth metrics"
            : "No growth metrics defined yet"}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
            <div className="h-16 bg-gray-100 animate-pulse rounded-md"></div>
          </div>
        ) : metrics.length > 0 ? (
          <div className="space-y-3">
            {metrics.slice(0, 3).map((metric) => (
              <div 
                key={metric.id} 
                className="flex justify-between items-center p-3 rounded-md border hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-medium">{metric.name}</h4>
                  <p className="text-sm text-gray-500">{metric.description || metric.category}</p>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-medium ${
                    metric.status === 'on-track' ? 'text-green-600' : 
                    metric.status === 'at-risk' ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {metric.current_value} {metric.unit}
                  </div>
                  <p className="text-xs text-gray-500">Target: {metric.target_value} {metric.unit}</p>
                </div>
              </div>
            ))}
            
            {metrics.length > 3 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                {metrics.length - 3} more metrics available in the growth section
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <p className="text-gray-500">Define growth metrics to track your progress</p>
            <Button 
              onClick={() => navigate('/growth/metrics/new')}
              variant="outline"
              className="mx-auto"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Growth Metric
            </Button>
          </div>
        )}
        
        {!isLoading && (
          <div className="mt-4 flex justify-between">
            <Link to="/metrics">
              <Button variant="ghost" size="sm" className="text-xs">
                Business Metrics
              </Button>
            </Link>
            
            <Link to="/growth">
              <Button variant="ghost" size="sm" className="text-xs">
                Growth Dashboard
                <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GrowthMetricsPanel;

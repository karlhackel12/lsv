
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { GrowthMetric } from '@/types/database';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useGrowthModels } from '@/hooks/growth/use-growth-models';

interface MetricProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ReactNode;
  tooltip: string;
}

const MetricCard = ({ title, value, change, changeType, icon, tooltip }: MetricProps) => {
  return (
    <div className="bg-white rounded-lg border p-4 flex flex-col">
      <div className="flex justify-between items-start mb-2">
        <div className="text-sm text-gray-500 font-medium flex items-center gap-1">
          {title}
          <InfoTooltip text={tooltip} link="/lean-startup-methodology" className="ml-1" />
        </div>
        <div className="bg-blue-50 p-1.5 rounded-md">
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      {change && (
        <div className={`text-xs font-medium flex items-center ${
          changeType === 'positive' ? 'text-green-600' : 'text-red-600'
        }`}>
          {changeType === 'positive' ? 
            <ArrowUpRight className="h-3 w-3 mr-1" /> : 
            <ArrowDownRight className="h-3 w-3 mr-1" />}
          {change} from previous period
        </div>
      )}
    </div>
  );
};

const GrowthMetricsPanel = () => {
  const { currentProject } = useProject();
  const [isLoading, setIsLoading] = useState(true);
  const { growthMetrics, fetchModelData } = useGrowthModels(currentProject?.id || '');
  
  // Find metrics by category
  const findMetric = (category: string): GrowthMetric | undefined => {
    return growthMetrics.find(m => m.category === category);
  };
  
  // Get CAC metric
  const cacMetric = findMetric('acquisition');
  
  // Get LTV metric
  const ltvMetric = findMetric('revenue');
  
  // Get conversion rate metric
  const conversionMetric = findMetric('conversion');
  
  // Get LTV:CAC ratio
  const ltvCacRatio = cacMetric && ltvMetric && cacMetric.current_value > 0 
    ? (ltvMetric.current_value / cacMetric.current_value).toFixed(1) + ':1'
    : 'N/A';
  
  // Calculate change percentages  
  const calculateChange = (metric?: GrowthMetric): { value: string, type: 'positive' | 'negative' } | undefined => {
    if (!metric || metric.target_value === 0) return undefined;
    
    const change = ((metric.current_value / metric.target_value) * 100) - 100;
    return {
      value: `${Math.abs(change).toFixed(1)}%`,
      type: change >= 0 ? 'positive' : 'negative'
    };
  };
  
  const formatMetricValue = (metric?: GrowthMetric): string => {
    if (!metric) return 'N/A';
    
    switch (metric.unit) {
      case 'currency':
        return `$${metric.current_value.toFixed(2)}`;
      case 'percentage':
        return `${metric.current_value}%`;
      default:
        return metric.current_value.toString();
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (currentProject?.id) {
        await fetchModelData(currentProject.id);
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [currentProject?.id, fetchModelData]);

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
          Growth Metrics
          <InfoTooltip 
            text="Track key metrics related to your growth model" 
            link="/lean-startup-methodology" 
            className="ml-2"
          />
        </CardTitle>
        <Button variant="outline" size="sm" asChild>
          <Link to="/growth?tab=metrics">View All</Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Customer Acquisition Cost"
            value={formatMetricValue(cacMetric)}
            change={calculateChange(cacMetric)?.value}
            changeType={calculateChange(cacMetric)?.type}
            icon={<DollarSign className="h-5 w-5 text-blue-500" />}
            tooltip="The cost to acquire one new customer (CAC)"
          />
          <MetricCard
            title="Lifetime Value"
            value={formatMetricValue(ltvMetric)}
            change={calculateChange(ltvMetric)?.value}
            changeType={calculateChange(ltvMetric)?.type}
            icon={<Users className="h-5 w-5 text-green-500" />}
            tooltip="The total revenue expected from a customer (LTV)"
          />
          <MetricCard
            title="Conversion Rate"
            value={formatMetricValue(conversionMetric)}
            change={calculateChange(conversionMetric)?.value}
            changeType={calculateChange(conversionMetric)?.type}
            icon={<LineChart className="h-5 w-5 text-yellow-500" />}
            tooltip="Percentage of visitors who become customers"
          />
          <MetricCard
            title="LTV:CAC Ratio"
            value={ltvCacRatio}
            change={ltvMetric && cacMetric ? "Calculated" : undefined}
            changeType="positive"
            icon={<TrendingUp className="h-5 w-5 text-purple-500" />}
            tooltip="The ratio between customer lifetime value and acquisition cost"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default GrowthMetricsPanel;

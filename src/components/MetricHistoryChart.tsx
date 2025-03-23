
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { MetricData, MetricHistoryEntry } from '@/types/metrics';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MetricHistoryChartProps {
  metric: MetricData;
}

const MetricHistoryChart = ({ metric }: MetricHistoryChartProps) => {
  const [historyData, setHistoryData] = useState<MetricHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showThresholds, setShowThresholds] = useState(true);
  const [thresholds, setThresholds] = useState<{warning: number, error: number}>({
    warning: 0,
    error: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch history data
        const { data: historyData, error: historyError } = await supabase
          .from('metric_history')
          .select('*')
          .eq('metric_id', metric.originalId || metric.id)
          .order('recorded_at', { ascending: true });
          
        if (historyError) throw historyError;
        
        // Fetch threshold data
        const { data: thresholdData, error: thresholdError } = await supabase
          .from('metric_thresholds')
          .select('*')
          .eq('metric_id', metric.originalId || metric.id)
          .maybeSingle();
          
        if (thresholdError) throw thresholdError;
        
        // Add the current value as the latest point if it's not already in history
        const hasCurrentInHistory = historyData?.some(h => 
          new Date(h.recorded_at).getTime() === new Date(metric.updated_at).getTime()
        );
        
        const completeHistoryData = [...(historyData || [])];
        
        if (!hasCurrentInHistory && metric.current) {
          completeHistoryData.push({
            id: 'current',
            metric_id: metric.originalId || metric.id,
            value: metric.current,
            status: metric.status,
            recorded_at: metric.updated_at,
            notes: 'Latest value',
            context: 'Current value'
          });
        }
        
        setHistoryData(completeHistoryData);
        
        if (thresholdData) {
          setThresholds({
            warning: parseFloat(thresholdData.warning_threshold) || 0,
            error: parseFloat(thresholdData.error_threshold) || 0
          });
        }
      } catch (err) {
        console.error('Error fetching metric data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (metric?.id) {
      fetchData();
    }
  }, [metric]);

  const formatChartData = () => {
    return historyData.map(item => {
      // Format date for display
      const date = parseISO(item.recorded_at);
      const formattedDate = format(date, 'MMM d');
      
      // Parse value for chart (remove % if present)
      let value = item.value;
      if (value && typeof value === 'string' && value.includes('%')) {
        value = value.replace('%', '');
      }
      
      return {
        date: formattedDate,
        fullDate: date,
        value: parseFloat(value || '0'),
        status: item.status,
        notes: item.notes,
        context: item.context
      };
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#10b981';
      case 'warning': return '#f59e0b';
      case 'error': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const chartData = formatChartData();
  const targetValue = parseFloat(metric.target);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="pt-6 flex items-center justify-center" style={{ height: '200px' }}>
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (historyData.length < 2) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">{metric.name} Trend</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 flex items-center justify-center" style={{ height: '150px' }}>
          <p className="text-gray-500 text-sm">Not enough data for a trend chart</p>
        </CardContent>
      </Card>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded shadow border border-gray-200 max-w-xs">
          <p className="font-medium text-sm">{format(data.fullDate, 'PPP')}</p>
          <p className="text-sm text-gray-600">
            Value: {data.value}
            {metric.current?.includes('%') ? '%' : ''}
          </p>
          {data.notes && (
            <p className="text-xs mt-1 border-t pt-1 border-gray-200">
              {data.notes}
            </p>
          )}
          {data.context && (
            <p className="text-xs text-gray-500 italic">
              {data.context}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{metric.name} Trend</CardTitle>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className="cursor-pointer" 
              onClick={() => setShowThresholds(!showThresholds)}
            >
              {showThresholds ? "Hide Thresholds" : "Show Thresholds"}
            </Badge>
            <TooltipProvider>
              <UITooltip>
                <TooltipTrigger asChild>
                  <div className="cursor-help">
                    <Info className="h-4 w-4 text-gray-400" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs max-w-xs">
                    This chart shows the history of values for this metric.
                    The target line is in blue, while warning and error thresholds
                    are shown in yellow and red.
                  </p>
                </TooltipContent>
              </UITooltip>
            </TooltipProvider>
          </div>
        </div>
        <CardDescription>
          Tracking historical performance against target ({metric.target})
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height: '250px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
              />
              <YAxis fontSize={12} domain={['auto', 'auto']} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Target line */}
              <ReferenceLine 
                y={targetValue} 
                label={{
                  value: 'Target',
                  position: 'insideTopRight'
                }} 
                stroke="#3b82f6"
                strokeDasharray="3 3"
              />
              
              {/* Threshold lines */}
              {showThresholds && thresholds.warning > 0 && (
                <ReferenceLine 
                  y={thresholds.warning} 
                  label={{
                    value: 'Warning',
                    position: 'insideTopRight'
                  }} 
                  stroke="#f59e0b"
                  strokeDasharray="3 3"
                />
              )}
              
              {showThresholds && thresholds.error > 0 && (
                <ReferenceLine 
                  y={thresholds.error} 
                  label={{
                    value: 'Critical',
                    position: 'insideTopRight'
                  }} 
                  stroke="#ef4444"
                  strokeDasharray="3 3"
                />
              )}
              
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ 
                  stroke: '#3b82f6', 
                  strokeWidth: 2, 
                  r: 4, 
                  fill: '#fff'
                }}
                activeDot={{ 
                  stroke: '#1e40af', 
                  strokeWidth: 2, 
                  r: 6,
                  fill: '#3b82f6'
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MetricHistoryChart;


import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { Metric, MetricHistory } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface MetricHistoryChartProps {
  metric: Metric;
}

const MetricHistoryChart = ({ metric }: MetricHistoryChartProps) => {
  const [historyData, setHistoryData] = useState<MetricHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('metric_history')
          .select('*')
          .eq('metric_id', metric.id)
          .order('recorded_at', { ascending: true });
          
        if (error) throw error;
        
        // Add the current value as the latest point
        const historyWithCurrent = [...(data || [])];
        if (metric.current) {
          historyWithCurrent.push({
            id: 'current',
            metric_id: metric.id,
            value: metric.current,
            status: metric.status,
            recorded_at: metric.updated_at
          });
        }
        
        setHistoryData(historyWithCurrent);
      } catch (err) {
        console.error('Error fetching metric history:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (metric?.id) {
      fetchHistory();
    }
  }, [metric]);

  const formatData = () => {
    return historyData.map(item => {
      // Format date for display
      const date = new Date(item.recorded_at);
      const formattedDate = format(date, 'MMM d');
      
      // Parse value for chart (remove % if present)
      let value = item.value;
      if (value && value.includes('%')) {
        value = value.replace('%', '');
      }
      
      return {
        date: formattedDate,
        fullDate: date,
        value: parseFloat(value || '0'),
        status: item.status
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

  const chartData = formatData();

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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{metric.name} Trend</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div style={{ height: '200px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                fontSize={12}
              />
              <YAxis fontSize={12} />
              <Tooltip 
                formatter={(value) => [`${value}${metric.current?.includes('%') ? '%' : ''}`, 'Value']}
                labelFormatter={(label) => `Date: ${label}`}
              />
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


import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Metric } from '@/types/database';
import MetricHistoryChart from './MetricHistoryChart';

interface MetricChartsProps {
  metrics: Metric[];
}

const MetricCharts = ({ metrics }: MetricChartsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<Metric | null>(
    metrics.length > 0 ? metrics[0] : null
  );

  // Count of metrics by status
  const statusCounts = metrics.reduce((acc: any, metric) => {
    acc[metric.status] = (acc[metric.status] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'Success', value: statusCounts.success || 0, color: '#10b981' },
    { name: 'Warning', value: statusCounts.warning || 0, color: '#f59e0b' },
    { name: 'Error', value: statusCounts.error || 0, color: '#ef4444' },
    { name: 'Not Started', value: statusCounts['not-started'] || 0, color: '#6b7280' },
  ];

  // Count of metrics by category
  const categoryCounts = metrics.reduce((acc: any, metric) => {
    const category = metric.category.charAt(0).toUpperCase() + metric.category.slice(1);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});

  const categoryData = Object.keys(categoryCounts).map(category => ({
    name: category,
    value: categoryCounts[category],
    color: getCategoryColor(category.toLowerCase())
  }));

  function getCategoryColor(category: string) {
    switch (category) {
      case 'acquisition': return '#3b82f6';
      case 'activation': return '#10b981';
      case 'retention': return '#8b5cf6';
      case 'revenue': return '#f59e0b';
      case 'referral': return '#ec4899';
      default: return '#6b7280';
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metrics Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => percent > 0 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} metric${value !== 1 ? 's' : ''}`, 'Count']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Metrics by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} metric${value !== 1 ? 's' : ''}`, 'Count']}
                  />
                  <Legend />
                  <Bar dataKey="value" name="Metrics">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Metric History</CardTitle>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No metrics available to show history</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {metrics.map(metric => (
                  <Badge
                    key={metric.id}
                    variant={selectedMetric?.id === metric.id ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedMetric(metric)}
                  >
                    {metric.name}
                  </Badge>
                ))}
              </div>
              
              {selectedMetric && (
                <MetricHistoryChart metric={selectedMetric} />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricCharts;

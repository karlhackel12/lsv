
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { MetricData } from '@/types/metrics';
import MetricHistoryChart from './MetricHistoryChart';
import { Calendar, TrendingUp, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MetricChartsProps {
  metrics: MetricData[];
}

const MetricCharts = ({ metrics }: MetricChartsProps) => {
  const [selectedMetric, setSelectedMetric] = useState<MetricData | null>(
    metrics.length > 0 ? metrics[0] : null
  );
  const [activeTab, setActiveTab] = useState('history');

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

  function getCategoryIcon(category: string) {
    switch (category) {
      case 'acquisition': return <Badge className="bg-blue-100 text-blue-800 border border-blue-200">Acquisition</Badge>;
      case 'activation': return <Badge className="bg-green-100 text-green-800 border border-green-200">Activation</Badge>;
      case 'retention': return <Badge className="bg-purple-100 text-purple-800 border border-purple-200">Retention</Badge>;
      case 'revenue': return <Badge className="bg-amber-100 text-amber-800 border border-amber-200">Revenue</Badge>;
      case 'referral': return <Badge className="bg-pink-100 text-pink-800 border border-pink-200">Referral</Badge>;
      default: return <Badge className="bg-gray-100 text-gray-800 border border-gray-200">Custom</Badge>;
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Metrics Status</CardTitle>
            <CardDescription>Distribution of metrics by current status</CardDescription>
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
            <CardDescription>Distribution of metrics across AARRR framework</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={categoryData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
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
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Metric Details</CardTitle>
              <CardDescription>Select a metric to view detailed analysis</CardDescription>
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[300px]">
              <TabsList>
                <TabsTrigger value="history" className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  Trend
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-1">
                  <BarChart2 className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {metrics.length === 0 ? (
            <p className="text-center text-gray-500 py-6">No metrics available to show history</p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-4">
                {metrics.map(metric => (
                  <Button
                    key={metric.id}
                    variant={selectedMetric?.id === metric.id ? "default" : "outline"}
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => setSelectedMetric(metric)}
                  >
                    <span>{metric.name}</span>
                    {getCategoryIcon(metric.category)}
                  </Button>
                ))}
              </div>
              
              <TabsContent value="history" className="mt-4">
                {selectedMetric && (
                  <MetricHistoryChart metric={selectedMetric} />
                )}
              </TabsContent>

              <TabsContent value="details" className="mt-4">
                {selectedMetric && (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Name</h4>
                            <p className="text-base">{selectedMetric.name}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Category</h4>
                            <p className="text-base capitalize">{selectedMetric.category}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium mb-1">Description</h4>
                          <p className="text-base">{selectedMetric.description || 'No description'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h4 className="text-sm font-medium mb-1">Current Value</h4>
                            <p className="text-xl font-semibold">{selectedMetric.current || 'Not set'}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Target Value</h4>
                            <p className="text-xl font-semibold">{selectedMetric.target}</p>
                          </div>
                          <div>
                            <h4 className="text-sm font-medium mb-1">Status</h4>
                            <Badge className={`
                              ${selectedMetric.status === 'success' ? 'bg-green-100 text-green-800 border-green-200' : ''}
                              ${selectedMetric.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' : ''}
                              ${selectedMetric.status === 'error' ? 'bg-red-100 text-red-800 border-red-200' : ''}
                              ${selectedMetric.status === 'not-started' ? 'bg-gray-100 text-gray-800 border-gray-200' : ''}
                            `}>
                              {selectedMetric.status}
                            </Badge>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Last Updated</h4>
                          <p className="text-sm text-gray-600">
                            {new Date(selectedMetric.updated_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="calendar" className="mt-4">
                {selectedMetric && (
                  <Card>
                    <CardContent className="pt-6">
                      <p className="text-center text-gray-500 py-12">
                        Timeline view will be implemented in a future update
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MetricCharts;

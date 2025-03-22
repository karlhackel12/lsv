
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

interface MetricChartsProps {
  metrics: any[];
}

const MetricCharts = ({ metrics }: MetricChartsProps) => {
  // Group metrics by category
  const acquisitionMetrics = metrics.filter(m => m.category === 'acquisition');
  const activationMetrics = metrics.filter(m => m.category === 'activation');
  const retentionMetrics = metrics.filter(m => m.category === 'retention');
  const revenueMetrics = metrics.filter(m => m.category === 'revenue');
  const referralMetrics = metrics.filter(m => m.category === 'referral');

  // Generate sample data for demonstration
  // In a real app, you would fetch historical metric data
  const generateSampleData = (metricsArray: any[], category: string) => {
    if (metricsArray.length === 0) return [];
    
    return [
      { name: 'Week 1', value: Math.floor(Math.random() * 100) },
      { name: 'Week 2', value: Math.floor(Math.random() * 100) },
      { name: 'Week 3', value: Math.floor(Math.random() * 100) },
      { name: 'Week 4', value: Math.floor(Math.random() * 100) },
      { name: 'Week 5', value: Math.floor(Math.random() * 100) },
      { name: 'Week 6', value: Math.floor(Math.random() * 100) },
    ];
  };

  // Sample data for each category
  const acquisitionData = generateSampleData(acquisitionMetrics, 'acquisition');
  const activationData = generateSampleData(activationMetrics, 'activation');
  const retentionData = generateSampleData(retentionMetrics, 'retention');
  const revenueData = generateSampleData(revenueMetrics, 'revenue');
  const referralData = generateSampleData(referralMetrics, 'referral');

  // AARRR framework comparison data
  const aaarrData = [
    { name: 'Acquisition', value: acquisitionMetrics.length > 0 ? parseInt(acquisitionMetrics[0].current || '0') : 0 },
    { name: 'Activation', value: activationMetrics.length > 0 ? parseInt(activationMetrics[0].current || '0') : 0 },
    { name: 'Retention', value: retentionMetrics.length > 0 ? parseInt(retentionMetrics[0].current || '0') : 0 },
    { name: 'Revenue', value: revenueMetrics.length > 0 ? parseInt(revenueMetrics[0].current || '0') : 0 },
    { name: 'Referral', value: referralMetrics.length > 0 ? parseInt(referralMetrics[0].current || '0') : 0 },
  ];

  const getChartColor = (category: string) => {
    switch (category) {
      case 'acquisition': return '#0EA5E9';
      case 'activation': return '#8B5CF6';
      case 'retention': return '#10B981';
      case 'revenue': return '#F97316';
      case 'referral': return '#D946EF';
      default: return '#8E9196';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>AARRR Framework Overview</CardTitle>
          <CardDescription>
            Comparison of key metrics across all categories
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={aaarrData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Current Value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {acquisitionMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Acquisition Metrics</CardTitle>
              <CardDescription>
                {acquisitionMetrics[0].name} - Target: {acquisitionMetrics[0].target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={acquisitionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={getChartColor('acquisition')} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {activationMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Activation Metrics</CardTitle>
              <CardDescription>
                {activationMetrics[0].name} - Target: {activationMetrics[0].target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={activationData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={getChartColor('activation')} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {retentionMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Retention Metrics</CardTitle>
              <CardDescription>
                {retentionMetrics[0].name} - Target: {retentionMetrics[0].target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={retentionData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={getChartColor('retention')} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {revenueMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Revenue Metrics</CardTitle>
              <CardDescription>
                {revenueMetrics[0].name} - Target: {revenueMetrics[0].target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={revenueData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={getChartColor('revenue')} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {referralMetrics.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Referral Metrics</CardTitle>
              <CardDescription>
                {referralMetrics[0].name} - Target: {referralMetrics[0].target}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={referralData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke={getChartColor('referral')} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MetricCharts;


import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GrowthMetric, GrowthModel, GrowthChannel } from '@/types/database';
import { Users, Activity, DollarSign } from 'lucide-react';
import { ChartContainer, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { CartesianGrid, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface GrowthTypesPanelProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  channels: GrowthChannel[];
}

// Sample data for testing - would be replaced with real data
const viralData = [
  { month: 'Jan', referralRate: 0.15, viralCoefficient: 0.7, kFactor: 0.65 },
  { month: 'Feb', referralRate: 0.18, viralCoefficient: 0.8, kFactor: 0.75 },
  { month: 'Mar', referralRate: 0.22, viralCoefficient: 0.9, kFactor: 0.85 },
  { month: 'Apr', referralRate: 0.25, viralCoefficient: 1.1, kFactor: 1.05 },
  { month: 'May', referralRate: 0.28, viralCoefficient: 1.2, kFactor: 1.15 },
  { month: 'Jun', referralRate: 0.32, viralCoefficient: 1.3, kFactor: 1.25 },
];

const stickyData = [
  { day: '1', retention: 100 },
  { day: '7', retention: 65 },
  { day: '14', retention: 55 },
  { day: '30', retention: 40 },
  { day: '60', retention: 35 },
  { day: '90', retention: 30 },
];

const churnData = [
  { month: 'Jan', churnRate: 8.5, reactivationRate: 2.1 },
  { month: 'Feb', churnRate: 7.8, reactivationRate: 2.3 },
  { month: 'Mar', churnRate: 7.2, reactivationRate: 2.5 },
  { month: 'Apr', churnRate: 6.5, reactivationRate: 2.8 },
  { month: 'May', churnRate: 5.9, reactivationRate: 3.2 },
  { month: 'Jun', churnRate: 5.4, reactivationRate: 3.5 },
];

const paidData = [
  { channel: 'Google Ads', cac: 45, ltvCacRatio: 2.2, paybackPeriod: 4.5 },
  { channel: 'Facebook', cac: 38, ltvCacRatio: 2.5, paybackPeriod: 4.0 },
  { channel: 'Instagram', cac: 42, ltvCacRatio: 2.3, paybackPeriod: 4.2 },
  { channel: 'LinkedIn', cac: 65, ltvCacRatio: 3.1, paybackPeriod: 3.5 },
  { channel: 'Twitter', cac: 30, ltvCacRatio: 1.8, paybackPeriod: 5.2 },
];

const chartConfig = {
  referralRate: { label: 'Referral Rate' },
  viralCoefficient: { label: 'Viral Coefficient' },
  kFactor: { label: 'K-Factor' },
  churnRate: { label: 'Churn Rate' },
  reactivationRate: { label: 'Reactivation Rate' },
};

const GrowthTypesPanel = ({ growthModel, projectId, metrics, channels }: GrowthTypesPanelProps) => {
  const [activeGrowthTab, setActiveGrowthTab] = useState('viral');

  return (
    <div className="space-y-6">
      <Tabs defaultValue="viral" value={activeGrowthTab} onValueChange={setActiveGrowthTab}>
        <TabsList className="grid grid-cols-3 max-w-md mb-6">
          <TabsTrigger value="viral" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Viral Growth</span>
          </TabsTrigger>
          <TabsTrigger value="sticky" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <span>Sticky Growth</span>
          </TabsTrigger>
          <TabsTrigger value="paid" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            <span>Paid Growth</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="viral" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Viral Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={viralData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="referralRate" stroke="#8884d8" name="Referral Rate" />
                      <Line type="monotone" dataKey="viralCoefficient" stroke="#82ca9d" name="Viral Coefficient" />
                      <Line type="monotone" dataKey="kFactor" stroke="#ffc658" name="K-Factor" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Viral Growth Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Referral Rate</h3>
                    <p className="text-2xl font-semibold">{(viralData[viralData.length - 1].referralRate * 100).toFixed(1)}%</p>
                    <p className="text-sm text-gray-500">Percentage of users who refer at least one new user</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Viral Coefficient</h3>
                    <p className="text-2xl font-semibold">{viralData[viralData.length - 1].viralCoefficient.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      {viralData[viralData.length - 1].viralCoefficient >= 1 
                        ? "Your product is experiencing viral growth (>1.0)" 
                        : "Not yet viral (<1.0), but showing steady improvement"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">K-Factor</h3>
                    <p className="text-2xl font-semibold">{viralData[viralData.length - 1].kFactor.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Number of new users each user brings on average</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="sticky" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Retention Curve</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={stickyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" label={{ value: 'Days', position: 'insideBottom', offset: -10 }} />
                      <YAxis label={{ value: 'Retention %', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Line type="monotone" dataKey="retention" stroke="#8884d8" name="User Retention %" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Churn & Reactivation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <LineChart data={churnData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="churnRate" stroke="#ff6b6b" name="Churn Rate %" />
                      <Line type="monotone" dataKey="reactivationRate" stroke="#51cf66" name="Reactivation Rate %" />
                    </LineChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Sticky Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">60-Day Retention</h3>
                    <p className="text-2xl font-semibold">{stickyData[3].retention}%</p>
                    <p className="text-sm text-gray-500">
                      {stickyData[3].retention >= 60 
                        ? "Excellent retention (>60%)" 
                        : "Below target of 60%"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Current Churn Rate</h3>
                    <p className="text-2xl font-semibold">{churnData[churnData.length - 1].churnRate}%</p>
                    <p className="text-sm text-gray-500">Monthly user churn</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Reactivation Rate</h3>
                    <p className="text-2xl font-semibold">{churnData[churnData.length - 1].reactivationRate}%</p>
                    <p className="text-sm text-gray-500">Returning users who previously churned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="paid" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Acquisition Cost (CAC) by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={paidData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis label={{ value: 'CAC ($)', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="cac" fill="#8884d8" name="CAC" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>LTV:CAC Ratio by Channel</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ChartContainer config={chartConfig}>
                    <BarChart data={paidData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="channel" />
                      <YAxis label={{ value: 'LTV:CAC Ratio', angle: -90, position: 'insideLeft' }} />
                      <Tooltip />
                      <Bar dataKey="ltvCacRatio" fill="#82ca9d" name="LTV:CAC Ratio" />
                    </BarChart>
                  </ChartContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Paid Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average LTV:CAC Ratio</h3>
                    <p className="text-2xl font-semibold">
                      {(paidData.reduce((sum, item) => sum + item.ltvCacRatio, 0) / paidData.length).toFixed(1)}:1
                    </p>
                    <p className="text-sm text-gray-500">
                      {paidData.reduce((sum, item) => sum + item.ltvCacRatio, 0) / paidData.length >= 3 
                        ? "Good ratio (>3:1)" 
                        : "Below target ratio of 3:1"}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Average CAC</h3>
                    <p className="text-2xl font-semibold">
                      ${(paidData.reduce((sum, item) => sum + item.cac, 0) / paidData.length).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">Average cost to acquire one customer</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Payback Period</h3>
                    <p className="text-2xl font-semibold">
                      {(paidData.reduce((sum, item) => sum + item.paybackPeriod, 0) / paidData.length).toFixed(1)} months
                    </p>
                    <p className="text-sm text-gray-500">Time to recoup acquisition cost</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GrowthTypesPanel;

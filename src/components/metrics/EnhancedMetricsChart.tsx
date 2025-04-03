import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart as BarChartIcon,
  LineChart as LineChartIcon,
  PieChart as PieChartIcon
} from 'lucide-react';

interface ChartData {
  name: string;
  value: number;
  fill?: string;
}

interface MetricsChartProps {
  title: string;
  description?: string;
  data: ChartData[];
  valueSuffix?: string; // e.g. '%', '$', etc.
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const EnhancedMetricsChart = ({ 
  title, 
  description,
  data,
  valueSuffix = ''
}: MetricsChartProps) => {
  const [chartType, setChartType] = useState<'line' | 'bar' | 'pie'>('bar');
  
  // Custom tooltip formatter
  const formatTooltipValue = (value: number) => {
    return `${value}${valueSuffix}`;
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && (
              <p className="text-sm text-gray-500">{description}</p>
            )}
          </div>
          
          <Tabs 
            value={chartType} 
            onValueChange={(value) => setChartType(value as 'line' | 'bar' | 'pie')}
            className="w-auto"
          >
            <TabsList className="grid w-auto grid-cols-3 bg-gray-100">
              <TabsTrigger value="bar" className="text-xs px-2 py-1 data-[state=active]:bg-white">
                <BarChartIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="line" className="text-xs px-2 py-1 data-[state=active]:bg-white">
                <LineChartIcon className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="pie" className="text-xs px-2 py-1 data-[state=active]:bg-white">
                <PieChartIcon className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      <CardContent className="pt-3">
        <div className="h-80">
          <TabsContent value="bar" className="mt-0 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatTooltipValue(value as number), title]} />
                <Legend />
                <Bar dataKey="value" fill="#3b82f6" name={title} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="line" className="mt-0 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [formatTooltipValue(value as number), title]} />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#3b82f6" name={title} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          
          <TabsContent value="pie" className="mt-0 h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip formatter={(value) => [formatTooltipValue(value as number), title]} />
              </PieChart>
            </ResponsiveContainer>
          </TabsContent>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedMetricsChart; 
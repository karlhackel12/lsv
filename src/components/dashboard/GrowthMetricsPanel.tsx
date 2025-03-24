
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, DollarSign, LineChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';

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
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <TrendingUp className="h-5 w-5 mr-2 text-purple-500" />
          Growth Metrics
          <InfoTooltip 
            text="Track key metrics related to your growth model" 
            link="/lean-startup-methodology" 
            className="ml-2"
          />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Customer Acquisition Cost"
            value="$24.50"
            change="12.5%"
            changeType="negative"
            icon={<DollarSign className="h-5 w-5 text-blue-500" />}
            tooltip="The cost to acquire one new customer (CAC)"
          />
          <MetricCard
            title="Lifetime Value"
            value="$156.00"
            change="8.3%"
            changeType="positive"
            icon={<Users className="h-5 w-5 text-green-500" />}
            tooltip="The total revenue expected from a customer (LTV)"
          />
          <MetricCard
            title="Conversion Rate"
            value="3.2%"
            change="0.5%"
            changeType="positive"
            icon={<LineChart className="h-5 w-5 text-yellow-500" />}
            tooltip="Percentage of visitors who become customers"
          />
          <MetricCard
            title="LTV:CAC Ratio"
            value="6.4:1"
            change="15.2%"
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

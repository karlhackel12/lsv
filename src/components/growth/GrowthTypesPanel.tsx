
import React from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GrowthModel, GrowthMetric, GrowthChannel } from '@/types/database';
import { 
  TrendingUp, 
  Repeat, 
  DollarSign,
  Users,
  ChevronsUp
} from 'lucide-react';

interface GrowthTypesPanelProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  channels: GrowthChannel[];
}

const GrowthTypesPanel = ({ 
  growthModel, 
  projectId, 
  metrics, 
  channels 
}: GrowthTypesPanelProps) => {
  // Filter metrics by category for each growth type
  const viralMetrics = metrics.filter(m => 
    m.category === 'referral' || m.name.toLowerCase().includes('viral') || 
    m.name.toLowerCase().includes('referral') || m.name.toLowerCase().includes('k-factor')
  );
  
  const stickyMetrics = metrics.filter(m => 
    m.category === 'retention' || m.name.toLowerCase().includes('retention') || 
    m.name.toLowerCase().includes('churn') || m.name.toLowerCase().includes('active')
  );
  
  const paidMetrics = metrics.filter(m => 
    m.category === 'acquisition' && channels.some(c => c.category === 'paid') || 
    m.name.toLowerCase().includes('cac') || m.name.toLowerCase().includes('ltv')
  );

  // Helper function to calculate progress
  const calculateProgress = (current: number, target: number) => {
    if (target === 0) return 0;
    const progress = (current / target) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // Helper function to format values
  const formatValue = (value: number, unit: string) => {
    switch (unit) {
      case 'percentage':
        return `${value}%`;
      case 'currency':
        return `$${value.toLocaleString()}`;
      case 'ratio':
        return value.toFixed(2);
      case 'time':
        return `${value} days`;
      default:
        return value.toLocaleString();
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Viral Growth Panel */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-500" />
                Viral Growth
              </CardTitle>
              <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full">
                {viralMetrics.length} metrics
              </span>
            </div>
            <CardDescription>
              User-to-user growth through referrals
            </CardDescription>
          </CardHeader>
          <CardContent>
            {viralMetrics.length > 0 ? (
              <div className="space-y-4">
                {viralMetrics.map(metric => (
                  <div key={metric.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-sm">
                      <span>{metric.name}</span>
                      <span className="font-medium">
                        {formatValue(metric.current_value, metric.unit)} / {formatValue(metric.target_value, metric.unit)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(metric.current_value, metric.target_value)} 
                      className="h-1.5" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                <Users className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No viral metrics defined yet</p>
                <p className="text-xs mt-1">Add metrics in the "Metrics" tab</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sticky Growth Panel */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <Repeat className="h-5 w-5 mr-2 text-purple-500" />
                Sticky Growth
              </CardTitle>
              <span className="text-xs px-2 py-1 bg-purple-100 text-purple-800 rounded-full">
                {stickyMetrics.length} metrics
              </span>
            </div>
            <CardDescription>
              User retention and engagement over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stickyMetrics.length > 0 ? (
              <div className="space-y-4">
                {stickyMetrics.map(metric => (
                  <div key={metric.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-sm">
                      <span>{metric.name}</span>
                      <span className="font-medium">
                        {formatValue(metric.current_value, metric.unit)} / {formatValue(metric.target_value, metric.unit)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(metric.current_value, metric.target_value)} 
                      className="h-1.5" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                <Repeat className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No retention metrics defined yet</p>
                <p className="text-xs mt-1">Add metrics in the "Metrics" tab</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Paid Growth Panel */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <DollarSign className="h-5 w-5 mr-2 text-blue-500" />
                Paid Growth
              </CardTitle>
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                {paidMetrics.length} metrics
              </span>
            </div>
            <CardDescription>
              Acquisition through paid channels
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paidMetrics.length > 0 ? (
              <div className="space-y-4">
                {paidMetrics.map(metric => (
                  <div key={metric.id} className="space-y-1">
                    <div className="flex justify-between items-baseline text-sm">
                      <span>{metric.name}</span>
                      <span className="font-medium">
                        {formatValue(metric.current_value, metric.unit)} / {formatValue(metric.target_value, metric.unit)}
                      </span>
                    </div>
                    <Progress 
                      value={calculateProgress(metric.current_value, metric.target_value)} 
                      className="h-1.5" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-sm text-gray-500">
                <DollarSign className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No paid acquisition metrics defined yet</p>
                <p className="text-xs mt-1">Add metrics in the "Metrics" tab</p>
              </div>
            )}
            
            {channels.filter(c => c.category === 'paid').length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Paid Channels</h4>
                <div className="space-y-2">
                  {channels.filter(c => c.category === 'paid').map(channel => (
                    <div key={channel.id} className="flex justify-between text-xs">
                      <span>{channel.name}</span>
                      <span className="font-medium">
                        {channel.cac ? `CAC: $${channel.cac}` : 'No CAC data'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GrowthTypesPanel;

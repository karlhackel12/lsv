
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription,
  CardFooter 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { GrowthModel, GrowthMetric, GrowthChannel } from '@/types/database';
import { 
  Rocket, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  BarChart3,
  Users,
  Repeat,
  ArrowRight,
  DollarSign,
  Server,
  FileText
} from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface ScalingReadinessSectionProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  channels: GrowthChannel[];
}

const ScalingReadinessSection = ({ 
  growthModel, 
  projectId, 
  metrics, 
  channels 
}: ScalingReadinessSectionProps) => {
  const [showPlan, setShowPlan] = useState(false);
  
  // Define scaling criteria
  const scalingCriteria = [
    {
      id: 'unit-economics',
      name: 'Unit Economics',
      description: 'LTV:CAC ratio greater than 3:1',
      icon: <DollarSign className="h-5 w-5" />,
      checkFn: () => {
        const ltv = metrics.find(m => 
          m.name.toLowerCase().includes('ltv') || 
          m.name.toLowerCase().includes('lifetime value')
        );
        const cac = metrics.find(m => 
          m.name.toLowerCase().includes('cac') || 
          m.name.toLowerCase().includes('acquisition cost')
        );
        
        if (!ltv || !cac) return 'unknown';
        
        const ratio = ltv.current_value / cac.current_value;
        if (ratio >= 3) return 'passed';
        if (ratio >= 2) return 'warning';
        return 'failed';
      },
      metrics: metrics.filter(m => 
        m.name.toLowerCase().includes('ltv') || 
        m.name.toLowerCase().includes('cac') || 
        m.name.toLowerCase().includes('lifetime value') || 
        m.name.toLowerCase().includes('acquisition cost')
      )
    },
    {
      id: 'retention',
      name: 'Retention Curve Flattening',
      description: 'At least 60% retention at 60 days',
      icon: <Repeat className="h-5 w-5" />,
      checkFn: () => {
        const retention = metrics.find(m => 
          (m.name.toLowerCase().includes('retention') && m.name.toLowerCase().includes('day')) || 
          (m.name.toLowerCase().includes('retention') && m.name.toLowerCase().includes('60'))
        );
        
        if (!retention) return 'unknown';
        
        if (retention.current_value >= 60) return 'passed';
        if (retention.current_value >= 40) return 'warning';
        return 'failed';
      },
      metrics: metrics.filter(m => 
        m.name.toLowerCase().includes('retention') || 
        m.name.toLowerCase().includes('churn') || 
        m.category === 'retention'
      )
    },
    {
      id: 'channels',
      name: 'Acquisition Channel Diversification',
      description: 'At least 2 reliable channels with predictable CAC',
      icon: <BarChart3 className="h-5 w-5" />,
      checkFn: () => {
        const reliableChannels = channels.filter(c => 
          c.status === 'active' && c.cac !== undefined && c.cac > 0
        );
        
        if (reliableChannels.length >= 2) return 'passed';
        if (reliableChannels.length === 1) return 'warning';
        return 'failed';
      },
      channels: channels.filter(c => c.status === 'active')
    },
    {
      id: 'team',
      name: 'Team Capacity',
      description: 'Team structured by key functions with hired leads',
      icon: <Users className="h-5 w-5" />,
      checkFn: () => {
        // Since we don't have team data, this is placeholder logic
        return 'unknown';
      }
    },
    {
      id: 'infrastructure',
      name: 'Tech Infrastructure Scalability',
      description: 'Systems can handle 10x current load without major rework',
      icon: <Server className="h-5 w-5" />,
      checkFn: () => {
        // Since we don't have infrastructure data, this is placeholder logic
        return 'unknown';
      }
    }
  ];
  
  // Calculate overall readiness
  const criteriaResults = scalingCriteria.map(c => c.checkFn());
  const passedCount = criteriaResults.filter(r => r === 'passed').length;
  const warningCount = criteriaResults.filter(r => r === 'warning').length;
  const failedCount = criteriaResults.filter(r => r === 'failed').length;
  const unknownCount = criteriaResults.filter(r => r === 'unknown').length;
  
  const readinessPercentage = Math.round(
    ((passedCount * 100) + (warningCount * 50)) / 
    ((scalingCriteria.length - unknownCount) * 100) * 100
  ) || 0;
  
  const getReadinessStatus = () => {
    if (readinessPercentage >= 80) return 'Ready to Scale';
    if (readinessPercentage >= 50) return 'Almost Ready';
    return 'Not Ready';
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <span className="h-5 w-5 rounded-full bg-gray-200" />;
    }
  };
  
  const getReadinessColor = () => {
    if (readinessPercentage >= 80) return 'text-green-600';
    if (readinessPercentage >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Generate scaling plan
  const generateScalingPlan = () => {
    setShowPlan(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Scaling Readiness Assessment</h2>
        {!showPlan && (
          <Button onClick={generateScalingPlan} className="flex items-center gap-2">
            <Rocket className="h-4 w-4" />
            Generate Scaling Plan
          </Button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle>Scaling Prerequisites</CardTitle>
            <CardDescription>
              Critical metrics and capabilities needed before scaling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {scalingCriteria.map((criteria, index) => {
                const status = criteria.checkFn();
                return (
                  <AccordionItem key={criteria.id} value={criteria.id}>
                    <AccordionTrigger className="py-4">
                      <div className="flex items-center text-left">
                        <div className="mr-3">{criteria.icon}</div>
                        <div>
                          <div className="font-medium">{criteria.name}</div>
                          <div className="text-sm text-gray-500">{criteria.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center ml-auto mr-4">
                        {getStatusIcon(status)}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-8 pb-4">
                      {criteria.metrics && criteria.metrics.length > 0 && (
                        <div className="space-y-3">
                          <h4 className="text-sm font-medium">Related Metrics</h4>
                          {criteria.metrics.map(metric => (
                            <div key={metric.id} className="flex justify-between items-center text-sm">
                              <span>{metric.name}</span>
                              <span className="font-medium">
                                {metric.unit === 'currency' ? '$' : ''}
                                {metric.current_value.toString()}
                                {metric.unit === 'percentage' ? '%' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {criteria.channels && criteria.channels.length > 0 && (
                        <div className="space-y-3 mt-4">
                          <h4 className="text-sm font-medium">Active Channels</h4>
                          {criteria.channels.map(channel => (
                            <div key={channel.id} className="flex justify-between items-center text-sm">
                              <span>{channel.name}</span>
                              <span className="font-medium">
                                {channel.cac ? `CAC: $${channel.cac}` : 'No CAC data'}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {(!criteria.metrics || criteria.metrics.length === 0) && 
                       (!criteria.channels || criteria.channels.length === 0) && (
                        <div className="text-sm text-gray-500">
                          No data available for this criterion yet.
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge 
                            variant={status === 'passed' ? 'default' : 
                                    status === 'warning' ? 'outline' : 'destructive'}
                          >
                            {status === 'passed' ? 'Passed' : 
                             status === 'warning' ? 'Needs Improvement' : 
                             status === 'failed' ? 'Not Ready' : 'Unknown'}
                          </Badge>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                );
              })}
            </Accordion>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Overall Readiness</CardTitle>
            <CardDescription>
              Current scaling readiness assessment
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center justify-center py-4">
              <div className="relative w-40 h-40 flex items-center justify-center">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle 
                    className="text-gray-200" 
                    strokeWidth="10" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                  <circle 
                    className={`${readinessPercentage >= 80 ? 'text-green-500' : 
                                  readinessPercentage >= 50 ? 'text-yellow-500' : 'text-red-500'}`}
                    strokeWidth="10" 
                    strokeDasharray={`${readinessPercentage * 2.51} 251`}
                    strokeLinecap="round" 
                    stroke="currentColor" 
                    fill="transparent" 
                    r="40" 
                    cx="50" 
                    cy="50" 
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className={`text-3xl font-bold ${getReadinessColor()}`}>{readinessPercentage}%</span>
                  <span className="text-sm text-gray-500">{getReadinessStatus()}</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" /> Passed
                </span>
                <span className="font-medium">{passedCount}/{scalingCriteria.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mr-1" /> Needs Work
                </span>
                <span className="font-medium">{warningCount}/{scalingCriteria.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm flex items-center">
                  <XCircle className="h-4 w-4 text-red-600 mr-1" /> Not Ready
                </span>
                <span className="font-medium">{failedCount}/{scalingCriteria.length}</span>
              </div>
              {unknownCount > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm flex items-center">
                    <span className="h-4 w-4 rounded-full bg-gray-200 mr-1" /> Unknown
                  </span>
                  <span className="font-medium">{unknownCount}/{scalingCriteria.length}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      {showPlan && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Rocket className="h-5 w-5 mr-2 text-blue-600" />
              Scaling Plan
            </CardTitle>
            <CardDescription>
              Automated recommendations based on your current readiness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Phased Scaling Roadmap</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize Unit Economics</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Focus on improving your LTV:CAC ratio before attempting significant scaling.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Improve Retention Metrics</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Work on flattening your retention curve to ensure sustainable growth.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">3</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Diversify Acquisition Channels</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Test and validate multiple channels to reduce dependency on a single source.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Resource Allocation Recommendations</h3>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Invest in retention initiatives to improve long-term user value</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Optimize paid acquisition channels with highest conversion rates</span>
                  </div>
                  <div className="flex items-center">
                    <ArrowRight className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Develop referral program to leverage network effects</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Risk Mitigation Strategies</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-1 text-yellow-600" />
                    <div>
                      <span className="font-medium">High CAC Risk:</span>
                      <span className="text-sm text-gray-600 ml-1">
                        Set strict spending limits and monitor daily to prevent overspending during scaling.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-1 text-yellow-600" />
                    <div>
                      <span className="font-medium">Retention Drop Risk:</span>
                      <span className="text-sm text-gray-600 ml-1">
                        Implement cohort analysis to quickly identify changes in retention patterns.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full">
              <h3 className="text-lg font-medium mb-2">Go/No-Go Decision</h3>
              <div className="flex items-center mt-2">
                {readinessPercentage >= 80 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-600">Ready to Scale</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Your growth model has strong fundamentals for scaling.
                    </p>
                  </>
                ) : readinessPercentage >= 50 ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-600">Proceed with Caution</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Address key metrics before aggressive scaling.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-600">Not Ready</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Scaling not recommended until fundamental metrics improve.
                    </p>
                  </>
                )}
              </div>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ScalingReadinessSection;


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
  FileText,
  LineChart,
  Scale,
  FlaskConical,
  TrendingUp,
  Target,
  GitFork
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
  
  // Get core metrics
  const getLtvMetric = () => {
    return metrics.find(m => 
      m.name.toLowerCase().includes('ltv') || 
      m.name.toLowerCase().includes('lifetime value')
    );
  };
  
  const getCacMetric = () => {
    return metrics.find(m => 
      m.name.toLowerCase().includes('cac') || 
      m.name.toLowerCase().includes('acquisition cost')
    );
  };
  
  const getConversionMetric = () => {
    return metrics.find(m => 
      m.name.toLowerCase().includes('conversion rate') || 
      m.category === 'conversion'
    );
  };
  
  const getRetentionMetric = () => {
    return metrics.find(m => 
      m.name.toLowerCase().includes('retention') || 
      m.category === 'retention'
    );
  };
  
  // Calculate LTV:CAC ratio
  const calculateLtvCacRatio = () => {
    const ltv = getLtvMetric();
    const cac = getCacMetric();
    
    if (!ltv || !cac || cac.current_value === 0) return 0;
    return ltv.current_value / cac.current_value;
  };
  
  // Define scaling criteria based on Lean Startup principles
  const scalingCriteria = [
    {
      id: 'unit-economics',
      name: 'Unit Economics',
      description: 'LTV:CAC ratio greater than 3:1',
      icon: <DollarSign className="h-5 w-5" />,
      checkFn: () => {
        const ratio = calculateLtvCacRatio();
        
        if (ratio >= 3) return 'passed';
        if (ratio >= 2) return 'warning';
        return 'failed';
      },
      metrics: [getLtvMetric(), getCacMetric()].filter(Boolean),
      learnMore: 'Unit economics are fundamental for sustainable growth. A ratio of 3:1 or higher indicates a healthy business model.'
    },
    {
      id: 'retention',
      name: 'Retention Curve Flattening',
      description: 'Retention curve has flattened (60+ days)',
      icon: <Repeat className="h-5 w-5" />,
      checkFn: () => {
        const retention = getRetentionMetric();
        
        if (!retention) return 'unknown';
        
        if (retention.current_value >= 60) return 'passed';
        if (retention.current_value >= 40) return 'warning';
        return 'failed';
      },
      metrics: metrics.filter(m => 
        m.name.toLowerCase().includes('retention') || 
        m.name.toLowerCase().includes('churn') || 
        m.category === 'retention'
      ),
      learnMore: 'A flattened retention curve indicates product-market fit - users continue to use your product over time.'
    },
    {
      id: 'acquisition-channels',
      name: 'Acquisition Channel Validation',
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
      channels: channels.filter(c => c.status === 'active'),
      learnMore: 'Having multiple validated acquisition channels reduces risk and enables predictable scaling.'
    },
    {
      id: 'innovation-accounting',
      name: 'Innovation Accounting',
      description: 'Using metrics that demonstrate causation, not just correlation',
      icon: <LineChart className="h-5 w-5" />,
      checkFn: () => {
        // This is a qualitative assessment, we'll assume it's based on whether the core metrics are present
        const hasCoreMetrics = Boolean(getLtvMetric() && getCacMetric() && getConversionMetric());
        
        if (hasCoreMetrics) return 'passed';
        return 'warning';
      },
      metrics: metrics.filter(m => m.category === 'acquisition' || m.category === 'conversion' || m.category === 'revenue'),
      learnMore: 'Innovation accounting uses actionable metrics that demonstrate causation, not just correlation, helping to validate your business model.'
    },
    {
      id: 'engine-of-growth',
      name: 'Engine of Growth Clarity',
      description: 'Clear engine of growth (sticky, viral, or paid) with metrics to prove it',
      icon: <TrendingUp className="h-5 w-5" />,
      checkFn: () => {
        // Check if we have metrics that support growth engines
        const hasRetentionMetrics = metrics.some(m => m.category === 'retention');
        const hasViralMetrics = metrics.some(m => m.name.toLowerCase().includes('referral') || m.name.toLowerCase().includes('viral'));
        const hasPaidMetrics = Boolean(getCacMetric());
        
        if ((hasRetentionMetrics || hasViralMetrics || hasPaidMetrics) && calculateLtvCacRatio() > 1) {
          return 'passed';
        }
        if (hasRetentionMetrics || hasViralMetrics || hasPaidMetrics) {
          return 'warning';
        }
        return 'failed';
      },
      metrics: metrics.filter(m => m.category === 'retention' || m.name.toLowerCase().includes('viral') || m.category === 'acquisition'),
      learnMore: 'The Lean Startup identifies three engines of growth: sticky (retention), viral (referrals), and paid. Clarity on which you\'re using is crucial for scaling.'
    },
    {
      id: 'mvp-iterations',
      name: 'MVP Iteration Velocity',
      description: 'Fast iteration cycles with measured learning',
      icon: <FlaskConical className="h-5 w-5" />,
      checkFn: () => {
        // This would ideally be based on experiment data but we'll use a placeholder
        return 'warning';
      },
      learnMore: 'The speed at which you can iterate on your product based on user feedback is crucial for achieving product-market fit before scaling.'
    },
    {
      id: 'pivot-or-persevere',
      name: 'Pivot or Persevere Decision',
      description: 'Clear decision framework based on validated learning',
      icon: <GitFork className="h-5 w-5" />,
      checkFn: () => {
        // This is a qualitative assessment
        if (calculateLtvCacRatio() > 3 && getRetentionMetric()?.current_value > 60) {
          return 'passed'; // Strong metrics indicate persevere
        }
        return 'warning'; // Absence of strong signals means clarity is needed
      },
      metrics: [getLtvMetric(), getCacMetric(), getRetentionMetric()].filter(Boolean),
      learnMore: 'Being clear about when to pivot or persevere based on validated metrics is essential for smart resource allocation.'
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
            <CardTitle>Lean Startup Scaling Prerequisites</CardTitle>
            <CardDescription>
              Critical metrics and capabilities needed before scaling, based on Lean Startup methodology
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
                      
                      {criteria.learnMore && (
                        <div className="mt-4 text-sm text-gray-600 bg-blue-50 p-3 rounded-md border border-blue-100">
                          <strong>Lean Startup Insight:</strong> {criteria.learnMore}
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
              Current scaling readiness based on Lean Startup criteria
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
              Lean Startup Scaling Plan
            </CardTitle>
            <CardDescription>
              Structured recommendations based on your readiness and Lean Startup principles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Engine of Growth Optimization</h3>
                <div className="space-y-4">
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">1</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Identify Your Primary Engine</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Focus on one engine of growth: Sticky (retention), Viral (word-of-mouth), or Paid (advertising).
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">2</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Optimize Core Metrics for Your Engine</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Sticky: Focus on retention metrics and reducing churn<br/>
                        Viral: Measure and improve viral coefficient<br/>
                        Paid: Ensure LTV:CAC ratio exceeds 3:1
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="mr-4">
                      <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">3</div>
                    </div>
                    <div>
                      <h4 className="font-medium">Validate Sustainable Growth</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        Test increasing investment in your primary engine to confirm predictable scaling before full commitment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Pivot or Persevere Decision Framework</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Set specific thresholds for core metrics that trigger pivot considerations</span>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Schedule regular pivot/persevere meetings with decision frameworks</span>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Document validated learning to support decision making</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Innovation Accounting Implementation</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Create cohort-based analysis for all core metrics</span>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Replace vanity metrics with actionable metrics that drive decisions</span>
                  </div>
                  <div className="flex items-start">
                    <ArrowRight className="h-4 w-4 mr-2 mt-1 text-blue-600" />
                    <span>Establish baseline metrics and measurable growth hypotheses</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Pre-Scaling Risk Assessment</h3>
                <div className="space-y-2">
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-1 text-yellow-600" />
                    <div>
                      <span className="font-medium">Unit Economics Risk:</span>
                      <span className="text-sm text-gray-600 ml-1">
                        Ensure positive unit economics before scaling to avoid burning through capital without a path to profitability.
                      </span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <AlertCircle className="h-4 w-4 mr-2 mt-1 text-yellow-600" />
                    <div>
                      <span className="font-medium">Premature Scaling Risk:</span>
                      <span className="text-sm text-gray-600 ml-1">
                        Scale only after achieving validated learning about your engine of growth to avoid wasting resources.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t pt-4">
            <div className="w-full">
              <h3 className="text-lg font-medium mb-2">Lean Startup Go/No-Go Decision</h3>
              <div className="flex items-center mt-2">
                {readinessPercentage >= 80 ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                    <span className="font-medium text-green-600">Ready to Scale</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Your metrics show validated learning and engine of growth is ready for scaling.
                    </p>
                  </>
                ) : readinessPercentage >= 50 ? (
                  <>
                    <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
                    <span className="font-medium text-yellow-600">Proceed with Caution</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Continue experiments to validate key metrics before aggressive scaling.
                    </p>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="font-medium text-red-600">Not Ready</span>
                    <p className="text-sm text-gray-600 ml-3">
                      Focus on validating your business model before considering scaling.
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

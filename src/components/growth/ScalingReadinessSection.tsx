
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle, ChevronDown, ChevronUp, Download, BarChart2 } from 'lucide-react';
import { GrowthMetric, GrowthModel, GrowthChannel } from '@/types/database';

interface ScalingReadinessSectionProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  channels: GrowthChannel[];
}

// Scaling thresholds and assessment criteria
const scalingCriteria = [
  {
    id: 'unit-economics',
    name: 'Unit Economics Validation',
    description: 'Your LTV:CAC ratio should be at least 3:1',
    targetValue: 3,
    currentValue: 2.5,
    metricKey: 'ltvCacRatio',
    status: 'at-risk', // 'ready', 'at-risk', 'not-ready'
    resourceRequirement: 'Optimize customer lifetime value or reduce acquisition costs',
    timelineToReady: '2-3 months'
  },
  {
    id: 'retention',
    name: 'Retention Curve Flattening',
    description: 'You should have >60% retention at 60 days',
    targetValue: 60,
    currentValue: 40,
    metricKey: 'retentionRate',
    status: 'not-ready',
    resourceRequirement: 'Implement customer success program and product improvements',
    timelineToReady: '4-6 months'
  },
  {
    id: 'channels',
    name: 'Acquisition Channel Diversification',
    description: 'You need at least 2 reliable channels with predictable CAC',
    targetValue: 2,
    currentValue: 1,
    metricKey: 'reliableChannels',
    status: 'at-risk',
    resourceRequirement: 'Test and scale additional marketing channels',
    timelineToReady: '3-4 months'
  },
  {
    id: 'team',
    name: 'Team Capacity',
    description: 'Team structured by function with clear roles',
    targetValue: 100,
    currentValue: 75,
    metricKey: 'teamCapacity',
    status: 'at-risk',
    resourceRequirement: 'Hire key roles in sales, marketing, and customer success',
    timelineToReady: '2-3 months'
  },
  {
    id: 'infrastructure',
    name: 'Tech Infrastructure Scalability',
    description: 'Systems can handle 10x current load with minimal changes',
    targetValue: 100,
    currentValue: 90,
    metricKey: 'techScalability',
    status: 'ready',
    resourceRequirement: 'Minor infrastructure optimizations',
    timelineToReady: 'Ready now'
  }
];

const ScalingReadinessSection = ({ growthModel, projectId, metrics, channels }: ScalingReadinessSectionProps) => {
  const [activeScalingTab, setActiveScalingTab] = useState('checklist');
  const [expandedItems, setExpandedItems] = useState<string[]>(['unit-economics']);

  const toggleItem = (id: string) => {
    if (expandedItems.includes(id)) {
      setExpandedItems(expandedItems.filter(item => item !== id));
    } else {
      setExpandedItems([...expandedItems, id]);
    }
  };

  // Calculate overall readiness score (simple average for demo)
  const readyItems = scalingCriteria.filter(item => item.status === 'ready').length;
  const atRiskItems = scalingCriteria.filter(item => item.status === 'at-risk').length;
  const overallReadiness = Math.round((readyItems * 100 + atRiskItems * 50) / scalingCriteria.length);

  // Generate scaling plan based on current readiness
  const generateScalingPlan = () => {
    let recommendations: string[] = [];
    let riskMitigation: string[] = [];

    if (overallReadiness < 50) {
      recommendations.push("Focus on achieving product-market fit before scaling");
      recommendations.push("Improve unit economics by reducing CAC or increasing LTV");
      riskMitigation.push("Limit marketing spend until retention improves");
      riskMitigation.push("Implement customer success program to reduce churn");
    } else if (overallReadiness < 75) {
      recommendations.push("Begin gradual scaling while addressing at-risk areas");
      recommendations.push("Add one additional acquisition channel before full scale");
      riskMitigation.push("Establish weekly growth metrics reviews");
      riskMitigation.push("Set spending caps per channel until performance stabilizes");
    } else {
      recommendations.push("Ready for aggressive scaling across multiple channels");
      recommendations.push("Invest in team expansion to support growth");
      riskMitigation.push("Implement thorough onboarding to maintain retention during growth");
      riskMitigation.push("Set up alerting system for key metrics that fall below thresholds");
    }

    return { recommendations, riskMitigation };
  };

  const scalingPlan = generateScalingPlan();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'bg-green-500';
      case 'at-risk': return 'bg-yellow-500';
      case 'not-ready': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getDecision = () => {
    if (overallReadiness >= 75) return { text: 'GO', color: 'text-green-600' };
    if (overallReadiness >= 50) return { text: 'CAUTION', color: 'text-yellow-600' };
    return { text: 'NO-GO', color: 'text-red-600' };
  };

  const decision = getDecision();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <BarChart2 className="h-5 w-5 mr-2 text-blue-500" />
          Scaling Readiness Assessment
        </CardTitle>
        <CardDescription>
          Evaluate your readiness to scale based on key metrics and prerequisites
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center mb-6">
          <div className="mr-4">
            <span className="text-sm text-gray-500">Overall Readiness</span>
            <div className="flex items-center gap-3 mt-1">
              <Progress value={overallReadiness} className="h-2 w-40" />
              <span className="font-medium">{overallReadiness}%</span>
            </div>
          </div>
          <div className="ml-auto text-right">
            <span className="text-sm text-gray-500">Scaling Decision</span>
            <p className={`text-lg font-bold ${decision.color}`}>{decision.text}</p>
          </div>
        </div>

        <Tabs defaultValue="checklist" value={activeScalingTab} onValueChange={setActiveScalingTab}>
          <TabsList className="grid grid-cols-3 max-w-md mb-6">
            <TabsTrigger value="checklist">Checklist</TabsTrigger>
            <TabsTrigger value="risk-matrix">Risk Matrix</TabsTrigger>
            <TabsTrigger value="scaling-plan">Scaling Plan</TabsTrigger>
          </TabsList>
          
          <TabsContent value="checklist">
            <div className="space-y-4">
              {scalingCriteria.map(criterion => (
                <div 
                  key={criterion.id} 
                  className="border rounded-lg overflow-hidden"
                >
                  <div 
                    className={`p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50`}
                    onClick={() => toggleItem(criterion.id)}
                  >
                    <div className="flex items-center">
                      <div className={`h-3 w-3 rounded-full ${getStatusColor(criterion.status)} mr-3`}></div>
                      <h3 className="font-medium">{criterion.name}</h3>
                    </div>
                    <div className="flex items-center">
                      <div className="mr-4 text-right">
                        <span className="text-sm text-gray-500 block">
                          {criterion.currentValue} / {criterion.targetValue}
                        </span>
                      </div>
                      {expandedItems.includes(criterion.id) ? (
                        <ChevronUp className="h-5 w-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                  
                  {expandedItems.includes(criterion.id) && (
                    <div className="px-4 pb-4 pt-2 bg-gray-50 border-t">
                      <p className="text-sm text-gray-600 mb-3">
                        {criterion.description}
                      </p>
                      
                      <div className="flex items-center mb-3">
                        <span className="text-xs text-gray-500 w-24">Progress:</span>
                        <Progress 
                          value={(criterion.currentValue / criterion.targetValue) * 100} 
                          className="h-2 flex-1 mr-2" 
                        />
                        <span className="text-xs font-medium">
                          {Math.round((criterion.currentValue / criterion.targetValue) * 100)}%
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Requirements:</span>
                          <p className="text-gray-700">{criterion.resourceRequirement}</p>
                        </div>
                        <div>
                          <span className="text-xs text-gray-500 block mb-1">Timeline:</span>
                          <p className="text-gray-700">{criterion.timelineToReady}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="risk-matrix">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Risk Assessment Matrix</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scalingCriteria.map(criterion => (
                      <div key={criterion.id} className="flex items-center">
                        <div className="w-1/2">
                          <span className="text-sm font-medium">{criterion.name}</span>
                        </div>
                        <div className="w-1/2 flex items-center">
                          <div className="flex-1 mr-2">
                            <Progress 
                              value={(criterion.currentValue / criterion.targetValue) * 100} 
                              className={`h-3 ${
                                criterion.status === 'ready' ? 'bg-green-100' :
                                criterion.status === 'at-risk' ? 'bg-yellow-100' : 'bg-red-100'
                              }`}
                            />
                          </div>
                          {criterion.status === 'ready' ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertCircle className={`h-5 w-5 ${
                              criterion.status === 'at-risk' ? 'text-yellow-500' : 'text-red-500'
                            }`} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Critical Path To Scale</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {scalingCriteria
                      .filter(c => c.status !== 'ready')
                      .sort((a, b) => {
                        // Sort not-ready before at-risk
                        if (a.status === 'not-ready' && b.status === 'at-risk') return -1;
                        if (a.status === 'at-risk' && b.status === 'not-ready') return 1;
                        return 0;
                      })
                      .map(criterion => (
                        <div key={criterion.id} className="border-l-4 pl-3 py-1 mb-2 -ml-1 border-l-yellow-500">
                          <h4 className="font-medium text-sm">{criterion.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{criterion.resourceRequirement}</p>
                          <div className="flex justify-between mt-1">
                            <span className="text-xs">Timeline: {criterion.timelineToReady}</span>
                            <span className="text-xs font-medium">
                              {Math.round((criterion.currentValue / criterion.targetValue) * 100)}% complete
                            </span>
                          </div>
                        </div>
                    ))}
                    
                    {scalingCriteria.filter(c => c.status !== 'ready').length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6">
                        <CheckCircle className="h-12 w-12 text-green-500 mb-3" />
                        <p className="text-center text-gray-700">All criteria have been met!</p>
                        <p className="text-center text-gray-500 text-sm mt-1">You're ready to scale your business</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="scaling-plan">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Scaling Roadmap & Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Phased Scaling Approach</h3>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {scalingPlan.recommendations.map((rec, index) => (
                          <li key={index}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">Risk Mitigation Strategies</h3>
                      <ul className="list-disc pl-5 space-y-2 text-sm">
                        {scalingPlan.riskMitigation.map((risk, index) => (
                          <li key={index}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Go/No-Go Decision Framework</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center justify-center p-4">
                    <div className={`text-3xl font-bold mb-4 ${decision.color}`}>
                      {decision.text}
                    </div>
                    
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-600">
                        {decision.text === 'GO' && "You're ready to scale! All critical metrics are in a good position."}
                        {decision.text === 'CAUTION' && "You can scale with caution, but address at-risk areas first."}
                        {decision.text === 'NO-GO' && "Not ready to scale yet. Focus on addressing critical prerequisites."}
                      </p>
                    </div>
                    
                    <div className="w-full">
                      <div className="text-sm font-medium text-gray-500 mb-2">Readiness Score</div>
                      <div className="flex items-center gap-3">
                        <Progress value={overallReadiness} className="h-3 flex-1" />
                        <span className="font-medium w-12 text-right">{overallReadiness}%</span>
                      </div>
                      
                      <div className="flex justify-between mt-6">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Ready</div>
                          <div className="text-lg font-medium">{readyItems}/{scalingCriteria.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">At Risk</div>
                          <div className="text-lg font-medium">{atRiskItems}/{scalingCriteria.length}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Not Ready</div>
                          <div className="text-lg font-medium">
                            {scalingCriteria.length - readyItems - atRiskItems}/{scalingCriteria.length}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="mt-6" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Export Scaling Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ScalingReadinessSection;

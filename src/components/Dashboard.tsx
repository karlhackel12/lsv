
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, Beaker, BarChart2, TrendingUp, Users, Settings, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Layers } from 'lucide-react';
import LeanStartupBanner from '@/components/dashboard/LeanStartupBanner';
import BusinessPlanBanner from '@/components/dashboard/BusinessPlanBanner';
import InfoTooltip from '@/components/InfoTooltip';
import { adaptGrowthExperimentToExperiment } from '@/utils/experiment-adapters';
import { GrowthExperiment } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

const Dashboard = () => {
  const {
    currentProject
  } = useProject();
  const navigate = useNavigate();
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [mvpFeatures, setMvpFeatures] = useState<any[]>([]);
  const [growthExperiments, setGrowthExperiments] = useState<any[]>([]);
  const [scalingMetrics, setScalingMetrics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (currentProject) {
      fetchDashboardData();
    }
  }, [currentProject]);
  
  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch hypotheses
      const {
        data: hypothesesData,
        error: hypothesesError
      } = await supabase.from('hypotheses').select('*').eq('project_id', currentProject?.id).order('updated_at', {
        ascending: false
      }).limit(5);
      if (hypothesesError) throw hypothesesError;

      // Fetch experiments
      const {
        data: experimentsData,
        error: experimentsError
      } = await supabase.from('experiments').select('*').eq('project_id', currentProject?.id).order('updated_at', {
        ascending: false
      }).limit(5);
      if (experimentsError) throw experimentsError;

      // Fetch metrics
      const {
        data: metricsData,
        error: metricsError
      } = await supabase.from('metrics').select('*').eq('project_id', currentProject?.id).limit(5);
      if (metricsError) throw metricsError;

      // Fetch MVP features
      const {
        data: mvpData,
        error: mvpError
      } = await supabase.from('mvp_features').select('*').eq('project_id', currentProject?.id).order('updated_at', {
        ascending: false
      }).limit(5);
      if (mvpError) throw mvpError;

      // Fetch growth experiments
      const {
        data: growthExperimentsData,
        error: growthExperimentsError
      } = await supabase.from('growth_experiments').select('*').eq('project_id', currentProject?.id).order('updated_at', {
        ascending: false
      }).limit(5);
      if (growthExperimentsError) throw growthExperimentsError;

      // Fetch scaling readiness metrics
      const {
        data: scalingMetricsData,
        error: scalingMetricsError
      } = await supabase.from('scaling_readiness_metrics').select('*').eq('project_id', currentProject?.id).order('importance', {
        ascending: false
      }).limit(5);
      if (scalingMetricsError) throw scalingMetricsError;

      setHypotheses(hypothesesData || []);
      setExperiments(experimentsData || []);
      setMetrics(metricsData || []);
      setMvpFeatures(mvpData || []);
      setGrowthExperiments(growthExperimentsData || []);
      setScalingMetrics(scalingMetricsData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate scaling readiness score based on metrics
  const calculateReadinessScore = () => {
    if (scalingMetrics.length === 0) return 0;
    
    let totalWeight = 0;
    let achievedWeight = 0;
    
    scalingMetrics.forEach(metric => {
      const weight = metric.importance || 1;
      totalWeight += weight;
      
      if (metric.status === 'achieved') {
        achievedWeight += weight;
      } else if (metric.status === 'on-track') {
        achievedWeight += (weight * 0.75);
      } else if (metric.status === 'needs-improvement') {
        achievedWeight += (weight * 0.25);
      }
      // critical and pending contribute 0
    });
    
    return Math.round((achievedWeight / totalWeight) * 100);
  };
  
  if (!currentProject) {
    return <div>Please select a project to view the dashboard.</div>;
  }
  
  return <div className="space-y-6">
      <LeanStartupBanner />
      <BusinessPlanBanner />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
              Hypothesis Testing
              <InfoTooltip text="Validate your business assumptions systematically" link="/lean-startup-methodology" className="ml-2" />
            </CardTitle>
            <CardDescription>Validate your business assumptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hypotheses.length}</div>
            <p className="text-sm text-muted-foreground">Active hypotheses</p>
            
            {hypotheses.length > 0 ? <div className="mt-4 space-y-3">
                {hypotheses.slice(0, 3).map(hypothesis => <div key={hypothesis.id} className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-2"></div>
                    <div className="text-sm line-clamp-2">{hypothesis.statement}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No hypotheses created yet
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-blue-600" onClick={() => navigate('/hypotheses')}>
              View All Hypotheses
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Beaker className="mr-2 h-5 w-5 text-green-500" />
              Experiments
              <InfoTooltip text="Test and learn systematically through structured experiments" link="/lean-startup-methodology" className="ml-2" />
            </CardTitle>
            <CardDescription>Test and learn systematically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-sm text-muted-foreground">Total experiments</p>
            
            {experiments.length > 0 ? <div className="mt-4 space-y-3">
                {experiments.slice(0, 3).map(experiment => <div key={experiment.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${experiment.status === 'completed' ? 'bg-green-500' : experiment.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm line-clamp-2">{experiment.title}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No experiments created yet
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-green-600" onClick={() => navigate('/experiments')}>
              View All Experiments
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Layers className="mr-2 h-5 w-5 text-yellow-500" />
              MVP Features
              <InfoTooltip text="Minimum Viable Product features that deliver core value" link="/lean-startup-methodology" className="ml-2" />
            </CardTitle>
            <CardDescription>Track your core feature development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mvpFeatures.length}</div>
            <p className="text-sm text-muted-foreground">Defined features</p>
            
            {mvpFeatures.length > 0 ? <div className="mt-4 space-y-3">
                {mvpFeatures.slice(0, 3).map(feature => <div key={feature.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${feature.status === 'completed' ? 'bg-green-500' : feature.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm line-clamp-2">{feature.feature}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No MVP features defined yet
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-yellow-600" onClick={() => navigate('/mvp')}>
              View MVP Features
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
            Growth Experiments
            <InfoTooltip text="Optimize your growth metrics through focused experiments" link="/growth" className="ml-2" />
          </CardTitle>
          <CardDescription>Accelerate your growth metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{growthExperiments.length}</div>
          <p className="text-sm text-muted-foreground">Growth experiments</p>
          
          {growthExperiments.length > 0 ? (
            <div className="mt-4 space-y-4">
              {growthExperiments.slice(0, 3).map(experiment => {
                const status = experiment.status === 'running' ? 'in-progress' : 
                               experiment.status === 'completed' || experiment.status === 'failed' ? 'completed' : 
                               'planned';
                const statusColor = status === 'completed' ? 'bg-green-500' : 
                                   status === 'in-progress' ? 'bg-yellow-500' : 
                                   'bg-gray-400';
                return (
                  <div key={experiment.id} className="flex flex-col">
                    <div className="flex items-start">
                      <div className={`w-2 h-2 mt-1.5 rounded-full ${statusColor} mr-2`}></div>
                      <div className="text-sm font-medium">{experiment.title}</div>
                    </div>
                    <div className="ml-4 flex items-center mt-1 text-xs text-gray-500">
                      <span>Expected lift: {experiment.expected_lift}%</span>
                      {experiment.actual_lift !== null && (
                        <span className="ml-3">Actual: {experiment.actual_lift}%</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
              No growth experiments created yet
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full text-purple-600" onClick={() => navigate('/experiments?type=growth')}>
            View Growth Experiments
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-teal-500" />
            Scaling Readiness
            <InfoTooltip text="Track your startup's readiness to scale" link="/growth?tab=scaling_readiness" className="ml-2" />
          </CardTitle>
          <CardDescription>Evaluate your scaling readiness</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold">{calculateReadinessScore()}%</div>
            <p className="text-sm text-muted-foreground">Overall readiness</p>
          </div>
          
          <div className="mt-2">
            <Progress value={calculateReadinessScore()} className="h-2" />
          </div>
          
          {scalingMetrics.length > 0 ? (
            <div className="mt-4 space-y-3">
              {scalingMetrics.slice(0, 3).map(metric => {
                const statusColor = metric.status === 'achieved' ? 'bg-green-100 text-green-800 border-green-200' : 
                                   metric.status === 'on-track' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                                   metric.status === 'needs-improvement' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                                   metric.status === 'critical' ? 'bg-red-100 text-red-800 border-red-200' :
                                   'bg-gray-100 text-gray-800 border-gray-200';
                                   
                return (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-start flex-1">
                      <div className="text-sm line-clamp-1">{metric.name}</div>
                    </div>
                    <Badge variant="outline" className={statusColor}>
                      {metric.status.charAt(0).toUpperCase() + metric.status.slice(1).replace('-', ' ')}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
              No scaling metrics defined yet
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full text-teal-600" onClick={() => navigate('/growth?tab=scaling_readiness')}>
            View Scaling Readiness
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default Dashboard;

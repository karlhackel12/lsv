import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, Beaker, BarChart2, TrendingUp, Users, Settings, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Layers } from 'lucide-react';
import InfoTooltip from '@/components/InfoTooltip';
import { adaptGrowthExperimentToExperiment } from '@/utils/experiment-adapters';
import { GrowthExperiment } from '@/types/database';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';

const Dashboard = () => {
  const {
    currentProject
  } = useProject();
  const navigate = useNavigate();
  const { t } = useTranslation();
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
    return <div>{t('dashboard.selectProject')}</div>;
  }
  
  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
              {t('dashboard.hypothesisTesting')}
              <InfoTooltip content={t('dashboard.validateAssumptions')} className="ml-2" />
            </CardTitle>
            <CardDescription>{t('dashboard.validateAssumptions')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hypotheses.length}</div>
            <p className="text-sm text-muted-foreground">{t('dashboard.activeHypotheses')}</p>
            
            {hypotheses.length > 0 ? <div className="mt-4 space-y-3">
                {hypotheses.slice(0, 3).map(hypothesis => <div key={hypothesis.id} className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-2"></div>
                    <div className="text-sm line-clamp-2">{hypothesis.statement}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                {t('dashboard.noHypotheses')}
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-blue-600" onClick={() => navigate('/problem-validation')}>
              {t('dashboard.viewAllHypotheses')}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Beaker className="mr-2 h-5 w-5 text-green-500" />
              {t('dashboard.experiments')}
              <InfoTooltip content={t('dashboard.systematicTesting')} className="ml-2" />
            </CardTitle>
            <CardDescription>{t('dashboard.systematicTesting')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-sm text-muted-foreground">{t('dashboard.totalExperiments')}</p>
            
            {experiments.length > 0 ? <div className="mt-4 space-y-3">
                {experiments.slice(0, 3).map(experiment => <div key={experiment.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${experiment.status === 'completed' ? 'bg-green-500' : experiment.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm line-clamp-2">{experiment.title}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                {t('dashboard.noExperiments')}
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-green-600" onClick={() => navigate('/experiments')}>
              {t('dashboard.viewAllExperiments')}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Layers className="mr-2 h-5 w-5 text-yellow-500" />
              {t('dashboard.mvpFeatures')}
              <InfoTooltip content={t('dashboard.trackCoreDevelopment')} className="ml-2" />
            </CardTitle>
            <CardDescription>{t('dashboard.trackCoreDevelopment')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mvpFeatures.length}</div>
            <p className="text-sm text-muted-foreground">{t('dashboard.definedFeatures')}</p>
            
            {mvpFeatures.length > 0 ? <div className="mt-4 space-y-3">
                {mvpFeatures.slice(0, 3).map(feature => <div key={feature.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${feature.status === 'completed' ? 'bg-green-500' : feature.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'}`}></div>
                    <div className="text-sm line-clamp-2">{feature.feature}</div>
                  </div>)}
              </div> : <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                {t('dashboard.noMvpFeatures')}
              </div>}
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full text-yellow-600" onClick={() => navigate('/mvp')}>
              {t('dashboard.viewMvpFeatures')}
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
            {t('dashboard.growthExperiments')}
            <InfoTooltip content={t('dashboard.accelerateGrowth')} className="ml-2" />
          </CardTitle>
          <CardDescription>{t('dashboard.accelerateGrowth')}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{growthExperiments.length}</div>
          <p className="text-sm text-muted-foreground">{t('dashboard.growthExperiments')}</p>
          
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
                      <span>{t('dashboard.expectedLift')}: {experiment.expected_lift}%</span>
                      {experiment.actual_lift ? (
                        <Badge variant={parseFloat(experiment.actual_lift) > 0 ? "success" : "destructive"} className="ml-2">
                          {experiment.actual_lift}%
                        </Badge>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
              Nenhum experimento de crescimento definido ainda
            </div>
          )}
          
          <div className="mt-4 space-y-2">
            <Button 
              variant="outline" 
              className="w-full text-purple-600"
              onClick={() => navigate('/growth')}
            >
              {t('dashboard.viewGrowthExperiments')}
            </Button>
            <Button 
              className="w-full"
              onClick={() => navigate('/experiments?create=true&type=growth')}
            >
              {t('dashboard.createGrowthExperiment')}
            </Button>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-indigo-500" />
              {t('dashboard.keyMetrics')}
              <InfoTooltip content={t('dashboard.trackProgress')} className="ml-2" />
            </CardTitle>
            <CardDescription>{t('dashboard.trackProgress')}</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="space-y-4">
                {metrics.slice(0, 3).map(metric => (
                  <div key={metric.id} className="flex flex-col">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{metric.name}</span>
                      <span className="text-sm">
                        {metric.current_value} / {metric.target_value} 
                        <span className="text-xs text-gray-500 ml-1">{metric.unit}</span>
                      </span>
                    </div>
                    <Progress 
                      className="mt-2" 
                      value={(metric.current_value / metric.target_value) * 100} 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-md text-sm text-gray-500 text-center">
                {t('dashboard.noMetrics')}
              </div>
            )}
            
            <div className="mt-4 space-y-2">
              <Button 
                variant="outline" 
                className="w-full text-indigo-600"
                onClick={() => navigate('/metrics')}
              >
                {t('dashboard.viewAllMetrics')}
              </Button>
              <Button 
                className="w-full"
                onClick={() => navigate('/metrics?create=true')}
              >
                {t('dashboard.createNewMetric')}
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Target className="mr-2 h-5 w-5 text-rose-500" />
              {t('dashboard.scalingReadiness')}
              <InfoTooltip content="Avalie sua preparação para escalar com base em métricas críticas de negócio" className="ml-2" />
            </CardTitle>
            <CardDescription>Avalie sua preparação para escalar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-2">
              <div className="relative h-32 w-32 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="h-full w-full">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="10"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke={`${calculateReadinessScore() > 70 ? '#10b981' : calculateReadinessScore() > 40 ? '#eab308' : '#ef4444'}`}
                    strokeWidth="10"
                    strokeDasharray={`${calculateReadinessScore() * 2.83} 283`}
                    strokeDashoffset="0"
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute text-3xl font-bold">{calculateReadinessScore()}%</div>
              </div>
              <div className="mt-2 text-sm text-center text-gray-500">
                {t('dashboard.readinessScore')}
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                variant="outline" 
                className="w-full text-rose-600"
                onClick={() => navigate('/scaling-readiness')}
              >
                {t('dashboard.viewScalingDetails')}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <CheckCircle2 className="mr-2 h-5 w-5 text-green-500" />
            {t('dashboard.validationProgress')}
          </CardTitle>
          <CardDescription>Progresso através das fases da metodologia Lean Startup</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{t('dashboard.problemDefinition')}</span>
                <span className="text-xs">{hypotheses.filter(h => h.is_validated).length}/{hypotheses.length}</span>
              </div>
              <Progress value={hypotheses.length > 0 ? (hypotheses.filter(h => h.is_validated).length / hypotheses.length) * 100 : 0} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{t('dashboard.solutionExploration')}</span>
                <span className="text-xs">{experiments.filter(e => e.status === 'completed').length}/{experiments.length}</span>
              </div>
              <Progress value={experiments.length > 0 ? (experiments.filter(e => e.status === 'completed').length / experiments.length) * 100 : 0} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{t('dashboard.productMarketFit')}</span>
                <span className="text-xs">{mvpFeatures.filter(f => f.status === 'completed').length}/{mvpFeatures.length}</span>
              </div>
              <Progress value={mvpFeatures.length > 0 ? (mvpFeatures.filter(f => f.status === 'completed').length / mvpFeatures.length) * 100 : 0} />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{t('dashboard.scalingMotion')}</span>
                <span className="text-xs">{calculateReadinessScore()}%</span>
              </div>
              <Progress value={calculateReadinessScore()} />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>;
};

export default Dashboard;

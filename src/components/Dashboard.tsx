import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/hooks/use-project';
import { supabase } from '@/integrations/supabase/client';
import { Metric, Experiment, Hypothesis } from '@/types/database';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Target, Lightbulb, Beaker, BarChart2, TrendingUp, Users, Settings, Clock, ArrowRight } from 'lucide-react';
import PhaseNavigation from '@/components/PhaseNavigation';
import { Layers } from 'lucide-react';

const Dashboard = () => {
  const { currentProject } = useProject();
  const navigate = useNavigate();
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [experiments, setExperiments] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [mvpFeatures, setMvpFeatures] = useState<any[]>([]);
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
      const { data: hypothesesData, error: hypothesesError } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', currentProject?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (hypothesesError) throw hypothesesError;
      
      // Fetch experiments
      const { data: experimentsData, error: experimentsError } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', currentProject?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (experimentsError) throw experimentsError;
      
      // Fetch metrics
      const { data: metricsData, error: metricsError } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', currentProject?.id)
        .limit(5);
        
      if (metricsError) throw metricsError;
      
      // Fetch MVP features
      const { data: mvpData, error: mvpError } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', currentProject?.id)
        .order('updated_at', { ascending: false })
        .limit(5);
        
      if (mvpError) throw mvpError;
      
      setHypotheses(hypothesesData || []);
      setExperiments(experimentsData || []);
      setMetrics(metricsData || []);
      setMvpFeatures(mvpData || []);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!currentProject) {
    return <div>Please select a project to view the dashboard.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">{currentProject.name}</h1>
          <p className="text-muted-foreground">{currentProject.description}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/settings')} className="flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Project Settings
        </Button>
      </div>
      
      <PhaseNavigation />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Lightbulb className="mr-2 h-5 w-5 text-blue-500" />
              Hypothesis Testing
            </CardTitle>
            <CardDescription>Validate your business assumptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hypotheses.length}</div>
            <p className="text-sm text-muted-foreground">Active hypotheses</p>
            
            {hypotheses.length > 0 ? (
              <div className="mt-4 space-y-3">
                {hypotheses.slice(0, 3).map((hypothesis) => (
                  <div key={hypothesis.id} className="flex items-start">
                    <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-500 mr-2"></div>
                    <div className="text-sm line-clamp-2">{hypothesis.statement}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No hypotheses created yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full text-blue-600" 
              onClick={() => navigate('/hypotheses')}
            >
              View All Hypotheses
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Beaker className="mr-2 h-5 w-5 text-green-500" />
              Experiments
            </CardTitle>
            <CardDescription>Test and learn systematically</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{experiments.length}</div>
            <p className="text-sm text-muted-foreground">Total experiments</p>
            
            {experiments.length > 0 ? (
              <div className="mt-4 space-y-3">
                {experiments.slice(0, 3).map((experiment) => (
                  <div key={experiment.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                      experiment.status === 'completed' ? 'bg-green-500' : 
                      experiment.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="text-sm line-clamp-2">{experiment.title}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No experiments created yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full text-green-600" 
              onClick={() => navigate('/experiments')}
            >
              View All Experiments
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Layers className="mr-2 h-5 w-5 text-yellow-500" />
              MVP Features
            </CardTitle>
            <CardDescription>Track your core feature development</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mvpFeatures.length}</div>
            <p className="text-sm text-muted-foreground">Defined features</p>
            
            {mvpFeatures.length > 0 ? (
              <div className="mt-4 space-y-3">
                {mvpFeatures.slice(0, 3).map((feature) => (
                  <div key={feature.id} className="flex items-start">
                    <div className={`w-2 h-2 mt-1.5 rounded-full mr-2 ${
                      feature.status === 'completed' ? 'bg-green-500' : 
                      feature.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-400'
                    }`}></div>
                    <div className="text-sm line-clamp-2">{feature.feature}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 p-4 bg-gray-50 rounded-md text-sm text-gray-500">
                No MVP features defined yet
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full text-yellow-600" 
              onClick={() => navigate('/mvp')}
            >
              View MVP Features
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="mr-2 h-5 w-5 text-purple-500" />
            Validation Journey
          </CardTitle>
          <CardDescription>
            Track your progress through the lean startup validation process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-8">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Button 
                variant="outline" 
                className="flex-1 h-auto py-6 flex flex-col items-center justify-center border-blue-100 hover:border-blue-200 text-blue-800"
                onClick={() => navigate('/hypotheses?phase=problem')}
              >
                <Lightbulb className="h-8 w-8 mb-2 text-blue-500" />
                <span className="text-lg font-medium">Problem Validation</span>
                <span className="text-sm mt-1 text-blue-600">Verify that you're solving a real problem</span>
                <ArrowRight className="h-5 w-5 mt-4 text-blue-400" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 h-auto py-6 flex flex-col items-center justify-center border-green-100 hover:border-green-200 text-green-800"
                onClick={() => navigate('/hypotheses?phase=solution')}
              >
                <Beaker className="h-8 w-8 mb-2 text-green-500" />
                <span className="text-lg font-medium">Solution Validation</span>
                <span className="text-sm mt-1 text-green-600">Test that your solution addresses the problem</span>
                <ArrowRight className="h-5 w-5 mt-4 text-green-400" />
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
              <Button 
                variant="outline" 
                className="flex-1 h-auto py-6 flex flex-col items-center justify-center border-yellow-100 hover:border-yellow-200 text-yellow-800"
                onClick={() => navigate('/mvp')}
              >
                <Layers className="h-8 w-8 mb-2 text-yellow-500" />
                <span className="text-lg font-medium">MVP Testing</span>
                <span className="text-sm mt-1 text-yellow-600">Build and validate your minimum viable product</span>
                <ArrowRight className="h-5 w-5 mt-4 text-yellow-400" />
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 h-auto py-6 flex flex-col items-center justify-center border-purple-100 hover:border-purple-200 text-purple-800"
                onClick={() => navigate('/growth')}
              >
                <TrendingUp className="h-8 w-8 mb-2 text-purple-500" />
                <span className="text-lg font-medium">Growth Model Validation</span>
                <span className="text-sm mt-1 text-purple-600">Optimize your acquisition, retention and revenue</span>
                <ArrowRight className="h-5 w-5 mt-4 text-purple-400" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

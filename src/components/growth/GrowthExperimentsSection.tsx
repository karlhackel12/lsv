
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Beaker, Calendar, TrendingUp, Target, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { GrowthExperiment, GrowthMetric, GrowthModel } from '@/types/database';
import GrowthExperimentForm from '@/components/forms/GrowthExperimentForm';
import StructuredHypothesisForm from '@/components/growth/StructuredHypothesisForm';
import DeleteGrowthExperimentDialog from '@/components/growth/DeleteGrowthExperimentDialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';

interface GrowthExperimentsSectionProps {
  experiments: GrowthExperiment[];
  metrics: GrowthMetric[];
  growthModel: GrowthModel;
  projectId: string;
  refreshData: () => Promise<void>;
}

const GrowthExperimentsSection = ({ 
  experiments, 
  metrics, 
  growthModel, 
  projectId, 
  refreshData 
}: GrowthExperimentsSectionProps) => {
  const [showForm, setShowForm] = useState(false);
  const [showHypothesisForm, setShowHypothesisForm] = useState(false);
  const [editingExperiment, setEditingExperiment] = useState<GrowthExperiment | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [experimentToDelete, setExperimentToDelete] = useState<GrowthExperiment | null>(null);
  const { toast } = useToast();

  const handleOpenForm = (experiment?: GrowthExperiment) => {
    setEditingExperiment(experiment || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingExperiment(null);
  };

  const handleOpenHypothesisForm = () => {
    setShowHypothesisForm(true);
  };

  const handleCloseHypothesisForm = () => {
    setShowHypothesisForm(false);
  };

  const handleDelete = (experiment: GrowthExperiment) => {
    setExperimentToDelete(experiment);
    setIsDeleteDialogOpen(true);
  };

  // Get the metric name for an experiment
  const getMetricName = (metricId: string) => {
    const metric = metrics.find(m => m.id === metricId);
    return metric ? metric.name : 'Unknown metric';
  };

  // Filter experiments by status
  const filteredExperiments = experiments.filter(exp => {
    if (activeTab === 'all') return true;
    return exp.status === activeTab;
  });

  // Function to calculate days remaining
  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="space-y-6">
      {showForm ? (
        <GrowthExperimentForm
          growthModel={growthModel}
          projectId={projectId}
          metrics={metrics}
          onSave={refreshData}
          onClose={handleCloseForm}
          experiment={editingExperiment}
        />
      ) : showHypothesisForm ? (
        <StructuredHypothesisForm
          growthModel={growthModel}
          projectId={projectId}
          metrics={metrics}
          onSave={refreshData}
          onClose={handleCloseHypothesisForm}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Experiments</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                onClick={handleOpenHypothesisForm} 
                className="flex items-center gap-2"
              >
                <Target className="h-4 w-4" />
                New Hypothesis
              </Button>
              <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                New Experiment
              </Button>
            </div>
          </div>
          
          <div className="border rounded-lg overflow-hidden bg-white">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
              <div className="px-4 pt-3 pb-0 border-b">
                <TabsList className="grid w-full max-w-md grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="planned">Planned</TabsTrigger>
                  <TabsTrigger value="running">Running</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value={activeTab} className="p-0 mt-0">
                {filteredExperiments.length === 0 ? (
                  <div className="p-8 text-center">
                    <Beaker className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No {activeTab !== 'all' ? activeTab : ''} experiments yet</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Create experiments to test your growth hypotheses and validate your growth model.
                    </p>
                    <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
                      <PlusCircle className="h-4 w-4" />
                      Create First Experiment
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                    {filteredExperiments.map(experiment => {
                      const daysRemaining = getDaysRemaining(experiment.end_date);
                      const isActive = experiment.status === 'running';
                      const isCompleted = experiment.status === 'completed';
                      
                      // Get status badge color
                      const getStatusColor = () => {
                        switch (experiment.status) {
                          case 'running': return 'bg-blue-500';
                          case 'completed': return 'bg-green-500';
                          case 'failed': return 'bg-red-500';
                          default: return 'bg-gray-500';
                        }
                      };
                      
                      return (
                        <Card key={experiment.id} className="overflow-hidden">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between">
                              <Badge className={getStatusColor()}>
                                {experiment.status.charAt(0).toUpperCase() + experiment.status.slice(1)}
                              </Badge>
                              <div className="flex space-x-1">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleDelete(experiment)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0" 
                                  onClick={() => handleOpenForm(experiment)}
                                >
                                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </Button>
                              </div>
                            </div>
                            <CardTitle className="text-base mt-1">{experiment.title}</CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {experiment.hypothesis}
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pb-3">
                            <div className="grid grid-cols-2 gap-4 my-1">
                              <div className="flex items-center text-xs">
                                <Target className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                <span className="text-gray-600">{getMetricName(experiment.metric_id || '')}</span>
                              </div>
                              <div className="flex items-center text-xs">
                                <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                <span className="text-gray-600">
                                  {format(new Date(experiment.start_date), 'MMM d')} - {format(new Date(experiment.end_date), 'MMM d')}
                                </span>
                              </div>
                            </div>
                            
                            {/* Experiment Target Metrics */}
                            <div className="mt-3 border-t pt-2 border-gray-100">
                              <div className="flex justify-between items-center text-xs mb-1">
                                <div className="flex items-center">
                                  <TrendingUp className="h-3.5 w-3.5 mr-1.5 text-blue-500" />
                                  <span className="font-medium">Expected Lift</span>
                                </div>
                                <span className="font-semibold">{experiment.expected_lift}%</span>
                              </div>
                              
                              {isCompleted && experiment.actual_lift !== undefined && (
                                <div className="flex justify-between items-center text-xs mb-1">
                                  <div className="flex items-center">
                                    <CheckCircle className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                                    <span className="font-medium">Actual Lift</span>
                                  </div>
                                  <span className="font-semibold">{experiment.actual_lift}%</span>
                                </div>
                              )}
                              
                              {/* Time remaining for running experiments */}
                              {isActive && (
                                <div className="mt-2">
                                  <div className="flex justify-between text-xs mb-1">
                                    <div className="flex items-center">
                                      <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                                      <span className="text-gray-600">Time Remaining</span>
                                    </div>
                                    <span className="font-medium">
                                      {daysRemaining} days
                                    </span>
                                  </div>
                                  <Progress 
                                    value={100 - (daysRemaining / 14 * 100)} 
                                    className="h-1.5 mt-1" 
                                  />
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      <DeleteGrowthExperimentDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        experimentToDelete={experimentToDelete}
        refreshData={refreshData}
      />
    </div>
  );
};

export default GrowthExperimentsSection;

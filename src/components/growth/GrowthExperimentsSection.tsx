
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription, 
  CardFooter 
} from '@/components/ui/card';
import { 
  PlusCircle, 
  FlaskConical, 
  TrendingUp, 
  Calendar,
  CheckCircle2,
  Clock,
  BrainCircuit
} from 'lucide-react';
import { GrowthModel, GrowthExperiment } from '@/types/database';
import GrowthExperimentForm from '../forms/GrowthExperimentForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';

interface GrowthExperimentsProps {
  growthModel: GrowthModel;
  projectId: string;
  growthModelId: string;
}

const statusLabels: Record<string, { label: string, color: string }> = {
  'planned': { label: 'Planned', color: 'bg-blue-100 text-blue-800' },
  'running': { label: 'In Progress', color: 'bg-amber-100 text-amber-800' },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-800' },
  'failed': { label: 'Abandoned', color: 'bg-red-100 text-red-800' }
};

const GrowthExperimentsSection: React.FC<GrowthExperimentsProps> = ({ 
  growthModel, 
  projectId,
  growthModelId
}) => {
  const [showForm, setShowForm] = useState(false);
  const [selectedExperiment, setSelectedExperiment] = useState<GrowthExperiment | null>(null);
  const [experiments, setExperiments] = useState<GrowthExperiment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    if (growthModel) {
      fetchExperiments();
    }
  }, [growthModel]);

  const fetchExperiments = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('growth_experiments')
        .select('*')
        .eq('growth_model_id', growthModel.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setExperiments(data);
    } catch (err) {
      console.error('Error fetching experiments:', err);
      toast({
        title: 'Error',
        description: 'Failed to load growth experiments',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (experiment?: GrowthExperiment) => {
    setSelectedExperiment(experiment || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedExperiment(null);
  };

  const refreshData = async () => {
    await fetchExperiments();
  };

  // Filter experiments based on the active tab
  const filteredExperiments = activeTab === 'all' 
    ? experiments 
    : experiments.filter(e => e.status === activeTab);

  const renderExperimentCard = (experiment: GrowthExperiment) => {
    const status = statusLabels[experiment.status as keyof typeof statusLabels] || statusLabels.planned;
    const startDate = experiment.start_date ? new Date(experiment.start_date) : null;
    const endDate = experiment.end_date ? new Date(experiment.end_date) : null;
    
    return (
      <Card key={experiment.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">{experiment.title}</CardTitle>
              <CardDescription className="mt-1 line-clamp-2">{experiment.hypothesis}</CardDescription>
            </div>
            <Badge className={status.color}>{status.label}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {startDate && endDate && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <Calendar className="h-3.5 w-3.5 mr-1" />
              <span>
                {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
              </span>
            </div>
          )}
          
          {experiment.expected_lift > 0 && (
            <div className="flex items-center text-sm text-gray-500 mb-3">
              <TrendingUp className="h-3.5 w-3.5 mr-1" />
              <span>Expected lift: {experiment.expected_lift}%</span>
            </div>
          )}
          
          {experiment.actual_lift && (
            <div className="flex items-center text-sm font-medium text-green-600 mb-3">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
              <span>Actual lift: {experiment.actual_lift}%</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t pt-3 pb-3 flex justify-end">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleOpenForm(experiment)}
          >
            Edit
          </Button>
        </CardFooter>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <GrowthExperimentForm
        isOpen={showForm}
        projectId={projectId}
        growthModelId={growthModelId}
        onSave={refreshData}
        onClose={handleCloseForm}
        experiment={selectedExperiment}
      />

      {!showForm && (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Experiments</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2" id="create-experiment-button">
              <PlusCircle className="h-4 w-4" />
              New Experiment
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="planned">Planned</TabsTrigger>
              <TabsTrigger value="running">In Progress</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="failed">Abandoned</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <p>Loading experiments...</p>
                </div>
              ) : filteredExperiments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredExperiments.map(renderExperimentCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FlaskConical className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Growth Experiments Yet</h3>
                    <p className="text-center text-gray-500 mb-6 max-w-md">
                      Create experiments to test your growth hypotheses and validate
                      your assumptions about how to grow your product.
                    </p>
                    <Button onClick={() => handleOpenForm()}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First Experiment
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default GrowthExperimentsSection;

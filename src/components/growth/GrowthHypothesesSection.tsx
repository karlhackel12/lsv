
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  PlusCircle, 
  Lightbulb, 
  FlaskConical, 
  TrendingUp,
  Link,
  ArrowUpRight
} from 'lucide-react';
import { GrowthModel, GrowthMetric, GrowthHypothesis } from '@/types/database';
import StructuredHypothesisForm from './StructuredHypothesisForm';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

interface GrowthHypothesisData extends Omit<GrowthHypothesis, 'originalId'> {
  metric_name?: string;
  experiment_count?: number;
}

interface GrowthHypothesesSectionProps {
  growthModel: GrowthModel;
  projectId: string;
  metrics: GrowthMetric[];
  refreshData: () => Promise<void>;
}

const stageLabels: Record<string, string> = {
  'channel': 'Channel Validation',
  'activation': 'Activation Optimization',
  'monetization': 'Monetization Testing',
  'retention': 'Retention Engineering',
  'referral': 'Referral Engine',
  'scaling': 'Scaling Readiness'
};

const GrowthHypothesesSection: React.FC<GrowthHypothesesSectionProps> = ({ 
  growthModel, 
  projectId, 
  metrics,
  refreshData 
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingHypothesis, setEditingHypothesis] = useState<GrowthHypothesisData | null>(null);
  const [hypotheses, setHypotheses] = useState<GrowthHypothesisData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('all');
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (growthModel) {
      fetchHypotheses();
    }
  }, [growthModel]);

  const fetchHypotheses = async () => {
    try {
      setIsLoading(true);
      
      // First get all hypotheses for this growth model
      const { data, error } = await supabase
        .from('growth_hypotheses')
        .select('*')
        .eq('growth_model_id', growthModel.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Enrich with metric names
      const enrichedData = await Promise.all(data.map(async (hypothesis) => {
        let metricName = 'Unknown Metric';
        let experimentCount = 0;
        
        // Get metric name if there's a metric ID
        if (hypothesis.metric_id) {
          const { data: metricData } = await supabase
            .from('growth_metrics')
            .select('name')
            .eq('id', hypothesis.metric_id)
            .single();
            
          if (metricData) {
            metricName = metricData.name;
          }
        }
        
        // Get count of linked experiments (future enhancement)
        // This would require a relation between experiments and growth hypotheses
        
        return {
          ...hypothesis,
          metric_name: metricName,
          experiment_count: experimentCount
        };
      }));
      
      setHypotheses(enrichedData);
    } catch (err) {
      console.error('Error fetching hypotheses:', err);
      toast({
        title: 'Error',
        description: 'Failed to load growth hypotheses',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenForm = (hypothesis?: GrowthHypothesisData) => {
    setEditingHypothesis(hypothesis || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingHypothesis(null);
  };

  const handleSave = async () => {
    await fetchHypotheses();
    await refreshData();
  };

  const handleNavigateToMetric = (metricId: string) => {
    navigate('/growth', { 
      state: { tab: 'metrics', metricId } 
    });
  };
  
  const handleCreateExperiment = (hypothesis: GrowthHypothesisData) => {
    navigate('/experiments', { 
      state: { 
        createExperiment: true, 
        hypothesisId: hypothesis.id,
        hypothesisType: 'growth'
      } 
    });
  };

  // Filter hypotheses based on the active tab
  const filteredHypotheses = activeTab === 'all' 
    ? hypotheses 
    : hypotheses.filter(h => h.stage === activeTab);

  const renderHypothesisCard = (hypothesis: GrowthHypothesisData) => (
    <Card key={hypothesis.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <Badge className="mb-2">{stageLabels[hypothesis.stage] || hypothesis.stage}</Badge>
          {hypothesis.metric_id && (
            <Badge 
              variant="outline" 
              className="cursor-pointer hover:bg-blue-50"
              onClick={() => hypothesis.metric_id && handleNavigateToMetric(hypothesis.metric_id)}
            >
              <TrendingUp className="h-3 w-3 mr-1" />
              {hypothesis.metric_name}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-700">We believe that</p>
          <p className="text-sm p-2 bg-gray-50 rounded border border-gray-200 my-1">
            {hypothesis.action}
          </p>
          
          <p className="text-sm font-medium text-gray-700 mt-2">will result in</p>
          <p className="text-sm p-2 bg-gray-50 rounded border border-gray-200 my-1">
            {hypothesis.outcome}
          </p>
          
          {hypothesis.success_criteria && (
            <>
              <p className="text-sm font-medium text-gray-700 mt-2">We'll know we're right when</p>
              <p className="text-sm p-2 bg-gray-50 rounded border border-gray-200 my-1">
                {hypothesis.success_criteria}
              </p>
            </>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-4">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => handleOpenForm(hypothesis)}
          >
            Edit
          </Button>
          <Button 
            size="sm"
            onClick={() => handleCreateExperiment(hypothesis)}
            className="flex items-center"
          >
            <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
            Test Hypothesis
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {showForm ? (
        <StructuredHypothesisForm
          isOpen={showForm}
          growthModel={growthModel}
          projectId={projectId}
          metrics={metrics}
          onSave={handleSave}
          onClose={handleCloseForm}
          hypothesis={editingHypothesis}
        />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Growth Hypotheses</h2>
            <Button onClick={() => handleOpenForm()} className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              New Hypothesis
            </Button>
          </div>

          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All Stages</TabsTrigger>
              <TabsTrigger value="channel">Channel</TabsTrigger>
              <TabsTrigger value="activation">Activation</TabsTrigger>
              <TabsTrigger value="monetization">Monetization</TabsTrigger>
              <TabsTrigger value="retention">Retention</TabsTrigger>
              <TabsTrigger value="referral">Referral</TabsTrigger>
              <TabsTrigger value="scaling">Scaling</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab}>
              {isLoading ? (
                <div className="flex justify-center p-8">
                  <p>Loading hypotheses...</p>
                </div>
              ) : filteredHypotheses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredHypotheses.map(renderHypothesisCard)}
                </div>
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <Lightbulb className="h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Growth Hypotheses Yet</h3>
                    <p className="text-center text-gray-500 mb-6 max-w-md">
                      Create structured growth hypotheses to test your assumptions 
                      about how to grow your product and business.
                    </p>
                    <Button onClick={() => handleOpenForm()}>
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Create First Hypothesis
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

export default GrowthHypothesesSection;

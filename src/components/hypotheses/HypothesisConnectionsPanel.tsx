import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Hypothesis, Experiment } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { LinkIcon, FlaskConical, ArrowUpRight, Plus } from 'lucide-react';
import StatusBadge from '@/components/StatusBadge';
import { Separator } from '@/components/ui/separator';
import { useNavigate } from 'react-router-dom';
import ExperimentForm from '@/components/forms/ExperimentForm';
interface HypothesisConnectionsPanelProps {
  hypothesis: Hypothesis;
  projectId: string;
  linkedExperiments: Experiment[];
  onRefresh: () => void;
}
const HypothesisConnectionsPanel = ({
  hypothesis,
  projectId,
  linkedExperiments,
  onRefresh
}: HypothesisConnectionsPanelProps) => {
  const [isExperimentFormOpen, setIsExperimentFormOpen] = useState(false);
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleCreateExperiment = () => {
    setIsExperimentFormOpen(true);
  };
  const navigateToExperiment = (experimentId: string) => {
    navigate('/experiments', {
      state: {
        experimentId
      }
    });
  };
  const handleExperimentSaved = () => {
    setIsExperimentFormOpen(false);
    onRefresh();
    toast({
      title: 'Experiment created',
      description: 'New experiment has been created and linked to this hypothesis'
    });
  };
  return <Card>
      
      

      {/* Experiment Form Dialog */}
      {isExperimentFormOpen && <ExperimentForm isOpen={isExperimentFormOpen} onClose={() => setIsExperimentFormOpen(false)} onSave={handleExperimentSaved} experiment={null} projectId={projectId} hypothesisId={hypothesis.id} />}
    </Card>;
};
export default HypothesisConnectionsPanel;
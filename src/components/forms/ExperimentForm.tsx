import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { FlaskConical, TrendingUp } from 'lucide-react';
import { Experiment, Hypothesis } from '@/types/database';
import { useExperimentForm } from '@/hooks/use-experiment-form';
import { FormController } from '@/components/ui/form-controller';
import CategorySelect from './experiment/CategorySelect';
import StatusRadioGroup from './experiment/StatusRadioGroup';
import TextFieldGroup from './experiment/TextFieldGroup';
import ResultsFields from './experiment/ResultsFields';
import HypothesisSelect from './experiment/HypothesisSelect';

// Update FormData to match Experiment type exactly to avoid type mismatches
export type FormData = Experiment;

interface ExperimentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (experiment: Experiment) => void;
  experiment?: Experiment | null;
  projectId: string;
  hypothesisId?: string;
  experimentType?: 'problem' | 'solution' | 'business-model';
  isGrowthExperiment?: boolean;
}

const ExperimentForm = ({ 
  isOpen, 
  onClose, 
  onSave, 
  experiment, 
  projectId, 
  hypothesisId,
  experimentType = 'problem',
  isGrowthExperiment = false
}: ExperimentFormProps) => {
  console.log("ExperimentForm rendering with experiment:", experiment?.id || "new", "isOpen:", isOpen);
  const [selectedHypothesis, setSelectedHypothesis] = useState<Hypothesis | null>(null);
  
  const { form, isEditing, handleSubmit } = useExperimentForm({
    experiment,
    projectId,
    hypothesisId,
    onSave,
    onClose,
    experimentType,
    isGrowthExperiment
  });

  // Enhanced useEffect to ensure proper form reset
  useEffect(() => {
    console.log("ExperimentForm useEffect triggered:", { 
      isOpen, 
      isEditing: !!experiment, 
      experimentId: experiment?.id,
      experimentType 
    });
    
    if (isOpen) {
      if (experiment) {
        console.log("Resetting form with existing experiment data:", experiment);
        
        // Force form reset with all fields explicitly assigned to ensure proper data binding
        setTimeout(() => {
          form.reset({
            ...experiment,
            id: experiment.id,
            title: experiment.title || '',
            hypothesis: experiment.hypothesis || '',
            method: experiment.method || '',
            metrics: experiment.metrics || '',
            status: experiment.status || 'planned',
            category: experiment.category || experimentType || 'problem',
            results: experiment.results || '',
            insights: experiment.insights || '',
            decisions: experiment.decisions || '',
            project_id: experiment.project_id || projectId,
            hypothesis_id: experiment.hypothesis_id || hypothesisId,
          });
        }, 0);
      } else {
        console.log("Resetting form with default values for a new experiment");
        // Clear form for new experiment
        form.reset({
          title: '',
          hypothesis: '',
          method: '',
          metrics: '',
          status: 'planned',
          category: experimentType || 'problem',
          results: '',
          insights: '',
          decisions: '',
          project_id: projectId,
          hypothesis_id: hypothesisId || null,
        });
      }
    }
  }, [experiment, form, isOpen, projectId, hypothesisId, experimentType]);

  const handleHypothesisSelected = (hypothesis: Hypothesis | null) => {
    setSelectedHypothesis(hypothesis);
    
    // If a hypothesis is selected and we're creating a new experiment, update the category
    if (hypothesis && !isEditing) {
      const category = hypothesis.phase === 'problem' ? 'problem' : 
                      hypothesis.phase === 'solution' ? 'solution' : 'business-model';
      form.setValue('category', category);
    }
  };

  // Get form title based on experiment type
  const getFormTitle = () => {
    if (isGrowthExperiment) {
      return isEditing ? 'Edit Growth Experiment' : 'Create New Growth Experiment';
    }
    return isEditing ? 'Edit Experiment' : hypothesisId ? 'Create Experiment from Hypothesis' : 'Create New Experiment';
  };

  // Get form description
  const getFormDescription = () => {
    if (isGrowthExperiment) {
      return 'Design an experiment to test your growth hypothesis';
    }
    return 'Define an experiment to validate your hypothesis with real-world data';
  };

  // Get form icon based on experiment type
  const FormIcon = isGrowthExperiment ? TrendingUp : FlaskConical;

  return (
    <FormController
      isOpen={isOpen}
      onClose={onClose}
      title={getFormTitle()}
      description={getFormDescription()}
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
          {!isGrowthExperiment && (
            <HypothesisSelect 
              form={form}
              projectId={projectId}
              experimentType={experimentType}
              onHypothesisSelected={handleHypothesisSelected}
            />
          )}
          
          <TextFieldGroup form={form} isGrowthExperiment={isGrowthExperiment} />
          
          {!isGrowthExperiment && (
            <CategorySelect form={form} />
          )}
          
          <StatusRadioGroup 
            form={form} 
            isGrowthExperiment={isGrowthExperiment} 
          />
          
          {/* Results, Decisions and Insights sections - shown only for in-progress or completed experiments */}
          {(form.watch('status') === 'in-progress' || form.watch('status') === 'completed') && (
            <ResultsFields form={form} isGrowthExperiment={isGrowthExperiment} />
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit">{isEditing ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </form>
      </Form>
    </FormController>
  );
};

export default ExperimentForm;

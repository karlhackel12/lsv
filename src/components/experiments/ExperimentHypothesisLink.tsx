
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Hypothesis, Experiment } from '@/types/database';
import { useToast } from '@/hooks/use-toast';

interface ExperimentHypothesisLinkProps {
  experiment: Experiment;
  projectId: string;
  onHypothesisFound: (hypothesis: Hypothesis | null) => void;
}

const ExperimentHypothesisLink: React.FC<ExperimentHypothesisLinkProps> = ({ 
  experiment, 
  projectId,
  onHypothesisFound
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const findRelatedHypothesis = async () => {
      try {
        setLoading(true);
        
        // First try to find by hypothesis_id if it exists
        if (experiment.hypothesis_id) {
          const { data: directMatch, error: directError } = await supabase
            .from('hypotheses')
            .select('*')
            .eq('id', experiment.hypothesis_id)
            .single();
            
          if (!directError && directMatch) {
            // Transform and pass the found hypothesis
            const transformedHypothesis = {
              ...directMatch,
              originalId: directMatch.id,
              id: directMatch.id
            };
            onHypothesisFound(transformedHypothesis);
            setLoading(false);
            return;
          }
        }
        
        // If no direct match, look for hypotheses that match the experiment hypothesis text
        const { data, error } = await supabase
          .from('hypotheses')
          .select('*')
          .eq('project_id', projectId)
          .ilike('statement', `%${experiment.hypothesis}%`);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Transform and pass the found hypothesis
          const transformedHypothesis = {
            ...data[0],
            originalId: data[0].id,
            id: data[0].id
          };
          onHypothesisFound(transformedHypothesis);
          
          // Update the experiment to link it to this hypothesis if no hypothesis_id exists
          if (!experiment.hypothesis_id) {
            await supabase
              .from('experiments')
              .update({ 
                hypothesis_id: data[0].id,
                updated_at: new Date().toISOString() 
              })
              .eq('id', experiment.originalId || experiment.id);
          }
        } else {
          onHypothesisFound(null);
        }
      } catch (error: any) {
        console.error('Error finding related hypothesis:', error);
        toast({
          title: 'Error',
          description: error.message || 'Failed to find related hypothesis',
          variant: 'destructive',
        });
        onHypothesisFound(null);
      } finally {
        setLoading(false);
      }
    };
    
    if (experiment && projectId) {
      findRelatedHypothesis();
    }
  }, [experiment, projectId]);
  
  return null; // This is a non-visual component
};

export default ExperimentHypothesisLink;

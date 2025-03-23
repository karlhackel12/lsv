
import React, { useEffect, useState } from 'react';
import { Experiment, Hypothesis } from '@/types/database';
import { supabase } from '@/integrations/supabase/client';

interface ExperimentHypothesisLinkProps {
  experiment: Experiment;
  projectId: string;
  onHypothesisFound: (hypothesis: Hypothesis | null) => void;
}

const ExperimentHypothesisLink = ({ experiment, projectId, onHypothesisFound }: ExperimentHypothesisLinkProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedHypothesis = async () => {
      setIsLoading(true);
      
      try {
        // If we have hypothesis_id, use it to find the related hypothesis
        if (experiment.hypothesis_id) {
          const { data, error } = await supabase
            .from('hypotheses')
            .select('*')
            .eq('id', experiment.hypothesis_id)
            .single();
          
          if (error) {
            console.error('Error fetching related hypothesis by ID:', error);
            onHypothesisFound(null);
          } else if (data) {
            // Convert from database schema to our type
            const hypothesis: Hypothesis = {
              ...data,
              // Ensure phase is a valid union type
              phase: (data.phase === 'solution' ? 'solution' : 'problem') as 'problem' | 'solution',
              originalId: data.id
            };
            onHypothesisFound(hypothesis);
          }
        } 
        // Otherwise, try to match by statement
        else if (experiment.hypothesis) {
          const { data, error } = await supabase
            .from('hypotheses')
            .select('*')
            .eq('project_id', projectId)
            .ilike('statement', `%${experiment.hypothesis.trim()}%`);
          
          if (error) {
            console.error('Error fetching related hypothesis by statement:', error);
            onHypothesisFound(null);
          } else if (data && data.length > 0) {
            // Find the most likely match (exact match or closest)
            const exactMatch = data.find(h => 
              h.statement.trim().toLowerCase() === experiment.hypothesis.trim().toLowerCase()
            );
            
            if (exactMatch) {
              const hypothesis: Hypothesis = {
                ...exactMatch,
                // Ensure phase is a valid union type
                phase: (exactMatch.phase === 'solution' ? 'solution' : 'problem') as 'problem' | 'solution',
                originalId: exactMatch.id
              };
              onHypothesisFound(hypothesis);
            } else {
              // Use the first one as fallback
              const hypothesis: Hypothesis = {
                ...data[0],
                // Ensure phase is a valid union type
                phase: (data[0].phase === 'solution' ? 'solution' : 'problem') as 'problem' | 'solution',
                originalId: data[0].id
              };
              onHypothesisFound(hypothesis);
            }
          } else {
            onHypothesisFound(null);
          }
        } else {
          onHypothesisFound(null);
        }
      } catch (error) {
        console.error('Unexpected error fetching hypothesis:', error);
        onHypothesisFound(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRelatedHypothesis();
  }, [experiment, projectId]);

  return null; // This is just a utility component that doesn't render anything
};

export default ExperimentHypothesisLink;

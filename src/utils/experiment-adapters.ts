
import { Experiment, GrowthExperiment } from '@/types/database';

/**
 * Adapts a GrowthExperiment to the format expected by the Experiment components
 */
export const adaptGrowthExperimentToExperiment = (growthExperiment: GrowthExperiment): Experiment => {
  // Map growth experiment status to experiment status
  let status: 'planned' | 'in-progress' | 'completed';
  if (growthExperiment.status === 'running') {
    status = 'in-progress';
  } else if (growthExperiment.status === 'completed' || growthExperiment.status === 'failed') {
    status = 'completed';
  } else {
    status = 'planned';
  }
  
  return {
    id: growthExperiment.id,
    originalId: growthExperiment.originalId || growthExperiment.id,
    title: growthExperiment.title,
    hypothesis: growthExperiment.hypothesis,
    method: `Growth experiment targeting ${growthExperiment.expected_lift}% lift`,
    metrics: [growthExperiment.metric_id ? `Metric ID: ${growthExperiment.metric_id}` : 'No metric specified'],
    status,
    category: 'business-model', // Default to business-model for growth experiments
    results: growthExperiment.actual_lift !== null ? `Actual lift: ${growthExperiment.actual_lift}%` : '',
    insights: growthExperiment.notes || '',
    decisions: growthExperiment.status === 'completed' ? 
      `Experiment completed with ${growthExperiment.actual_lift !== null ? growthExperiment.actual_lift + '%' : 'unknown'} lift` : 
      '',
    project_id: growthExperiment.project_id,
    hypothesis_id: null,
    created_at: growthExperiment.created_at,
    updated_at: growthExperiment.updated_at,
    // Add a flag to identify this as a growth experiment
    isGrowthExperiment: true,
    // Store original growth experiment data
    originalGrowthExperiment: growthExperiment
  };
};

/**
 * Update a GrowthExperiment with data from an adapted Experiment
 */
export const updateGrowthExperimentFromExperiment = (
  experiment: Experiment, 
  originalGrowthExperiment: GrowthExperiment
): GrowthExperiment => {
  // Map experiment status to growth experiment status
  let status: 'planned' | 'running' | 'completed' | 'failed';
  if (experiment.status === 'in-progress') {
    status = 'running';
  } else if (experiment.status === 'completed') {
    status = originalGrowthExperiment.actual_lift !== null && originalGrowthExperiment.actual_lift > 0 
      ? 'completed' 
      : 'failed';
  } else {
    status = 'planned';
  }
  
  return {
    ...originalGrowthExperiment,
    title: experiment.title,
    hypothesis: experiment.hypothesis,
    status,
    notes: experiment.insights || '',
    updated_at: new Date().toISOString()
  };
};

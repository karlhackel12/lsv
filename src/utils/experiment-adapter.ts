
import { Experiment } from '@/types/database';

/**
 * Define the database row format for experiments
 */
export interface ExperimentRow {
  id: string;
  title: string;
  hypothesis: string;
  method: string;
  metrics: string;  // In database it's stored as string
  status: 'planned' | 'in-progress' | 'completed';
  category: string;
  results?: string;
  insights?: string;
  decisions?: string;
  learnings?: string;
  project_id: string;
  hypothesis_id?: string | null;
  created_at: string;
  updated_at: string;
  description?: string;
}

/**
 * Adapts an experiment from the database row format to the application format
 */
export const adaptExperiment = (row: ExperimentRow): Experiment => {
  return {
    ...row,
    metrics: Array.isArray(row.metrics) ? row.metrics : 
             (typeof row.metrics === 'string' ? row.metrics.split(',') : [])
  };
};

/**
 * Adapts an experiment from the application format to the database row format
 */
export const adaptExperimentForDb = (experiment: Experiment): ExperimentRow => {
  return {
    ...experiment,
    metrics: Array.isArray(experiment.metrics) ? experiment.metrics.join(',') : experiment.metrics as unknown as string
  };
};

/**
 * Adapts an array of experiment rows to application format
 */
export const adaptExperiments = (rows: ExperimentRow[]): Experiment[] => {
  return rows.map(adaptExperiment);
};

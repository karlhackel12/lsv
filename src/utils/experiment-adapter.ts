
import { Experiment, ExperimentRow } from '@/types/database';

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

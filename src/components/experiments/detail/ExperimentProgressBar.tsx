import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Experiment } from '@/types/database';
interface ExperimentProgressBarProps {
  experiment: Experiment;
  showLabels?: boolean;
}
const ExperimentProgressBar = ({
  experiment,
  showLabels = true
}: ExperimentProgressBarProps) => {
  // Calculate experiment progress based on status and completed fields
  const calculateProgress = () => {
    switch (experiment.status) {
      case 'planned':
        return 10;
      case 'in-progress':
        return experiment.results ? 75 : 50;
      case 'completed':
        return 100;
      default:
        return 10;
    }
  };
  const progress = calculateProgress();
  return;
};
export default ExperimentProgressBar;
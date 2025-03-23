
import { PivotOption, Metric } from '@/types/database';

// Extended PivotOption interface to include additional properties used in the form
export interface ExtendedPivotOption extends PivotOption {
  name?: string;
  pivot_type?: string;
  potential_impact?: string;
  implementation_effort?: string;
  evidence?: string;
  status?: string;
  originalId?: string;
}

// Extended Metric interface to include description if it's being used
export interface ExtendedMetric extends Metric {
  description?: string;
}

export interface PivotOptionFormProps {
  isOpen?: boolean;
  pivotOption?: ExtendedPivotOption;
  projectId: string;
  metrics: ExtendedMetric[];
  onSave: () => void;
  onClose: () => void;
}

export type LikelihoodType = "high" | "medium" | "low";

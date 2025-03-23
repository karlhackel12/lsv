
export interface Project {
  id: string;
  name: string;
  description: string;
  owner_id: string;
  stage: string;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  statement: string;
  criteria: string;
  experiment: string;
  status: 'not-started' | 'validated' | 'invalidated' | 'testing';
  created_at: string;
  updated_at: string;
  project_id: string;
  category: 'problem' | 'solution' | 'customer' | 'market' | 'business-model';
  evidence?: string;
  result?: string;
}

export interface Experiment {
  id: string;
  title: string;
  hypothesis: string;
  method: string;
  metrics: string;
  status: 'planned' | 'in-progress' | 'completed';
  category: 'problem' | 'solution' | 'business-model' | string | null;
  created_at: string;
  updated_at: string;
  hypothesis_id?: string;
  project_id: string;
  results?: string;
  decisions?: string;
  insights?: string;
  typeform_id?: string;
  typeform_url?: string;
  typeform_workspace_id?: string;
  typeform_responses_count?: number;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
}

export interface Stage {
  id: string;
  name: string;
  description: string;
  status: 'not-started' | 'in-progress' | 'completed';
  project_id: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface MVPFeature {
  id: string;
  feature: string;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'planned' | 'in-progress' | 'completed';
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Metric {
  id: string;
  name: string;
  category: string;
  target: string;
  current: string | null;
  status: 'not-started' | 'success' | 'warning' | 'error';
  project_id: string;
  created_at: string;
  updated_at: string;
  description?: string;
}

export interface MetricThreshold {
  id: string;
  metric_id: string;
  warning_threshold: string;
  error_threshold: string;
  created_at: string;
  updated_at: string;
}

export interface MetricHistory {
  id: string;
  metric_id: string;
  value: string | null;
  status: string;
  recorded_at: string;
}

export interface PivotOption {
  id: string;
  type: string;
  description: string;
  trigger: string;
  likelihood: 'high' | 'medium' | 'low';
  project_id: string;
  created_at: string;
  updated_at: string;
  originalId?: string;
  name?: string;
  status?: string;
  potential_impact?: string;
  implementation_effort?: string;
  evidence?: string;
  pivot_type?: string;
}

export interface PivotMetricTrigger {
  id: string;
  pivot_option_id: string;
  metric_id: string;
  threshold_type: string;
  created_at: string;
  updated_at: string;
}

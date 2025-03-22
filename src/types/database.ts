
// Custom types for our database tables
export interface Project {
  id: string;
  name: string;
  description: string;
  stage: string;
  created_at: string;
  updated_at: string;
  owner_id?: string;
}

export interface Stage {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: 'complete' | 'in-progress' | 'not-started';
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  project_id: string;
  category: string;
  statement: string;
  experiment: string;
  criteria: string;
  status: 'validated' | 'validating' | 'not-started' | 'invalid';
  result: string | null;
  evidence: string | null;
  created_at: string;
  updated_at: string;
  originalId?: string;
}

export interface Experiment {
  id: string;
  originalId?: string;
  title: string;
  hypothesis: string;
  method: string;
  metrics: string;
  results: string | null;
  insights: string | null;
  decisions: string | null;
  project_id: string;
  status: 'in-progress' | 'completed' | 'planned';
  created_at: string;
  updated_at: string;
  name?: string;
  description?: string;
  hypothesis_id?: string;
  category?: 'problem' | 'solution' | 'business-model';
  success_criteria?: string;
  // Typeform integration fields
  typeform_id?: string;
  typeform_url?: string;
  typeform_workspace_id?: string;
  typeform_responses_count?: number;
}

export interface MvpFeature {
  id: string;
  project_id: string;
  feature: string;
  priority: 'high' | 'medium' | 'low';
  status: 'in-progress' | 'planned' | 'completed' | 'post-mvp';
  notes: string | null;
  created_at: string;
  updated_at: string;
  originalId?: string;
  name?: string;
  description?: string;
  effort?: string;
  impact?: string;
}

export interface Metric {
  id: string;
  project_id: string;
  category: string;
  name: string;
  target: string;
  current: string | null;
  status: 'success' | 'warning' | 'error' | 'not-started';
  created_at: string;
  updated_at: string;
  originalId?: string;
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
  project_id: string;
  type: string;
  description: string;
  trigger: string;
  likelihood: 'high' | 'medium' | 'low';
  created_at: string;
  updated_at: string;
  originalId?: string;
  
  // Adding fields needed by PivotOptionForm
  name?: string;
  pivot_type?: string;
  potential_impact?: string;
  implementation_effort?: string;
  evidence?: string;
  status?: string;
}

export interface PivotMetricTrigger {
  id: string;
  pivot_option_id: string;
  metric_id: string;
  threshold_type: string;
  created_at: string;
  updated_at: string;
}

// Template definitions for feature priority
export const TEMPLATE_FEATURE_PRIORITY = {
  "high": "Essential for validating core value proposition",
  "medium": "Important for user experience but not critical for validation",
  "low": "Nice-to-have feature that can be deferred to post-MVP"
};

// Template definitions for feature status
export const TEMPLATE_FEATURE_STATUS = {
  "planned": "Defined and prioritized but not yet in development",
  "in-progress": "Currently being developed and tested",
  "completed": "Finished and ready for user testing",
  "post-mvp": "Deferred to next development phase"
};

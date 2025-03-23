
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
  status: 'not-started' | 'validated' | 'validating' | 'invalid';
  created_at: string;
  updated_at: string;
  project_id: string;
  category: 'problem' | 'solution' | 'customer' | 'market' | 'business-model' | 'value' | 'growth';
  evidence?: string;
  result?: string;
  originalId?: string; // Added for data mapping from Supabase
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
  originalId?: string; // Added for data mapping from Supabase
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
  status: 'planned' | 'in-progress' | 'completed' | 'post-mvp';
  project_id: string;
  created_at: string;
  updated_at: string;
  originalId?: string; // Added for data mapping from Supabase
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
  originalId?: string; // Added for data mapping from Supabase
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

// Constants for feature status and priority descriptions
export const TEMPLATE_FEATURE_STATUS = {
  'planned': 'Feature is planned for development but work has not started yet.',
  'in-progress': 'Development of this feature is currently underway.',
  'completed': 'This feature has been fully implemented and is ready for use.',
  'post-mvp': 'This feature will be implemented after the initial MVP release.'
};

export const TEMPLATE_FEATURE_PRIORITY = {
  'high': 'Critical for product viability and must be included in the MVP.',
  'medium': 'Important for product functionality but not a deal-breaker.',
  'low': 'Desirable but can be deprioritized if time constraints arise.'
};

// Constants for hypothesis templates
export const TEMPLATE_VALUE_HYPOTHESES = [
  'We believe [customer segment] will [action] in order to [achieve benefit].',
  'We believe [customer segment] has a problem [achieving goal] because [obstacle].',
  'We believe [solution] will solve [customer segment]\'s problem of [problem description].',
  'We believe [customer segment] will pay [price] for [solution] because [value proposition].'
];

export const TEMPLATE_GROWTH_HYPOTHESES = [
  'We believe [marketing channel] will result in [acquisition metric] for [customer segment].',
  'We believe [onboarding change] will improve [activation metric] by [X%].',
  'We believe [feature change] will improve [retention metric] by [X%].',
  'We believe [pricing model] will increase [revenue metric] by [X%].',
  'We believe [referral program] will generate [X] new customers per existing customer.'
];


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
  category: string;
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

// New Growth Model interfaces
export interface GrowthModel {
  id: string;
  name: string;
  description: string;
  framework: 'aarrr' | 'aida' | 'hook' | 'jobs-to-be-done' | 'custom';
  project_id: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
  originalId?: string;
}

export interface GrowthMetric {
  id: string;
  name: string;
  description?: string;
  category: 'acquisition' | 'activation' | 'retention' | 'referral' | 'revenue' | 'custom';
  current_value: number;
  target_value: number;
  unit: 'percentage' | 'count' | 'currency' | 'ratio' | 'time';
  growth_model_id: string;
  project_id: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  created_at: string;
  updated_at: string;
  originalId?: string;
}

export interface GrowthExperiment {
  id: string;
  title: string;
  hypothesis: string;
  metric_id: string;
  expected_lift: number;
  actual_lift?: number;
  start_date: string;
  end_date: string;
  status: 'planned' | 'running' | 'completed' | 'failed';
  notes?: string;
  growth_model_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  originalId?: string;
}

export interface GrowthChannel {
  id: string;
  name: string;
  category: 'organic' | 'paid' | 'partnership' | 'content' | 'other';
  cac?: number;
  conversion_rate?: number;
  volume?: number;
  status: 'active' | 'testing' | 'inactive';
  growth_model_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
  originalId?: string;
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

// Growth templates constants
export const GROWTH_FRAMEWORKS = {
  'aarrr': {
    name: 'AARRR (Pirate Metrics)',
    description: 'Acquisition, Activation, Retention, Referral, Revenue - a framework for tracking user behavior.',
    stages: ['Acquisition', 'Activation', 'Retention', 'Referral', 'Revenue']
  },
  'aida': {
    name: 'AIDA',
    description: 'Awareness, Interest, Desire, Action - a framework for tracking the customer journey.',
    stages: ['Awareness', 'Interest', 'Desire', 'Action']
  },
  'hook': {
    name: 'Hook Model',
    description: 'Trigger, Action, Variable Reward, Investment - a framework for building habit-forming products.',
    stages: ['Trigger', 'Action', 'Variable Reward', 'Investment']
  },
  'jobs-to-be-done': {
    name: 'Jobs to be Done',
    description: 'Focus on the job customers are hiring your product to do, not the product itself.',
    stages: ['Job Identification', 'Problem Solution Fit', 'Product Market Fit', 'Scale']
  },
  'custom': {
    name: 'Custom Framework',
    description: 'Create your own growth framework with custom stages.',
    stages: []
  }
};

export const GROWTH_METRIC_TEMPLATES = {
  'acquisition': [
    { name: 'CAC (Customer Acquisition Cost)', unit: 'currency', description: 'Total marketing cost divided by new customers acquired' },
    { name: 'Visit-to-signup rate', unit: 'percentage', description: 'Percentage of visitors who create an account' },
    { name: 'Traffic sources', unit: 'count', description: 'Number of visitors from each channel' }
  ],
  'activation': [
    { name: 'Activation rate', unit: 'percentage', description: 'Percentage of users who reach the "aha moment"' },
    { name: 'Time to value', unit: 'time', description: 'How long it takes for users to reach the "aha moment"' },
    { name: 'Onboarding completion rate', unit: 'percentage', description: 'Percentage of users who complete onboarding' }
  ],
  'retention': [
    { name: 'N-day retention rate', unit: 'percentage', description: 'Percentage of users who return after N days' },
    { name: 'Churn rate', unit: 'percentage', description: 'Percentage of users who stop using your product' },
    { name: 'DAU/MAU ratio', unit: 'ratio', description: 'Daily active users divided by monthly active users' }
  ],
  'referral': [
    { name: 'Viral coefficient', unit: 'ratio', description: 'Average number of new users each user brings' },
    { name: 'Referral rate', unit: 'percentage', description: 'Percentage of users who refer others' },
    { name: 'NPS (Net Promoter Score)', unit: 'count', description: 'Likelihood of users recommending your product' }
  ],
  'revenue': [
    { name: 'ARPU (Average Revenue Per User)', unit: 'currency', description: 'Average revenue generated per user' },
    { name: 'LTV (Lifetime Value)', unit: 'currency', description: 'Total revenue expected from a user' },
    { name: 'Conversion rate', unit: 'percentage', description: 'Percentage of users who become paying customers' }
  ]
};

export const GROWTH_CHANNEL_CATEGORIES = {
  'organic': ['SEO', 'Content Marketing', 'Social Media', 'Community Building'],
  'paid': ['Search Ads', 'Social Ads', 'Display Ads', 'Affiliate Marketing'],
  'partnership': ['Co-marketing', 'Integrations', 'Channel Partners', 'Influencers'],
  'content': ['Blog', 'Podcast', 'Video', 'Newsletter'],
  'other': ['PR', 'Events', 'Word of Mouth', 'Customer Success']
};

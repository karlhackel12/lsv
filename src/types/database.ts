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
  status: 'not-started' | 'in-progress' | 'completed' | 'abandoned';
  created_at: string;
  updated_at: string;
  name?: string;
  description?: string;
  hypothesis_id?: string;
  category?: 'problem' | 'solution' | 'business-model';
  success_criteria?: string;
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

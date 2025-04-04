
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      experiments: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          hypothesis: string | null
          id: string
          name: string | null
          project_id: string | null
          results: string | null
          status: string | null
          updated_at: string | null
          insights: string | null
          decisions: string | null
          metrics: string | null
          title: string | null
          method: string | null
          hypothesis_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          hypothesis?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          results?: string | null
          status?: string | null
          updated_at?: string | null
          insights?: string | null
          decisions?: string | null
          metrics?: string | null
          title?: string | null
          method?: string | null
          hypothesis_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          hypothesis?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          results?: string | null
          status?: string | null
          updated_at?: string | null
          insights?: string | null
          decisions?: string | null
          metrics?: string | null
          title?: string | null
          method?: string | null
          hypothesis_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      growth_metrics: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          description: string | null
          growth_model_id: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          target_value: number | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          growth_model_id?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          description?: string | null
          growth_model_id?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_metrics_growth_model_id_fkey"
            columns: ["growth_model_id"]
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_metrics_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      growth_models: {
        Row: {
          created_at: string
          description: string | null
          framework: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          framework?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_models_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      metric_history: {
        Row: {
          context: string | null
          id: string
          metric_id: string | null
          notes: string | null
          recorded_at: string | null
          status: string | null
          value: string | null
        }
        Insert: {
          context?: string | null
          id?: string
          metric_id?: string | null
          notes?: string | null
          recorded_at?: string | null
          status?: string | null
          value?: string | null
        }
        Update: {
          context?: string | null
          id?: string
          metric_id?: string | null
          notes?: string | null
          recorded_at?: string | null
          status?: string | null
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_history_metric_id_fkey"
            columns: ["metric_id"]
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          }
        ]
      }
      metric_thresholds: {
        Row: {
          created_at: string
          error_threshold: string | null
          id: string
          metric_id: string | null
          updated_at: string
          warning_threshold: string | null
        }
        Insert: {
          created_at?: string
          error_threshold?: string | null
          id?: string
          metric_id?: string | null
          updated_at?: string
          warning_threshold?: string | null
        }
        Update: {
          created_at?: string
          error_threshold?: string | null
          id?: string
          metric_id?: string | null
          updated_at?: string
          warning_threshold?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_thresholds_metric_id_fkey"
            columns: ["metric_id"]
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          }
        ]
      }
      metrics: {
        Row: {
          category: string | null
          created_at: string
          current: string | null
          description: string | null
          id: string
          name: string | null
          project_id: string | null
          status: string | null
          target: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current?: string | null
          description?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          target?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current?: string | null
          description?: string | null
          id?: string
          name?: string | null
          project_id?: string | null
          status?: string | null
          target?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      pivot_metric_triggers: {
        Row: {
          created_at: string
          id: string
          metric_id: string | null
          pivot_option_id: string | null
          threshold_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id?: string | null
          pivot_option_id?: string | null
          threshold_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string | null
          pivot_option_id?: string | null
          threshold_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pivot_metric_triggers_metric_id_fkey"
            columns: ["metric_id"]
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pivot_metric_triggers_pivot_option_id_fkey"
            columns: ["pivot_option_id"]
            referencedRelation: "pivot_options"
            referencedColumns: ["id"]
          }
        ]
      }
      pivot_options: {
        Row: {
          created_at: string
          description: string | null
          id: string
          likelihood: string | null
          project_id: string | null
          trigger: string | null
          type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          likelihood?: string | null
          project_id?: string | null
          trigger?: string | null
          type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          likelihood?: string | null
          project_id?: string | null
          trigger?: string | null
          type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pivot_options_project_id_fkey"
            columns: ["project_id"]
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Metric = Database['public']['Tables']['metrics']['Row'];
export type MetricHistory = Database['public']['Tables']['metric_history']['Row'];
export type MetricThreshold = Database['public']['Tables']['metric_thresholds']['Row'];
export type PivotOption = Database['public']['Tables']['pivot_options']['Row'];
export type PivotMetricTrigger = Database['public']['Tables']['pivot_metric_triggers']['Row'];
export type GrowthMetric = Database['public']['Tables']['growth_metrics']['Row'];
export type GrowthModel = Database['public']['Tables']['growth_models']['Row'];

export interface Hypothesis {
  id: string;
  statement: string;
  category: string;
  criteria: string;
  experiment: string;
  evidence?: string;
  result?: string;
  status: "validated" | "validating" | "not-started" | "invalid";
  phase: "problem" | "solution";
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Experiment {
  id: string;
  originalId?: string;
  title: string;
  hypothesis: string;
  method: string;
  metrics: string;
  status: "planned" | "in-progress" | "completed";
  category?: string;
  results?: string;
  insights?: string;
  decisions?: string;
  project_id: string;
  hypothesis_id?: string | null;
  created_at: string;
  updated_at: string;
  success_criteria?: string;
  user_id?: string;
  description?: string;
  isGrowthExperiment?: boolean;
  originalGrowthExperiment?: GrowthExperiment;
}

export interface ExperimentTemplate {
  id: string;
  name: string;
  description?: string;
  method?: string;
  hypothesis_template?: string;
  category?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ScalingReadinessMetric {
  id: string;
  name: string;
  description?: string;
  category: string;
  current_value: number;
  target_value: number;
  unit: string;
  importance: number;
  status: string;
  project_id: string;
  growth_model_id?: string;
  created_at: string;
  updated_at: string;
  notes?: string;
}

export interface GrowthExperiment {
  id: string;
  originalId?: string;
  title: string;
  hypothesis: string;
  expected_lift: number;
  actual_lift?: number;
  start_date: string;
  end_date: string;
  status: "planned" | "running" | "completed" | "failed";
  notes?: string;
  project_id: string;
  growth_model_id?: string;
  metric_id?: string;
  scaling_metric_id?: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthChannel {
  id: string;
  name: string;
  category: string;
  status: "active" | "testing" | "inactive";
  cac: number;
  conversion_rate: number;
  volume: number;
  growth_model_id?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthHypothesis {
  id: string;
  originalId?: string;
  action: string;
  outcome: string;
  success_criteria?: string;
  stage: string;
  metric_id?: string;
  growth_model_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  stage: string;
  owner_id?: string;
  created_at: string;
  updated_at: string;
  current_stage?: string;
  problem_tracking?: {
    hypotheses_created: boolean;
    customer_interviews_conducted: boolean;
    pain_points_identified: boolean;
    market_need_validated: boolean;
  };
  solution_tracking?: {
    solution_hypotheses_defined: boolean;
    solution_sketches_created: boolean;
    tested_with_customers: boolean;
    positive_feedback_received: boolean;
  };
  mvp_tracking?: {
    core_features_defined: boolean;
    mvp_built: boolean;
    released_to_users: boolean;
    metrics_gathered: boolean;
  };
  metrics_tracking?: {
    key_metrics_established: boolean;
    tracking_systems_setup: boolean;
    dashboards_created: boolean;
    data_driven_decisions: boolean;
  };
  growth_tracking?: {
    channels_identified: boolean;
    growth_experiments_setup: boolean;
    funnel_optimized: boolean;
    repeatable_growth: boolean;
  };
  pivot_tracking?: {
    validation_data_evaluated: boolean;
    pivot_assessment_conducted: boolean;
    reasoning_documented: boolean;
    strategic_decision_made: boolean;
  };
}

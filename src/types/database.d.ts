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

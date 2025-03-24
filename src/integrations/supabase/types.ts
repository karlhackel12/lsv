export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      business_plan_sections: {
        Row: {
          content: string | null
          created_at: string
          id: string
          order_index: number
          project_id: string
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id: string
          section_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          order_index?: number
          project_id?: string
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_plan_sections_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      entity_dependencies: {
        Row: {
          created_at: string
          id: string
          project_id: string
          relationship_type: string
          source_id: string
          source_type: string
          strength: number | null
          target_id: string
          target_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          project_id: string
          relationship_type: string
          source_id: string
          source_type: string
          strength?: number | null
          target_id: string
          target_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string
          relationship_type?: string
          source_id?: string
          source_type?: string
          strength?: number | null
          target_id?: string
          target_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "entity_dependencies_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      experiment_logs: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          created_by_name: string | null
          experiment_id: string
          files: Json | null
          id: string
          metrics: string | null
          project_id: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          experiment_id: string
          files?: Json | null
          id?: string
          metrics?: string | null
          project_id: string
          type: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          created_by_name?: string | null
          experiment_id?: string
          files?: Json | null
          id?: string
          metrics?: string | null
          project_id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiment_logs_experiment_id_fkey"
            columns: ["experiment_id"]
            isOneToOne: false
            referencedRelation: "experiments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiment_logs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          category: string | null
          created_at: string
          decisions: string | null
          hypothesis: string
          hypothesis_id: string | null
          id: string
          insights: string | null
          method: string
          metrics: string
          project_id: string | null
          results: string | null
          status: Database["public"]["Enums"]["experiment_status"]
          title: string
          typeform_id: string | null
          typeform_responses_count: number | null
          typeform_url: string | null
          typeform_workspace_id: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          decisions?: string | null
          hypothesis: string
          hypothesis_id?: string | null
          id?: string
          insights?: string | null
          method: string
          metrics: string
          project_id?: string | null
          results?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          title: string
          typeform_id?: string | null
          typeform_responses_count?: number | null
          typeform_url?: string | null
          typeform_workspace_id?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          decisions?: string | null
          hypothesis?: string
          hypothesis_id?: string | null
          id?: string
          insights?: string | null
          method?: string
          metrics?: string
          project_id?: string | null
          results?: string | null
          status?: Database["public"]["Enums"]["experiment_status"]
          title?: string
          typeform_id?: string | null
          typeform_responses_count?: number | null
          typeform_url?: string | null
          typeform_workspace_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_channels: {
        Row: {
          cac: number | null
          category: string
          conversion_rate: number | null
          created_at: string
          growth_model_id: string | null
          id: string
          name: string
          project_id: string | null
          status: string
          updated_at: string
          volume: number | null
        }
        Insert: {
          cac?: number | null
          category: string
          conversion_rate?: number | null
          created_at?: string
          growth_model_id?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: string
          updated_at?: string
          volume?: number | null
        }
        Update: {
          cac?: number | null
          category?: string
          conversion_rate?: number | null
          created_at?: string
          growth_model_id?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: string
          updated_at?: string
          volume?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "growth_channels_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_channels_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_experiments: {
        Row: {
          actual_lift: number | null
          created_at: string
          end_date: string
          expected_lift: number
          growth_model_id: string | null
          hypothesis: string
          id: string
          metric_id: string | null
          notes: string | null
          project_id: string | null
          scaling_metric_id: string | null
          start_date: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          actual_lift?: number | null
          created_at?: string
          end_date: string
          expected_lift: number
          growth_model_id?: string | null
          hypothesis: string
          id?: string
          metric_id?: string | null
          notes?: string | null
          project_id?: string | null
          scaling_metric_id?: string | null
          start_date: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          actual_lift?: number | null
          created_at?: string
          end_date?: string
          expected_lift?: number
          growth_model_id?: string | null
          hypothesis?: string
          id?: string
          metric_id?: string | null
          notes?: string | null
          project_id?: string | null
          scaling_metric_id?: string | null
          start_date?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_experiments_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_experiments_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "growth_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_experiments_scaling_metric_id_fkey"
            columns: ["scaling_metric_id"]
            isOneToOne: false
            referencedRelation: "scaling_readiness_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_hypotheses: {
        Row: {
          action: string
          created_at: string
          growth_model_id: string
          id: string
          metric_id: string | null
          outcome: string
          project_id: string
          stage: string
          success_criteria: string | null
          updated_at: string
        }
        Insert: {
          action: string
          created_at?: string
          growth_model_id: string
          id?: string
          metric_id?: string | null
          outcome: string
          project_id: string
          stage: string
          success_criteria?: string | null
          updated_at?: string
        }
        Update: {
          action?: string
          created_at?: string
          growth_model_id?: string
          id?: string
          metric_id?: string | null
          outcome?: string
          project_id?: string
          stage?: string
          success_criteria?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_hypotheses_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_hypotheses_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "growth_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_hypotheses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_metrics: {
        Row: {
          category: string
          created_at: string
          current_value: number
          description: string | null
          growth_model_id: string | null
          id: string
          name: string
          project_id: string | null
          scaling_metric_id: string | null
          status: string
          target_value: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number
          description?: string | null
          growth_model_id?: string | null
          id?: string
          name: string
          project_id?: string | null
          scaling_metric_id?: string | null
          status?: string
          target_value?: number
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          description?: string | null
          growth_model_id?: string | null
          id?: string
          name?: string
          project_id?: string | null
          scaling_metric_id?: string | null
          status?: string
          target_value?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_metrics_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "growth_metrics_scaling_metric_id_fkey"
            columns: ["scaling_metric_id"]
            isOneToOne: false
            referencedRelation: "scaling_readiness_metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      growth_models: {
        Row: {
          created_at: string
          description: string
          framework: string
          id: string
          name: string
          project_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          framework: string
          id?: string
          name: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          framework?: string
          id?: string
          name?: string
          project_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "growth_models_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hypotheses: {
        Row: {
          category: string
          created_at: string
          criteria: string
          evidence: string | null
          experiment: string
          id: string
          phase: string
          project_id: string | null
          result: string | null
          statement: string
          status: Database["public"]["Enums"]["hypothesis_status"]
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          criteria: string
          evidence?: string | null
          experiment: string
          id?: string
          phase?: string
          project_id?: string | null
          result?: string | null
          statement: string
          status?: Database["public"]["Enums"]["hypothesis_status"]
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          criteria?: string
          evidence?: string | null
          experiment?: string
          id?: string
          phase?: string
          project_id?: string | null
          result?: string | null
          statement?: string
          status?: Database["public"]["Enums"]["hypothesis_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypotheses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_history: {
        Row: {
          context: string | null
          id: string
          metric_id: string
          notes: string | null
          recorded_at: string
          status: string
          value: string | null
        }
        Insert: {
          context?: string | null
          id?: string
          metric_id: string
          notes?: string | null
          recorded_at?: string
          status: string
          value?: string | null
        }
        Update: {
          context?: string | null
          id?: string
          metric_id?: string
          notes?: string | null
          recorded_at?: string
          status?: string
          value?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_history_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_thresholds: {
        Row: {
          created_at: string
          error_threshold: string
          id: string
          metric_id: string
          updated_at: string
          warning_threshold: string
        }
        Insert: {
          created_at?: string
          error_threshold: string
          id?: string
          metric_id: string
          updated_at?: string
          warning_threshold: string
        }
        Update: {
          created_at?: string
          error_threshold?: string
          id?: string
          metric_id?: string
          updated_at?: string
          warning_threshold?: string
        }
        Relationships: [
          {
            foreignKeyName: "metric_thresholds_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          category: string
          created_at: string
          current: string | null
          description: string | null
          id: string
          name: string
          project_id: string | null
          status: Database["public"]["Enums"]["metric_status"]
          target: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current?: string | null
          description?: string | null
          id?: string
          name: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["metric_status"]
          target: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current?: string | null
          description?: string | null
          id?: string
          name?: string
          project_id?: string | null
          status?: Database["public"]["Enums"]["metric_status"]
          target?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      mvp_features: {
        Row: {
          created_at: string
          effort: Database["public"]["Enums"]["feature_effort"] | null
          feature: string
          growth_metric_id: string | null
          id: string
          impact: Database["public"]["Enums"]["feature_impact"] | null
          notes: string | null
          priority: Database["public"]["Enums"]["feature_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["feature_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          effort?: Database["public"]["Enums"]["feature_effort"] | null
          feature: string
          growth_metric_id?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["feature_impact"] | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          effort?: Database["public"]["Enums"]["feature_effort"] | null
          feature?: string
          growth_metric_id?: string | null
          id?: string
          impact?: Database["public"]["Enums"]["feature_impact"] | null
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_features_growth_metric_id_fkey"
            columns: ["growth_metric_id"]
            isOneToOne: false
            referencedRelation: "growth_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mvp_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      pivot_metric_triggers: {
        Row: {
          created_at: string
          id: string
          metric_id: string
          pivot_option_id: string
          threshold_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metric_id: string
          pivot_option_id: string
          threshold_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metric_id?: string
          pivot_option_id?: string
          threshold_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pivot_metric_triggers_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pivot_metric_triggers_pivot_option_id_fkey"
            columns: ["pivot_option_id"]
            isOneToOne: false
            referencedRelation: "pivot_options"
            referencedColumns: ["id"]
          },
        ]
      }
      pivot_options: {
        Row: {
          created_at: string
          description: string
          id: string
          likelihood: Database["public"]["Enums"]["pivot_likelihood"]
          project_id: string | null
          trigger: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          likelihood?: Database["public"]["Enums"]["pivot_likelihood"]
          project_id?: string | null
          trigger: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          likelihood?: Database["public"]["Enums"]["pivot_likelihood"]
          project_id?: string | null
          trigger?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pivot_options_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      project_invitations: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          project_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          status: string
          token: string
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token: string
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_invitations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_members: {
        Row: {
          created_at: string | null
          id: string
          project_id: string | null
          role: Database["public"]["Enums"]["user_role"]
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          project_id?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_members_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          owner_id: string | null
          stage: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          owner_id?: string | null
          stage: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          owner_id?: string | null
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      scaling_plan_actions: {
        Row: {
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metric_id: string | null
          priority: string
          scaling_plan_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metric_id?: string | null
          priority?: string
          scaling_plan_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metric_id?: string | null
          priority?: string
          scaling_plan_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scaling_plan_actions_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "scaling_readiness_metrics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_plan_actions_scaling_plan_id_fkey"
            columns: ["scaling_plan_id"]
            isOneToOne: false
            referencedRelation: "scaling_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      scaling_plans: {
        Row: {
          created_at: string
          description: string | null
          growth_model_id: string | null
          id: string
          overall_readiness: number | null
          project_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          growth_model_id?: string | null
          id?: string
          overall_readiness?: number | null
          project_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          growth_model_id?: string | null
          id?: string
          overall_readiness?: number | null
          project_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scaling_plans_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_plans_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scaling_readiness_metrics: {
        Row: {
          category: string
          created_at: string
          current_value: number
          description: string | null
          growth_model_id: string | null
          id: string
          importance: number
          name: string
          project_id: string
          status: string
          target_value: number
          unit: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          current_value?: number
          description?: string | null
          growth_model_id?: string | null
          id?: string
          importance?: number
          name: string
          project_id: string
          status?: string
          target_value?: number
          unit: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          current_value?: number
          description?: string | null
          growth_model_id?: string | null
          id?: string
          importance?: number
          name?: string
          project_id?: string
          status?: string
          target_value?: number
          unit?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scaling_readiness_metrics_growth_model_id_fkey"
            columns: ["growth_model_id"]
            isOneToOne: false
            referencedRelation: "growth_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scaling_readiness_metrics_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      scaling_recommendations: {
        Row: {
          created_at: string
          description: string
          id: string
          priority: string
          project_id: string
          source_id: string | null
          status: string
          target_id: string | null
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          priority: string
          project_id: string
          source_id?: string | null
          status?: string
          target_id?: string | null
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          priority?: string
          project_id?: string
          source_id?: string | null
          status?: string
          target_id?: string | null
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "scaling_recommendations_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      stages: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          position: number
          project_id: string | null
          status: Database["public"]["Enums"]["stage_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id: string
          name: string
          position: number
          project_id?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          position?: number
          project_id?: string | null
          status?: Database["public"]["Enums"]["stage_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_project_member: {
        Args: {
          project_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      experiment_status: "completed" | "in-progress" | "planned"
      feature_effort: "high" | "medium" | "low"
      feature_impact: "high" | "medium" | "low"
      feature_priority: "high" | "medium" | "low"
      feature_status: "in-progress" | "planned" | "completed" | "post-mvp"
      hypothesis_status: "validated" | "validating" | "not-started" | "invalid"
      metric_status: "success" | "warning" | "error" | "not-started"
      pivot_likelihood: "high" | "medium" | "low"
      stage_status: "complete" | "in-progress" | "not-started"
      user_role: "admin" | "team_member"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

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
      hypotheses: {
        Row: {
          category: string
          created_at: string
          criteria: string
          evidence: string | null
          experiment: string
          id: string
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
      metrics: {
        Row: {
          category: string
          created_at: string
          current: string | null
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
          feature: string
          id: string
          notes: string | null
          priority: Database["public"]["Enums"]["feature_priority"]
          project_id: string | null
          status: Database["public"]["Enums"]["feature_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          project_id?: string | null
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mvp_features_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
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

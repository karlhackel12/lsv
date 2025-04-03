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
          id: string
          title: string
          description: string | null
          hypothesis: string
          method: string
          results: string | null
          status: string
          project_id: string
          created_at: string
          updated_at: string
          category: string | null
          success_criteria: string | null
          feedback: string | null
          learnings: string | null
          metrics: string[] | null
        }
      }
      hypotheses: {
        Row: {
          id: string
          statement: string
          category: string
          criteria: string
          experiment: string
          status: string
          evidence: string | null
          result: string | null
          phase: string
          project_id: string
          created_at: string
          updated_at: string
        }
      }
      metrics: {
        Row: {
          id: string
          name: string
          description: string | null
          category: string
          target: string
          current: string | null
          status: string
          project_id: string
          created_at: string
          updated_at: string
        }
      }
      projects: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
          vision: string | null
          problem_statement: string | null
          customer_segments: string[] | null
          current_stage: string | null
          owner_id: string | null
          stage: string | null
          mvp_tracking: Json | null
          metrics_tracking: Json | null
          growth_tracking: Json | null
          pivot_tracking: Json | null
          problem_tracking: Json | null
          solution_tracking: Json | null
          milestones: Json | null
        }
      }
      // Additional tables would be defined here
    }
  }
} 
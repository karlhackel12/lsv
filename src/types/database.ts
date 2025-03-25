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
      metric_history: {
        Row: {
          id: string
          metric_id: string
          recorded_at: string
          status: string
          value: string | null
        }
        Insert: {
          id?: string
          metric_id: string
          recorded_at?: string
          status: string
          value?: string | null
        }
        Update: {
          id?: string
          metric_id?: string
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
          effort: Database["public"]["Enums"]["feature_effort"]
          impact: Database["public"]["Enums"]["feature_impact"]
          status: Database["public"]["Enums"]["feature_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          feature: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          effort?: Database["public"]["Enums"]["feature_effort"]
          impact?: Database["public"]["Enums"]["feature_impact"]
          status?: Database["public"]["Enums"]["feature_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          feature?: string
          id?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["feature_priority"]
          effort?: Database["public"]["Enums"]["feature_effort"]
          impact?: Database["public"]["Enums"]["feature_impact"]
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
          status?: string
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

// Growth models types
export interface GrowthModel {
  id: string;
  originalId?: string;
  name: string;
  description: string;
  framework: string;
  project_id: string;
  status: 'draft' | 'active' | 'archived';
  created_at: string;
  updated_at: string;
}

export interface GrowthMetric {
  id: string;
  originalId?: string;
  name: string;
  description?: string;
  category: string;
  current_value: number;
  target_value: number;
  unit: string;
  growth_model_id?: string;
  project_id: string;
  status: 'on-track' | 'at-risk' | 'off-track';
  scaling_metric_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GrowthChannel {
  id: string;
  originalId?: string;
  name: string;
  category: string;
  cac?: number;
  conversion_rate?: number;
  volume?: number;
  status: 'active' | 'testing' | 'inactive';
  growth_model_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface GrowthExperiment {
  id: string;
  originalId?: string;
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
}

export interface MVPFeature {
  id: string;
  originalId?: string;
  feature: string;
  priority: 'high' | 'medium' | 'low';
  effort: 'high' | 'medium' | 'low';
  impact: 'high' | 'medium' | 'low';
  status: 'in-progress' | 'planned' | 'completed' | 'post-mvp';
  notes?: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Define the GrowthHypothesis interface to match the database schema
export interface GrowthHypothesis {
  id: string;
  originalId?: string;
  action: string;
  outcome: string;
  success_criteria?: string;
  metric_id?: string | null;
  stage: string;
  growth_model_id: string;
  project_id: string;
  created_at: string;
  updated_at: string;
}

// Constants for growth framework options
export const GROWTH_FRAMEWORKS = {
  'aarrr': {
    name: 'AARRR (Pirate Metrics)',
    stages: ['Acquisition', 'Activation', 'Retention', 'Referral', 'Revenue']
  },
  'hook': {
    name: 'Hook Model',
    stages: ['Trigger', 'Action', 'Variable Reward', 'Investment']
  },
  'jobs-to-be-done': {
    name: 'Jobs To Be Done',
    stages: ['Functional', 'Emotional', 'Social']
  },
  'growth-loops': {
    name: 'Growth Loops',
    stages: ['Acquisition', 'Conversion', 'Compounding Action', 'Retention']
  },
  'flywheel': {
    name: 'Flywheel Model',
    stages: ['Attract', 'Engage', 'Delight', 'Refer']
  },
  'custom': {
    name: 'Custom Framework',
    stages: ['Custom Stages']
  }
};

// Export the templates from pivot.ts
export const TEMPLATE_VALUE_HYPOTHESES = [
  "Teachers need {feature} to solve {specific_problem}",
  "Students will consistently use {feature} for {time_period} if it {provides_value}",
  "{user_type} will pay {price_point} for {value_proposition}",
  "{feature} will improve {key_metric} by at least {percentage}"
];

export const TEMPLATE_GROWTH_HYPOTHESES = [
  "{user_type} will refer {number} new users after {trigger_event}",
  "{marketing_channel} will acquire users at less than {target_CAC}",
  "{percentage} of users will upgrade to paid tier within {timeframe}",
  "User retention will exceed {percentage} at {time_period} due to {feature}"
];

export const TEMPLATE_PROBLEM_EXPERIMENTS = [
  "Conduct {number} structured interviews with {target_users} focusing on {problem_area}",
  "Create landing page describing {solution} and measure email signup rate",
  "Run {number} observation sessions watching {users} attempt to solve {problem}",
  "Distribute survey to {user_segment} with questions about {problem_frequency/severity}"
];

export const TEMPLATE_SOLUTION_EXPERIMENTS = [
  "Provide {number} users access to {MVP_feature} and track {usage_metric}",
  "A/B test {current_solution} against {new_solution} measuring {key_metric}",
  "Create Wizard of Oz prototype of {feature} and observe {user_behavior}",
  "Run usability tests on {prototype} measuring {completion_metric}"
];

export const TEMPLATE_BUSINESS_MODEL_EXPERIMENTS = [
  "Offer {product} at {price_point} to {number} users measuring conversion rate",
  "Test {monetization_approach} with {user_segment} tracking {revenue_metric}",
  "Compare {pricing_tiers} using split testing measuring overall revenue",
  "Implement {acquisition_channel} with {budget} measuring CAC and conversion"
];

export const TEMPLATE_PROBLEM_CRITERIA = [
  ">75% of interviewed users report this as a top 3 problem",
  ">30% email signup rate on landing page",
  ">50% of users currently using workarounds for this problem",
  "Problem severity rated >8/10 by >60% of users"
];

export const TEMPLATE_SOLUTION_CRITERIA = [
  ">65% daily active usage rate",
  ">40% improvement over control group",
  ">80% task completion rate with prototype",
  "NPS score >40 after using solution"
];

export const TEMPLATE_BUSINESS_MODEL_CRITERIA = [
  ">70% conversion rate at target price point",
  "CAC <$X with >$Y LTV (3:1 ratio minimum)",
  ">60% retention at 60 days",
  ">0.5 viral coefficient (referrals per user)"
];

// Add missing template exports that are referenced in other files
export const TEMPLATE_FEATURE_PRIORITY = {
  'high': 'This feature is critical for the product to function and deliver value.',
  'medium': 'This feature is important but not essential for the initial launch.',
  'low': 'This feature would be nice to have but can be deferred to a later release.'
};

export const TEMPLATE_FEATURE_STATUS = {
  'in-progress': 'Currently being implemented',
  'planned': 'Scheduled for implementation',
  'completed': 'Feature has been implemented',
  'post-mvp': 'Planned for after the MVP release'
};

export const GROWTH_CHANNEL_CATEGORIES = [
  'Organic Search',
  'Paid Search',
  'Social Media',
  'Email Marketing',
  'Content Marketing',
  'Referral',
  'Direct',
  'Partnerships',
  'PR',
  'Events',
  'Other'
];

export const GROWTH_METRIC_TEMPLATES = {
  'acquisition': [
    { name: 'New Users', unit: '%', description: 'Number of new users acquired in a given period' },
    { name: 'Visitor to Sign-up Rate', unit: '%', description: 'Percentage of visitors who sign up' },
    { name: 'Cost per Acquisition', unit: '$', description: 'Cost to acquire a new user' }
  ],
  'activation': [
    { name: 'Onboarding Completion Rate', unit: '%', description: 'Percentage of users who complete onboarding' },
    { name: 'First Value Moment', unit: '%', description: 'Percentage of users who reach first value moment' },
    { name: 'Time to First Value', unit: 'minutes', description: 'Average time to reach first value moment' }
  ],
  'retention': [
    { name: 'Day 1 Retention', unit: '%', description: 'Percentage of users who return after 1 day' },
    { name: 'Day 7 Retention', unit: '%', description: 'Percentage of users who return after 7 days' },
    { name: 'Day 30 Retention', unit: '%', description: 'Percentage of users who return after 30 days' },
    { name: 'Monthly Active Users', unit: 'users', description: 'Number of users active in the past month' }
  ],
  'revenue': [
    { name: 'Average Revenue Per User', unit: '$', description: 'Average revenue generated per user' },
    { name: 'Conversion Rate to Paid', unit: '%', description: 'Percentage of users who convert to paid' },
    { name: 'Monthly Recurring Revenue', unit: '$', description: 'Predictable revenue generated every month' }
  ],
  'referral': [
    { name: 'Virality Coefficient', unit: 'k-factor', description: 'Number of new users each user brings' },
    { name: 'Referral Rate', unit: '%', description: 'Percentage of users who refer others' },
    { name: 'Shared Content Rate', unit: '%', description: 'Percentage of users who share content' }
  ],
  'custom': [
    { name: 'Custom Metric', unit: 'count', description: 'A custom metric for your specific needs' }
  ]
};

// Define the interfaces for other tables referenced in the codebase
export interface Project {
  id: string;
  name: string;
  description: string;
  stage: string;
  owner_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Hypothesis {
  id: string;
  originalId?: string;
  statement: string;
  category: string;
  criteria: string;
  experiment: string;
  status: 'validated' | 'validating' | 'not-started' | 'invalid';
  evidence?: string;
  result?: string;
  phase: 'problem' | 'solution';
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
  status: 'planned' | 'in-progress' | 'completed';
  category: string;
  results?: string | null;
  insights?: string | null;
  decisions?: string | null;
  project_id: string;
  hypothesis_id: string | null;
  created_at?: string;
  updated_at?: string;
  // Additional fields for tracking growth experiments
  isGrowthExperiment?: boolean;
  originalGrowthExperiment?: GrowthExperiment;
}

export interface Metric {
  id: string;
  originalId?: string;
  name: string;
  description?: string;
  category: string;
  target: string;
  current?: string;
  status: 'success' | 'warning' | 'error' | 'not-started';
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface MetricHistory {
  id: string;
  metric_id: string;
  value?: string;
  status: string;
  recorded_at: string;
}

export interface PivotOption {
  id: string;
  originalId?: string;
  type: string;
  description: string;
  trigger: string;
  likelihood: 'high' | 'medium' | 'low';
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface PivotMetricTrigger {
  id: string;
  pivot_option_id: string;
  metric_id: string;
  threshold_type: string;
  created_at: string;
  updated_at: string;
}

export interface ExperimentLog {
  id: string;
  experiment_id: string;
  project_id: string;
  type: 'note' | 'result' | 'insight';
  content: string;
  metrics?: string;
  files?: string[];
  created_at: string;
  created_by?: string;
  created_by_name?: string;
}

// Scaling Readiness Types
export interface ScalingReadinessMetric {
  id: string;
  originalId?: string;
  project_id: string;
  growth_model_id?: string | null;
  category: string;
  name: string;
  description?: string;
  current_value: number;
  target_value: number;
  unit: string;
  importance: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScalingPlan {
  id: string;
  originalId?: string;
  project_id: string;
  growth_model_id?: string | null;
  title: string;
  description?: string;
  overall_readiness: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface ScalingPlanAction {
  id: string;
  originalId?: string;
  scaling_plan_id: string;
  title: string;
  description?: string;
  metric_id?: string | null;
  priority: string;
  status: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Add these missing constants
export const SCALING_METRIC_CATEGORIES = {
  'unit_economics': 'Unit Economics',
  'retention': 'Retention',
  'acquisition': 'Acquisition',
  'team': 'Team',
  'infrastructure': 'Infrastructure',
  'product': 'Product',
  'finance': 'Finance',
  'operations': 'Operations'
};

export const SCALING_METRIC_UNITS = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'currency', label: 'Currency ($)' },
  { value: 'ratio', label: 'Ratio (x:1)' },
  { value: 'count', label: 'Count (#)' },
  { value: 'time', label: 'Time (days)' }
];

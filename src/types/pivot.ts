
export interface PivotTrigger {
  id: string;
  metric_id: string;
  threshold: string;
  trigger_description: string;
  action_plan: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
  updated_at: string;
}

export interface PivotWorkflow {
  id: string;
  name: string;
  description: string;
  hypothesis_id: string;
  selected_pivot_option_id: string;
  impact_assessment: string;
  decision: string;
  status: 'draft' | 'in-review' | 'approved' | 'rejected' | 'implemented';
  created_at: string;
  updated_at: string;
}

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

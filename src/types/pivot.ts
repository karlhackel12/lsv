
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

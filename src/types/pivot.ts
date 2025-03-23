
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

export interface PivotMetricTrigger {
  id: string;
  pivot_option_id: string;
  metric_id: string;
  threshold_type: string;
  created_at: string;
  updated_at: string;
}

// Problem phase hypothesis templates
export const TEMPLATE_PROBLEM_HYPOTHESES = [
  "We believe [customer segment] has a significant problem with [pain point]",
  "We believe that [customer segment] are currently using [workaround] to solve [problem]",
  "We believe [customer segment] will pay to solve [specific problem] because [reason]",
  "We believe [customer segment] experiences [problem] at a frequency of [estimate]"
];

// Solution phase hypothesis templates
export const TEMPLATE_SOLUTION_HYPOTHESES = [
  "We believe that [proposed solution] will solve [validated problem] for [customer segment]",
  "We believe that [customer segment] will prefer our solution over [existing alternatives]",
  "We believe that [feature] is essential for solving [specific aspect of problem]",
  "We believe that [customer segment] will be willing to pay [price point] for our solution"
];

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

// Problem phase experiment templates
export const TEMPLATE_PROBLEM_EXPERIMENTS = [
  "Conduct {number} structured interviews with {target_users} focusing on {problem_area}",
  "Create landing page describing {problem} and measure email signup rate",
  "Run {number} observation sessions watching {users} attempt to solve {problem}",
  "Distribute survey to {user_segment} with questions about {problem_frequency/severity}"
];

// Solution phase experiment templates
export const TEMPLATE_SOLUTION_EXPERIMENTS = [
  "Provide {number} users access to {MVP_feature} and track {usage_metric}",
  "A/B test {current_solution} against {new_solution} measuring {key_metric}",
  "Create Wizard of Oz prototype of {feature} and observe {user_behavior}",
  "Run usability tests on {prototype} measuring {completion_metric}"
];

// Business model phase experiment templates
export const TEMPLATE_BUSINESS_MODEL_EXPERIMENTS = [
  "Offer {product} at {price_point} to {number} users measuring conversion rate",
  "Test {monetization_approach} with {user_segment} tracking {revenue_metric}",
  "Compare {pricing_tiers} using split testing measuring overall revenue",
  "Implement {acquisition_channel} with {budget} measuring CAC and conversion"
];

// Success criteria templates
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

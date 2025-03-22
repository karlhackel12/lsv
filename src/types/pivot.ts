
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

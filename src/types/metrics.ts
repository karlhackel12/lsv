
export interface MetricData {
  id: string;
  originalId?: string;
  name: string;
  description?: string;
  category: 'acquisition' | 'activation' | 'retention' | 'revenue' | 'referral' | 'custom';
  current: string | null;
  target: string;
  status: 'success' | 'warning' | 'error' | 'not-started';
  project_id: string;
  created_at: string;
  updated_at: string;
}

export interface MetricHistoryEntry {
  id: string;
  metric_id: string;
  value: string | null;
  status: string;
  recorded_at: string;
  notes?: string;
  context?: string;
}

export interface MetricThreshold {
  id: string;
  metric_id: string;
  warning_threshold: string;
  error_threshold: string;
  created_at: string;
  updated_at: string;
}

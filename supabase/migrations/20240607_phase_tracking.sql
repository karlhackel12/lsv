-- Add tracking fields for Growth, Metrics, and Pivot Decision phases
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "metrics_tracking" JSONB DEFAULT '{
  "key_metrics_established": false,
  "tracking_systems_setup": false,
  "dashboards_created": false,
  "data_driven_decisions": false
}'::jsonb;

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "growth_tracking" JSONB DEFAULT '{
  "channels_identified": false,
  "growth_experiments_setup": false,
  "funnel_optimized": false,
  "repeatable_growth": false
}'::jsonb;

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "pivot_tracking" JSONB DEFAULT '{
  "validation_data_evaluated": false,
  "pivot_assessment_conducted": false,
  "strategic_decision_made": false,
  "reasoning_documented": false
}'::jsonb;

-- Add tracking fields for Problem and Solution validation phases
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "problem_tracking" JSONB DEFAULT '{
  "hypotheses_created": false,
  "customer_interviews_conducted": false,
  "pain_points_identified": false,
  "market_need_validated": false
}'::jsonb;

ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "solution_tracking" JSONB DEFAULT '{
  "solution_hypotheses_defined": false,
  "solution_sketches_created": false,
  "tested_with_customers": false,
  "positive_feedback_received": false
}'::jsonb;

-- Create functions to update tracking fields automatically

-- Function to update metrics tracking
CREATE OR REPLACE FUNCTION update_metrics_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a metric is added, update key_metrics_established
  IF (TG_OP = 'INSERT') THEN
    UPDATE projects 
    SET metrics_tracking = jsonb_set(
      COALESCE(metrics_tracking, '{}'::jsonb),
      '{key_metrics_established}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update growth tracking
CREATE OR REPLACE FUNCTION update_growth_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a growth experiment is added, update channels_identified and growth_experiments_setup
  IF (TG_OP = 'INSERT') THEN
    UPDATE projects 
    SET growth_tracking = jsonb_set(
      jsonb_set(
        COALESCE(growth_tracking, '{}'::jsonb),
        '{channels_identified}',
        'true'::jsonb
      ),
      '{growth_experiments_setup}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update pivot tracking
CREATE OR REPLACE FUNCTION update_pivot_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a pivot assessment is created, update validation_data_evaluated and pivot_assessment_conducted
  IF (TG_OP = 'INSERT') THEN
    UPDATE projects 
    SET pivot_tracking = jsonb_set(
      jsonb_set(
        COALESCE(pivot_tracking, '{}'::jsonb),
        '{validation_data_evaluated}',
        'true'::jsonb
      ),
      '{pivot_assessment_conducted}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update problem tracking
CREATE OR REPLACE FUNCTION update_problem_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a problem hypothesis is created, update hypotheses_created
  IF (TG_OP = 'INSERT') AND NEW.phase = 'problem' THEN
    UPDATE projects 
    SET problem_tracking = jsonb_set(
      COALESCE(problem_tracking, '{}'::jsonb),
      '{hypotheses_created}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update solution tracking
CREATE OR REPLACE FUNCTION update_solution_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- When a solution hypothesis is created, update solution_hypotheses_defined
  IF (TG_OP = 'INSERT') AND NEW.phase = 'solution' THEN
    UPDATE projects 
    SET solution_tracking = jsonb_set(
      COALESCE(solution_tracking, '{}'::jsonb),
      '{solution_hypotheses_defined}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers 
DROP TRIGGER IF EXISTS metrics_tracking_trigger ON metrics;
CREATE TRIGGER metrics_tracking_trigger
AFTER INSERT ON metrics
FOR EACH ROW
EXECUTE FUNCTION update_metrics_tracking();

DROP TRIGGER IF EXISTS growth_tracking_trigger ON growth_experiments;
CREATE TRIGGER growth_tracking_trigger
AFTER INSERT ON growth_experiments
FOR EACH ROW
EXECUTE FUNCTION update_growth_tracking();

DROP TRIGGER IF EXISTS pivot_tracking_trigger ON pivot_assessments;
CREATE TRIGGER pivot_tracking_trigger
AFTER INSERT ON pivot_assessments
FOR EACH ROW
EXECUTE FUNCTION update_pivot_tracking();

-- Create triggers for problem and solution tracking
DROP TRIGGER IF EXISTS problem_tracking_trigger ON hypotheses;
CREATE TRIGGER problem_tracking_trigger
AFTER INSERT ON hypotheses
FOR EACH ROW
EXECUTE FUNCTION update_problem_tracking();

DROP TRIGGER IF EXISTS solution_tracking_trigger ON hypotheses;
CREATE TRIGGER solution_tracking_trigger
AFTER INSERT ON hypotheses
FOR EACH ROW
EXECUTE FUNCTION update_solution_tracking(); 
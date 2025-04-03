-- Add enhanced MVP tracking to projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "mvp_tracking" JSONB DEFAULT '{
  "core_features_defined": false,
  "mvp_built": false,
  "released_to_users": false,
  "metrics_gathered": false
}'::jsonb;

-- Create function to update mvp_tracking field
CREATE OR REPLACE FUNCTION update_mvp_tracking()
RETURNS TRIGGER AS $$
BEGIN
  -- Automatically set core_features_defined to true when a MVP feature is created
  IF (TG_OP = 'INSERT' OR TG_OP = 'UPDATE') AND NEW.status IS NOT NULL THEN
    UPDATE projects 
    SET mvp_tracking = jsonb_set(
      COALESCE(mvp_tracking, '{}'::jsonb),
      '{core_features_defined}',
      'true'::jsonb
    )
    WHERE id = NEW.project_id;
    
    -- If at least one feature is completed, mark mvp_built as true
    IF NEW.status = 'completed' THEN
      UPDATE projects 
      SET mvp_tracking = jsonb_set(
        COALESCE(mvp_tracking, '{}'::jsonb),
        '{mvp_built}',
        'true'::jsonb
      )
      WHERE id = NEW.project_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on mvp_features table
DROP TRIGGER IF EXISTS mvp_tracking_trigger ON mvp_features;
CREATE TRIGGER mvp_tracking_trigger
AFTER INSERT OR UPDATE ON mvp_features
FOR EACH ROW
EXECUTE FUNCTION update_mvp_tracking(); 
-- Create pivot_assessments table for storing pivot decisions
CREATE TABLE IF NOT EXISTS "pivot_assessments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "project_id" UUID NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
  "answers" JSONB,
  "notes" TEXT,
  "recommendation" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add pivot_assessment field to projects table as fallback storage
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "pivot_assessment" JSONB;

-- Update RLS policies for pivot_assessments
ALTER TABLE "pivot_assessments" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own pivot assessments" 
  ON "pivot_assessments" FOR SELECT 
  USING ((auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)));

CREATE POLICY "Users can insert their own pivot assessments" 
  ON "pivot_assessments" FOR INSERT 
  WITH CHECK ((auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)));

CREATE POLICY "Users can update their own pivot assessments" 
  ON "pivot_assessments" FOR UPDATE 
  USING ((auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)));

CREATE POLICY "Users can delete their own pivot assessments" 
  ON "pivot_assessments" FOR DELETE 
  USING ((auth.uid() = (SELECT owner_id FROM projects WHERE id = project_id)));

-- Add metadata tracking for project progress
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "milestones" JSONB; 
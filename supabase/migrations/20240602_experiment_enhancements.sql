-- Add learnings field to experiments table
ALTER TABLE "experiments" ADD COLUMN IF NOT EXISTS "learnings" TEXT;

-- Add current_stage field to projects table
ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "current_stage" TEXT DEFAULT 'problem';

-- Create experiment_templates table
CREATE TABLE IF NOT EXISTS "experiment_templates" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" TEXT NOT NULL,
  "description" TEXT,
  "category" TEXT,
  "method" TEXT,
  "hypothesis_template" TEXT,
  "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Insert default templates
INSERT INTO "experiment_templates" 
  ("name", "description", "category", "method", "hypothesis_template")
VALUES
  (
    'Customer Interview', 
    'Conduct interviews with potential customers to validate problem hypotheses', 
    'problem', 
    'Prepare 5-7 open-ended questions and interview 5+ potential customers',
    'We believe that [customer segment] experiences [problem] when trying to [activity]'
  ),
  (
    'Landing Page Test', 
    'Create a simple landing page to test interest in your solution', 
    'solution', 
    'Create a landing page describing your solution and add a sign-up form to measure interest',
    'We believe that [customer segment] will sign up to learn more about [solution]'
  ),
  (
    'Concierge MVP', 
    'Manually deliver your service to early customers', 
    'solution', 
    'Personally deliver your service to a small group of users without building any technology',
    'We believe that manually delivering [solution] will satisfy [customer need]'
  ),
  (
    'Paper Prototype', 
    'Create low-fidelity mockups to test UI/UX concepts', 
    'solution', 
    'Sketch your interface on paper and walk users through interactions',
    'We believe that [customer segment] will understand and engage with our interface design'
  ),
  (
    'Pricing Test', 
    'Test willingness to pay for your solution', 
    'solution', 
    'Present different pricing options to potential customers and measure responses',
    'We believe that [customer segment] is willing to pay [price] for [solution]'
  );

-- Update RLS policies
ALTER TABLE "experiment_templates" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public templates are viewable by authenticated users" 
  ON "experiment_templates" FOR SELECT 
  USING (auth.role() = 'authenticated'); 
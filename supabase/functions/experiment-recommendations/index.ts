
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import { Database } from '../_shared/types.ts';
import { OpenAI } from 'https://esm.sh/openai@4.0.0';

// Define service role key from env for server-to-server communication
const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const openaiApiKey = Deno.env.get('OPENAI_API_KEY') || '';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: openaiApiKey,
});

// Define recommendation request interface
interface RecommendationRequest {
  projectId: string;
  userId: string;
  currentStage: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request data
    const requestData: RecommendationRequest = await req.json();
    const { projectId, userId, currentStage } = requestData;

    if (!projectId || !userId || !currentStage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Fetch project data
    const { data: project, error: projectError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (projectError) {
      console.error('Error fetching project:', projectError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch project data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch existing experiments
    const { data: existingExperiments, error: experimentsError } = await supabase
      .from('experiments')
      .select('*')
      .eq('project_id', projectId);

    if (experimentsError) {
      console.error('Error fetching experiments:', experimentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch experiment data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Fetch existing hypotheses
    const { data: hypotheses, error: hypothesesError } = await supabase
      .from('hypotheses')
      .select('*')
      .eq('project_id', projectId);

    if (hypothesesError) {
      console.error('Error fetching hypotheses:', hypothesesError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch hypotheses data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Generate recommendations using AI
    const recommendations = await generateRecommendations(
      project, 
      existingExperiments || [], 
      hypotheses || [], 
      currentStage
    );

    // Identify patterns in existing experiments
    const patterns = identifyPatterns(existingExperiments || []);

    return new Response(
      JSON.stringify({ recommendations, patterns }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Function to generate experiment recommendations
async function generateRecommendations(
  project: any, 
  existingExperiments: any[], 
  hypotheses: any[],
  currentStage: string
): Promise<any[]> {
  try {
    // Prepare data for the AI model
    const projectData = {
      name: project.name,
      description: project.description,
      stage: currentStage,
      problem_statement: project.problem_statement,
      customer_segments: project.customer_segments,
    };

    // Different prompt templates based on validation stage
    const stagePrompts = {
      problem: "Generate experiment ideas to validate the problem:",
      solution: "Generate experiment ideas to validate the solution:",
      mvp: "Generate experiment ideas to validate the Minimum Viable Product:",
      growth: "Generate experiment ideas to optimize growth metrics:"
    };

    // Default to problem stage if the stage doesn't match any specific template
    const stagePrompt = stagePrompts[currentStage as keyof typeof stagePrompts] || stagePrompts.problem;

    // Create a prompt for OpenAI
    const prompt = `
    ${stagePrompt}
    
    Project Details:
    ${JSON.stringify(projectData, null, 2)}
    
    Existing Experiments:
    ${JSON.stringify(existingExperiments.slice(0, 5), null, 2)}
    
    Existing Hypotheses:
    ${JSON.stringify(hypotheses.slice(0, 5), null, 2)}
    
    Based on this data, generate 3-5 experiment recommendations that would be valuable to run next in the ${currentStage} validation stage.
    
    For each experiment recommendation, provide:
    - title: A concise title for the experiment
    - description: A clear and detailed description
    - method: The specific method to use (e.g., customer interviews, surveys, A/B testing)
    - hypothesis: A well-formulated hypothesis statement
    - expectedOutcome: What the startup should expect to learn
    - confidenceScore: A number from 1-10 representing confidence in value
    - relevanceScore: A number from 1-10 representing relevance to current stage
    - difficulty: "easy", "medium", or "hard"
    - estimatedDuration: Estimated time to run (e.g., "1-2 days", "1 week")
    - category: The category of experiment (e.g., "problem", "solution", "customer", "market")
    
    Format the response as a JSON array of recommendation objects.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are an expert in lean startup methodology who specializes in designing effective experiments to validate business assumptions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });

    const responseContent = completion.choices[0].message.content;
    if (!responseContent) {
      throw new Error("Empty response from OpenAI");
    }

    // Parse the JSON response
    const responseJson = JSON.parse(responseContent);
    
    // Ensure we have an array of recommendations
    const recommendations = responseJson.recommendations || [];
    
    return recommendations;
  } catch (error) {
    console.error("Error generating recommendations:", error);
    // Return an empty array if AI generation fails
    return [];
  }
}

// Function to identify patterns in existing experiments
function identifyPatterns(experiments: any[]): any {
  // Skip if there are too few experiments
  if (experiments.length < 3) {
    return null;
  }

  // Basic pattern identification
  const patterns = {
    successfulMethods: [],
    commonCategories: {},
    averageDuration: 0,
    completionRate: 0
  };

  // Count successful methods
  const successMethods = experiments
    .filter(exp => exp.status === 'completed' && exp.results && !exp.results.includes('fail'))
    .map(exp => exp.method);
  
  // Find most common methods among successful experiments
  const methodCounts: Record<string, number> = {};
  successMethods.forEach(method => {
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });
  
  patterns.successfulMethods = Object.entries(methodCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([method]) => method);

  // Categorize experiments
  experiments.forEach(exp => {
    const category = exp.category || 'uncategorized';
    patterns.commonCategories[category] = (patterns.commonCategories[category] || 0) + 1;
  });

  // Calculate completion rate
  const completedExperiments = experiments.filter(exp => exp.status === 'completed');
  patterns.completionRate = Math.round((completedExperiments.length / experiments.length) * 100);

  return patterns;
}

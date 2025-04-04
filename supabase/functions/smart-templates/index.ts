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

// Define template request interface
interface TemplateRequest {
  projectId: string;
  userId: string;
  templateType: 'experiment' | 'hypothesis' | 'metric' | 'mvp-feature' | 'pivot-option';
  stage: string;
  context?: {
    problemStatement?: string;
    customerSegments?: string[];
    previousExperiments?: string[];
    existingHypotheses?: string[];
    specificFocus?: string;
  };
}

// Define template response interface
interface TemplateResponse {
  templates: any[];
  suggestedFields: Record<string, any>;
  adaptationReasoning: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request data
    const requestData: TemplateRequest = await req.json();
    const { projectId, userId, templateType, stage, context } = requestData;

    if (!projectId || !userId || !templateType || !stage) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Fetch project details to understand the context
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

    // Fetch relevant data based on template type
    const projectContext = await fetchRelevantData(supabase, projectId, templateType, project);

    // Generate smart templates using AI
    const templates = await generateSmartTemplates(
      templateType,
      stage, 
      {
        ...projectContext,
        ...context
      }
    );

    return new Response(
      JSON.stringify(templates),
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

// Function to fetch relevant data for template generation
async function fetchRelevantData(supabase: any, projectId: string, templateType: string, project: any) {
  const contextData: any = {
    projectName: project.name,
    projectDescription: project.description,
    problemStatement: project.problem_statement,
    customerSegments: project.customer_segments,
    stage: project.current_stage || project.stage
  };

  // Fetch type-specific data
  switch (templateType) {
    case 'experiment':
      const { data: experiments } = await supabase
        .from('experiments')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: experimentTemplates } = await supabase
        .from('experiment_templates')
        .select('*')
        .limit(10);
      
      contextData.recentExperiments = experiments || [];
      contextData.experimentTemplates = experimentTemplates || [];
      break;
      
    case 'hypothesis':
      const { data: hypotheses } = await supabase
        .from('hypotheses')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      contextData.recentHypotheses = hypotheses || [];
      break;
      
    case 'metric':
      const { data: metrics } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      contextData.recentMetrics = metrics || [];
      break;
      
    case 'mvp-feature':
      const { data: features } = await supabase
        .from('mvp_features')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      contextData.recentFeatures = features || [];
      break;
      
    case 'pivot-option':
      const { data: pivotOptions } = await supabase
        .from('pivot_options')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false })
        .limit(5);
      
      const { data: projectMetrics } = await supabase
        .from('metrics')
        .select('*')
        .eq('project_id', projectId)
        .eq('status', 'error')
        .order('created_at', { ascending: false })
        .limit(5);
      
      contextData.recentPivotOptions = pivotOptions || [];
      contextData.problematicMetrics = projectMetrics || [];
      break;
  }

  return contextData;
}

// Function to generate smart templates using AI
async function generateSmartTemplates(
  templateType: string, 
  stage: string, 
  context: any
): Promise<TemplateResponse> {
  try {
    // Construct prompt based on template type
    let prompt = `
    Generate AI-powered templates for a startup in the ${stage} stage.
    
    Project context:
    - Project Name: ${context.projectName || 'Unnamed project'}
    - Description: ${context.projectDescription || 'No description provided'}
    - Problem Statement: ${context.problemStatement || 'No problem statement provided'}
    - Customer Segments: ${JSON.stringify(context.customerSegments || [])}
    
    `;

    // Add template-specific content to the prompt
    switch (templateType) {
      case 'experiment':
        prompt += `
        I need smart templates for experiments. Use the following context:
        
        Recent experiments:
        ${JSON.stringify(context.recentExperiments || [], null, 2)}
        
        Generate 3 different experiment templates that:
        1. Are appropriate for the ${stage} stage
        2. Follow lean methodology best practices
        3. Are specific enough to be actionable
        4. Build on any patterns of success from past experiments
        5. Avoid repeating unsuccessful approaches
        
        For each template, provide:
        - title: A clear title
        - description: What this experiment tests and how
        - method: The specific methodology
        - hypothesis: Template hypothesis that can be customized
        - successCriteria: How to determine if the experiment succeeds
        - estimatedDuration: Approx. time required
        - difficulty: "easy", "medium", or "hard"
        - category: The appropriate category
        
        Also include a "suggestedFields" object with pre-filled values for form fields and an "adaptationReasoning" explaining how these templates were adapted to this project's context.
        `;
        break;
        
      case 'hypothesis':
        prompt += `
        I need smart templates for hypotheses. Use the following context:
        
        Recent hypotheses:
        ${JSON.stringify(context.recentHypotheses || [], null, 2)}
        
        Generate 3 different hypothesis templates that:
        1. Are appropriate for the ${stage} stage
        2. Follow the "We believe that..." format
        3. Are specific and testable
        4. Address key uncertainties relevant to this stage
        
        For each template, provide:
        - statement: The hypothesis statement template
        - criteria: How to validate/invalidate this hypothesis
        - experiment: Suggested experiment approach
        - category: The appropriate category
        - phase: The appropriate phase (problem/solution)
        
        Also include a "suggestedFields" object with pre-filled values for form fields and an "adaptationReasoning" explaining how these templates were adapted to this project's context.
        `;
        break;
        
      case 'metric':
        prompt += `
        I need smart templates for metrics. Use the following context:
        
        Recent metrics:
        ${JSON.stringify(context.recentMetrics || [], null, 2)}
        
        Generate 3 different metric templates that:
        1. Are appropriate for the ${stage} stage
        2. Follow lean analytics principles
        3. Are measurable and actionable
        4. Include appropriate targets based on stage
        
        For each template, provide:
        - name: The metric name
        - description: What this metric measures and why it matters
        - category: The appropriate category (acquisition, activation, etc.)
        - target: A reasonable target value
        - unit: The unit of measurement
        
        Also include a "suggestedFields" object with pre-filled values for form fields and an "adaptationReasoning" explaining how these templates were adapted to this project's context.
        `;
        break;
        
      case 'mvp-feature':
        prompt += `
        I need smart templates for MVP features. Use the following context:
        
        Recent features:
        ${JSON.stringify(context.recentFeatures || [], null, 2)}
        
        Generate 3 different MVP feature templates that:
        1. Follow the "minimum viable" principle
        2. Focus on core value delivery
        3. Are feasible to implement quickly
        4. Address key pain points from the problem statement
        
        For each template, provide:
        - name: The feature name
        - description: What this feature does and why it's important
        - userValue: How it delivers value to users
        - complexity: "low", "medium", or "high"
        - priority: "must-have", "should-have", or "nice-to-have"
        
        Also include a "suggestedFields" object with pre-filled values for form fields and an "adaptationReasoning" explaining how these templates were adapted to this project's context.
        `;
        break;
        
      case 'pivot-option':
        prompt += `
        I need smart templates for pivot options. Use the following context:
        
        Recent pivot options:
        ${JSON.stringify(context.recentPivotOptions || [], null, 2)}
        
        Problematic metrics:
        ${JSON.stringify(context.problematicMetrics || [], null, 2)}
        
        Generate 3 different pivot option templates that:
        1. Respond to the problematic metrics
        2. Follow established pivot patterns (e.g., zoom-in, customer segment, value capture)
        3. Preserve what's working while changing what isn't
        
        For each template, provide:
        - type: The pivot type (e.g., "zoom-in", "customer segment")
        - description: Detailed description of this pivot approach
        - trigger: What would trigger this pivot
        - likelihood: "high", "medium", or "low"
        
        Also include a "suggestedFields" object with pre-filled values for form fields and an "adaptationReasoning" explaining how these templates were adapted to this project's context.
        `;
        break;
    }

    // Finalize the prompt with formatting instructions
    prompt += `
    Return the response as a JSON object with these properties:
    - templates: An array of the generated templates
    - suggestedFields: Pre-populated fields for forms
    - adaptationReasoning: Explanation of how these templates were adapted to this project
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert in lean startup methodology and creating effective templates for startup validation activities. Your task is to generate contextually relevant templates that help startups validate their ideas efficiently."
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
    
    return {
      templates: responseJson.templates || [],
      suggestedFields: responseJson.suggestedFields || {},
      adaptationReasoning: responseJson.adaptationReasoning || ''
    };
  } catch (error) {
    console.error("Error generating smart templates:", error);
    // Return empty response if AI generation fails
    return {
      templates: [],
      suggestedFields: {},
      adaptationReasoning: 'Failed to generate templates due to an error.'
    };
  }
} 
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

// Define insight request interface
interface InsightRequest {
  projectId: string;
  userId: string;
  experimentId?: string; // Optional - if provided, generate insights for a specific experiment
}

// Define insight response interface
interface Insight {
  id: string;
  title: string;
  description: string;
  category: string;
  confidence: number;
  actionItems: string[];
  relatedExperiments: string[];
  tags: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request data
    const requestData: InsightRequest = await req.json();
    const { projectId, userId, experimentId } = requestData;

    if (!projectId || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Initialize Supabase client with service role key for admin access
    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

    // Create the query builder
    let experimentsQuery = supabase
      .from('experiments')
      .select('*');

    // If a specific experiment is requested, filter for it
    if (experimentId) {
      experimentsQuery = experimentsQuery.eq('id', experimentId);
    } else {
      // Otherwise get all completed experiments for the project
      experimentsQuery = experimentsQuery
        .eq('project_id', projectId)
        .eq('status', 'completed');
    }

    // Execute the query
    const { data: experiments, error: experimentsError } = await experimentsQuery;

    if (experimentsError) {
      console.error('Error fetching experiments:', experimentsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch experiments data' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // If no experiments are found or have results
    if (!experiments || experiments.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No completed experiments found',
          insights: [] 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // Fetch hypotheses related to these experiments
    const experimentIds = experiments.map(exp => exp.id);
    const { data: hypotheses, error: hypothesesError } = await supabase
      .from('hypotheses')
      .select('*')
      .in('id', experimentIds.map(id => id.toString()));

    if (hypothesesError) {
      console.error('Error fetching hypotheses:', hypothesesError);
    }

    // Generate insights using AI
    const insights = await generateInsights(experiments, hypotheses || []);

    return new Response(
      JSON.stringify({ insights }),
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

// Function to generate insights using AI
async function generateInsights(experiments: any[], hypotheses: any[]): Promise<Insight[]> {
  try {
    // Filter experiments that have meaningful results or learnings
    const experimentsWithResults = experiments.filter(
      exp => exp.results || exp.learnings || exp.feedback
    );

    if (experimentsWithResults.length === 0) {
      return [];
    }

    // Create a prompt for OpenAI to generate insights
    const prompt = `
    Analyze the following experiment data from a startup and generate meaningful insights:
    
    Experiments:
    ${JSON.stringify(experimentsWithResults, null, 2)}
    
    Related Hypotheses:
    ${JSON.stringify(hypotheses, null, 2)}
    
    Extract 3-5 key insights from these experiments. For each insight:
    
    1. Identify patterns across multiple experiments
    2. Highlight surprising or counter-intuitive findings
    3. Connect results to broader business implications
    4. Suggest actionable next steps based on the findings
    
    For each insight, provide:
    - title: A concise, specific title for the insight
    - description: A clear explanation of the insight, including supporting evidence
    - category: Category like "user behavior", "value proposition", "market fit", "product design"
    - confidence: A number from 1-10 indicating confidence level in this insight
    - actionItems: An array of 2-3 specific actions the team should take based on this insight
    - relatedExperiments: Array of IDs of experiments that support this insight
    - tags: Array of relevant tags for this insight
    
    Format the response as a JSON array of insight objects, with a unique ID for each insight.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an expert data analyst specializing in startup experiments. Your task is to analyze experiment results and extract meaningful insights that can guide business decisions."
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
    
    // Ensure we have an array of insights
    const insights = responseJson.insights || [];
    
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    // Return an empty array if AI generation fails
    return [];
  }
} 
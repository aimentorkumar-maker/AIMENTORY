import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SimplifyRequest {
  content: string;
  options?: {
    context?: string;
    target_level?: 'child' | 'exam' | 'both';
    include_mnemonics?: boolean;
    max_length?: number;
  };
}

interface SimplifyResult {
  child_view: string;
  exam_view: string;
  citations: Array<{
    source_type: string;
    title: string;
    author?: string;
    url?: string;
    confidence_score: number;
  }>;
  confidence: number;
  key_points: string[];
  mnemonics?: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const requestData: SimplifyRequest = await req.json();
    const { content, options = {} } = requestData;

    if (!content || content.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Configuration
    const {
      context = '',
      target_level = 'both',
      include_mnemonics = true,
      max_length = 500,
    } = options;

    // OpenRouter API configuration
    const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
    if (!openRouterApiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    // Prepare prompts for different views
    const basePrompt = `You are an AI tutor specialized in UPSC (Indian Civil Services) exam preparation. Your task is to simplify and structure the given content for effective learning.

Context: ${context || 'General UPSC preparation'}

Content to simplify:
${content}

Requirements:
1. Extract key points and main concepts
2. Create clear, structured explanations
3. Focus on UPSC exam relevance
4. Maintain factual accuracy
5. Include mnemonics where helpful`;

    const childPrompt = `${basePrompt}

Create a CHILD-FRIENDLY explanation:
- Use simple language and analogies
- Break down complex concepts
- Make it engaging and easy to remember
- Max length: ${max_length} words
- Format as clear paragraphs`;

    const examPrompt = `${basePrompt}

Create an EXAM-FOCUSED summary:
- Highlight key points likely to appear in UPSC exams
- Include important facts, dates, and numbers
- Structure for quick revision
- Max length: ${max_length} words
- Use bullet points and clear formatting`;

    const mnemonicPrompt = `${basePrompt}

Create MEMORY AIDS (mnemonics):
- Generate 3-5 mnemonics for key concepts
- Use acronyms, rhymes, or visual associations
- Make them specific to Indian context where relevant
- Ensure they're easy to remember`;

    // Function to call OpenRouter API
    const callOpenRouter = async (prompt: string): Promise<string> => {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://pragyaai-upsc.app',
          'X-Title': 'PragyaAI UPSC Notes Simplifier',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-3.5-sonnet',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    };

    // Extract key points first
    const keyPointsPrompt = `${basePrompt}

Extract the top 5-7 KEY POINTS from this content:
- List only the most important concepts
- Make each point concise and clear
- Format as a simple list
- Focus on UPSC exam relevance`;

    const keyPointsResponse = await callOpenRouter(keyPointsPrompt);
    const keyPoints = keyPointsResponse
      .split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-•*]\s*/, '').trim())
      .filter(point => point.length > 0);

    // Generate different views based on target_level
    let childView = '';
    let examView = '';
    let mnemonics: string[] = [];

    if (target_level === 'child' || target_level === 'both') {
      childView = await callOpenRouter(childPrompt);
    }

    if (target_level === 'exam' || target_level === 'both') {
      examView = await callOpenRouter(examPrompt);
    }

    if (include_mnemonics) {
      const mnemonicResponse = await callOpenRouter(mnemonicPrompt);
      mnemonics = mnemonicResponse
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[-•*\d.]\s*/, '').trim())
        .filter(mnemonic => mnemonic.length > 0);
    }

    // Generate basic citations (placeholder - in production, this would analyze the content for sources)
    const citations = [
      {
        source_type: 'document',
        title: 'UPSC Official Content',
        confidence_score: 0.8,
      },
    ];

    // Calculate confidence score based on content length and structure
    const confidence = Math.min(0.95, Math.max(0.6, content.length / 1000));

    const result: SimplifyResult = {
      child_view: childView,
      exam_view: examView,
      citations,
      confidence,
      key_points: keyPoints.slice(0, 7), // Limit to 7 key points
      mnemonics: include_mnemonics ? mnemonics.slice(0, 5) : undefined, // Limit to 5 mnemonics
    };

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in simplify-notes function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: 'Failed to process note simplification'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

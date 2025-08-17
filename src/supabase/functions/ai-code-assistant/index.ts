import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, projectContent, projectId, conversationHistory } = await req.json();
    
    // Get API keys from user settings (would be stored in database)
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      return new Response(JSON.stringify({ 
        error: 'OpenAI API key not configured. Please add it in Settings.' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Prepare context for AI
    const context = `You are a helpful AI assistant for web development. 
    Current project files: ${JSON.stringify(projectContent, null, 2)}
    
    User message: ${message}
    
    Please help the user with their request. If you need to modify code, provide the complete updated file content and specify which file should be updated.
    
    Always respond with valid JSON in this format:
    {
      "response": "Your helpful response here",
      "codeChanges": [
        {
          "file": "filename.ext",
          "content": "complete file content here"
        }
      ]
    }
    
    If no code changes are needed, return an empty codeChanges array.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: context },
          ...conversationHistory.map((msg: any) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Try to parse as JSON first, fallback to text response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      parsedResponse = {
        response: aiResponse,
        codeChanges: []
      };
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request. Please try again.',
      response: 'Sorry, I encountered an error. Please try rephrasing your request or check your API key configuration.',
      codeChanges: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
/// <reference types="https://deno.land/x/xhr@0.1.0/mod.ts" />
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
    const { message, projectContent, projectId, conversationHistory, apiKeys } = await req.json();
    
    // Determine which API to use based on available keys
    let apiUrl = '';
    let apiKey = '';
    let model = '';
    let headers: any = {
      'Content-Type': 'application/json',
    };

    if (apiKeys?.openrouter && apiKeys.openrouter.trim()) {
      apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
      apiKey = apiKeys.openrouter;
      model = 'meta-llama/llama-3.2-3b-instruct:free';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['HTTP-Referer'] = 'https://webcrafter.ai';
      headers['X-Title'] = 'AI Website Builder';
    } else if (apiKeys?.openai && apiKeys.openai.trim()) {
      apiUrl = 'https://api.openai.com/v1/chat/completions';
      apiKey = apiKeys.openai;
      model = 'gpt-4o-mini';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.deepseek && apiKeys.deepseek.trim()) {
      apiUrl = 'https://api.deepseek.com/chat/completions';
      apiKey = apiKeys.deepseek;
      model = 'deepseek-coder';
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else if (apiKeys?.anthropic && apiKeys.anthropic.trim()) {
      apiUrl = 'https://api.anthropic.com/v1/messages';
      apiKey = apiKeys.anthropic;
      model = 'claude-3-haiku-20240307';
      headers['Authorization'] = `Bearer ${apiKey}`;
      headers['anthropic-version'] = '2023-06-01';
    } else {
      return new Response(JSON.stringify({ 
        error: 'No valid API key provided. Please configure at least one API key in Settings.',
        response: 'Please configure your API keys in Settings to enable the AI assistant.',
        codeChanges: []
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Enhanced context for comprehensive code generation
    const context = `You are an advanced AI web app builder, similar to tools like Lovable.dev, Bolt.new, and v0.dev. Your goal is to generate fully functional, runnable web applications based on user prompts, producing clean, production-ready code that includes frontend, backend, database integration, authentication, and deployment instructions.

Current project files:
${JSON.stringify(projectContent, null, 2)}

User message: ${message}

CRITICAL INSTRUCTIONS:
1. Analyze the user's request carefully and enhance small prompts with comprehensive features
2. Always default to React with modern web technologies unless specifically requested otherwise
3. Generate COMPLETE, FUNCTIONAL code files with all required logic and functions
4. For any web app request, include:
   - Responsive design with Tailwind CSS
   - Modern React patterns (hooks, components)
   - Error handling and loading states
   - Clean, production-ready code structure
   - User-friendly interfaces with proper UX

5. When generating code:
   - Provide COMPLETE file contents, never truncated
   - Include all necessary imports and dependencies
   - Add proper TypeScript types when applicable
   - Implement proper component structure
   - Include realistic placeholder data for demonstrations

6. Enhance basic requests:
   - If user asks for "a todo app", create a full-featured todo with add/edit/delete/filter/persist
   - If user asks for "a dashboard", include charts, tables, responsive layout, navigation
   - If user asks for "a landing page", include hero, features, testimonials, contact form
   - Always add more value than requested while staying focused

RESPONSE FORMAT - Always respond with valid JSON:
{
  "response": "Detailed explanation of what you built and why, including features added",
  "codeChanges": [
    {
      "file": "filename.ext",
      "content": "COMPLETE file content with all code - NEVER truncate or use placeholders"
    }
  ]
}

If no code changes are needed, return an empty codeChanges array.
Make every response valuable and production-ready.`;

    let requestBody: any;
    
    if (apiUrl.includes('anthropic')) {
      requestBody = {
        model,
        max_tokens: 4000,
        messages: [{ role: 'user', content: context }]
      };
    } else {
      requestBody = {
        model,
        messages: [
          { role: 'system', content: context },
          ...conversationHistory.map((msg: any) => ({
            role: msg.type === 'user' ? 'user' : 'assistant',
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        temperature: 0.7,
        max_tokens: 4000,
        response_format: { type: 'json_object' }
      };
    }

    console.log('Making AI assistant request to:', apiUrl);
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API Error:', response.status, errorText);
      throw new Error(`AI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    let aiResponse;
    
    if (apiUrl.includes('anthropic')) {
      aiResponse = data.content[0]?.text;
    } else {
      aiResponse = data.choices[0]?.message?.content;
    }

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Try to parse as JSON first, fallback to text response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch (e) {
      console.error('JSON parsing error:', e);
      parsedResponse = {
        response: aiResponse,
        codeChanges: []
      };
    }

    console.log('AI Assistant Response:', parsedResponse.response);
    if (parsedResponse.codeChanges && parsedResponse.codeChanges.length > 0) {
      console.log('Code changes for files:', parsedResponse.codeChanges.map((c: any) => c.file));
    }

    return new Response(JSON.stringify(parsedResponse), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI assistant:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request. Please try again.',
      response: 'Sorry, I encountered an error processing your request. Please try rephrasing your question or check your API key configuration.',
      codeChanges: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
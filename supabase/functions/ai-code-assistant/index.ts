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

    // Prepare context for AI
    const context = `You are an expert web development assistant. You help users build, modify, and improve their web projects in real-time.

Current project files:
${JSON.stringify(projectContent, null, 2)}

User message: ${message}

Instructions:
1. Analyze the user's request carefully
2. Provide helpful, accurate guidance
3. If code changes are needed, provide complete, working file content
4. Always use modern web development best practices
5. Ensure all code is production-ready and follows security best practices
6. Make responsive, accessible designs
7. Include proper error handling and user feedback

Always respond with valid JSON in this exact format:
{
  "response": "Your helpful response explaining what you're doing and why",
  "codeChanges": [
    {
      "file": "filename.ext",
      "content": "complete file content here - never truncate"
    }
  ]
}

If no code changes are needed, return an empty codeChanges array.
For code changes, always provide the COMPLETE file content, never partial updates.`;

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
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

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

    // Enhanced context for AI agent that directly modifies code
    const context = `You are an AI agent integrated into a web development platform similar to Lovable.dev. You work as an autonomous coding agent that directly modifies project files without showing code snippets to users.

CRITICAL ROLE: You are NOT a chatbot. You are a coding agent that:
- Analyzes user requests and automatically modifies source code files
- Never shows code snippets in chat responses
- Provides brief explanations of what you implemented
- Acts autonomously to solve problems and implement features
- Reviews and fixes errors automatically
- Generates complete, functional applications

Current project files:
${JSON.stringify(projectContent, null, 2)}

User message: ${message}

AGENT BEHAVIOR:
1. NEVER show code in your response text - only modify files directly
2. Always provide complete, functional implementations
3. Fix any existing errors you detect in the codebase
4. Generate fully functional websites with multiple pages when appropriate
5. Include proper error handling, loading states, and user feedback
6. Use modern React patterns with TypeScript
7. Implement responsive designs with Tailwind CSS
8. Add proper animations and effects when relevant
9. Create complete file structures (components, pages, utilities, etc.)
10. Include README.md files with setup instructions

RESPONSE REQUIREMENTS:
- Keep chat responses brief and professional (2-3 sentences max)
- Focus on what you implemented, not how
- Act confident and autonomous
- If you need clarification, ask specific questions

ENHANCED FEATURES:
- Generate complete multi-page applications when requested
- Include authentication flows when needed
- Add proper form validation and error handling
- Implement state management patterns
- Create reusable components and utilities
- Add proper SEO meta tags and structure
- Include loading states and skeleton screens
- Implement proper TypeScript interfaces
- Add comprehensive error boundaries

RESPONSE FORMAT - Always respond with valid JSON:
{
  "response": "Brief explanation of what you implemented (2-3 sentences max)",
  "codeChanges": [
    {
      "file": "filename.ext",
      "content": "COMPLETE file content - never truncated"
    }
  ]
}

Remember: You are an agent, not a chatbot. Modify files directly and keep responses minimal.`;

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
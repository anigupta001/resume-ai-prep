import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { question, userAnswer, expectedAnswer, questionType, difficulty } = await req.json();

    const systemPrompt = `You are an expert interview evaluator. Evaluate the candidate's answer based on the following criteria:

1. Relevance to the question
2. Completeness of the response
3. Technical accuracy (if applicable)
4. Communication clarity
5. Depth of understanding

Question Type: ${questionType}
Difficulty Level: ${difficulty}

Provide a score from 0-100 and detailed feedback.

Return your evaluation as JSON:
{
  "score": number (0-100),
  "feedback": "detailed feedback explaining the score",
  "strengths": ["strength1", "strength2"],
  "improvements": ["improvement1", "improvement2"]
}`;

    const userPrompt = `
Question: ${question}
Expected Answer: ${expectedAnswer}
Candidate's Answer: ${userAnswer}

Please evaluate this answer and provide a score with detailed feedback.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const evaluationContent = data.choices[0].message.content;
    
    // Parse the JSON response
    const evaluation = JSON.parse(evaluationContent);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in evaluate-answer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
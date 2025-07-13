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
    const { sessionData, answers, overallScore } = await req.json();

    const systemPrompt = `You are an expert interview coach providing comprehensive feedback on interview performance. 

Analyze the interview session and provide:
1. Overall assessment
2. Key strengths
3. Areas for improvement
4. Specific recommendations
5. Detailed analysis

The candidate's overall score was ${overallScore}/100.

Return your analysis as JSON:
{
  "overallScore": number,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"],
  "aiAnalysis": "detailed comprehensive analysis of the performance"
}`;

    const userPrompt = `
Interview Type: ${sessionData.interviewType}
Target Role: ${sessionData.targetRole}
Experience Level: ${sessionData.experienceLevel}
Duration: ${Math.floor(sessionData.durationSeconds / 60)} minutes

Questions and Answers:
${answers.map((answer: any, index: number) => `
Q${index + 1}: ${answer.question}
Answer: ${answer.userAnswer}
Score: ${answer.score}/100
`).join('\n')}

Please provide comprehensive feedback for this interview performance.`;

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
        temperature: 0.4,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const reviewContent = data.choices[0].message.content;
    
    // Parse the JSON response
    const review = JSON.parse(reviewContent);

    return new Response(JSON.stringify(review), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-review function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
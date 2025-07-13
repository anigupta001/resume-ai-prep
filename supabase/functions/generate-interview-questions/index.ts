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
    const { interviewType, jobDescription, experienceLevel, targetRole, questionCount = 5 } = await req.json();

    const systemPrompt = `You are an expert interview question generator. Generate ${questionCount} interview questions based on the following criteria:
- Interview Type: ${interviewType}
- Job Description: ${jobDescription}
- Experience Level: ${experienceLevel}
- Target Role: ${targetRole}

For each question, provide:
1. The question text
2. Question type (behavioral, technical, situational, etc.)
3. Difficulty level (easy, medium, hard)
4. A comprehensive expected answer that demonstrates the ideal response

Return the response as a JSON array of questions with this structure:
{
  "questions": [
    {
      "questionText": "string",
      "questionType": "string",
      "difficulty": "easy|medium|hard",
      "expectedAnswer": "string"
    }
  ]
}`;

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
          { role: 'user', content: `Generate ${questionCount} ${interviewType} interview questions for a ${experienceLevel} level ${targetRole} position.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${await response.text()}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;
    
    // Parse the JSON response
    const parsedQuestions = JSON.parse(generatedContent);

    return new Response(JSON.stringify(parsedQuestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-interview-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
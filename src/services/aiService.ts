import { supabase } from "@/integrations/supabase/client";

export interface QuestionData {
  questionText: string;
  questionType: string;
  difficulty: 'easy' | 'medium' | 'hard';
  expectedAnswer: string;
}

export interface EvaluationResult {
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

export interface ReviewData {
  overallScore: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  aiAnalysis: string;
}

export class AIService {
  static async generateQuestions(
    interviewType: string,
    jobDescription: string,
    experienceLevel: string,
    targetRole: string,
    questionCount = 5
  ): Promise<QuestionData[]> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-interview-questions', {
        body: {
          interviewType,
          jobDescription,
          experienceLevel,
          targetRole,
          questionCount
        }
      });

      if (error) throw error;
      return data.questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate interview questions');
    }
  }

  static async evaluateAnswer(
    question: string,
    userAnswer: string,
    expectedAnswer: string,
    questionType: string,
    difficulty: string
  ): Promise<EvaluationResult> {
    try {
      const { data, error } = await supabase.functions.invoke('evaluate-answer', {
        body: {
          question,
          userAnswer,
          expectedAnswer,
          questionType,
          difficulty
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error evaluating answer:', error);
      throw new Error('Failed to evaluate answer');
    }
  }

  static async transcribeAudio(audioBlob: Blob): Promise<string> {
    try {
      // Convert blob to base64
      const base64Audio = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(audioBlob);
      });

      const { data, error } = await supabase.functions.invoke('voice-to-text', {
        body: { audio: base64Audio }
      });

      if (error) throw error;
      return data.text;
    } catch (error) {
      console.error('Error transcribing audio:', error);
      throw new Error('Failed to transcribe audio');
    }
  }

  static async generateReview(
    sessionData: any,
    answers: any[],
    overallScore: number
  ): Promise<ReviewData> {
    try {
      const { data, error } = await supabase.functions.invoke('generate-review', {
        body: {
          sessionData,
          answers,
          overallScore
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error generating review:', error);
      throw new Error('Failed to generate review');
    }
  }
}
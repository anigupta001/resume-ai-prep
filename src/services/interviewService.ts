import { supabase } from "@/integrations/supabase/client";

export interface InterviewSession {
  id: string;
  user_id: string;
  interview_type: string;
  job_description: string;
  experience_level: string;
  target_role: string;
  status: string;
  total_score: number;
  total_questions: number;
  duration_seconds: number;
  created_at: string;
  completed_at?: string;
  updated_at: string;
}

export interface InterviewQuestion {
  id: string;
  session_id: string;
  question_text: string;
  question_type: string;
  difficulty: string;
  expected_answer: string;
  question_order: number;
}

export interface InterviewAnswer {
  id: string;
  question_id: string;
  session_id: string;
  user_answer: string;
  ai_score?: number;
  ai_feedback?: string;
  answer_method: string;
  time_taken_seconds?: number;
  created_at: string;
}

export interface InterviewReview {
  id: string;
  session_id: string;
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
  ai_analysis: string;
}

export class InterviewService {
  static async createSession(config: {
    interviewType: string;
    jobDescription: string;
    experienceLevel: string;
    targetRole: string;
  }): Promise<InterviewSession> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interview_sessions')
      .insert({
        user_id: user.user.id,
        interview_type: config.interviewType,
        job_description: config.jobDescription,
        experience_level: config.experienceLevel,
        target_role: config.targetRole,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async saveQuestions(sessionId: string, questions: any[]): Promise<InterviewQuestion[]> {
    const questionsToInsert = questions.map((q, index) => ({
      session_id: sessionId,
      question_text: q.questionText,
      question_type: q.questionType,
      difficulty: q.difficulty,
      expected_answer: q.expectedAnswer,
      question_order: index + 1,
    }));

    const { data, error } = await supabase
      .from('interview_questions')
      .insert(questionsToInsert)
      .select();

    if (error) throw error;
    return data;
  }

  static async saveAnswer(answer: {
    questionId: string;
    sessionId: string;
    userAnswer: string;
    aiScore?: number;
    aiFeedback?: string;
    answerMethod: 'text' | 'voice';
    timeTaken?: number;
  }): Promise<InterviewAnswer> {
    const { data, error } = await supabase
      .from('interview_answers')
      .insert({
        question_id: answer.questionId,
        session_id: answer.sessionId,
        user_answer: answer.userAnswer,
        ai_score: answer.aiScore,
        ai_feedback: answer.aiFeedback,
        answer_method: answer.answerMethod,
        time_taken_seconds: answer.timeTaken,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async completeSession(sessionId: string, totalScore: number, durationSeconds: number): Promise<void> {
    const { error } = await supabase
      .from('interview_sessions')
      .update({
        status: 'completed',
        total_score: totalScore,
        duration_seconds: durationSeconds,
        completed_at: new Date().toISOString(),
      })
      .eq('id', sessionId);

    if (error) throw error;
  }

  static async saveReview(sessionId: string, review: {
    overallScore: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
    aiAnalysis: string;
  }): Promise<InterviewReview> {
    const { data, error } = await supabase
      .from('interview_reviews')
      .insert({
        session_id: sessionId,
        overall_score: review.overallScore,
        strengths: review.strengths,
        weaknesses: review.weaknesses,
        recommendations: review.recommendations,
        ai_analysis: review.aiAnalysis,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getUserSessions(): Promise<InterviewSession[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', user.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getSessionWithDetails(sessionId: string): Promise<{
    session: InterviewSession;
    questions: InterviewQuestion[];
    answers: InterviewAnswer[];
    review?: InterviewReview;
  }> {
    const [sessionResult, questionsResult, answersResult, reviewResult] = await Promise.all([
      supabase.from('interview_sessions').select('*').eq('id', sessionId).single(),
      supabase.from('interview_questions').select('*').eq('session_id', sessionId).order('question_order'),
      supabase.from('interview_answers').select('*').eq('session_id', sessionId),
      supabase.from('interview_reviews').select('*').eq('session_id', sessionId).maybeSingle(),
    ]);

    if (sessionResult.error) throw sessionResult.error;
    if (questionsResult.error) throw questionsResult.error;
    if (answersResult.error) throw answersResult.error;

    return {
      session: sessionResult.data,
      questions: questionsResult.data,
      answers: answersResult.data,
      review: reviewResult.data,
    };
  }
}
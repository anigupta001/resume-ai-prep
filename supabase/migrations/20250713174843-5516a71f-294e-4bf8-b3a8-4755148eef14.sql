-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL CHECK (interview_type IN ('technical', 'hr', 'gd')),
  job_description TEXT,
  experience_level TEXT,
  target_role TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'completed', 'reviewed')),
  total_score INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview questions table
CREATE TABLE public.interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  expected_answer TEXT,
  ai_generated BOOLEAN DEFAULT true,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview answers table
CREATE TABLE public.interview_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback TEXT,
  answer_method TEXT DEFAULT 'text' CHECK (answer_method IN ('text', 'voice')),
  time_taken_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview reviews table
CREATE TABLE public.interview_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  overall_score INTEGER NOT NULL,
  strengths TEXT[],
  weaknesses TEXT[],
  recommendations TEXT[],
  ai_analysis TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for interview_sessions
CREATE POLICY "Users can view their own interview sessions" 
ON public.interview_sessions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" 
ON public.interview_sessions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
ON public.interview_sessions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for interview_questions
CREATE POLICY "Users can view questions from their sessions" 
ON public.interview_questions 
FOR SELECT 
USING (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

CREATE POLICY "System can insert questions" 
ON public.interview_questions 
FOR INSERT 
WITH CHECK (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

-- Create RLS policies for interview_answers
CREATE POLICY "Users can view their own answers" 
ON public.interview_answers 
FOR SELECT 
USING (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create their own answers" 
ON public.interview_answers 
FOR INSERT 
WITH CHECK (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

-- Create RLS policies for interview_reviews
CREATE POLICY "Users can view their own reviews" 
ON public.interview_reviews 
FOR SELECT 
USING (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

CREATE POLICY "System can create reviews" 
ON public.interview_reviews 
FOR INSERT 
WITH CHECK (session_id IN (
  SELECT id FROM public.interview_sessions WHERE user_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_interview_sessions_user_id ON public.interview_sessions(user_id);
CREATE INDEX idx_interview_questions_session_id ON public.interview_questions(session_id);
CREATE INDEX idx_interview_answers_session_id ON public.interview_answers(session_id);
CREATE INDEX idx_interview_answers_question_id ON public.interview_answers(question_id);
CREATE INDEX idx_interview_reviews_session_id ON public.interview_reviews(session_id);
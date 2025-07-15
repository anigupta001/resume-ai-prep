-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview sessions table
CREATE TABLE public.interview_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  interview_type TEXT NOT NULL,
  job_description TEXT,
  experience_level TEXT,
  target_role TEXT,
  status TEXT NOT NULL DEFAULT 'in_progress',
  score INTEGER,
  duration INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview questions table
CREATE TABLE public.interview_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  difficulty TEXT NOT NULL,
  expected_answer TEXT,
  order_number INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create interview answers table
CREATE TABLE public.interview_answers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.interview_sessions(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.interview_questions(id) ON DELETE CASCADE,
  user_answer TEXT NOT NULL,
  score INTEGER,
  feedback TEXT,
  strengths TEXT[],
  improvements TEXT[],
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
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_reviews ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for interview sessions
CREATE POLICY "Users can view their own interview sessions" 
ON public.interview_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own interview sessions" 
ON public.interview_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview sessions" 
ON public.interview_sessions FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for interview questions
CREATE POLICY "Users can view questions from their sessions" 
ON public.interview_questions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create questions for their sessions" 
ON public.interview_questions FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

-- Create RLS policies for interview answers
CREATE POLICY "Users can view answers from their sessions" 
ON public.interview_answers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create answers for their sessions" 
ON public.interview_answers FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can update answers from their sessions" 
ON public.interview_answers FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

-- Create RLS policies for interview reviews
CREATE POLICY "Users can view reviews from their sessions" 
ON public.interview_reviews FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

CREATE POLICY "Users can create reviews for their sessions" 
ON public.interview_reviews FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.interview_sessions 
  WHERE id = session_id AND user_id = auth.uid()
));

-- Create function to automatically update timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_interview_sessions_updated_at
  BEFORE UPDATE ON public.interview_sessions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to handle new user signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name)
  VALUES (new.id, new.raw_user_meta_data->>'display_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
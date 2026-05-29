-- Database setup for MathVerse Phase 2: Learning Analytics

-- Create learning_sessions table
CREATE TABLE IF NOT EXISTS public.learning_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create solved_questions table
CREATE TABLE IF NOT EXISTS public.solved_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    session_id UUID REFERENCES public.learning_sessions(id) ON DELETE SET NULL,
    topic TEXT NOT NULL,
    difficulty TEXT CHECK (difficulty IN ('basic', 'intermediate', 'advanced', 'expert', 'applied', 'quantum')) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    time_spent_ms INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_statistics table
CREATE TABLE IF NOT EXISTS public.user_statistics (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    streak_days INTEGER DEFAULT 0 NOT NULL,
    total_study_time_seconds INTEGER DEFAULT 0 NOT NULL,
    accuracy_percentage NUMERIC(5,2) DEFAULT 0.00 NOT NULL,
    questions_solved INTEGER DEFAULT 0 NOT NULL,
    ai_questions_asked INTEGER DEFAULT 0 NOT NULL,
    last_active TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.learning_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.solved_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_sessions
CREATE POLICY "Allow users to view their own learning sessions"
ON public.learning_sessions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to create/update their own learning sessions"
ON public.learning_sessions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for solved_questions
CREATE POLICY "Allow users to view their own solved questions"
ON public.solved_questions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to record their own solved questions"
ON public.solved_questions FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_statistics
CREATE POLICY "Allow users to view their own statistics"
ON public.user_statistics FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own statistics"
ON public.user_statistics FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Trigger to create stats profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user_stats()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_statistics (user_id)
  VALUES (new.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically calculate user streak and update stats when active
CREATE OR REPLACE FUNCTION public.update_user_activity_stats()
RETURNS trigger AS $$
BEGIN
  -- Record dynamic active updates
  INSERT INTO public.user_statistics (user_id, last_active)
  VALUES (new.user_id, now())
  ON CONFLICT (user_id) DO UPDATE
  SET last_active = EXCLUDED.last_active;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

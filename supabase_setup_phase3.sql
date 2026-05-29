-- Database setup for MathVerse Phase 3: Study Planner System

-- Create daily_goals table
CREATE TABLE IF NOT EXISTS public.daily_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    goal TEXT NOT NULL,
    completed BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create timetable_items table
CREATE TABLE IF NOT EXISTS public.timetable_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject TEXT NOT NULL,
    day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create ai_study_plans table
CREATE TABLE IF NOT EXISTS public.ai_study_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    plan_content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on new tables
ALTER TABLE public.daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timetable_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_study_plans ENABLE ROW LEVEL SECURITY;

-- RLS Policies for daily_goals
CREATE POLICY "Allow users to view their own daily goals"
ON public.daily_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own daily goals"
ON public.daily_goals FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for timetable_items
CREATE POLICY "Allow users to view their own timetable items"
ON public.timetable_items FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own timetable items"
ON public.timetable_items FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for ai_study_plans
CREATE POLICY "Allow users to view their own AI study plans"
ON public.ai_study_plans FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to manage their own AI study plans"
ON public.ai_study_plans FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

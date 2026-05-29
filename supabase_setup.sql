-- Database setup for MathVerse expanded features

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Extend profiles table with new customization fields
-- (Assumes profiles table already exists, if not we will create it)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    avatar_url TEXT,
    banner_url TEXT,
    username TEXT UNIQUE,
    bio TEXT,
    selected_theme TEXT DEFAULT 'neon-dark',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles if not already enabled
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles RLS Policies
CREATE POLICY "Allow public read access to profiles" 
ON public.profiles FOR SELECT 
USING (true);

CREATE POLICY "Allow users to update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Allow users to insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = id);


-- 2. Create learning_preferences table
CREATE TABLE IF NOT EXISTS public.learning_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    mode TEXT CHECK (mode IN ('simple', 'detailed', 'visual', 'exam_focused')) DEFAULT 'detailed',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on learning_preferences
ALTER TABLE public.learning_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for learning_preferences
CREATE POLICY "Allow users to view their own learning preferences" 
ON public.learning_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Allow users to update/insert their own learning preferences" 
ON public.learning_preferences FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);


-- Create trigger to automatically create profile and preference on user signup if needed
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE
  SET email = EXCLUDED.email;

  INSERT INTO public.learning_preferences (user_id, mode)
  VALUES (new.id, 'detailed')
  ON CONFLICT (user_id) DO NOTHING;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger definition (uncomment if you want automatic creations on auth.users signup)
-- DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
/* Accessibility Settings Table */
CREATE TABLE IF NOT EXISTS public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
    font_scale NUMERIC NOT NULL DEFAULT 1,
    high_contrast BOOLEAN NOT NULL DEFAULT false,
    reduced_motion BOOLEAN NOT NULL DEFAULT false,
    selected_theme TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on user_preferences
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_preferences
CREATE POLICY "Allow users to view their own preferences"
    ON public.user_preferences FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Allow users to upsert their own preferences"
    ON public.user_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

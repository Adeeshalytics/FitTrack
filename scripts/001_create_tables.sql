-- Create users profile table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create workouts table
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration INTEGER, -- in minutes
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES public.workouts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER,
  reps INTEGER,
  weight DECIMAL(5,2), -- weight in kg/lbs
  rest_time INTEGER, -- rest time in seconds
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create RLS policies for workouts
CREATE POLICY "workouts_select_own" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workouts_insert_own" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_update_own" ON public.workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "workouts_delete_own" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Create RLS policies for exercises (through workout ownership)
CREATE POLICY "exercises_select_own" ON public.exercises FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE workouts.id = exercises.workout_id 
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "exercises_insert_own" ON public.exercises FOR INSERT 
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE workouts.id = exercises.workout_id 
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "exercises_update_own" ON public.exercises FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE workouts.id = exercises.workout_id 
    AND workouts.user_id = auth.uid()
  ));

CREATE POLICY "exercises_delete_own" ON public.exercises FOR DELETE 
  USING (EXISTS (
    SELECT 1 FROM public.workouts 
    WHERE workouts.id = exercises.workout_id 
    AND workouts.user_id = auth.uid()
  ));

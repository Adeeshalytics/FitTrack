-- Create workout plan templates table
CREATE TABLE IF NOT EXISTS public.workout_plan_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  focus_area TEXT NOT NULL, -- 'legs', 'chest', 'arms', 'core', 'full_body'
  difficulty_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  duration_minutes INTEGER NOT NULL,
  fitness_goal TEXT, -- 'weight_loss', 'muscle_gain', 'endurance', 'strength'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create template exercises table
CREATE TABLE IF NOT EXISTS public.template_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.workout_plan_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  rest_time INTEGER, -- rest time in seconds
  instructions TEXT,
  muscle_groups TEXT[], -- array of muscle groups
  equipment TEXT,
  youtube_video_id TEXT, -- for exercise demo videos
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user workout plans table (personalized instances)
CREATE TABLE IF NOT EXISTS public.user_workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.workout_plan_templates(id),
  name TEXT NOT NULL,
  is_custom BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.workout_plan_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.template_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_workout_plans ENABLE ROW LEVEL SECURITY;

-- RLS policies for templates (public read)
CREATE POLICY "templates_select_all" ON public.workout_plan_templates FOR SELECT USING (true);
CREATE POLICY "template_exercises_select_all" ON public.template_exercises FOR SELECT USING (true);

-- RLS policies for user workout plans
CREATE POLICY "user_plans_select_own" ON public.user_workout_plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_plans_insert_own" ON public.user_workout_plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_plans_update_own" ON public.user_workout_plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_plans_delete_own" ON public.user_workout_plans FOR DELETE USING (auth.uid() = user_id);

-- Insert sample workout plan templates
INSERT INTO public.workout_plan_templates (name, description, focus_area, difficulty_level, duration_minutes, fitness_goal) VALUES
('Beginner Full Body Blast', 'Perfect starter workout targeting all major muscle groups', 'full_body', 'beginner', 45, 'muscle_gain'),
('Chest & Triceps Power', 'Build upper body strength with focused chest and tricep exercises', 'chest', 'intermediate', 60, 'strength'),
('Leg Day Destroyer', 'Comprehensive lower body workout for strength and size', 'legs', 'intermediate', 55, 'muscle_gain'),
('Core Crusher', 'Intense core workout to build stability and definition', 'core', 'beginner', 30, 'weight_loss'),
('Arms & Shoulders Sculpt', 'Target arms and shoulders for definition and strength', 'arms', 'beginner', 40, 'muscle_gain');

-- Insert sample exercises for Beginner Full Body Blast
INSERT INTO public.template_exercises (template_id, name, sets, reps, rest_time, instructions, muscle_groups, equipment, youtube_video_id, order_index) VALUES
((SELECT id FROM public.workout_plan_templates WHERE name = 'Beginner Full Body Blast'), 'Push-ups', 3, 12, 60, 'Keep your body straight, lower chest to floor, push back up', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', 'IODxDxX7oi4', 1),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Beginner Full Body Blast'), 'Bodyweight Squats', 3, 15, 60, 'Feet shoulder-width apart, lower until thighs parallel to floor', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'aclHkVaku9U', 2),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Beginner Full Body Blast'), 'Plank', 3, 30, 45, 'Hold straight line from head to heels, engage core', ARRAY['core', 'shoulders'], 'bodyweight', 'ASdvN_XEl_c', 3),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Beginner Full Body Blast'), 'Lunges', 3, 10, 60, 'Step forward, lower back knee toward ground, return to start', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'QOVaHwm-Q6U', 4);

-- Insert sample exercises for Chest & Triceps Power
INSERT INTO public.template_exercises (template_id, name, sets, reps, rest_time, instructions, muscle_groups, equipment, youtube_video_id, order_index) VALUES
((SELECT id FROM public.workout_plan_templates WHERE name = 'Chest & Triceps Power'), 'Bench Press', 4, 8, 90, 'Lower bar to chest, press up explosively', ARRAY['chest', 'triceps', 'shoulders'], 'barbell', 'rT7DgCr-3pg', 1),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Chest & Triceps Power'), 'Incline Dumbbell Press', 3, 10, 75, 'Press dumbbells up and slightly together at the top', ARRAY['chest', 'shoulders'], 'dumbbells', 'hCoLQiurbox', 2),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Chest & Triceps Power'), 'Tricep Dips', 3, 12, 60, 'Lower body by bending elbows, push back up', ARRAY['triceps', 'shoulders'], 'bodyweight', '0326dy_-CzM', 3),
((SELECT id FROM public.workout_plan_templates WHERE name = 'Chest & Triceps Power'), 'Close-Grip Push-ups', 3, 10, 60, 'Hands close together, focus on tricep engagement', ARRAY['triceps', 'chest'], 'bodyweight', 'IODxDxX7oi4', 4);

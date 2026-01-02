-- Create exercise library table with video content
CREATE TABLE IF NOT EXISTS public.exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  instructions TEXT,
  muscle_groups TEXT[] NOT NULL,
  equipment TEXT,
  difficulty_level TEXT NOT NULL, -- 'beginner', 'intermediate', 'advanced'
  youtube_video_id TEXT,
  thumbnail_url TEXT,
  calories_per_minute DECIMAL(4,2),
  category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility', 'sports'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name)
);

-- Enable RLS
ALTER TABLE public.exercise_library ENABLE ROW LEVEL SECURITY;

-- RLS policy for exercise library (public read)
CREATE POLICY "exercise_library_select_all" ON public.exercise_library FOR SELECT USING (true);

-- Insert comprehensive exercise library with YouTube video IDs
INSERT INTO public.exercise_library (name, description, instructions, muscle_groups, equipment, difficulty_level, youtube_video_id, calories_per_minute, category) VALUES
-- Bodyweight Exercises
('Push-ups', 'Classic upper body exercise', 'Start in plank position, lower chest to floor, push back up', ARRAY['chest', 'triceps', 'shoulders'], 'bodyweight', 'beginner', 'IODxDxX7oi4', 8.0, 'strength'),
('Bodyweight Squats', 'Fundamental lower body movement', 'Feet shoulder-width apart, lower until thighs parallel to floor', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'beginner', 'aclHkVaku9U', 6.0, 'strength'),
('Plank', 'Core stability exercise', 'Hold straight line from head to heels, engage core', ARRAY['core', 'shoulders'], 'bodyweight', 'beginner', 'ASdvN_XEl_c', 4.0, 'strength'),
('Lunges', 'Single-leg strength exercise', 'Step forward, lower back knee toward ground, return to start', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'bodyweight', 'beginner', 'QOVaHwm-Q6U', 7.0, 'strength'),
('Burpees', 'Full-body explosive exercise', 'Squat down, jump back to plank, push-up, jump forward, jump up', ARRAY['full_body'], 'bodyweight', 'intermediate', '818SkLbSLuY', 12.0, 'cardio'),
('Mountain Climbers', 'Dynamic core and cardio exercise', 'Start in plank, alternate bringing knees to chest rapidly', ARRAY['core', 'shoulders', 'legs'], 'bodyweight', 'intermediate', 'nmwgirgXLYM', 10.0, 'cardio'),

-- Dumbbell Exercises
('Dumbbell Bench Press', 'Upper body strength builder', 'Lie on bench, press dumbbells up and slightly together', ARRAY['chest', 'triceps', 'shoulders'], 'dumbbells', 'intermediate', 'hCoLQiurbox', 6.0, 'strength'),
('Dumbbell Rows', 'Back strengthening exercise', 'Bend over, pull dumbbells to sides of torso', ARRAY['back', 'biceps'], 'dumbbells', 'intermediate', 'roCP6wCXPqo', 5.0, 'strength'),
('Dumbbell Shoulder Press', 'Overhead pressing movement', 'Press dumbbells overhead from shoulder height', ARRAY['shoulders', 'triceps'], 'dumbbells', 'intermediate', 'qEwKCR5JCog', 5.0, 'strength'),
('Dumbbell Bicep Curls', 'Isolated arm exercise', 'Curl dumbbells up while keeping elbows stationary', ARRAY['biceps'], 'dumbbells', 'beginner', 'ykJmrZ5v0Oo', 3.0, 'strength'),

-- Barbell Exercises
('Barbell Bench Press', 'Classic chest exercise', 'Lower bar to chest, press up explosively', ARRAY['chest', 'triceps', 'shoulders'], 'barbell', 'intermediate', 'rT7DgCr-3pg', 7.0, 'strength'),
('Barbell Squats', 'King of lower body exercises', 'Bar on upper back, squat down and drive up through heels', ARRAY['quadriceps', 'glutes', 'hamstrings'], 'barbell', 'advanced', 'ultWZbUMPL8', 8.0, 'strength'),
('Deadlifts', 'Full-body strength exercise', 'Lift bar from floor to hip level, keep back straight', ARRAY['back', 'glutes', 'hamstrings'], 'barbell', 'advanced', 'ytGaGIn3SjE', 9.0, 'strength'),
('Barbell Rows', 'Back development exercise', 'Bend over, pull bar to lower chest/upper abdomen', ARRAY['back', 'biceps'], 'barbell', 'intermediate', 'FWJR5Ve8bnQ', 6.0, 'strength'),

-- Cardio Exercises
('Jumping Jacks', 'Classic cardio warm-up', 'Jump feet apart while raising arms overhead, return to start', ARRAY['full_body'], 'bodyweight', 'beginner', 'c4DAnQ6DtF8', 8.0, 'cardio'),
('High Knees', 'Running in place variation', 'Run in place bringing knees up to waist level', ARRAY['legs', 'core'], 'bodyweight', 'beginner', 'OAJ_J3EZkdY', 9.0, 'cardio'),
('Running', 'Cardiovascular endurance', 'Maintain steady pace, focus on breathing and form', ARRAY['legs', 'cardiovascular'], 'none', 'beginner', '9L2b2khySLE', 12.0, 'cardio'),

-- Core Exercises
('Crunches', 'Basic abdominal exercise', 'Lie on back, lift shoulders off ground using abs', ARRAY['core'], 'bodyweight', 'beginner', 'Xyd_fa5zoEU', 4.0, 'strength'),
('Russian Twists', 'Oblique strengthening', 'Sit with feet off ground, rotate torso side to side', ARRAY['core', 'obliques'], 'bodyweight', 'intermediate', 'wkD8rjkodUI', 5.0, 'strength'),
('Dead Bug', 'Core stability exercise', 'Lie on back, extend opposite arm and leg while keeping core engaged', ARRAY['core'], 'bodyweight', 'beginner', '4XLEnwUr1d8', 3.0, 'strength'),

-- Flexibility/Stretching
('Downward Dog', 'Yoga pose for flexibility', 'Form inverted V-shape, stretch calves and hamstrings', ARRAY['hamstrings', 'calves', 'shoulders'], 'bodyweight', 'beginner', 'VpP3mBON4vE', 2.0, 'flexibility'),
('Child Pose', 'Relaxing stretch', 'Kneel and sit back on heels, extend arms forward', ARRAY['back', 'shoulders'], 'bodyweight', 'beginner', 'ui9pzqAhx6M', 1.0, 'flexibility');

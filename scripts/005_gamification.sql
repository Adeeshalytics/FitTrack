-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- icon name or emoji
  category TEXT NOT NULL, -- 'workout', 'streak', 'milestone', 'social'
  requirement_type TEXT NOT NULL, -- 'workout_count', 'streak_days', 'calories_burned', 'exercise_count'
  requirement_value INTEGER NOT NULL,
  points INTEGER DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user achievements table
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Create user stats table for tracking progress
CREATE TABLE IF NOT EXISTS public.user_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  total_exercises INTEGER DEFAULT 0,
  total_calories_burned INTEGER DEFAULT 0,
  total_points INTEGER DEFAULT 0,
  last_workout_date DATE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create goals table
CREATE TABLE IF NOT EXISTS public.user_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type TEXT NOT NULL, -- 'weekly_workouts', 'monthly_workouts', 'streak', 'calories'
  target_value INTEGER NOT NULL,
  current_value INTEGER DEFAULT 0,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN DEFAULT TRUE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;

-- RLS policies for achievements (public read)
CREATE POLICY "achievements_select_all" ON public.achievements FOR SELECT USING (true);

-- RLS policies for user achievements
CREATE POLICY "user_achievements_select_own" ON public.user_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_achievements_insert_own" ON public.user_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for user stats
CREATE POLICY "user_stats_select_own" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_stats_insert_own" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_stats_update_own" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user goals
CREATE POLICY "user_goals_select_own" ON public.user_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_goals_insert_own" ON public.user_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_goals_update_own" ON public.user_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_goals_delete_own" ON public.user_goals FOR DELETE USING (auth.uid() = user_id);

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points) VALUES
('First Steps', 'Complete your first workout', '🎯', 'milestone', 'workout_count', 1, 10),
('Getting Started', 'Complete 5 workouts', '💪', 'milestone', 'workout_count', 5, 25),
('Consistency King', 'Complete 10 workouts', '👑', 'milestone', 'workout_count', 10, 50),
('Fitness Fanatic', 'Complete 25 workouts', '🔥', 'milestone', 'workout_count', 25, 100),
('Workout Warrior', 'Complete 50 workouts', '⚡', 'milestone', 'workout_count', 50, 200),
('Century Club', 'Complete 100 workouts', '💯', 'milestone', 'workout_count', 100, 500),
('Streak Starter', 'Maintain a 3-day workout streak', '📅', 'streak', 'streak_days', 3, 15),
('Week Warrior', 'Maintain a 7-day workout streak', '🗓️', 'streak', 'streak_days', 7, 35),
('Streak Master', 'Maintain a 14-day workout streak', '🔥', 'streak', 'streak_days', 14, 75),
('Unstoppable', 'Maintain a 30-day workout streak', '🚀', 'streak', 'streak_days', 30, 150),
('Calorie Crusher', 'Burn 1,000 calories total', '🔥', 'milestone', 'calories_burned', 1000, 30),
('Calorie Destroyer', 'Burn 5,000 calories total', '💥', 'milestone', 'calories_burned', 5000, 100),
('Exercise Explorer', 'Complete 50 different exercises', '🎯', 'milestone', 'exercise_count', 50, 75);

-- Function to update user stats after workout
CREATE OR REPLACE FUNCTION update_user_stats_after_workout()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, total_workouts, last_workout_date, updated_at)
  VALUES (NEW.user_id, 1, NEW.date, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    total_workouts = user_stats.total_workouts + 1,
    last_workout_date = NEW.date,
    updated_at = NOW();
  
  -- Update streak
  UPDATE public.user_stats 
  SET 
    current_streak = CASE 
      WHEN last_workout_date = NEW.date - INTERVAL '1 day' OR last_workout_date = NEW.date THEN current_streak + 1
      ELSE 1
    END,
    longest_streak = GREATEST(longest_streak, 
      CASE 
        WHEN last_workout_date = NEW.date - INTERVAL '1 day' OR last_workout_date = NEW.date THEN current_streak + 1
        ELSE 1
      END
    )
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for workout stats
CREATE TRIGGER update_stats_after_workout
  AFTER INSERT ON public.workouts
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_after_workout();

-- Function to update exercise count
CREATE OR REPLACE FUNCTION update_exercise_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.user_stats 
  SET 
    total_exercises = total_exercises + 1,
    updated_at = NOW()
  WHERE user_id = (
    SELECT user_id FROM public.workouts WHERE id = NEW.workout_id
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for exercise count
CREATE TRIGGER update_exercise_count_trigger
  AFTER INSERT ON public.exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_exercise_count();

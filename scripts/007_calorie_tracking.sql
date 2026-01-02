-- Create daily calorie goals table
CREATE TABLE IF NOT EXISTS public.daily_calorie_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_calories INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Create meals table
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  calories INTEGER NOT NULL,
  meal_type TEXT, -- 'breakfast', 'lunch', 'dinner', 'snack'
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.daily_calorie_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;

-- RLS policies for daily calorie goals
CREATE POLICY "daily_calorie_goals_select_own" ON public.daily_calorie_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "daily_calorie_goals_insert_own" ON public.daily_calorie_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "daily_calorie_goals_update_own" ON public.daily_calorie_goals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "daily_calorie_goals_delete_own" ON public.daily_calorie_goals FOR DELETE USING (auth.uid() = user_id);

-- RLS policies for meals
CREATE POLICY "meals_select_own" ON public.meals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "meals_insert_own" ON public.meals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "meals_update_own" ON public.meals FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "meals_delete_own" ON public.meals FOR DELETE USING (auth.uid() = user_id);

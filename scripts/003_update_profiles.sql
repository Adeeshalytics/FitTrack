-- Add additional profile fields for fitness goals and preferences
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS height DECIMAL(5,2); -- height in cm
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS weight DECIMAL(5,2); -- weight in kg
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS fitness_goal TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS activity_level TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;

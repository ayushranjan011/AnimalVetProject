-- Run this in Supabase SQL Editor for existing projects.
-- Adds location columns used by registration and My Profile.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);
CREATE INDEX IF NOT EXISTS idx_profiles_state ON public.profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_country ON public.profiles(country);

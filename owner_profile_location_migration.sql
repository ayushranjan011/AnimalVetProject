-- Run this on existing projects where `profiles` table already exists.
-- Adds pet owner location fields used by registration + nearest pharmacy discovery.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS state TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_city ON public.profiles(city);

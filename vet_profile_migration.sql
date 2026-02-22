-- Run this on existing projects where `profiles` table already exists.
-- Adds veterinarian profile fields used by registration + owner directory.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS vet_specialty TEXT,
  ADD COLUMN IF NOT EXISTS vet_experience_years INTEGER CHECK (vet_experience_years >= 0),
  ADD COLUMN IF NOT EXISTS vet_clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS vet_clinic_address TEXT,
  ADD COLUMN IF NOT EXISTS vet_city TEXT,
  ADD COLUMN IF NOT EXISTS vet_consultation_fee NUMERIC(10,2) CHECK (vet_consultation_fee >= 0),
  ADD COLUMN IF NOT EXISTS vet_availability TEXT CHECK (vet_availability IN ('Available', 'Busy', 'On Leave')),
  ADD COLUMN IF NOT EXISTS vet_description TEXT,
  ADD COLUMN IF NOT EXISTS vet_image_url TEXT,
  ADD COLUMN IF NOT EXISTS vet_rating NUMERIC(2,1) CHECK (vet_rating >= 0 AND vet_rating <= 5);

UPDATE public.profiles
SET vet_availability = 'Available'
WHERE role = 'veterinarian'
  AND (vet_availability IS NULL OR vet_availability = '');

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

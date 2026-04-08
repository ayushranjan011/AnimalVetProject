BEGIN;

ALTER TABLE public.pet_adoption_requests
  ADD COLUMN IF NOT EXISTS ngo_pet_id TEXT,
  ADD COLUMN IF NOT EXISTS ngo_pet_name TEXT;

COMMIT;

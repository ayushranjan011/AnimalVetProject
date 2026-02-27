BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  profiles_role_constraint_name TEXT;
BEGIN
  SELECT conname
  INTO profiles_role_constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.profiles'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%'
  LIMIT 1;

  IF profiles_role_constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.profiles DROP CONSTRAINT %I', profiles_role_constraint_name);
  END IF;

  ALTER TABLE public.profiles
    ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('user', 'veterinarian', 'ngo', 'pet_nanny'));
END $$;

DO $$
DECLARE
  users_role_constraint_name TEXT;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    SELECT conname
    INTO users_role_constraint_name
    FROM pg_constraint
    WHERE conrelid = 'public.users'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) ILIKE '%role%'
    LIMIT 1;

    IF users_role_constraint_name IS NOT NULL THEN
      EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', users_role_constraint_name);
    END IF;

    ALTER TABLE public.users
      ADD CONSTRAINT users_role_check
      CHECK (role IN ('pet_owner', 'veterinarian', 'ngo', 'pet_nanny'));
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pet_nannies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  full_name text not null,
  image text,
  phone text,
  email text,
  location text,
  distance_km numeric,
  rating numeric default 0,
  reviews_count integer default 0,
  total_reviews integer default 0,
  bio text,
  description text,
  services text,
  price_per_hour numeric,
  price_per_day numeric,
  availability text,
  available_times text,
  pet_types text,
  experience text,
  experience_years integer,
  is_verified boolean default false,
  reviews_list jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

ALTER TABLE public.pet_nannies
  ADD COLUMN IF NOT EXISTS user_id uuid references users(id) on delete cascade,
  ADD COLUMN IF NOT EXISTS full_name text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS total_reviews integer default 0,
  ADD COLUMN IF NOT EXISTS bio text,
  ADD COLUMN IF NOT EXISTS available_times text,
  ADD COLUMN IF NOT EXISTS experience_years integer,
  ADD COLUMN IF NOT EXISTS is_verified boolean default false,
  ADD COLUMN IF NOT EXISTS updated_at timestamptz default now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pet_nannies'
      AND column_name = 'name'
  ) THEN
    EXECUTE '
      UPDATE public.pet_nannies
      SET full_name = COALESCE(NULLIF(full_name, ''''), NULLIF(name, ''''))
      WHERE COALESCE(NULLIF(full_name, ''''), '''') = ''''
    ';
  END IF;
END $$;

UPDATE public.pet_nannies
SET full_name = 'Pet Nanny'
WHERE COALESCE(NULLIF(full_name, ''), '') = '';

ALTER TABLE public.pet_nannies
  ALTER COLUMN full_name SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pet_nannies'
      AND column_name = 'services'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.pet_nannies
      ALTER COLUMN services TYPE text USING array_to_string(services, ', ');
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'pet_nannies'
      AND column_name = 'pet_types'
      AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE public.pet_nannies
      ALTER COLUMN pet_types TYPE text USING array_to_string(pet_types, ', ');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.pet_nanny_bookings (
  id uuid primary key default gen_random_uuid(),
  nanny_id uuid references pet_nannies(id) on delete cascade,
  owner_id uuid references users(id),
  pet_id uuid references pets(id),
  start_time timestamp with time zone,
  end_time timestamp with time zone,
  status text check (status in ('pending', 'confirmed', 'cancelled')) default 'pending',
  notes text,
  created_at timestamp with time zone default now()
);

CREATE INDEX IF NOT EXISTS idx_pet_nannies_user_id ON public.pet_nannies(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_nannies_rating ON public.pet_nannies(rating DESC);
CREATE INDEX IF NOT EXISTS idx_pet_nanny_bookings_nanny_id ON public.pet_nanny_bookings(nanny_id);
CREATE INDEX IF NOT EXISTS idx_pet_nanny_bookings_owner_id ON public.pet_nanny_bookings(owner_id);

COMMIT;

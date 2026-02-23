-- Run this in Supabase SQL Editor to normalize appointments schema
-- so owner/vet dashboards and booking flow use consistent columns.

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID,
  vet_id UUID,
  pet_name TEXT,
  vet_name TEXT,
  owner_name TEXT,
  owner_email TEXT,
  type TEXT,
  mode TEXT,
  date DATE,
  time TEXT,
  status TEXT DEFAULT 'Pending',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS vet_id UUID,
  ADD COLUMN IF NOT EXISTS pet_name TEXT,
  ADD COLUMN IF NOT EXISTS vet_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS time TEXT,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'appointment_date'
  ) THEN
    EXECUTE '
      UPDATE public.appointments
      SET date = COALESCE(date, appointment_date)
      WHERE appointment_date IS NOT NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'scheduled_date'
  ) THEN
    EXECUTE '
      UPDATE public.appointments
      SET date = COALESCE(date, scheduled_date)
      WHERE scheduled_date IS NOT NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'appointment_time'
  ) THEN
    EXECUTE '
      UPDATE public.appointments
      SET time = COALESCE(time, appointment_time)
      WHERE appointment_time IS NOT NULL
    ';
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'appointments'
      AND column_name = 'scheduled_time'
  ) THEN
    EXECUTE '
      UPDATE public.appointments
      SET time = COALESCE(time, scheduled_time)
      WHERE scheduled_time IS NOT NULL
    ';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON public.appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON public.appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);

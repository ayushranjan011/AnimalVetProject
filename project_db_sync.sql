-- Consolidated DB sync for current Innovet frontend expectations.
-- Safe to run multiple times.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1) profiles compatibility for vet directory/settings
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

-- 2) appointments compatibility (new + legacy columns together)
ALTER TABLE public.appointments
  ADD COLUMN IF NOT EXISTS owner_id UUID,
  ADD COLUMN IF NOT EXISTS pet_owner_id UUID,
  ADD COLUMN IF NOT EXISTS pet_name TEXT,
  ADD COLUMN IF NOT EXISTS vet_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT,
  ADD COLUMN IF NOT EXISTS mode TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS time TEXT;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='appointments' AND column_name='appointment_date'
  ) THEN
    EXECUTE 'ALTER TABLE public.appointments ALTER COLUMN appointment_date DROP NOT NULL';
    EXECUTE '
      UPDATE public.appointments
      SET date = COALESCE(date, appointment_date)
      WHERE appointment_date IS NOT NULL
    ';
    EXECUTE '
      UPDATE public.appointments
      SET appointment_date = COALESCE(appointment_date, date)
      WHERE date IS NOT NULL
    ';
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='appointments' AND column_name='appointment_time'
  ) THEN
    EXECUTE 'ALTER TABLE public.appointments ALTER COLUMN appointment_time DROP NOT NULL';
    EXECUTE '
      UPDATE public.appointments
      SET time = COALESCE(time, appointment_time::text)
      WHERE appointment_time IS NOT NULL
    ';
    EXECUTE '
      UPDATE public.appointments
      SET appointment_time = COALESCE(
        appointment_time,
        CASE
          WHEN time ~ ''^\d{1,2}:\d{2}(:\d{2})?$'' THEN time::time
          ELSE NULL
        END
      )
      WHERE time IS NOT NULL
    ';
  END IF;
END $$;

UPDATE public.appointments
SET owner_id = COALESCE(owner_id, pet_owner_id),
    pet_owner_id = COALESCE(pet_owner_id, owner_id);

UPDATE public.appointments
SET status = 'scheduled'
WHERE status IS NULL;

CREATE INDEX IF NOT EXISTS idx_appointments_owner_id ON public.appointments(owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_pet_owner_id ON public.appointments(pet_owner_id);
CREATE INDEX IF NOT EXISTS idx_appointments_vet_id ON public.appointments(vet_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON public.appointments(date);
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='appointments' AND column_name='appointment_date'
  ) THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS idx_appointments_appointment_date ON public.appointments(appointment_date)';
  END IF;
END $$;

-- 3) notifications table (used in user dashboard + bell counters)
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT DEFAULT 'medical',
  title TEXT NOT NULL DEFAULT 'Notification',
  description TEXT,
  is_read BOOLEAN DEFAULT false,
  pet_name TEXT,
  is_user_triggered BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);

-- 4) diet plans table (used in pet owner dashboard)
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  pet_name TEXT,
  pet_type TEXT,
  plan TEXT,
  diet_plan TEXT,
  notes TEXT,
  care_notes TEXT,
  next_review TEXT,
  review_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_diet_plans_owner_id ON public.diet_plans(owner_id);

-- 5) pet_nannies table (used in Pet Nanny screen)
CREATE TABLE IF NOT EXISTS public.pet_nannies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image TEXT,
  distance_km NUMERIC(6,2) DEFAULT 0,
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  description TEXT,
  services TEXT[],
  price_per_hour NUMERIC(10,2) DEFAULT 0,
  price_per_day NUMERIC(10,2) DEFAULT 0,
  availability TEXT DEFAULT 'available',
  pet_types TEXT[],
  experience TEXT,
  reviews_list JSONB DEFAULT '[]'::jsonb,
  available_times TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6) medical_records compatibility columns expected by frontend
ALTER TABLE public.medical_records
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES public.users(id),
  ADD COLUMN IF NOT EXISTS pet_name TEXT,
  ADD COLUMN IF NOT EXISTS pet_type TEXT,
  ADD COLUMN IF NOT EXISTS vet_name TEXT,
  ADD COLUMN IF NOT EXISTS date DATE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Completed',
  ADD COLUMN IF NOT EXISTS document TEXT,
  ADD COLUMN IF NOT EXISTS file_name TEXT,
  ADD COLUMN IF NOT EXISTS qr_code TEXT;

UPDATE public.medical_records
SET date = COALESCE(date, record_date)
WHERE record_date IS NOT NULL;

UPDATE public.medical_records mr
SET owner_id = p.owner_id
FROM public.pets p
WHERE mr.pet_id = p.id
  AND mr.owner_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_medical_records_owner_id ON public.medical_records(owner_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_pet_id ON public.medical_records(pet_id);
CREATE INDEX IF NOT EXISTS idx_medical_records_record_date ON public.medical_records(record_date);

-- 7) volunteer applications table (used in pet owner NGO volunteer form)
CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ngo_id UUID,
  ngo_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  age INTEGER CHECK (age IS NULL OR age >= 18),
  city TEXT,
  availability TEXT,
  skills TEXT,
  experience TEXT,
  id_proof_number TEXT NOT NULL,
  id_proof_url TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_ngo_id ON public.volunteer_applications(ngo_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_user_id ON public.volunteer_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON public.volunteer_applications(status);

-- 8) pet handover requests table (used when pet owner wants to hand over pet to NGO)
CREATE TABLE IF NOT EXISTS public.pet_handover_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ngo_id UUID,
  ngo_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  pet_breed TEXT,
  pet_age TEXT,
  reason TEXT NOT NULL,
  health_notes TEXT,
  verification_id_number TEXT NOT NULL,
  verification_id_proof_url TEXT NOT NULL,
  pet_passport_requested BOOLEAN NOT NULL DEFAULT false,
  passport_pet_id UUID,
  passport_snapshot JSONB,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pet_handover_requests
  ADD COLUMN IF NOT EXISTS verification_id_number TEXT,
  ADD COLUMN IF NOT EXISTS verification_id_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS pet_passport_requested BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS passport_pet_id UUID,
  ADD COLUMN IF NOT EXISTS passport_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_ngo_id ON public.pet_handover_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_user_id ON public.pet_handover_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_status ON public.pet_handover_requests(status);

-- 9) pet adoption requests table (used when pet owner wants to adopt from NGO)
CREATE TABLE IF NOT EXISTS public.pet_adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  ngo_id UUID,
  ngo_name TEXT NOT NULL,
  ngo_pet_id TEXT,
  ngo_pet_name TEXT,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  preferred_pet_type TEXT NOT NULL,
  experience TEXT,
  reason TEXT NOT NULL,
  verification_id_number TEXT NOT NULL,
  verification_id_proof_url TEXT NOT NULL,
  pet_passport_requested BOOLEAN NOT NULL DEFAULT true,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pet_adoption_requests
  ADD COLUMN IF NOT EXISTS ngo_pet_id TEXT,
  ADD COLUMN IF NOT EXISTS ngo_pet_name TEXT,
  ADD COLUMN IF NOT EXISTS verification_id_number TEXT,
  ADD COLUMN IF NOT EXISTS verification_id_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS pet_passport_requested BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_ngo_id ON public.pet_adoption_requests(ngo_id);
CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_user_id ON public.pet_adoption_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_status ON public.pet_adoption_requests(status);

COMMIT;

-- Run this in Supabase SQL Editor
-- Creates table used by Pet Owner volunteer registration form

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.volunteer_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  ngo_id UUID NULL,
  ngo_name TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  age INTEGER NULL CHECK (age IS NULL OR age >= 18),
  city TEXT NULL,
  availability TEXT NULL,
  skills TEXT NULL,
  experience TEXT NULL,
  id_proof_number TEXT NOT NULL,
  id_proof_url TEXT NOT NULL,
  message TEXT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_ngo_id
  ON public.volunteer_applications(ngo_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_user_id
  ON public.volunteer_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status
  ON public.volunteer_applications(status);

COMMIT;

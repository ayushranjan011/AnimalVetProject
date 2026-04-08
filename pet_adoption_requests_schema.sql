-- Run this in Supabase SQL Editor
-- Creates table used by Pet Owner -> NGO pet adoption request form

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.pet_adoption_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  ngo_id UUID NULL,
  ngo_name TEXT NOT NULL,
  ngo_pet_id TEXT NULL,
  ngo_pet_name TEXT NULL,
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  preferred_pet_type TEXT NOT NULL,
  experience TEXT NULL,
  reason TEXT NOT NULL,
  verification_id_number TEXT NOT NULL,
  verification_id_proof_url TEXT NOT NULL,
  pet_passport_requested BOOLEAN NOT NULL DEFAULT true,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_adoption_requests
  ADD COLUMN IF NOT EXISTS ngo_pet_id TEXT,
  ADD COLUMN IF NOT EXISTS ngo_pet_name TEXT;

CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_ngo_id
  ON public.pet_adoption_requests(ngo_id);

CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_user_id
  ON public.pet_adoption_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_pet_adoption_requests_status
  ON public.pet_adoption_requests(status);

COMMIT;

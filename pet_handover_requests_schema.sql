-- Run this in Supabase SQL Editor
-- Creates table used by Pet Owner -> NGO pet handover request form

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.pet_handover_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL,
  ngo_id UUID NULL,
  ngo_name TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  pet_breed TEXT NULL,
  pet_age TEXT NULL,
  reason TEXT NOT NULL,
  health_notes TEXT NULL,
  verification_id_number TEXT NOT NULL,
  verification_id_proof_url TEXT NOT NULL,
  pet_passport_requested BOOLEAN NOT NULL DEFAULT false,
  passport_pet_id UUID NULL,
  passport_snapshot JSONB NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pet_handover_requests
  ADD COLUMN IF NOT EXISTS verification_id_number TEXT,
  ADD COLUMN IF NOT EXISTS verification_id_proof_url TEXT,
  ADD COLUMN IF NOT EXISTS pet_passport_requested BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS passport_pet_id UUID,
  ADD COLUMN IF NOT EXISTS passport_snapshot JSONB,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_ngo_id
  ON public.pet_handover_requests(ngo_id);

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_user_id
  ON public.pet_handover_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_status
  ON public.pet_handover_requests(status);

COMMIT;

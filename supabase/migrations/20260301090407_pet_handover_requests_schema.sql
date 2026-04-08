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
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_ngo_id
  ON public.pet_handover_requests(ngo_id);

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_user_id
  ON public.pet_handover_requests(user_id);

CREATE INDEX IF NOT EXISTS idx_pet_handover_requests_status
  ON public.pet_handover_requests(status);

COMMIT;


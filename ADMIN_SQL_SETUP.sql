-- ============================================
-- INNOVET ADMIN SETUP SQL
-- ============================================

-- 1️⃣ CREATE ADMIN TABLE
CREATE TABLE public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  admin_role TEXT DEFAULT 'admin' CHECK (admin_role IN ('super_admin', 'admin', 'moderator')),
  permissions JSONB DEFAULT '{"all": true}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMPTZ,
  login_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2️⃣ CREATE ADMIN ACTIVITY LOG TABLE (Audit Trail)
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES public.admins(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  user_agent TEXT,
  status TEXT DEFAULT 'success' CHECK (status IN ('success', 'failed', 'pending')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3️⃣ ENABLE ROW LEVEL SECURITY
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- 4️⃣ CREATE RLS POLICIES
-- Admins can only view admin data
CREATE POLICY "Admins can only view admin data"
  ON public.admins FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can create activity logs
CREATE POLICY "Admins can create activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (admin_id IN (SELECT id FROM public.admins WHERE user_id = auth.uid()));

-- Admins can view their own activity logs
CREATE POLICY "Admins can view their own activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (admin_id IN (SELECT id FROM public.admins WHERE user_id = auth.uid()));

-- ============================================
-- 5️⃣ INSERT TEST ADMIN USER (OPTIONAL)
-- ============================================
-- पहले Supabase में user create करो email: admin@innovet.com
-- फिर यह run करो (अपना USER_ID replace करके)

INSERT INTO public.admins (
  user_id,
  email,
  full_name,
  admin_role,
  permissions,
  is_active
) VALUES (
  'YOUR_USER_ID_HERE', -- Supabase से copy करो
  'admin@innovet.com',
  'Admin User',
  'super_admin',
  '{"all": true}'::jsonb,
  true
);

-- ============================================
-- ADMINS TABLE SCHEMA
-- ============================================

-- Field Explanation:
-- id: Unique admin identifier
-- user_id: Links to auth.users table
-- email: Admin email (unique)
-- full_name: Admin full name
-- admin_role: 'super_admin' | 'admin' | 'moderator'
-- permissions: JSON with admin permissions
-- is_active: Whether admin account is active
-- last_login_at: Last login timestamp
-- login_count: Total number of logins
-- created_at: Account creation time
-- updated_at: Last update time

-- ============================================
-- QUERIES FOR ADMIN OPERATIONS
-- ============================================

-- Get all admins:
SELECT * FROM public.admins WHERE is_active = true;

-- Get admin activity logs:
SELECT * FROM public.admin_activity_logs ORDER BY created_at DESC LIMIT 50;

-- Update admin last login:
UPDATE public.admins 
SET last_login_at = now(), login_count = login_count + 1
WHERE user_id = auth.uid();

-- Deactivate admin:
UPDATE public.admins SET is_active = false WHERE id = 'admin_id_here';

-- Insert activity log:
INSERT INTO public.admin_activity_logs (admin_id, action, entity_type, entity_id, description)
VALUES ('admin_id_here', 'USER_BLOCKED', 'users', 'user_id_here', 'Blocked user due to violation');

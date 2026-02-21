-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'veterinarian', 'ngo')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Enable insert for authenticated users"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 🔐 ADMIN TABLE
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

-- Admin Activity Log Table (for audit trail)
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

-- Enable RLS for Admin Tables
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Admin Policies
CREATE POLICY "Admins can only view admin data"
  ON public.admins FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only super admins can create new admins"
  ON public.admins FOR INSERT
  WITH CHECK (false); -- Modify this based on your needs

-- Activity Log Policies
CREATE POLICY "Admins can view their own activity logs"
  ON public.admin_activity_logs FOR SELECT
  USING (admin_id IN (SELECT id FROM public.admins WHERE user_id = auth.uid()));

CREATE POLICY "Admins can create activity logs"
  ON public.admin_activity_logs FOR INSERT
  WITH CHECK (admin_id IN (SELECT id FROM public.admins WHERE user_id = auth.uid()));

-- User Pets Table
CREATE TABLE IF NOT EXISTS public.user_pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pet_type TEXT NOT NULL,
  breed TEXT,
  age TEXT,
  gender TEXT,
  color TEXT,
  weight TEXT,
  image TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_pets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own pets"
  ON public.user_pets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pets"
  ON public.user_pets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pets"
  ON public.user_pets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pets"
  ON public.user_pets FOR DELETE
  USING (auth.uid() = user_id);


-- Update system_admins table to support three admin levels
-- First, update the permission_level enum to include the new levels
DROP TYPE IF EXISTS permission_level_new;
CREATE TYPE permission_level_new AS ENUM ('super_admin', 'admin_principal', 'admin_adjunto', 'admin_supervisor');

-- Add new columns and update existing ones
ALTER TABLE public.system_admins 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES public.system_admins(id),
  ADD COLUMN IF NOT EXISTS access_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Update the permission_level column type
ALTER TABLE public.system_admins 
  ALTER COLUMN permission_level TYPE permission_level_new 
  USING permission_level::text::permission_level_new;

-- Drop the old type
DROP TYPE permission_level;
ALTER TYPE permission_level_new RENAME TO permission_level;

-- Update RLS policies to work with session-based authentication
DROP POLICY IF EXISTS "Super admins can view all admins" ON public.system_admins;
DROP POLICY IF EXISTS "Super admins can insert admins" ON public.system_admins;
DROP POLICY IF EXISTS "Super admins can update admins" ON public.system_admins;

-- Create new RLS policies that work with session-based authentication
CREATE POLICY "Enable read access for all users" 
ON public.system_admins 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.system_admins 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Enable update for all users" 
ON public.system_admins 
FOR UPDATE 
USING (true);

-- Add function to generate unique admin codes
CREATE OR REPLACE FUNCTION public.generate_admin_code(prefix text DEFAULT 'ADM')
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Generate code: prefix + 4 random digits
    new_code := prefix || '_' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    
    -- Check if code already exists
    SELECT EXISTS(
      SELECT 1 FROM public.system_admins 
      WHERE access_code = new_code
    ) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Insert default super admin if not exists
INSERT INTO public.system_admins (name, email, access_code, permission_level, is_active)
SELECT 'Administrador Principal', 'admin@sigeg.ao', 'MB_0608', 'super_admin', true
WHERE NOT EXISTS (
  SELECT 1 FROM public.system_admins WHERE permission_level = 'super_admin'
);

-- Create admin audit log table
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES public.system_admins(id),
  action TEXT NOT NULL,
  target_admin_id UUID REFERENCES public.system_admins(id),
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" 
ON public.admin_audit_log 
FOR SELECT 
USING (true);

CREATE POLICY "Enable insert for all users" 
ON public.admin_audit_log 
FOR INSERT 
WITH CHECK (true);
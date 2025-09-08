-- Update system_admins table to support three admin levels
-- First, create the new enum type
DROP TYPE IF EXISTS permission_level_new;
CREATE TYPE permission_level_new AS ENUM ('super_admin', 'admin_principal', 'admin_adjunto', 'admin_supervisor');

-- Remove the default constraint temporarily
ALTER TABLE public.system_admins ALTER COLUMN permission_level DROP DEFAULT;

-- Update the permission_level column type
ALTER TABLE public.system_admins 
  ALTER COLUMN permission_level TYPE permission_level_new 
  USING permission_level::text::permission_level_new;

-- Set new default
ALTER TABLE public.system_admins ALTER COLUMN permission_level SET DEFAULT 'admin_adjunto'::permission_level_new;

-- Drop the old type
DROP TYPE permission_level;
ALTER TYPE permission_level_new RENAME TO permission_level;

-- Add new columns for enhanced admin management
ALTER TABLE public.system_admins 
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS created_by_admin_id UUID REFERENCES public.system_admins(id),
  ADD COLUMN IF NOT EXISTS access_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP WITH TIME ZONE;

-- Update existing admin to super_admin
UPDATE public.system_admins 
SET permission_level = 'super_admin' 
WHERE access_code = 'MB_0608' OR id IN (
  SELECT id FROM public.system_admins 
  WHERE permission_level::text = 'super_admin' 
  LIMIT 1
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

-- Function to generate unique admin codes
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
    new_code := prefix || '_' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM public.system_admins 
      WHERE access_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;
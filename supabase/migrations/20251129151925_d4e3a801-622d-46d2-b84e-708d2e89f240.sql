-- Create system_settings table for storing application configuration
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL DEFAULT '{}',
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES public.system_admins(id)
);

-- Enable RLS
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON public.system_settings
  FOR SELECT USING (true);

-- Anyone can insert settings (for initial setup)
CREATE POLICY "Anyone can insert settings" ON public.system_settings
  FOR INSERT WITH CHECK (true);

-- Anyone can update settings (admin check done in application)
CREATE POLICY "Anyone can update settings" ON public.system_settings
  FOR UPDATE USING (true);

-- Insert initial creator info
INSERT INTO public.system_settings (key, value) VALUES 
('creator_info', '{
  "name": "Manuel Bemvindo Mendes",
  "whatsapp": "+244 927 800 658",
  "email": "manuelbmendes01@gmail.com",
  "photo_url": null
}'::jsonb);
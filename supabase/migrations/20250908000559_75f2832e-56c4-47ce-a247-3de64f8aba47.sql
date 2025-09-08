-- Add leadership name columns to groups table
ALTER TABLE public.groups 
ADD COLUMN IF NOT EXISTS president_name TEXT,
ADD COLUMN IF NOT EXISTS vice_president_1_name TEXT,
ADD COLUMN IF NOT EXISTS vice_president_2_name TEXT,
ADD COLUMN IF NOT EXISTS secretary_1_name TEXT,
ADD COLUMN IF NOT EXISTS secretary_2_name TEXT;
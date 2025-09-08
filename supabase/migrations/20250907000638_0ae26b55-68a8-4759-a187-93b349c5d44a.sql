-- Update monthly_plans table with the specified plans
TRUNCATE public.monthly_plans;

INSERT INTO public.monthly_plans (name, max_members, price_per_member, is_active) VALUES
('Plano Gratuito', 20, 0, true),
('Plano Semente', 40, 65, true),
('Plano Broto', 70, 60, true),
('Plano Flora', 100, 75, true),
('Plano Árvore', 150, 60, true),
('Plano Floresta', 200, 55, true),
('Plano Máximo', 250, 50, true);

-- Add plan_id to groups table to link groups with their plans
ALTER TABLE public.groups ADD COLUMN plan_id uuid REFERENCES public.monthly_plans(id);

-- Set all existing groups to Plano Gratuito by default
UPDATE public.groups 
SET plan_id = (SELECT id FROM public.monthly_plans WHERE name = 'Plano Gratuito' LIMIT 1)
WHERE plan_id IS NULL;
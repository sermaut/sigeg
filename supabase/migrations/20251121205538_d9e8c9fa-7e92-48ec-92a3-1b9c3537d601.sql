-- ============================================
-- CORREÇÃO: RLS POLICY PARA MATERIALIZED VIEW
-- Proteger group_statistics contra acesso direto via API
-- ============================================

-- Remover a materialized view do schema público da API
-- Isso impede acesso direto via Supabase client
ALTER MATERIALIZED VIEW public.group_statistics SET SCHEMA supabase_migrations;

-- Criar função segura para acessar estatísticas
CREATE OR REPLACE FUNCTION public.get_group_statistics()
RETURNS TABLE (
  group_id uuid,
  group_name text,
  province text,
  municipality text,
  is_active boolean,
  total_members bigint,
  active_members bigint,
  leaders_count bigint,
  monthly_revenue numeric,
  last_member_added timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    group_id,
    group_name,
    province,
    municipality,
    is_active,
    total_members,
    active_members,
    leaders_count,
    monthly_revenue,
    last_member_added
  FROM supabase_migrations.group_statistics;
$$;

-- Atualizar função de refresh para usar o schema correto
CREATE OR REPLACE FUNCTION public.refresh_group_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY supabase_migrations.group_statistics;
  RETURN NULL;
END;
$$;

COMMENT ON FUNCTION public.get_group_statistics() IS 'Retorna estatísticas pré-calculadas dos grupos de forma segura via função';
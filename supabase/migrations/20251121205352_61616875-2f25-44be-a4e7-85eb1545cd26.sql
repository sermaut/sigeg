-- ============================================
-- FASE 3: OTIMIZAÇÕES DE PERFORMANCE
-- Database indexes e materialized views
-- ============================================

-- 1. CRIAR ÍNDICES PARA QUERIES MAIS RÁPIDAS
-- ============================================

-- Índices em members (tabela mais consultada)
CREATE INDEX IF NOT EXISTS idx_members_group_id ON public.members(group_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_members_role ON public.members(role) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_members_is_active ON public.members(is_active);
CREATE INDEX IF NOT EXISTS idx_members_partition ON public.members(partition) WHERE is_active = true;

-- Índices em financial_transactions
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON public.financial_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.financial_transactions(type);

-- Índices em payment_events
CREATE INDEX IF NOT EXISTS idx_payment_events_group_id ON public.payment_events(group_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_category_id ON public.payment_events(category_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_created_at ON public.payment_events(created_at DESC);

-- Índices em category_roles
CREATE INDEX IF NOT EXISTS idx_category_roles_member_id ON public.category_roles(member_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_category_roles_category_id ON public.category_roles(category_id) WHERE is_active = true;

-- Índices em groups
CREATE INDEX IF NOT EXISTS idx_groups_is_active ON public.groups(is_active);
CREATE INDEX IF NOT EXISTS idx_groups_province ON public.groups(province) WHERE is_active = true;

-- 2. CRIAR MATERIALIZED VIEW PARA ESTATÍSTICAS DE GRUPOS
-- ============================================

CREATE MATERIALIZED VIEW IF NOT EXISTS public.group_statistics AS
SELECT 
  g.id as group_id,
  g.name as group_name,
  g.province,
  g.municipality,
  g.is_active,
  COUNT(DISTINCT m.id) as total_members,
  COUNT(DISTINCT CASE WHEN m.is_active THEN m.id END) as active_members,
  COUNT(DISTINCT CASE WHEN m.role IN ('presidente', 'vice_presidente_1', 'vice_presidente_2') THEN m.id END) as leaders_count,
  SUM(CASE WHEN g.monthly_fee IS NOT NULL THEN g.monthly_fee ELSE 0 END) as monthly_revenue,
  MAX(m.created_at) as last_member_added
FROM public.groups g
LEFT JOIN public.members m ON m.group_id = g.id
GROUP BY g.id, g.name, g.province, g.municipality, g.is_active;

-- Criar índice na materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_group_statistics_group_id ON public.group_statistics(group_id);
CREATE INDEX IF NOT EXISTS idx_group_statistics_province ON public.group_statistics(province);

-- 3. FUNÇÃO PARA REFRESH AUTOMÁTICO DA VIEW
-- ============================================

CREATE OR REPLACE FUNCTION public.refresh_group_statistics()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY public.group_statistics;
  RETURN NULL;
END;
$$;

-- 4. TRIGGERS PARA REFRESH AUTOMÁTICO
-- ============================================

-- Trigger quando membros são inseridos/atualizados/deletados
DROP TRIGGER IF EXISTS trigger_refresh_stats_on_member_change ON public.members;
CREATE TRIGGER trigger_refresh_stats_on_member_change
  AFTER INSERT OR UPDATE OR DELETE ON public.members
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_group_statistics();

-- Trigger quando grupos são atualizados
DROP TRIGGER IF EXISTS trigger_refresh_stats_on_group_change ON public.groups;
CREATE TRIGGER trigger_refresh_stats_on_group_change
  AFTER INSERT OR UPDATE OR DELETE ON public.groups
  FOR EACH STATEMENT
  EXECUTE FUNCTION public.refresh_group_statistics();

-- 5. REFRESH INICIAL DA MATERIALIZED VIEW
-- ============================================

REFRESH MATERIALIZED VIEW CONCURRENTLY public.group_statistics;

-- 6. COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ============================================

COMMENT ON MATERIALIZED VIEW public.group_statistics IS 'Estatísticas pré-calculadas dos grupos para performance otimizada. Atualizada automaticamente via triggers.';
COMMENT ON INDEX idx_members_group_id IS 'Acelera queries de membros por grupo (apenas ativos)';
COMMENT ON INDEX idx_transactions_category_id IS 'Acelera queries de transações por categoria';
COMMENT ON INDEX idx_payment_events_group_id IS 'Acelera queries de eventos de pagamento por grupo';
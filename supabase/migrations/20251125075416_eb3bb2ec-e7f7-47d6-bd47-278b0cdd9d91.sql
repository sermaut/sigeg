-- Função para obter nível de permissão do membro em uma categoria
CREATE OR REPLACE FUNCTION public.get_category_permission_level(
  p_member_id UUID,
  p_category_id UUID
)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role category_role;
BEGIN
  -- Buscar role do membro na categoria
  SELECT role INTO v_role
  FROM category_roles
  WHERE member_id = p_member_id
    AND category_id = p_category_id
    AND is_active = true;
  
  IF v_role IS NULL THEN
    -- Verificar se é líder do grupo
    IF EXISTS (
      SELECT 1 FROM financial_categories fc
      JOIN groups g ON fc.group_id = g.id
      WHERE fc.id = p_category_id
        AND (
          g.president_id = p_member_id OR
          g.vice_president_1_id = p_member_id OR
          g.vice_president_2_id = p_member_id OR
          g.secretary_1_id = p_member_id OR
          g.secretary_2_id = p_member_id
        )
    ) THEN
      RETURN 0; -- Nível máximo para líderes do grupo
    END IF;
    RETURN 999; -- Sem permissão
  END IF;
  
  -- Retornar nível baseado na role
  CASE v_role
    WHEN 'presidente' THEN RETURN 1;
    WHEN 'secretario' THEN RETURN 2;
    WHEN 'auxiliar' THEN RETURN 3;
    ELSE RETURN 999;
  END CASE;
END;
$$;

-- Atualizar RLS policies de financial_transactions para respeitar hierarquia

-- Policy para SELECT - todos podem ver se tiverem qualquer nível de acesso
DROP POLICY IF EXISTS "Temporary public read access for financial transactions" ON financial_transactions;

CREATE POLICY "Líderes podem ver transações da categoria"
ON financial_transactions
FOR SELECT
USING (
  public.get_category_permission_level(
    (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
    category_id
  ) <= 3 -- Presidente (1), Secretário (2), Auxiliar (3)
);

-- Policy para INSERT - apenas Presidente e Secretário
DROP POLICY IF EXISTS "Usuários autorizados podem criar transações" ON financial_transactions;

CREATE POLICY "Presidente e Secretário podem criar transações"
ON financial_transactions
FOR INSERT
WITH CHECK (
  public.get_category_permission_level(
    (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
    category_id
  ) <= 2 -- Presidente (1) ou Secretário (2)
  AND (
    ( SELECT NOT COALESCE(is_locked, false) FROM financial_categories WHERE id = category_id )
    OR public.get_category_permission_level(
      (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
      category_id
    ) = 1 -- Apenas presidente pode criar em categoria bloqueada
  )
);

-- Policy para UPDATE - Presidente pode editar tudo, Secretário apenas suas próprias
DROP POLICY IF EXISTS "Usuários autorizados podem atualizar transações" ON financial_transactions;

CREATE POLICY "Presidente edita tudo, Secretário edita suas próprias"
ON financial_transactions
FOR UPDATE
USING (
  public.get_category_permission_level(
    (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
    category_id
  ) = 1 -- Presidente pode editar tudo
  OR (
    public.get_category_permission_level(
      (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
      category_id
    ) = 2 -- Secretário
    AND created_by_member_id = (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code'))
  )
);

-- Policy para DELETE - apenas Presidente
DROP POLICY IF EXISTS "Usuários autorizados podem deletar transações" ON financial_transactions;

CREATE POLICY "Apenas Presidente pode deletar transações"
ON financial_transactions
FOR DELETE
USING (
  public.get_category_permission_level(
    (SELECT id FROM members WHERE member_code = (current_setting('request.jwt.claims', true)::json->>'member_code')),
    category_id
  ) = 1 -- Apenas Presidente
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_category_roles_active ON category_roles(member_id, category_id) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_financial_transactions_category ON financial_transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_financial_transactions_created_by ON financial_transactions(created_by_member_id);
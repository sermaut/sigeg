-- Criar funções de verificação de permissões (Security Definer para evitar recursão)

-- Função para verificar se membro pertence ao grupo
CREATE OR REPLACE FUNCTION public.is_member_of_group(p_group_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE id = p_member_id 
      AND group_id = p_group_id
      AND is_active = true
  );
$$;

-- Função para verificar se é líder do grupo
CREATE OR REPLACE FUNCTION public.is_group_leadership(p_group_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.groups
    WHERE id = p_group_id
      AND (
        president_id = p_member_id OR
        vice_president_1_id = p_member_id OR
        vice_president_2_id = p_member_id OR
        secretary_1_id = p_member_id OR
        secretary_2_id = p_member_id
      )
  );
$$;

-- CORRIGIR RLS: members
-- Remover políticas temporárias perigosas
DROP POLICY IF EXISTS "Enable delete for all users" ON public.members;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.members;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.members;
DROP POLICY IF EXISTS "Enable update for all users" ON public.members;

-- Criar políticas seguras para members
CREATE POLICY "Membros podem ver membros do seu grupo"
ON public.members
FOR SELECT
TO public
USING (
  group_id IN (
    SELECT group_id FROM public.members WHERE id = auth.uid()::uuid
  )
);

CREATE POLICY "Líderes podem adicionar membros ao grupo"
ON public.members
FOR INSERT
TO public
WITH CHECK (
  public.is_group_leadership(group_id, auth.uid()::uuid)
);

CREATE POLICY "Líderes podem editar qualquer membro do grupo"
ON public.members
FOR UPDATE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
  OR id = auth.uid()::uuid
);

CREATE POLICY "Líderes podem remover membros do grupo"
ON public.members
FOR DELETE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
);

-- CORRIGIR RLS: financial_transactions
-- Remover políticas temporárias
DROP POLICY IF EXISTS "Temporary public read access for financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Temporary public write access for financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Temporary public update access for financial transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Temporary public delete access for financial transactions" ON public.financial_transactions;

-- Criar políticas seguras para financial_transactions
CREATE POLICY "Ver transações do grupo e categorias com permissão"
ON public.financial_transactions
FOR SELECT
TO public
USING (
  category_id IN (
    SELECT fc.id FROM public.financial_categories fc
    WHERE fc.group_id IN (
      SELECT group_id FROM public.members WHERE id = auth.uid()::uuid
    )
  )
);

CREATE POLICY "Líderes de categoria podem criar transações"
ON public.financial_transactions
FOR INSERT
TO public
WITH CHECK (
  public.can_manage_category(category_id, auth.uid()::uuid)
);

CREATE POLICY "Presidente edita tudo secretário edita próprias"
ON public.financial_transactions
FOR UPDATE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.category_roles cr
    WHERE cr.category_id = financial_transactions.category_id
      AND cr.member_id = auth.uid()::uuid
      AND cr.role = 'presidente'
      AND cr.is_active = true
  )
  OR (
    created_by_member_id = auth.uid()::uuid
    AND EXISTS (
      SELECT 1 FROM public.category_roles cr
      WHERE cr.category_id = financial_transactions.category_id
        AND cr.member_id = auth.uid()::uuid
        AND cr.role = 'secretario'
        AND cr.is_active = true
    )
  )
);

CREATE POLICY "Apenas presidente pode deletar transações"
ON public.financial_transactions
FOR DELETE
TO public
USING (
  EXISTS (
    SELECT 1 FROM public.category_roles cr
    WHERE cr.category_id = financial_transactions.category_id
      AND cr.member_id = auth.uid()::uuid
      AND cr.role = 'presidente'
      AND cr.is_active = true
  )
);

-- CORRIGIR RLS: financial_categories
DROP POLICY IF EXISTS "Temporary public read access for financial categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Temporary public write access for financial categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Temporary public update access for financial categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Temporary public delete access for financial categories" ON public.financial_categories;

CREATE POLICY "Ver categorias do próprio grupo"
ON public.financial_categories
FOR SELECT
TO public
USING (
  group_id IN (
    SELECT group_id FROM public.members WHERE id = auth.uid()::uuid
  )
);

CREATE POLICY "Líderes podem criar categorias"
ON public.financial_categories
FOR INSERT
TO public
WITH CHECK (
  public.is_group_leadership(group_id, auth.uid()::uuid)
);

CREATE POLICY "Líderes podem editar categorias"
ON public.financial_categories
FOR UPDATE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
);

CREATE POLICY "Líderes podem deletar categorias"
ON public.financial_categories
FOR DELETE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
);

-- CORRIGIR RLS: payment_events
DROP POLICY IF EXISTS "Temporary public read access for payment events" ON public.payment_events;
DROP POLICY IF EXISTS "Temporary public write access for payment events" ON public.payment_events;
DROP POLICY IF EXISTS "Temporary public update access for payment events" ON public.payment_events;
DROP POLICY IF EXISTS "Temporary public delete access for payment events" ON public.payment_events;

CREATE POLICY "Ver eventos de pagamento do grupo"
ON public.payment_events
FOR SELECT
TO public
USING (
  group_id IN (
    SELECT group_id FROM public.members WHERE id = auth.uid()::uuid
  )
);

CREATE POLICY "Líderes de categoria podem criar eventos"
ON public.payment_events
FOR INSERT
TO public
WITH CHECK (
  category_id IS NULL OR public.can_manage_category(category_id, auth.uid()::uuid)
);

CREATE POLICY "Líderes podem editar eventos"
ON public.payment_events
FOR UPDATE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
  OR (category_id IS NOT NULL AND public.can_manage_category(category_id, auth.uid()::uuid))
);

CREATE POLICY "Líderes podem deletar eventos"
ON public.payment_events
FOR DELETE
TO public
USING (
  public.is_group_leadership(group_id, auth.uid()::uuid)
  OR (category_id IS NOT NULL AND public.can_manage_category(category_id, auth.uid()::uuid))
);

-- CORRIGIR RLS: member_payments
DROP POLICY IF EXISTS "Temporary public read access for member payments" ON public.member_payments;
DROP POLICY IF EXISTS "Temporary public write access for member payments" ON public.member_payments;
DROP POLICY IF EXISTS "Temporary public update access for member payments" ON public.member_payments;
DROP POLICY IF EXISTS "Temporary public delete access for member payments" ON public.member_payments;

CREATE POLICY "Ver pagamentos do próprio grupo"
ON public.member_payments
FOR SELECT
TO public
USING (
  payment_event_id IN (
    SELECT pe.id FROM public.payment_events pe
    WHERE pe.group_id IN (
      SELECT group_id FROM public.members WHERE id = auth.uid()::uuid
    )
  )
);

CREATE POLICY "Líderes podem registrar pagamentos"
ON public.member_payments
FOR INSERT
TO public
WITH CHECK (
  payment_event_id IN (
    SELECT pe.id FROM public.payment_events pe
    WHERE public.is_group_leadership(pe.group_id, auth.uid()::uuid)
      OR (pe.category_id IS NOT NULL AND public.can_manage_category(pe.category_id, auth.uid()::uuid))
  )
);

CREATE POLICY "Líderes podem atualizar pagamentos"
ON public.member_payments
FOR UPDATE
TO public
USING (
  payment_event_id IN (
    SELECT pe.id FROM public.payment_events pe
    WHERE public.is_group_leadership(pe.group_id, auth.uid()::uuid)
      OR (pe.category_id IS NOT NULL AND public.can_manage_category(pe.category_id, auth.uid()::uuid))
  )
);

CREATE POLICY "Líderes podem deletar pagamentos"
ON public.member_payments
FOR DELETE
TO public
USING (
  payment_event_id IN (
    SELECT pe.id FROM public.payment_events pe
    WHERE public.is_group_leadership(pe.group_id, auth.uid()::uuid)
      OR (pe.category_id IS NOT NULL AND public.can_manage_category(pe.category_id, auth.uid()::uuid))
  )
);

-- CORRIGIR RLS: groups (manter acesso público para leitura mas restringir modificações)
DROP POLICY IF EXISTS "Enable delete for all users" ON public.groups;
DROP POLICY IF EXISTS "Enable insert for all users" ON public.groups;
DROP POLICY IF EXISTS "Enable update for all users" ON public.groups;

CREATE POLICY "Qualquer um pode ver grupos"
ON public.groups
FOR SELECT
TO public
USING (true);

CREATE POLICY "Apenas sistema pode criar grupos"
ON public.groups
FOR INSERT
TO public
WITH CHECK (false);

CREATE POLICY "Líderes podem editar seu grupo"
ON public.groups
FOR UPDATE
TO public
USING (
  public.is_group_leadership(id, auth.uid()::uuid)
);

CREATE POLICY "Líderes podem deletar seu grupo"
ON public.groups
FOR DELETE
TO public
USING (
  public.is_group_leadership(id, auth.uid()::uuid)
);
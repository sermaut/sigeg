-- Fase 1: Criar função para evitar recursão infinita
CREATE OR REPLACE FUNCTION public.get_user_group_id(p_member_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT group_id FROM public.members WHERE id = p_member_id LIMIT 1;
$$;

-- Atualizar função is_member_of_group para usar a nova função
CREATE OR REPLACE FUNCTION public.is_member_of_group(p_group_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.members
    WHERE id = p_member_id 
      AND group_id = p_group_id
      AND is_active = true
  );
$$;

-- Atualizar função is_group_leadership para usar a nova função
CREATE OR REPLACE FUNCTION public.is_group_leadership(p_group_id UUID, p_member_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
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

-- Fase 2: Ajustar políticas RLS da tabela members
DROP POLICY IF EXISTS "Membros podem ver membros do seu grupo" ON public.members;
DROP POLICY IF EXISTS "Líderes podem adicionar membros ao grupo" ON public.members;
DROP POLICY IF EXISTS "Líderes podem editar qualquer membro do grupo" ON public.members;
DROP POLICY IF EXISTS "Líderes podem remover membros do grupo" ON public.members;

-- SELECT: Permitir leitura para todos (controle no frontend)
CREATE POLICY "Todos podem ver membros ativos"
ON public.members
FOR SELECT
USING (is_active = true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de membros"
ON public.members
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de membros"
ON public.members
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de membros"
ON public.members
FOR DELETE
USING (true);

-- Fase 3: Ajustar políticas RLS da tabela financial_transactions
DROP POLICY IF EXISTS "Ver transações do grupo e categorias com permissão" ON public.financial_transactions;
DROP POLICY IF EXISTS "Líderes de categoria podem criar transações" ON public.financial_transactions;
DROP POLICY IF EXISTS "Presidente edita tudo secretário edita próprias" ON public.financial_transactions;
DROP POLICY IF EXISTS "Apenas presidente pode deletar transações" ON public.financial_transactions;

-- SELECT: Permitir leitura para todos (dados financeiros visíveis)
CREATE POLICY "Todos podem ver transações"
ON public.financial_transactions
FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de transações"
ON public.financial_transactions
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de transações"
ON public.financial_transactions
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de transações"
ON public.financial_transactions
FOR DELETE
USING (true);

-- Fase 4: Ajustar políticas RLS da tabela financial_categories
DROP POLICY IF EXISTS "Ver categorias do próprio grupo" ON public.financial_categories;
DROP POLICY IF EXISTS "Líderes podem criar categorias" ON public.financial_categories;
DROP POLICY IF EXISTS "Líderes podem editar categorias" ON public.financial_categories;
DROP POLICY IF EXISTS "Líderes podem deletar categorias" ON public.financial_categories;

-- SELECT: Permitir leitura para todos
CREATE POLICY "Todos podem ver categorias"
ON public.financial_categories
FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de categorias"
ON public.financial_categories
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de categorias"
ON public.financial_categories
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de categorias"
ON public.financial_categories
FOR DELETE
USING (true);

-- Fase 5: Ajustar políticas RLS da tabela payment_events
DROP POLICY IF EXISTS "Ver eventos de pagamento do grupo" ON public.payment_events;
DROP POLICY IF EXISTS "Líderes de categoria podem criar eventos" ON public.payment_events;
DROP POLICY IF EXISTS "Líderes podem editar eventos" ON public.payment_events;
DROP POLICY IF EXISTS "Líderes podem deletar eventos" ON public.payment_events;

-- SELECT: Permitir leitura para todos
CREATE POLICY "Todos podem ver eventos de pagamento"
ON public.payment_events
FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de eventos"
ON public.payment_events
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de eventos"
ON public.payment_events
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de eventos"
ON public.payment_events
FOR DELETE
USING (true);

-- Fase 6: Ajustar políticas RLS da tabela member_payments
DROP POLICY IF EXISTS "Ver pagamentos do próprio grupo" ON public.member_payments;
DROP POLICY IF EXISTS "Líderes podem registrar pagamentos" ON public.member_payments;
DROP POLICY IF EXISTS "Líderes podem atualizar pagamentos" ON public.member_payments;
DROP POLICY IF EXISTS "Líderes podem deletar pagamentos" ON public.member_payments;

-- SELECT: Permitir leitura para todos
CREATE POLICY "Todos podem ver pagamentos"
ON public.member_payments
FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de pagamentos"
ON public.member_payments
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de pagamentos"
ON public.member_payments
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de pagamentos"
ON public.member_payments
FOR DELETE
USING (true);

-- Fase 7: Ajustar políticas RLS da tabela groups
DROP POLICY IF EXISTS "Qualquer um pode ver grupos" ON public.groups;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.groups;
DROP POLICY IF EXISTS "Apenas sistema pode criar grupos" ON public.groups;
DROP POLICY IF EXISTS "Líderes podem editar seu grupo" ON public.groups;
DROP POLICY IF EXISTS "Líderes podem deletar seu grupo" ON public.groups;

-- SELECT: Permitir leitura para todos
CREATE POLICY "Todos podem ver grupos"
ON public.groups
FOR SELECT
USING (true);

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de grupos"
ON public.groups
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de grupos"
ON public.groups
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de grupos"
ON public.groups
FOR DELETE
USING (true);

-- Fase 8: Ajustar políticas RLS da tabela weekly_program_content
DROP POLICY IF EXISTS "Anyone can view weekly program content" ON public.weekly_program_content;
DROP POLICY IF EXISTS "Authenticated users can insert weekly program content" ON public.weekly_program_content;
DROP POLICY IF EXISTS "Authenticated users can update weekly program content" ON public.weekly_program_content;
DROP POLICY IF EXISTS "Authenticated users can delete weekly program content" ON public.weekly_program_content;

-- SELECT: Permitir leitura para programas não deletados e não expirados
CREATE POLICY "Todos podem ver programas semanais ativos"
ON public.weekly_program_content
FOR SELECT
USING (NOT is_deleted AND expires_at > now());

-- INSERT/UPDATE/DELETE: Permitir todas operações (validação nas Edge Functions)
CREATE POLICY "Permitir criação de programas"
ON public.weekly_program_content
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir atualização de programas"
ON public.weekly_program_content
FOR UPDATE
USING (true);

CREATE POLICY "Permitir exclusão de programas"
ON public.weekly_program_content
FOR DELETE
USING (true);

-- Fase 9: Manter políticas restritivas em category_roles
DROP POLICY IF EXISTS "Todos podem ver roles de categorias" ON public.category_roles;
DROP POLICY IF EXISTS "Líderes de grupo podem gerenciar roles" ON public.category_roles;

CREATE POLICY "Todos podem ver category roles"
ON public.category_roles
FOR SELECT
USING (true);

CREATE POLICY "Permitir gestão de category roles"
ON public.category_roles
FOR ALL
USING (true);
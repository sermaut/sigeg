-- Criar tabela para notificações de atribuição de líderes
CREATE TABLE IF NOT EXISTS public.category_role_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id uuid NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.financial_categories(id) ON DELETE CASCADE,
  role text NOT NULL,
  assigned_by uuid REFERENCES public.members(id) ON DELETE SET NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Criar índices para performance
CREATE INDEX idx_category_role_notifications_member ON public.category_role_notifications(member_id);
CREATE INDEX idx_category_role_notifications_unread ON public.category_role_notifications(member_id, is_read);

-- Habilitar RLS
ALTER TABLE public.category_role_notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Membros podem ver suas próprias notificações
CREATE POLICY "Members can view their own notifications"
ON public.category_role_notifications FOR SELECT
USING (true);

-- Policy: Todos podem inserir notificações
CREATE POLICY "Anyone can insert notifications"
ON public.category_role_notifications FOR INSERT
WITH CHECK (true);

-- Policy: Membros podem atualizar suas notificações
CREATE POLICY "Members can update their notifications"
ON public.category_role_notifications FOR UPDATE
USING (true);

-- Criar função para verificar acesso a categoria (incluindo admins)
CREATE OR REPLACE FUNCTION public.can_access_financial_category(
  p_category_id uuid,
  p_member_id uuid
) RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se é líder da categoria
  IF EXISTS (
    SELECT 1 FROM public.category_roles
    WHERE category_id = p_category_id
      AND member_id = p_member_id
      AND is_active = true
  ) THEN
    RETURN true;
  END IF;
  
  -- Verificar se é líder do grupo
  IF EXISTS (
    SELECT 1 FROM public.financial_categories fc
    JOIN public.groups g ON fc.group_id = g.id
    WHERE fc.id = p_category_id
      AND (
        g.president_id = p_member_id OR
        g.vice_president_1_id = p_member_id OR
        g.vice_president_2_id = p_member_id
      )
  ) THEN
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;
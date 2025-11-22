-- FASE 2: Corrigir triggers e adicionar verificação de existência

-- Remover trigger se existir e recriar
DROP TRIGGER IF EXISTS create_financial_categories_trigger ON public.groups;

-- Recriar a função com tratamento de erro melhorado
CREATE OR REPLACE FUNCTION public.create_default_financial_categories()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Inserir categorias apenas se não existirem
  INSERT INTO public.financial_categories (group_id, name, description, total_balance, is_locked)
  SELECT NEW.id, cat.name, cat.description, 0, false
  FROM (
    VALUES 
      ('Apoio ao Grupo', 'Registros de apoio ao grupo'),
      ('Comissão de Desenvolvimento', 'Registros da comissão de desenvolvimento'),
      ('Comissão de Viagens', 'Registros da comissão de viagens'),
      ('Grupo em Geral', 'Registros gerais do grupo')
  ) AS cat(name, description)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.financial_categories fc
    WHERE fc.group_id = NEW.id AND fc.name = cat.name
  );
  
  RETURN NEW;
END;
$$;

-- Recriar trigger com verificação de existência
CREATE TRIGGER create_financial_categories_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_financial_categories();
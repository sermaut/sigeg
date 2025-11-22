-- Fase 1.1: Criar função para adicionar categorias financeiras padrão
CREATE OR REPLACE FUNCTION public.create_default_financial_categories()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir as 4 categorias padrão para o novo grupo
  INSERT INTO public.financial_categories (group_id, name, description, total_balance, is_locked)
  VALUES
    (NEW.id, 'Apoio ao Grupo', 'Registros de apoio ao grupo', 0, false),
    (NEW.id, 'Comissão de Desenvolvimento', 'Registros da comissão de desenvolvimento', 0, false),
    (NEW.id, 'Comissão de Viagens', 'Registros da comissão de viagens', 0, false),
    (NEW.id, 'Grupo em Geral', 'Registros gerais do grupo', 0, false);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Criar trigger para executar após inserir novo grupo
CREATE TRIGGER create_financial_categories_trigger
  AFTER INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_financial_categories();

-- Fase 1.2: Popular grupos existentes com as categorias padrão
INSERT INTO public.financial_categories (group_id, name, description, total_balance, is_locked)
SELECT 
  g.id,
  cat.name,
  cat.description,
  0,
  false
FROM public.groups g
CROSS JOIN (
  VALUES 
    ('Apoio ao Grupo', 'Registros de apoio ao grupo'),
    ('Comissão de Desenvolvimento', 'Registros da comissão de desenvolvimento'),
    ('Comissão de Viagens', 'Registros da comissão de viagens'),
    ('Grupo em Geral', 'Registros gerais do grupo')
) AS cat(name, description)
WHERE NOT EXISTS (
  SELECT 1 FROM public.financial_categories fc
  WHERE fc.group_id = g.id AND fc.name = cat.name
);
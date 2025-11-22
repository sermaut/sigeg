-- FASE 1: Sistema de Login por Código de Grupo

-- 1.1: Criar função para gerar códigos únicos de grupo
CREATE OR REPLACE FUNCTION public.generate_group_code()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    -- Gerar código no formato XXXX-XX (4 letras + 2 letras)
    new_code := 
      substr(md5(random()::text), 1, 4) || '-' || 
      substr(md5(random()::text), 1, 2);
    new_code := upper(new_code);
    
    -- Verificar se código já existe
    SELECT EXISTS(
      SELECT 1 FROM public.groups 
      WHERE access_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- 1.2: Atualizar grupos sem código de acesso
UPDATE public.groups
SET access_code = public.generate_group_code()
WHERE access_code IS NULL;

-- 1.3: Tornar access_code obrigatório
ALTER TABLE public.groups
ALTER COLUMN access_code SET NOT NULL;

-- 1.4: Criar função para trigger
CREATE OR REPLACE FUNCTION public.set_group_access_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.access_code IS NULL THEN
    NEW.access_code := public.generate_group_code();
  END IF;
  RETURN NEW;
END;
$$;

-- 1.5: Criar trigger para gerar código automaticamente
DROP TRIGGER IF EXISTS set_group_code_trigger ON public.groups;
CREATE TRIGGER set_group_code_trigger
  BEFORE INSERT ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_group_access_code();
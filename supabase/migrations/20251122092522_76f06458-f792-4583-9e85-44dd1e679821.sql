-- FASE 1: Normalizar todos os códigos existentes
UPDATE public.members 
SET member_code = UPPER(TRIM(member_code))
WHERE member_code IS NOT NULL AND member_code != UPPER(TRIM(member_code));

UPDATE public.groups 
SET access_code = UPPER(TRIM(access_code))
WHERE access_code IS NOT NULL AND access_code != UPPER(TRIM(access_code));

UPDATE public.system_admins 
SET access_code = UPPER(TRIM(access_code))
WHERE access_code IS NOT NULL AND access_code != UPPER(TRIM(access_code));

-- FASE 2: Criar funções de normalização
CREATE OR REPLACE FUNCTION public.normalize_member_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.member_code IS NOT NULL THEN
    NEW.member_code := UPPER(TRIM(NEW.member_code));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.normalize_group_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NOT NULL THEN
    NEW.access_code := UPPER(TRIM(NEW.access_code));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.normalize_admin_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.access_code IS NOT NULL THEN
    NEW.access_code := UPPER(TRIM(NEW.access_code));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- FASE 3: Criar triggers
CREATE TRIGGER normalize_member_code_trigger
  BEFORE INSERT OR UPDATE OF member_code ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_member_code();

CREATE TRIGGER normalize_group_code_trigger
  BEFORE INSERT OR UPDATE OF access_code ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_group_code();

CREATE TRIGGER normalize_admin_code_trigger
  BEFORE INSERT OR UPDATE OF access_code ON public.system_admins
  FOR EACH ROW
  EXECUTE FUNCTION public.normalize_admin_code();
-- Fix function search path for generate_admin_code
CREATE OR REPLACE FUNCTION public.generate_admin_code(prefix text DEFAULT 'ADM'::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
DECLARE
  new_code text;
  code_exists boolean;
BEGIN
  LOOP
    new_code := prefix || '_' || LPAD(FLOOR(RANDOM() * 10000)::text, 4, '0');
    
    SELECT EXISTS(
      SELECT 1 FROM public.system_admins 
      WHERE access_code = new_code
    ) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$function$;

-- Fix function search path for update_category_balance
CREATE OR REPLACE FUNCTION public.update_category_balance()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- For INSERT and UPDATE
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.financial_categories 
    SET total_balance = (
      SELECT COALESCE(
        SUM(CASE 
          WHEN type = 'entrada' THEN amount 
          WHEN type = 'saida' THEN -amount 
          ELSE 0 
        END), 0)
      FROM public.financial_transactions 
      WHERE category_id = NEW.category_id
    )
    WHERE id = NEW.category_id;
    RETURN NEW;
  END IF;
  
  -- For DELETE
  IF TG_OP = 'DELETE' THEN
    UPDATE public.financial_categories 
    SET total_balance = (
      SELECT COALESCE(
        SUM(CASE 
          WHEN type = 'entrada' THEN amount 
          WHEN type = 'saida' THEN -amount 
          ELSE 0 
        END), 0)
      FROM public.financial_transactions 
      WHERE category_id = OLD.category_id
    )
    WHERE id = OLD.category_id;
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$function$;
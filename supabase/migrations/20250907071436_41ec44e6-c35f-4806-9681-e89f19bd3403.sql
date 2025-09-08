-- Create trigger function to validate member limits based on group plan
CREATE OR REPLACE FUNCTION public.validate_member_limit()
RETURNS TRIGGER AS $$
DECLARE
  current_member_count INTEGER;
  plan_limit INTEGER;
  group_plan_name TEXT;
BEGIN
  -- Get current member count for the group (excluding soft deleted members)
  SELECT COUNT(*)
  INTO current_member_count
  FROM public.members
  WHERE group_id = NEW.group_id AND is_active = true;
  
  -- Get plan limit for the group
  SELECT mp.max_members, mp.name
  INTO plan_limit, group_plan_name
  FROM public.groups g
  LEFT JOIN public.monthly_plans mp ON g.plan_id = mp.id
  WHERE g.id = NEW.group_id;
  
  -- If no plan is set, allow unlimited members
  IF plan_limit IS NULL THEN
    RETURN NEW;
  END IF;
  
  -- For INSERT operations, check if adding would exceed limit
  IF TG_OP = 'INSERT' THEN
    IF current_member_count >= plan_limit THEN
      RAISE EXCEPTION 'Limite de membros excedido. O plano % permite apenas % membros e o grupo já tem % membros ativos.', 
        group_plan_name, plan_limit, current_member_count;
    END IF;
  END IF;
  
  -- For UPDATE operations, check if reactivating would exceed limit
  IF TG_OP = 'UPDATE' THEN
    -- If changing from inactive to active
    IF OLD.is_active = false AND NEW.is_active = true THEN
      IF current_member_count >= plan_limit THEN
        RAISE EXCEPTION 'Limite de membros excedido. O plano % permite apenas % membros e o grupo já tem % membros ativos.', 
          group_plan_name, plan_limit, current_member_count;
      END IF;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to validate member limits on insert and update
CREATE TRIGGER validate_member_limit_trigger
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_member_limit();
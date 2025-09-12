-- Fix RLS policies to be more secure and specific

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Enable all operations for financial_categories" ON public.financial_categories;
DROP POLICY IF EXISTS "Enable all operations for financial_transactions" ON public.financial_transactions;
DROP POLICY IF EXISTS "Enable all operations for member_payments" ON public.member_payments;
DROP POLICY IF EXISTS "Enable all operations for payment_events" ON public.payment_events;

-- Create more secure policies for financial_categories
CREATE POLICY "Admin can manage financial categories" ON public.financial_categories
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.system_admins 
    WHERE access_code = current_setting('request.jwt.claims', true)::json->>'access_code'
    AND is_active = true
  )
);

CREATE POLICY "Group leaders can view their group financial categories" ON public.financial_categories
FOR SELECT USING (
  group_id IN (
    SELECT g.id FROM public.groups g
    JOIN public.members m ON (
      g.president_id = m.id OR 
      g.vice_president_1_id = m.id OR 
      g.vice_president_2_id = m.id OR
      g.secretary_1_id = m.id OR
      g.secretary_2_id = m.id
    )
    WHERE m.member_code = current_setting('request.jwt.claims', true)::json->>'member_code'
  )
);

-- Create secure policies for financial_transactions
CREATE POLICY "Admin can manage financial transactions" ON public.financial_transactions
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.system_admins 
    WHERE access_code = current_setting('request.jwt.claims', true)::json->>'access_code'
    AND is_active = true
  )
);

CREATE POLICY "Group leaders can manage their group financial transactions" ON public.financial_transactions
FOR ALL USING (
  category_id IN (
    SELECT fc.id FROM public.financial_categories fc
    JOIN public.groups g ON fc.group_id = g.id
    JOIN public.members m ON (
      g.president_id = m.id OR 
      g.vice_president_1_id = m.id OR 
      g.vice_president_2_id = m.id OR
      g.secretary_1_id = m.id OR
      g.secretary_2_id = m.id
    )
    WHERE m.member_code = current_setting('request.jwt.claims', true)::json->>'member_code'
  )
);

-- Create secure policies for payment_events
CREATE POLICY "Admin can manage payment events" ON public.payment_events
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.system_admins 
    WHERE access_code = current_setting('request.jwt.claims', true)::json->>'access_code'
    AND is_active = true
  )
);

CREATE POLICY "Group leaders can manage their group payment events" ON public.payment_events
FOR ALL USING (
  group_id IN (
    SELECT g.id FROM public.groups g
    JOIN public.members m ON (
      g.president_id = m.id OR 
      g.vice_president_1_id = m.id OR 
      g.vice_president_2_id = m.id OR
      g.secretary_1_id = m.id OR
      g.secretary_2_id = m.id
    )
    WHERE m.member_code = current_setting('request.jwt.claims', true)::json->>'member_code'
  )
);

-- Create secure policies for member_payments
CREATE POLICY "Admin can manage member payments" ON public.member_payments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.system_admins 
    WHERE access_code = current_setting('request.jwt.claims', true)::json->>'access_code'
    AND is_active = true
  )
);

CREATE POLICY "Group leaders can manage their group member payments" ON public.member_payments
FOR ALL USING (
  payment_event_id IN (
    SELECT pe.id FROM public.payment_events pe
    JOIN public.groups g ON pe.group_id = g.id
    JOIN public.members m ON (
      g.president_id = m.id OR 
      g.vice_president_1_id = m.id OR 
      g.vice_president_2_id = m.id OR
      g.secretary_1_id = m.id OR
      g.secretary_2_id = m.id
    )
    WHERE m.member_code = current_setting('request.jwt.claims', true)::json->>'member_code'
  )
);

-- Create view policy for members to see their own payments
CREATE POLICY "Members can view their own payments" ON public.member_payments
FOR SELECT USING (
  member_id IN (
    SELECT m.id FROM public.members m
    WHERE m.member_code = current_setting('request.jwt.claims', true)::json->>'member_code'
  )
);
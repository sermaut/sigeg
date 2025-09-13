-- Temporarily allow public access to payment events and member payments
-- This will be replaced with proper auth-based policies later

-- Drop existing restrictive policies for payment_events
DROP POLICY IF EXISTS "Admin can manage payment events" ON payment_events;
DROP POLICY IF EXISTS "Group leaders can manage their group payment events" ON payment_events;

-- Add temporary public policies for payment_events
CREATE POLICY "Temporary public read access for payment events" 
ON payment_events FOR SELECT 
USING (true);

CREATE POLICY "Temporary public write access for payment events" 
ON payment_events FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Temporary public update access for payment events" 
ON payment_events FOR UPDATE 
USING (true);

CREATE POLICY "Temporary public delete access for payment events" 
ON payment_events FOR DELETE 
USING (true);

-- Drop existing restrictive policies for member_payments
DROP POLICY IF EXISTS "Admin can manage member payments" ON member_payments;
DROP POLICY IF EXISTS "Group leaders can manage their group member payments" ON member_payments;
DROP POLICY IF EXISTS "Members can view their own payments" ON member_payments;

-- Add temporary public policies for member_payments
CREATE POLICY "Temporary public read access for member payments" 
ON member_payments FOR SELECT 
USING (true);

CREATE POLICY "Temporary public write access for member payments" 
ON member_payments FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Temporary public update access for member payments" 
ON member_payments FOR UPDATE 
USING (true);

CREATE POLICY "Temporary public delete access for member payments" 
ON member_payments FOR DELETE 
USING (true);
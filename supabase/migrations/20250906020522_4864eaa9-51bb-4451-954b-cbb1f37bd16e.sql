-- Create financial categories table
CREATE TABLE public.financial_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  total_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial transactions table
CREATE TABLE public.financial_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id UUID NOT NULL REFERENCES public.financial_categories(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('entrada', 'saida')),
  amount DECIMAL(15,2) NOT NULL,
  description TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create payment events table
CREATE TABLE public.payment_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  amount_to_pay DECIMAL(15,2) NOT NULL,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create member payments table
CREATE TABLE public.member_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  payment_event_id UUID NOT NULL REFERENCES public.payment_events(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  amount_paid DECIMAL(15,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(payment_event_id, member_id)
);

-- Enable Row Level Security
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_payments ENABLE ROW LEVEL SECURITY;

-- Create policies for financial_categories
CREATE POLICY "Enable all operations for financial_categories" 
ON public.financial_categories FOR ALL USING (true);

-- Create policies for financial_transactions
CREATE POLICY "Enable all operations for financial_transactions" 
ON public.financial_transactions FOR ALL USING (true);

-- Create policies for payment_events
CREATE POLICY "Enable all operations for payment_events" 
ON public.payment_events FOR ALL USING (true);

-- Create policies for member_payments
CREATE POLICY "Enable all operations for member_payments" 
ON public.member_payments FOR ALL USING (true);

-- Create triggers for updated_at
CREATE TRIGGER update_financial_categories_updated_at
BEFORE UPDATE ON public.financial_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at
BEFORE UPDATE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payment_events_updated_at
BEFORE UPDATE ON public.payment_events
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_member_payments_updated_at
BEFORE UPDATE ON public.member_payments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to update category balance when transactions change
CREATE OR REPLACE FUNCTION public.update_category_balance()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Create trigger for automatic balance calculation
CREATE TRIGGER update_balance_on_transaction_change
AFTER INSERT OR UPDATE OR DELETE ON public.financial_transactions
FOR EACH ROW
EXECUTE FUNCTION public.update_category_balance();

-- Insert default financial categories for existing groups
INSERT INTO public.financial_categories (group_id, name, description)
SELECT 
  id,
  category_name,
  category_description
FROM public.groups
CROSS JOIN (
  VALUES 
    ('Comissão de Desenvolvimento', 'Registros da comissão de desenvolvimento'),
    ('Comissão de Viagens', 'Registros da comissão de viagens'),
    ('Apoio ao Grupo', 'Registros de apoio ao grupo'),
    ('Grupo em Geral', 'Registros gerais do grupo')
) AS categories(category_name, category_description);
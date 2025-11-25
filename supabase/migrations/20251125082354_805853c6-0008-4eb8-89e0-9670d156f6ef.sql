-- Corrigir RLS policies para financial_transactions
-- Remover policies problemáticas
DROP POLICY IF EXISTS "Líderes podem ver transações da categoria" ON public.financial_transactions;
DROP POLICY IF EXISTS "Presidente e Secretário podem criar transações" ON public.financial_transactions;
DROP POLICY IF EXISTS "Presidente edita tudo, Secretário edita suas próprias" ON public.financial_transactions;
DROP POLICY IF EXISTS "Apenas Presidente pode deletar transações" ON public.financial_transactions;

-- Políticas temporárias mais permissivas para debugging
CREATE POLICY "Temporary public read access for financial transactions"
ON public.financial_transactions
FOR SELECT
TO public
USING (true);

CREATE POLICY "Temporary public write access for financial transactions"
ON public.financial_transactions
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Temporary public update access for financial transactions"
ON public.financial_transactions
FOR UPDATE
TO public
USING (true);

CREATE POLICY "Temporary public delete access for financial transactions"
ON public.financial_transactions
FOR DELETE
TO public
USING (true);
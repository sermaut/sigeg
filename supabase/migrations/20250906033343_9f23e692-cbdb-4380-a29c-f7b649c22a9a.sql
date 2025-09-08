
-- Corrigir tipo da coluna para aceitar texto (nome de quem criou)
ALTER TABLE public.payment_events
  ALTER COLUMN created_by TYPE text
  USING created_by::text;

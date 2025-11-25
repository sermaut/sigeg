-- Criar tabela de partituras musicais
CREATE TABLE IF NOT EXISTS public.sheet_music (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT,
  category TEXT NOT NULL CHECK (category IN ('alegria', 'lamentacao', 'morte', 'perdao', 'outros')),
  event_type TEXT,
  partition TEXT CHECK (partition IN ('soprano', 'contralto', 'tenor', 'baixo', 'todos', 'instrumental')),
  file_url TEXT NOT NULL,
  file_size INTEGER,
  uploaded_by UUID REFERENCES public.members(id),
  group_id UUID REFERENCES public.groups(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  download_count INTEGER DEFAULT 0
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sheet_music_category ON public.sheet_music(category);
CREATE INDEX IF NOT EXISTS idx_sheet_music_partition ON public.sheet_music(partition);
CREATE INDEX IF NOT EXISTS idx_sheet_music_group ON public.sheet_music(group_id);
CREATE INDEX IF NOT EXISTS idx_sheet_music_search ON public.sheet_music USING gin(to_tsvector('portuguese', title || ' ' || COALESCE(author, '')));

-- RLS para sheet_music
ALTER TABLE public.sheet_music ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem visualizar partituras ativas"
  ON public.sheet_music FOR SELECT
  USING (is_active = true);

CREATE POLICY "Membros podem fazer upload de partituras"
  ON public.sheet_music FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Criadores podem atualizar suas partituras"
  ON public.sheet_music FOR UPDATE
  USING (true);

CREATE POLICY "Criadores podem deletar suas partituras"
  ON public.sheet_music FOR DELETE
  USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_sheet_music_updated_at
  BEFORE UPDATE ON public.sheet_music
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Criar tabela de notificações
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_id UUID NOT NULL,
  recipient_type TEXT NOT NULL CHECK (recipient_type IN ('member', 'group', 'admin')),
  type TEXT NOT NULL CHECK (type IN ('rehearsal_reminder', 'payment_due', 'new_program', 'role_assignment', 'general')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON public.notifications(recipient_id, recipient_type);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(recipient_id, is_read) WHERE NOT is_read;
CREATE INDEX IF NOT EXISTS idx_notifications_scheduled ON public.notifications(scheduled_for) WHERE scheduled_for IS NOT NULL AND sent_at IS NULL;

-- RLS para notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver suas próprias notificações"
  ON public.notifications FOR SELECT
  USING (true);

CREATE POLICY "Sistema pode criar notificações"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Usuários podem atualizar suas notificações"
  ON public.notifications FOR UPDATE
  USING (true);

CREATE POLICY "Usuários podem deletar suas notificações"
  ON public.notifications FOR DELETE
  USING (true);

-- Criar bucket de storage para partituras
INSERT INTO storage.buckets (id, name, public)
VALUES ('sheet-music-pdfs', 'sheet-music-pdfs', false)
ON CONFLICT (id) DO NOTHING;

-- RLS policies para storage de partituras
CREATE POLICY "Membros podem visualizar partituras"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'sheet-music-pdfs');

CREATE POLICY "Membros podem fazer upload de partituras"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'sheet-music-pdfs');

CREATE POLICY "Membros podem atualizar partituras"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'sheet-music-pdfs');

CREATE POLICY "Membros podem deletar partituras"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'sheet-music-pdfs');

-- Habilitar realtime para notificações
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
-- Adicionar colunas para categorização de programas semanais
ALTER TABLE public.weekly_program_content 
ADD COLUMN category TEXT NOT NULL DEFAULT 'hino' CHECK (category IN ('hino', 'acompanhamento')),
ADD COLUMN items JSONB DEFAULT '[]'::jsonb;

-- Tornar image_url opcional (para acompanhamentos que não têm imagens)
ALTER TABLE public.weekly_program_content 
ALTER COLUMN image_url DROP NOT NULL;

-- Comentário explicativo
COMMENT ON COLUMN public.weekly_program_content.category IS 'Tipo de programa: hino (até 5 imagens+áudio) ou acompanhamento (até 4 áudios sem imagem)';
COMMENT ON COLUMN public.weekly_program_content.items IS 'Array JSON com itens do programa. Para hinos: [{subtitle, image_url, audio_url}]. Para acompanhamentos: [{subtitle, audio_url}]';
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Language = 'pt' | 'fr';

export function useTranslate() {
  const [isTranslating, setIsTranslating] = useState(false);

  const translate = async (
    text: string, 
    source: Language, 
    target: Language
  ): Promise<string | null> => {
    if (!text.trim()) return null;
    
    setIsTranslating(true);
    try {
      const { data, error } = await supabase.functions.invoke('translate', {
        body: { text, source, target }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      
      return data.translatedText;
    } catch (error: any) {
      toast.error(error.message || 'Erro ao traduzir texto');
      console.error('Translation error:', error);
      return null;
    } finally {
      setIsTranslating(false);
    }
  };

  return { translate, isTranslating };
}

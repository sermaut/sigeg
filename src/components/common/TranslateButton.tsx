import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Languages, Loader2 } from 'lucide-react';
import { useTranslate } from '@/hooks/useTranslate';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TranslateButtonProps {
  text: string;
  onTranslated: (translatedText: string) => void;
  currentLanguage?: 'pt' | 'fr';
  size?: 'sm' | 'default' | 'lg' | 'icon';
}

export function TranslateButton({ 
  text, 
  onTranslated, 
  currentLanguage = 'pt',
  size = 'sm'
}: TranslateButtonProps) {
  const { translate, isTranslating } = useTranslate();
  const [targetLang, setTargetLang] = useState<'pt' | 'fr'>(
    currentLanguage === 'pt' ? 'fr' : 'pt'
  );

  const handleTranslate = async () => {
    const sourceLang = targetLang === 'pt' ? 'fr' : 'pt';
    const result = await translate(text, sourceLang, targetLang);
    if (result) {
      onTranslated(result);
      setTargetLang(targetLang === 'pt' ? 'fr' : 'pt');
    }
  };

  const targetLabel = targetLang === 'pt' ? 'Português' : 'Français';
  const flag = targetLang === 'pt' ? '🇵🇹' : '🇫🇷';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size={size}
          onClick={handleTranslate}
          disabled={isTranslating || !text.trim()}
          className="gap-1"
        >
          {isTranslating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Languages className="h-4 w-4" />
          )}
          {flag}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Traduzir para {targetLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}

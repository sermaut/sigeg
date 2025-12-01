import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function GlobalLanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  const flag = language === 'pt' ? '🇫🇷' : '🇵🇹';
  const targetLabel = language === 'pt' ? 'Français' : 'Português';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleLanguage}
          className="w-8 h-8 md:w-10 md:h-10 text-lg hover:bg-cyan-700/30 
                     hover:scale-110 transition-all duration-300 relative group"
          title={t('language.toggle')}
        >
          <span className="text-base md:text-lg">{flag}</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full 
                          animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Traduzir para {targetLabel}</p>
      </TooltipContent>
    </Tooltip>
  );
}

import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Languages } from 'lucide-react';

export function GlobalLanguageToggle() {
  const { language, toggleLanguage, t } = useLanguage();

  // Show current language flag (PT shows 🇵🇹, FR shows 🇫🇷)
  const flag = language === 'pt' ? '🇵🇹' : '🇫🇷';
  const targetLabel = language === 'pt' ? 'Français' : 'Português';

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="h-8 md:h-10 px-2 md:px-3 text-lg hover:bg-cyan-700/30 
                     hover:scale-105 transition-all duration-300 relative group gap-1"
          title={t('language.toggle')}
        >
          <Languages className="w-4 h-4 text-cyan-300" />
          <span className="text-base md:text-lg">{flag}</span>
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full 
                          animate-pulse opacity-0 group-hover:opacity-100 transition-opacity" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{t('language.toggle')}</p>
      </TooltipContent>
    </Tooltip>
  );
}

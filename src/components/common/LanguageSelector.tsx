import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAppStore } from '@/stores/useAppStore';
import { Languages } from 'lucide-react';
import { useCallback, useMemo } from 'react';

const languages = [
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
] as const;

export function LanguageSelector() {
  const { i18n } = useTranslation();
  const { language, setLanguage } = useAppStore();

  // INSTANT: Memoize language change handler
  const handleLanguageChange = useCallback((langCode: 'pt' | 'fr' | 'en') => {
    // Update store first (persists to localStorage)
    setLanguage(langCode);
    // Then update i18n (triggers re-render)
    i18n.changeLanguage(langCode);
  }, [i18n, setLanguage]);

  // INSTANT: Memoize current language lookup
  const currentLanguage = useMemo(
    () => languages.find(lang => lang.code === language) || languages[0],
    [language]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2 text-white">
          <Languages className="w-5 h-5 text-white" />
          <span className="hidden sm:inline text-white">
            {currentLanguage.flag} {currentLanguage.name}
          </span>
          <span className="sm:hidden">{currentLanguage.flag}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className="gap-2"
          >
            <span>{lang.flag}</span>
            <span>{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
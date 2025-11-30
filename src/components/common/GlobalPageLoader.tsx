import { useTranslation } from 'react-i18next';

// ULTRA-FAST: Minimal loader with CSS-only animation
export function GlobalPageLoader() {
  const { t } = useTranslation();
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
      <div className="flex flex-col items-center gap-2 p-4 rounded-xl bg-card/90 shadow-lg border border-border/30">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-primary rounded-full animate-pulse"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          {t('common.loading')}
        </p>
      </div>
    </div>
  );
}
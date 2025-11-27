import { WaveLoader } from './LoadingIndicators';

export function GlobalPageLoader() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/50 backdrop-blur-[2px] animate-fade-in">
      <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-card/95 shadow-xl border border-border/50">
        <WaveLoader size="lg" />
        <p className="text-sm text-muted-foreground font-medium">
          A carregar...
        </p>
      </div>
    </div>
  );
}

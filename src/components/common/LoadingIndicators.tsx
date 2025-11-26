import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  text?: string;
  size?: "sm" | "md" | "lg";
}

// Pulsing Dots - Estilo moderno com 3 pontos
export function PulsingDots({ className, text, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4"
  };
  
  const dotSize = sizeClasses[size];
  
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="flex items-center gap-2">
        <div className={cn(dotSize, "bg-primary rounded-full animate-pulse-bounce")} 
             style={{ animationDelay: "0s" }} />
        <div className={cn(dotSize, "bg-primary rounded-full animate-pulse-bounce")} 
             style={{ animationDelay: "0.2s" }} />
        <div className={cn(dotSize, "bg-primary rounded-full animate-pulse-bounce")} 
             style={{ animationDelay: "0.4s" }} />
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Wave Loader - Barras animadas estilo microondas/áudio
export function WaveLoader({ className, text, size = "md" }: LoaderProps) {
  const heightClasses = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10"
  };
  
  const widthClasses = {
    sm: "w-1",
    md: "w-1.5",
    lg: "w-2"
  };
  
  const containerHeight = heightClasses[size];
  const barWidth = widthClasses[size];
  
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className={cn("flex items-end gap-1", containerHeight)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(barWidth, "bg-primary rounded-full animate-wave-bar")}
            style={{ animationDelay: `${i * 0.1}s` }}
          />
        ))}
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Spinner moderno com gradiente
export function SpinnerModern({ className, text, size = "md" }: LoaderProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };
  
  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative">
        <div className={cn(
          sizeClasses[size],
          "rounded-full border-2 border-transparent",
          "bg-gradient-to-r from-primary via-primary-glow to-accent bg-clip-border",
          "animate-spin-gradient"
        )}>
          <div className="w-full h-full rounded-full bg-background" />
        </div>
      </div>
      {text && (
        <p className="text-sm text-muted-foreground animate-pulse">{text}</p>
      )}
    </div>
  );
}

// Loading Overlay - Mantém a página visível mas fosca
interface LoadingOverlayProps {
  isLoading: boolean;
  children: React.ReactNode;
  text?: string;
  blur?: "light" | "medium" | "heavy";
  loader?: "wave" | "dots" | "spinner";
}

export function LoadingOverlay({ 
  isLoading, 
  children, 
  text = "Carregando...",
  blur = "medium",
  loader = "wave"
}: LoadingOverlayProps) {
  const blurClasses = {
    light: "backdrop-blur-[1px]",
    medium: "backdrop-blur-[2px]",
    heavy: "backdrop-blur-sm"
  };
  
  const LoaderComponent = loader === "wave" 
    ? WaveLoader 
    : loader === "dots" 
    ? PulsingDots 
    : SpinnerModern;
  
  return (
    <div className="relative">
      {children}
      
      {isLoading && (
        <div 
          className={cn(
            "absolute inset-0 bg-background/70 z-50",
            "flex items-center justify-center",
            "animate-fade-in",
            blurClasses[blur]
          )}
        >
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl bg-card/80 shadow-medium">
            <LoaderComponent size="lg" />
            <p className="text-sm text-muted-foreground font-medium">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// Page Loading Overlay - Para páginas inteiras
export function PageLoadingOverlay({ 
  isLoading, 
  children,
  showCachedData = false
}: { 
  isLoading: boolean; 
  children: React.ReactNode;
  showCachedData?: boolean;
}) {
  return (
    <div className="relative">
      <div className={cn(
        "transition-opacity duration-300",
        isLoading && showCachedData ? "opacity-60" : "opacity-100"
      )}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-50 
                       flex items-center justify-center animate-fade-in">
          <div className="flex flex-col items-center gap-3 p-6 rounded-xl 
                         bg-card shadow-strong border border-border">
            <WaveLoader size="lg" />
            <p className="text-sm text-muted-foreground font-medium">
              {showCachedData ? "Atualizando dados..." : "Carregando..."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Inline Loader - Para uso em botões e componentes pequenos
export function InlineLoader({ className, size = "sm" }: { className?: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  
  return (
    <Loader2 className={cn(sizeClass, "animate-spin", className)} />
  );
}

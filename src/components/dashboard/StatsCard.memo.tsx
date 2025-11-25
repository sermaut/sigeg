import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

// Memoized to prevent unnecessary re-renders
export const StatsCard = memo(function StatsCard({
  title,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  className
}: StatsCardProps) {
  const changeColorClass = {
    positive: 'text-green-600 dark:text-green-400',
    negative: 'text-red-600 dark:text-red-400',
    neutral: 'text-muted-foreground'
  }[changeType];

  return (
    <Card className={cn(
      "card-elevated hover:scale-105 transition-all duration-300 overflow-hidden relative group",
      className
    )}>
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="p-2 bg-primary/10 rounded-lg group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
            {value}
          </p>
          {change && (
            <p className={cn("text-xs font-medium", changeColorClass)}>
              {change}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

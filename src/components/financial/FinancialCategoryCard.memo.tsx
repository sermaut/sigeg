import { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Lock, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

interface FinancialCategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    total_balance: number;
    is_locked: boolean;
  };
  hasAccess: boolean;
  onClick?: () => void;
}

// Memoized to prevent unnecessary re-renders in lists
export const FinancialCategoryCard = memo(function FinancialCategoryCard({
  category,
  hasAccess,
  onClick
}: FinancialCategoryCardProps) {
  const isPositive = category.total_balance > 0;
  const isNegative = category.total_balance < 0;

  return (
    <Card 
      className={cn(
        "card-elevated transition-all duration-300 relative overflow-hidden",
        hasAccess && onClick ? "cursor-pointer hover:scale-105 hover:shadow-glow" : "opacity-60 cursor-not-allowed",
      )}
      onClick={hasAccess && onClick ? onClick : undefined}
    >
      {/* Gradient background based on balance */}
      <div className={cn(
        "absolute inset-0 opacity-5",
        isPositive && "bg-gradient-to-br from-green-500 to-emerald-500",
        isNegative && "bg-gradient-to-br from-red-500 to-orange-500",
        !isPositive && !isNegative && "bg-gradient-to-br from-primary to-accent"
      )} />
      
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg mb-1">
              {category.name}
            </h3>
            {category.description && (
              <p className="text-xs text-muted-foreground line-clamp-2">
                {category.description}
              </p>
            )}
          </div>
          {!hasAccess && (
            <Lock className="w-5 h-5 text-muted-foreground ml-2" />
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            <span className={cn(
              "text-2xl font-bold",
              isPositive && "text-green-600 dark:text-green-400",
              isNegative && "text-red-600 dark:text-red-400",
              !isPositive && !isNegative && "text-foreground"
            )}>
              {category.total_balance.toLocaleString('pt-AO')} Kz
            </span>
          </div>
          
          {isPositive && <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />}
          {isNegative && <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />}
        </div>

        {category.is_locked && (
          <Badge variant="secondary" className="mt-3 text-xs">
            Bloqueada
          </Badge>
        )}
      </CardContent>
    </Card>
  );
});

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface FinancialCategoryCardProps {
  category: {
    id: string;
    name: string;
    description?: string;
    total_balance: number;
  };
  index: number;
  onClick?: () => void;
}

const categoryColors = [
  { bg: "bg-blue-500/75", border: "border-blue-500", text: "text-blue-900" },
  { bg: "bg-green-500/75", border: "border-green-500", text: "text-green-900" },
  { bg: "bg-yellow-500/75", border: "border-yellow-500", text: "text-yellow-900" },
  { bg: "bg-purple-500/75", border: "border-purple-500", text: "text-purple-900" },
  { bg: "bg-red-500/75", border: "border-red-500", text: "text-red-900" },
  { bg: "bg-orange-500/75", border: "border-orange-500", text: "text-orange-900" },
  { bg: "bg-pink-500/75", border: "border-pink-500", text: "text-pink-900" },
  { bg: "bg-cyan-500/75", border: "border-cyan-500", text: "text-cyan-900" },
];

export function FinancialCategoryCard({ category, index, onClick }: FinancialCategoryCardProps) {
  const colorScheme = categoryColors[index % categoryColors.length];
  const balance = Number(category.total_balance);

  const getBalanceIcon = () => {
    if (balance > 0) return <TrendingUp className="w-4 h-4" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getBalanceColor = () => {
    if (balance > 0) return "text-green-600";
    if (balance < 0) return "text-red-600";
    return "text-muted-foreground";
  };

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md border ${colorScheme.border} ${colorScheme.bg} backdrop-blur-sm`}
      onClick={onClick}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className={`font-semibold text-sm ${colorScheme.text}`}>
            {category.name}
          </h3>
          <div className={`flex items-center space-x-1 ${getBalanceColor()}`}>
            {getBalanceIcon()}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className={`text-xl font-bold ${getBalanceColor()}`}>
            {balance.toLocaleString('pt-AO', {
              style: 'currency',
              currency: 'AOA',
              minimumFractionDigits: 2
            })}
          </div>
          
          {category.description && (
            <p className={`text-xs ${colorScheme.text} opacity-80`}>
              {category.description}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
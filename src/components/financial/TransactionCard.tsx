import { TrendingUp, TrendingDown, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TransactionCardProps {
  transaction: {
    id: string;
    description: string;
    amount: number;
    type: string;
    created_at: string;
  };
  onDelete: (id: string) => void;
  canDelete?: boolean;
}

export function TransactionCard({ transaction, onDelete, canDelete = true }: TransactionCardProps) {
  const isIncome = transaction.type === "entrada";
  
  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-md animate-fade-in">
      {/* Gradiente sutil de fundo */}
      <div className={`absolute inset-0 opacity-5 ${
        isIncome ? 'bg-gradient-to-br from-green-500 to-emerald-500' : 'bg-gradient-to-br from-red-500 to-rose-500'
      }`} />
      
      <div className="relative p-4 space-y-3">
        {/* Header com ícone e tipo */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              isIncome ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'
            }`}>
              {isIncome ? (
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
              )}
            </div>
            <div>
              <Badge 
                variant="outline" 
                className={isIncome ? 'border-green-500 text-green-700 dark:text-green-400' : 'border-red-500 text-red-700 dark:text-red-400'}
              >
                {isIncome ? 'Entrada' : 'Saída'}
              </Badge>
            </div>
          </div>
          
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(transaction.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Descrição */}
        <div>
          <h4 className="font-medium text-foreground leading-tight">
            {transaction.description}
          </h4>
        </div>

        {/* Valor e Data */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <span className="text-xs text-muted-foreground">
            {format(new Date(transaction.created_at), "dd MMM yyyy 'às' HH:mm", { locale: ptBR })}
          </span>
          <span className={`text-lg font-bold ${
            isIncome ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {isIncome ? '+' : '-'} {Number(transaction.amount).toLocaleString('pt-AO', { 
              style: 'currency', 
              currency: 'AOA' 
            })}
          </span>
        </div>
      </div>
    </Card>
  );
}

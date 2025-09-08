import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface TransactionsListProps {
  transactions: any[];
  loading: boolean;
  onTransactionDeleted: () => void;
}

export function TransactionsList({ transactions, loading, onTransactionDeleted }: TransactionsListProps) {
  const { toast } = useToast();

  const handleDelete = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: "Transação eliminada com sucesso!",
      });

      onTransactionDeleted();
    } catch (error) {
      console.error("Erro ao eliminar transação:", error);
      toast({
        title: "Erro ao eliminar transação",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-4">Carregando transações...</div>;
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhuma transação encontrada para esta categoria.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h4 className="font-medium">Transações Recentes</h4>
      <div className="space-y-2">
        {transactions.map((transaction) => (
          <div 
            key={transaction.id}
            className="flex items-center justify-between p-3 border rounded-lg"
          >
            <div className="flex items-center gap-3">
              {transaction.type === "entrada" ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <div>
                <p className="font-medium">{transaction.description}</p>
                <p className="text-xs text-muted-foreground">
                  {format(new Date(transaction.created_at), "dd/MM/yyyy 'às' HH:mm")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge 
                variant={transaction.type === "entrada" ? "default" : "destructive"}
                className="text-sm"
              >
                {transaction.type === "entrada" ? "+" : "-"}
                {Number(transaction.amount).toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </Badge>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(transaction.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TransactionCard } from "./TransactionCard";
import { useTranslation } from "react-i18next";

interface TransactionsListProps {
  transactions: any[];
  loading: boolean;
  onTransactionDeleted: () => void;
  canDelete?: boolean;
}

export function TransactionsList({ transactions, loading, onTransactionDeleted, canDelete = true }: TransactionsListProps) {
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleDelete = async (transactionId: string) => {
    try {
      const { error } = await supabase
        .from("financial_transactions")
        .delete()
        .eq("id", transactionId);

      if (error) throw error;

      toast({
        title: t('transactionsList.transactionDeleted'),
        description: t('transactionsList.transactionDeletedDesc'),
      });

      onTransactionDeleted();
    } catch (error) {
      console.error("Erro ao eliminar transação:", error);
      toast({
        title: t('transactionsList.errorDeleting'),
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-bounce" 
               style={{ animationDelay: "0s" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-bounce" 
               style={{ animationDelay: "0.2s" }} />
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-bounce" 
               style={{ animationDelay: "0.4s" }} />
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground text-lg">{t('transactionsList.noTransactions')}</p>
        <p className="text-sm text-muted-foreground mt-2">
          {t('transactionsList.addFirstTransaction')}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {transactions.map((transaction) => (
        <TransactionCard
          key={transaction.id}
          transaction={transaction}
          onDelete={handleDelete}
          canDelete={canDelete}
        />
      ))}
    </div>
  );
}
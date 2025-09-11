import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Wallet, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TransactionDialog } from "./TransactionDialog";
import { TransactionsList } from "./TransactionsList";
import { FinancialCategoryCard } from "./FinancialCategoryCard";
import { useToast } from "@/hooks/use-toast";

interface FinancialCategoriesProps {
  groupId: string;
  categories: any[];
  onCategoriesUpdate: () => void;
}

export function FinancialCategories({ groupId, categories, onCategoriesUpdate }: FinancialCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();

  const loadTransactions = async (categoryId: string) => {
    setLoadingTransactions(true);
    try {
      const { data, error } = await supabase
        .from("financial_transactions")
        .select("*")
        .eq("category_id", categoryId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Erro ao carregar transações:", error);
      toast({
        title: "Erro ao carregar transações",
        variant: "destructive",
      });
    } finally {
      setLoadingTransactions(false);
    }
  };

  const handleCategoryClick = (category: any) => {
    setSelectedCategory(category);
    loadTransactions(category.id);
  };

  const handleTransactionAdded = () => {
    onCategoriesUpdate();
    if (selectedCategory) {
      loadTransactions(selectedCategory.id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <FinancialCategoryCard
            key={category.id}
            category={category}
            index={index}
            onClick={() => handleCategoryClick(category)}
          />
        ))}
      </div>

      {/* Transaction Modal */}
      {selectedCategory && (
        <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedCategory.name}</DialogTitle>
              <DialogDescription>
                Saldo atual: 
                <span className={`ml-2 font-semibold ${
                  Number(selectedCategory.total_balance) >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {Number(selectedCategory.total_balance).toLocaleString('pt-AO', { 
                    style: 'currency', 
                    currency: 'AOA' 
                  })}
                </span>
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex justify-end">
                <Button 
                  onClick={() => setShowTransactionDialog(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Nova Transação
                </Button>
              </div>
              <TransactionsList 
                transactions={transactions}
                loading={loadingTransactions}
                onTransactionDeleted={handleTransactionAdded}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Transaction Dialog */}
      <TransactionDialog
        open={showTransactionDialog}
        onOpenChange={setShowTransactionDialog}
        categoryId={selectedCategory?.id}
        onTransactionAdded={handleTransactionAdded}
      />
    </div>
  );
}
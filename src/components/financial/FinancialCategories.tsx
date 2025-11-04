import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Wallet, TrendingUp, TrendingDown, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TransactionDialog } from "./TransactionDialog";
import { TransactionsList } from "./TransactionsList";
import { FinancialCategoryCard } from "./FinancialCategoryCard";
import { useToast } from "@/hooks/use-toast";
import { useCategoryPermissions } from "@/hooks/useCategoryPermissions";

interface FinancialCategoriesProps {
  groupId: string;
  categories: any[];
  onCategoriesUpdate: () => void;
  currentMemberId?: string;
  isGroupLeader?: boolean;
  userType?: 'admin' | 'member';
  permissionLevel?: string;
}

export function FinancialCategories({ 
  groupId, 
  categories, 
  onCategoriesUpdate,
  currentMemberId,
  isGroupLeader = false,
  userType,
  permissionLevel
}: FinancialCategoriesProps) {
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [showTransactionDialog, setShowTransactionDialog] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();
  
  const { canViewBalance, canEdit, loading: permissionsLoading } = useCategoryPermissions(
    selectedCategory?.id,
    currentMemberId,
    groupId,
    userType,
    permissionLevel
  );

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

  const handleCategoryClick = async (category: any) => {
    // Verificar se é admin principal/super admin
    const isSuperAdmin = userType === 'admin' && 
      (permissionLevel === 'super_admin' || permissionLevel === 'admin_principal');
    
    // Verificar se tem acesso à categoria
    if (!isSuperAdmin && currentMemberId && category.is_locked) {
      // Verificar se é líder da categoria
      const { data: roleData } = await supabase
        .from("category_roles")
        .select("role")
        .eq("category_id", category.id)
        .eq("member_id", currentMemberId)
        .eq("is_active", true)
        .maybeSingle();
      
      // Verificar se é líder do grupo
      const { data: groupData } = await supabase
        .from("groups")
        .select("president_id, vice_president_1_id, vice_president_2_id")
        .eq("id", groupId)
        .single();
      
      const isGroupLeaderCheck = groupData ? (
        groupData.president_id === currentMemberId ||
        groupData.vice_president_1_id === currentMemberId ||
        groupData.vice_president_2_id === currentMemberId
      ) : false;
      
      if (!roleData && !isGroupLeaderCheck) {
        toast({
          title: "Acesso Negado",
          description: "Você não tem permissão para acessar este registro financeiro. Entre em contato com um líder do grupo para solicitar acesso.",
          variant: "destructive",
        });
        return;
      }
    }
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => (
          <FinancialCategoryCard
            key={category.id}
            category={category}
            index={index}
            onClick={() => handleCategoryClick(category)}
            isGroupLeader={isGroupLeader}
            currentMemberId={currentMemberId}
            userType={userType}
            permissionLevel={permissionLevel}
          />
        ))}
      </div>

      {/* Transaction Modal */}
      {selectedCategory && (
        <Dialog open={!!selectedCategory} onOpenChange={() => setSelectedCategory(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header com gradiente */}
            <div className="relative -m-6 mb-6 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-2xl">{selectedCategory.name}</DialogTitle>
                  {selectedCategory.is_locked && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Lock className="h-3 w-3" />
                      Bloqueada
                    </Badge>
                  )}
                </div>
                <DialogDescription className="text-base mt-2">
                  <div className="flex items-center gap-4">
                    <div>
                      Saldo atual: 
                      <span className={`ml-2 font-bold text-lg ${
                        Number(selectedCategory.total_balance) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        {canViewBalance ? (
                          Number(selectedCategory.total_balance).toLocaleString('pt-AO', { 
                            style: 'currency', 
                            currency: 'AOA' 
                          })
                        ) : (
                          "****** AOA"
                        )}
                      </span>
                    </div>
                  </div>
                </DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="space-y-6">
              {canEdit && !permissionsLoading && (
                <div className="flex justify-end">
                  <Button 
                    onClick={() => setShowTransactionDialog(true)}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Nova Transação
                  </Button>
                </div>
              )}
              
              {!canEdit && !permissionsLoading && (
                <div className="bg-muted/50 p-4 rounded-lg text-center">
                  <Lock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Esta categoria está bloqueada. Apenas líderes atribuídos podem adicionar transações.
                  </p>
                </div>
              )}
              
              {canViewBalance ? (
                <TransactionsList 
                  transactions={transactions}
                  loading={loadingTransactions}
                  onTransactionDeleted={handleTransactionAdded}
                />
              ) : (
                <div className="bg-muted/50 p-8 rounded-lg text-center">
                  <Lock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Apenas líderes do grupo ou desta categoria podem visualizar as transações.
                  </p>
                </div>
              )}
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
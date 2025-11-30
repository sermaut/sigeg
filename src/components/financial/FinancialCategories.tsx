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
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "react-i18next";

interface FinancialCategoriesProps {
  groupId: string;
  categories: any[];
  onCategoriesUpdate: () => void;
  currentMemberId?: string;
  isGroupLeader?: boolean;
  userType?: 'admin' | 'member' | 'group';
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
  const [allLeaders, setAllLeaders] = useState<Map<string, any[]>>(new Map());
  const [loadingLeaders, setLoadingLeaders] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();
  const permissions = usePermissions();
  
  const { canViewBalance, canEdit, canDelete, loading: permissionsLoading } = useCategoryPermissions(
    selectedCategory?.id,
    currentMemberId,
    groupId,
    userType,
    permissionLevel
  );

  // Pré-carregar todos os líderes em batch
  useEffect(() => {
    const loadAllLeaders = async () => {
      if (categories.length === 0) {
        setLoadingLeaders(false);
        return;
      }

      setLoadingLeaders(true);
      try {
        const categoryIds = categories.map(c => c.id);
        const { data, error } = await supabase
          .from("category_roles")
          .select(`
            id,
            role,
            member_id,
            category_id,
            members!category_roles_member_id_fkey (
              id,
              name,
              profile_image_url
            )
          `)
          .in("category_id", categoryIds)
          .eq("is_active", true)
          .order("role", { ascending: true });

        if (error) throw error;

        // Agrupar líderes por categoria
        const leadersMap = new Map();
        data?.forEach(leader => {
          const existing = leadersMap.get(leader.category_id) || [];
          leadersMap.set(leader.category_id, [...existing, leader]);
        });
        
        setAllLeaders(leadersMap);
      } catch (error) {
        console.error("Erro ao carregar líderes:", error);
      } finally {
        setLoadingLeaders(false);
      }
    };

    loadAllLeaders();
  }, [categories]);

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
    // Níveis 2-5 e 7: bloquear acesso
    if (permissions.level && permissions.level >= 2 && permissions.level !== 6) {
      toast({
        title: t('financial.restrictedAccess'),
        description: t('financial.onlyLeadersAccess'),
        variant: "destructive",
      });
      return;
    }

    // Nível 6: verificar se é líder desta categoria
    if (permissions.level === 6 && currentMemberId && category.is_locked) {
      const { data: roleData } = await supabase
        .from("category_roles")
        .select("role")
        .eq("category_id", category.id)
        .eq("member_id", currentMemberId)
        .eq("is_active", true)
        .maybeSingle();
      
      if (!roleData) {
        toast({
          title: "Acesso restrito",
          description: "Você só pode acessar categorias onde é líder.",
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
      {loadingLeaders ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div key={category.id} className="h-64 animate-pulse bg-muted rounded-lg" />
          ))}
        </div>
      ) : (
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
              leaders={allLeaders.get(category.id) || []}
            />
          ))}
        </div>
      )}

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
              {permissionsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="flex items-end gap-1 h-8">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-primary rounded-full animate-wave-bar"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>
                </div>
              ) : canEdit && (
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
              
              {canViewBalance ? (
                <TransactionsList 
                  transactions={transactions}
                  loading={loadingTransactions}
                  onTransactionDeleted={handleTransactionAdded}
                  canDelete={canDelete}
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
        canCreate={canEdit}
        isLocked={selectedCategory?.is_locked}
      />
    </div>
  );
}
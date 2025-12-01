import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard, Shield, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FinancialCategories } from "./FinancialCategories";
import { PaymentEvents } from "./PaymentEvents";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from "@tanstack/react-query";

interface FinancialDashboardProps {
  groupId: string;
  currentMemberId?: string;
  isGroupLeader?: boolean;
}

export function FinancialDashboard({ groupId, currentMemberId, isGroupLeader: isGroupLeaderProp }: FinancialDashboardProps) {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const { t } = useLanguage();
  
  // Verificar se é líder do grupo através do role do membro
  const isMember = user?.type === 'member';
  const memberData = isMember ? user?.data as any : null;
  const memberRole = memberData?.role || '';
  const isActualGroupLeader = isAdmin() || ['presidente', 'vice_presidente_1', 'vice_presidente_2', 'secretario_1', 'secretario_2'].includes(memberRole);
  
  // Usar a prop ou o cálculo direto
  const isGroupLeader = isGroupLeaderProp ?? isActualGroupLeader;

  // Use React Query for automatic caching and revalidation
  const { data: categories = [], isLoading: loading, refetch: refetchCategories } = useQuery({
    queryKey: ['financial-categories', groupId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("id, name, description, total_balance, created_at, is_locked, group_id")
        .eq("group_id", groupId)
        .order("name");

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - financial data changes less frequently
    enabled: !!groupId,
  });

  const totalBalance = categories.reduce((sum, cat) => sum + Number(cat.total_balance), 0);
  const positiveBalance = categories.filter(cat => Number(cat.total_balance) > 0).reduce((sum, cat) => sum + Number(cat.total_balance), 0);
  const negativeBalance = categories.filter(cat => Number(cat.total_balance) < 0).reduce((sum, cat) => sum + Number(cat.total_balance), 0);

  if (loading) {
    return <div className="text-center py-8">{t('common.loading')}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header com informações e ação */}
      {isGroupLeader && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            {t('financial.manageLeaders')}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="categories" className="w-full mt-4">
        <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-gradient-to-r from-muted/60 to-muted/40 
                             rounded-lg border border-primary/10 shadow-sm backdrop-blur-sm">
          <TabsTrigger 
            value="categories"
            className="rounded-md h-8 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                       data-[state=active]:to-primary/90 data-[state=active]:text-white 
                       data-[state=active]:shadow-sm
                       transition-all duration-200 font-medium
                       hover:bg-primary/5 flex items-center justify-center gap-1.5 px-3"
          >
            <Wallet className="h-3 w-3" />
            <span className="hidden sm:inline">{t('financial.financialRecords')}</span>
            <span className="sm:hidden">{t('financial.transactions')}</span>
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="rounded-md h-8 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                       data-[state=active]:to-primary/90 data-[state=active]:text-white 
                       data-[state=active]:shadow-sm
                       transition-all duration-200 font-medium
                       hover:bg-primary/5 flex items-center justify-center gap-1.5 px-3"
          >
            <CreditCard className="h-3 w-3" />
            <span className="hidden sm:inline">{t('financial.paymentControl')}</span>
            <span className="sm:hidden">{t('financial.paymentEvents')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4 mt-6">
          <FinancialCategories 
            groupId={groupId} 
            categories={categories}
            onCategoriesUpdate={refetchCategories}
            currentMemberId={currentMemberId}
            isGroupLeader={isGroupLeader}
            userType={user?.type}
            permissionLevel={user?.type === 'admin' ? (user.data as any).permission_level : undefined}
          />
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentEvents groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FinancialCategories } from "./FinancialCategories";
import { PaymentEvents } from "./PaymentEvents";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface FinancialDashboardProps {
  groupId: string;
  currentMemberId?: string;
  isGroupLeader?: boolean;
}

export function FinancialDashboard({ groupId, currentMemberId, isGroupLeader }: FinancialDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    loadCategories();
  }, [groupId]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      
      // Otimizar consulta carregando apenas campos necessários
      const { data, error } = await supabase
        .from("financial_categories")
        .select("id, name, description, total_balance, created_at, is_locked, group_id")
        .eq("group_id", groupId)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast({
        title: "Erro ao carregar categorias financeiras",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const totalBalance = categories.reduce((sum, cat) => sum + Number(cat.total_balance), 0);
  const positiveBalance = categories.filter(cat => Number(cat.total_balance) > 0).reduce((sum, cat) => sum + Number(cat.total_balance), 0);
  const negativeBalance = categories.filter(cat => Number(cat.total_balance) < 0).reduce((sum, cat) => sum + Number(cat.total_balance), 0);

  if (loading) {
    return <div className="text-center py-8">Carregando sistema financeiro...</div>;
  }

  return (
    <div className="space-y-6">

      <Tabs defaultValue="categories" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-14 p-1.5 bg-gradient-to-r from-muted/60 to-muted/40 
                             rounded-2xl border-2 border-primary/15 shadow-lg backdrop-blur-sm">
          <TabsTrigger 
            value="categories"
            className="rounded-xl h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                       data-[state=active]:to-primary/90 data-[state=active]:text-white 
                       data-[state=active]:shadow-md data-[state=active]:shadow-primary/20
                       transition-all duration-300 font-semibold text-sm
                       hover:bg-primary/5 flex items-center gap-2"
          >
            <Wallet className="h-4 w-4" />
            Registros Financeiros
          </TabsTrigger>
          <TabsTrigger 
            value="payments"
            className="rounded-xl h-full data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                       data-[state=active]:to-primary/90 data-[state=active]:text-white 
                       data-[state=active]:shadow-md data-[state=active]:shadow-primary/20
                       transition-all duration-300 font-semibold text-sm
                       hover:bg-primary/5 flex items-center gap-2"
          >
            <CreditCard className="h-4 w-4" />
            Controlo de Pagamentos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4 mt-6">
          <FinancialCategories 
            groupId={groupId} 
            categories={categories}
            onCategoriesUpdate={loadCategories}
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
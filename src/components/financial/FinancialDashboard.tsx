import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FinancialCategories } from "./FinancialCategories";
import { PaymentEvents } from "./PaymentEvents";
import { useToast } from "@/hooks/use-toast";

interface FinancialDashboardProps {
  groupId: string;
  currentMemberId?: string;
  isGroupLeader?: boolean;
}

export function FinancialDashboard({ groupId, currentMemberId, isGroupLeader }: FinancialDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();

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
        <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-muted/50 to-muted/30 
                             rounded-xl border-2 border-primary/10 shadow-soft">
          <TabsTrigger value="categories"
                       className="rounded-lg data-[state=active]:gradient-primary 
                                 data-[state=active]:text-white data-[state=active]:shadow-soft
                                 transition-all duration-300">
            Registros Financeiros
          </TabsTrigger>
          <TabsTrigger value="payments"
                       className="rounded-lg data-[state=active]:gradient-primary 
                                 data-[state=active]:text-white data-[state=active]:shadow-soft
                                 transition-all duration-300">
            Controlo de Pagamentos
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories" className="space-y-4">
          <FinancialCategories 
            groupId={groupId} 
            categories={categories}
            onCategoriesUpdate={loadCategories}
            currentMemberId={currentMemberId}
            isGroupLeader={isGroupLeader}
          />
        </TabsContent>
        
        <TabsContent value="payments" className="space-y-4">
          <PaymentEvents groupId={groupId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
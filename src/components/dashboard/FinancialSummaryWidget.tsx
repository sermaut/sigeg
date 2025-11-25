import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface FinancialSummary {
  totalBalance: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  negativeCategories: Array<{
    id: string;
    name: string;
    balance: number;
    groupName: string;
  }>;
}

export function FinancialSummaryWidget() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFinancialSummary();
  }, []);

  const loadFinancialSummary = async () => {
    try {
      // Get all categories for total balance
      const { data: categories } = await supabase
        .from('financial_categories')
        .select('total_balance, id, name, groups(name)');

      const totalBalance = categories?.reduce((sum, cat) => sum + Number(cat.total_balance), 0) || 0;

      // Get current month transactions
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: transactions } = await supabase
        .from('financial_transactions')
        .select('amount, type')
        .gte('created_at', startOfMonth.toISOString());

      const monthlyRevenue = transactions?.filter(t => t.type === 'entrada')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;
      
      const monthlyExpenses = transactions?.filter(t => t.type === 'saida')
        .reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Get negative categories
      const negativeCategories = categories
        ?.filter(cat => Number(cat.total_balance) < 0)
        .sort((a, b) => Number(a.total_balance) - Number(b.total_balance))
        .slice(0, 5)
        .map(cat => ({
          id: cat.id,
          name: cat.name,
          balance: Number(cat.total_balance),
          groupName: (cat.groups as any)?.name || 'N/A'
        })) || [];

      setSummary({
        totalBalance,
        monthlyRevenue,
        monthlyExpenses,
        negativeCategories
      });
    } catch (error) {
      console.error('Erro ao carregar resumo financeiro:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-24 bg-muted/50" />
            <CardContent className="h-32 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  if (!summary) return null;

  const chartData = [
    { name: 'Receitas', value: summary.monthlyRevenue },
    { name: 'Despesas', value: summary.monthlyExpenses }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Total Balance Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardDescription className="flex items-center gap-2">
            {summary.totalBalance >= 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-destructive" />
            )}
            Saldo Total Consolidado
          </CardDescription>
          <CardTitle className={`text-3xl ${summary.totalBalance >= 0 ? 'text-green-600' : 'text-destructive'}`}>
            {summary.totalBalance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
          </CardTitle>
        </CardHeader>
      </Card>

      {/* Revenue vs Expenses Chart */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Receitas vs Despesas (Mês Atual)</CardTitle>
        </CardHeader>
        <CardContent className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value: number) => value.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })} />
              <Legend />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Negative Categories Alert */}
      {summary.negativeCategories.length > 0 && (
        <Card className="md:col-span-3 border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Categorias com Saldo Negativo
            </CardTitle>
            <CardDescription>Atenção necessária para estas categorias</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {summary.negativeCategories.map(cat => (
                <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium">{cat.name}</p>
                    <p className="text-sm text-muted-foreground">{cat.groupName}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="destructive">
                      {cat.balance.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })}
                    </Badge>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/groups/${cat.id}`)}
                    >
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

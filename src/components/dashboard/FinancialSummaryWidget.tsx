import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useFinancialSummary } from "@/hooks/useOptimizedQueries";
import { useMemo } from "react";

export function FinancialSummaryWidget() {
  const { data: summary, isLoading } = useFinancialSummary();
  const navigate = useNavigate();

  const chartData = useMemo(() => {
    if (!summary) return [];
    return [
      { name: 'Receitas', value: summary.monthlyRevenue },
      { name: 'Despesas', value: summary.monthlyExpenses }
    ];
  }, [summary]);

  if (isLoading) {
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
      {summary.negativeCategories && summary.negativeCategories.length > 0 && (
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
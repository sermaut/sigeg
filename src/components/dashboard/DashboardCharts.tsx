import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";
import { useDashboardCharts } from "@/hooks/useOptimizedQueries";

const PARTITION_COLORS = {
  "Soprano": "hsl(var(--primary))",
  "Contralto": "hsl(var(--secondary))",
  "Tenor": "hsl(var(--accent))",
  "Baixo": "hsl(var(--muted))",
  "Instrumental": "hsl(var(--chart-1))",
};

export function DashboardCharts() {
  const { data: chartsData, isLoading } = useDashboardCharts();

  // Memoize processed data
  const { memberGrowth, partitionData, topGroups } = useMemo(() => {
    if (!chartsData) {
      return { memberGrowth: [], partitionData: [], topGroups: [] };
    }
    return chartsData;
  }, [chartsData]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-16 bg-muted/50" />
            <CardContent className="h-64 bg-muted/20" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Member Growth Chart */}
      <Card className="lg:col-span-2 hover:shadow-strong transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            📈 Crescimento de Membros (Últimos 6 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={memberGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="month" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="members" 
                stroke="hsl(var(--primary))" 
                strokeWidth={3}
                dot={{ fill: 'hsl(var(--primary))', r: 5 }}
                activeDot={{ r: 8 }}
                name="Membros"
                animationDuration={1500}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Partition Distribution Chart */}
      <Card className="hover:shadow-strong transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🎵 Distribuição por Partições
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={partitionData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="hsl(var(--primary))"
                dataKey="value"
                animationDuration={1500}
                animationBegin={0}
              >
                {partitionData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={PARTITION_COLORS[entry.name as keyof typeof PARTITION_COLORS] || "hsl(var(--muted))"}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Groups Chart */}
      <Card className="hover:shadow-strong transition-shadow duration-300">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            🏆 Top 5 Grupos com Mais Membros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topGroups}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '11px' }}
                angle={-15}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Bar 
                dataKey="members" 
                fill="hsl(var(--primary))" 
                radius={[8, 8, 0, 0]}
                animationDuration={1500}
                name="Membros"
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
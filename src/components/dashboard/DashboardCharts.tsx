import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from "recharts";

interface MemberGrowthData {
  month: string;
  members: number;
}

interface PartitionData {
  name: string;
  value: number;
}

interface TopGroupData {
  name: string;
  members: number;
}

const PARTITION_COLORS = {
  "Soprano": "hsl(var(--primary))",
  "Contralto": "hsl(var(--secondary))",
  "Tenor": "hsl(var(--accent))",
  "Baixo": "hsl(var(--muted))",
  "Instrumental": "hsl(var(--chart-1))",
};

export function DashboardCharts() {
  const [memberGrowth, setMemberGrowth] = useState<MemberGrowthData[]>([]);
  const [partitionData, setPartitionData] = useState<PartitionData[]>([]);
  const [topGroups, setTopGroups] = useState<TopGroupData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartsData();
  }, []);

  async function loadChartsData() {
    try {
      setLoading(true);

      // Fetch members data
      const { data: members } = await supabase
        .from('members')
        .select('created_at, partition, group_id, groups(name)')
        .eq('is_active', true);

      if (members) {
        // Calculate member growth (last 6 months)
        const growthMap = new Map<string, number>();
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthKey = date.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
          growthMap.set(monthKey, 0);
        }

        members.forEach(member => {
          const createdDate = new Date(member.created_at);
          const monthKey = createdDate.toLocaleDateString('pt-AO', { month: 'short', year: '2-digit' });
          if (growthMap.has(monthKey)) {
            growthMap.set(monthKey, (growthMap.get(monthKey) || 0) + 1);
          }
        });

        const growthData: MemberGrowthData[] = [];
        let cumulative = 0;
        growthMap.forEach((count, month) => {
          cumulative += count;
          growthData.push({ month, members: cumulative });
        });
        setMemberGrowth(growthData);

        // Calculate partition distribution
        const partitionMap = new Map<string, number>();
        members.forEach(member => {
          if (member.partition) {
            const partition = member.partition.charAt(0).toUpperCase() + member.partition.slice(1).toLowerCase();
            partitionMap.set(partition, (partitionMap.get(partition) || 0) + 1);
          }
        });

        const partitions: PartitionData[] = Array.from(partitionMap.entries())
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);
        setPartitionData(partitions);

        // Calculate top groups by member count
        const groupMap = new Map<string, number>();
        members.forEach(member => {
          if (member.groups && typeof member.groups === 'object' && 'name' in member.groups) {
            const groupName = (member.groups as { name: string }).name;
            groupMap.set(groupName, (groupMap.get(groupName) || 0) + 1);
          }
        });

        const topGroupsData: TopGroupData[] = Array.from(groupMap.entries())
          .map(([name, members]) => ({ 
            name: name.length > 20 ? name.substring(0, 20) + '...' : name, 
            members 
          }))
          .sort((a, b) => b.members - a.members)
          .slice(0, 5);
        setTopGroups(topGroupsData);
      }
    } catch (error) {
      console.error('Error loading charts data:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
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

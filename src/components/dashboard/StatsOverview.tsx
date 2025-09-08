import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Building,
  TrendingUp,
  Activity,
  UserCheck,
  UserX,
  Crown,
  Music
} from "lucide-react";

interface Stats {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  leadersCount: number;
  partitionsDistribution: { [key: string]: number };
}

export function StatsOverview() {
  const [stats, setStats] = useState<Stats>({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    activeMembers: 0,
    inactiveMembers: 0,
    leadersCount: 0,
    partitionsDistribution: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      // Load groups stats
      const { data: groups } = await supabase
        .from('groups')
        .select('id, is_active');

      // Load members stats
      const { data: members } = await supabase
        .from('members')
        .select('id, is_active, role, partition');

      if (groups) {
        const totalGroups = groups.length;
        const activeGroups = groups.filter(g => g.is_active).length;

        if (members) {
          const totalMembers = members.length;
          const activeMembers = members.filter(m => m.is_active).length;
          const inactiveMembers = totalMembers - activeMembers;
          
          const leadersCount = members.filter(m => 
            m.role && ['presidente', 'vice_presidente', 'secretario'].includes(m.role)
          ).length;

          // Partitions distribution
          const partitionsDistribution = members.reduce((acc, member) => {
            if (member.partition) {
              acc[member.partition] = (acc[member.partition] || 0) + 1;
            }
            return acc;
          }, {} as { [key: string]: number });

          setStats({
            totalGroups,
            activeGroups,
            totalMembers,
            activeMembers,
            inactiveMembers,
            leadersCount,
            partitionsDistribution
          });
        }
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="card-elevated">
            <div className="p-6 animate-pulse">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="card-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Grupos</p>
                <p className="text-3xl font-bold text-primary">{stats.totalGroups}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Building className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                {stats.activeGroups} ativos
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="card-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Membros</p>
                <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-full">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="mt-4 flex items-center space-x-2">
              <Badge variant="default" className="text-xs">
                <UserCheck className="w-3 h-3 mr-1" />
                {stats.activeMembers} ativos
              </Badge>
              <Badge variant="secondary" className="text-xs">
                <UserX className="w-3 h-3 mr-1" />
                {stats.inactiveMembers} inativos
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="card-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Líderes</p>
                <p className="text-3xl font-bold text-accent">{stats.leadersCount}</p>
              </div>
              <div className="p-3 bg-accent/10 rounded-full">
                <Crown className="w-6 h-6 text-accent" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                Presidentes, Vice-Presidentes, Secretários
              </Badge>
            </div>
          </div>
        </Card>

        <Card className="card-elevated">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Taxa de Atividade</p>
                <p className="text-3xl font-bold text-success">
                  {stats.totalMembers > 0 
                    ? Math.round((stats.activeMembers / stats.totalMembers) * 100)
                    : 0
                  }%
                </p>
              </div>
              <div className="p-3 bg-success/10 rounded-full">
                <Activity className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">
                Membros ativos vs total
              </Badge>
            </div>
          </div>
        </Card>
      </div>

      {/* Partitions Distribution */}
      {Object.keys(stats.partitionsDistribution).length > 0 && (
        <Card className="card-elevated">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
              <Music className="w-5 h-5 mr-2" />
              Distribuição por Partições
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(stats.partitionsDistribution).map(([partition, count]) => (
                <div key={partition} className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">{count}</div>
                  <div className="text-sm text-muted-foreground capitalize">{partition}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
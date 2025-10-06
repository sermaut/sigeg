import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard";
import { RecentGroups } from "./OptimizedDashboard";
import { Button } from "@/components/ui/button";
import { Users, Building, UserPlus, Activity, Plus } from "lucide-react";
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalGroups: number;
  totalMembers: number;
  activeGroups: number;
  recentActivity: number;
}

export function Dashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalGroups: 0,
    totalMembers: 0,
    activeGroups: 0,
    recentActivity: 0
  });
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    try {
      setLoading(true);

      // Fetch groups data with error handling
      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('id, name, municipality, province, is_active, created_at')
        .order('created_at', { ascending: false })
        .limit(10);

      if (groupsError) {
        console.error('Error loading groups:', groupsError);
        toast({
          title: "Erro ao carregar grupos",
          description: "Não foi possível carregar os dados dos grupos.",
          variant: "destructive",
        });
        setStats({ totalGroups: 0, totalMembers: 0, activeGroups: 0, recentActivity: 0 });
        setGroups([]);
        return;
      }

      // Fetch members data with error handling
      const { data: membersData, error: membersError } = await supabase
        .from('members')
        .select('id, group_id, is_active')
        .eq('is_active', true);

      if (membersError) {
        console.error('Error loading members:', membersError);
        toast({
          title: "Erro ao carregar membros",
          description: "Não foi possível carregar os dados dos membros.",
          variant: "destructive",
        });
      }

      // Calculate statistics with safe defaults
      const totalGroups = groupsData?.length || 0;
      const totalMembers = membersData?.length || 0;
      const activeGroups = groupsData?.filter(g => g.is_active).length || 0;

      setStats({
        totalGroups,
        totalMembers,
        activeGroups,
        recentActivity: totalGroups
      });

      setGroups(groupsData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Erro inesperado",
        description: "Ocorreu um erro ao carregar o painel.",
        variant: "destructive",
      });
      setStats({ totalGroups: 0, totalMembers: 0, activeGroups: 0, recentActivity: 0 });
      setGroups([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-6">
        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Sistema de Gestão de Grupos
          </h1>
        </div>
        <div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plataforma completa para gestão eficiente de grupos musicais em Angola. Administre membros, organize eventos, solicite arranjos e gere relatórios detalhados com segurança e praticidade.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="gradient" 
            size="lg"
            onClick={() => window.location.href = "/groups"}
          >
            <Users className="w-5 h-5" />
            Ver Grupos
          </Button>
          <Button 
            variant="outline" 
            size="lg"
          >
            <Activity className="w-5 h-5" />
            Saiba Mais
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total de Grupos"
          value={stats.totalGroups}
          change="+2 este mês"
          changeType="positive"
          icon={Building}
        />
        <StatsCard
          title="Membros Ativos"
          value={stats.totalMembers}
          change="+15 este mês"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Grupos Ativos"
          value={stats.activeGroups}
          icon={Activity}
        />
        <StatsCard
          title="Novos Cadastros"
          value="8"
          change="+25% vs último mês"
          changeType="positive"
          icon={UserPlus}
        />
      </div>

      {/* Recent Groups - Optimized */}
      <RecentGroups groups={groups} />
      
      {/* Novo Grupo Button at the end */}
      <div className="flex justify-center pt-8">
        <Button 
          variant="gradient" 
          size="lg" 
          className="shadow-medium"
          onClick={() => window.location.href = "/groups/new"}
        >
          <Plus className="w-5 h-5" />
          Novo Grupo
        </Button>
      </div>
    </div>
  );
}
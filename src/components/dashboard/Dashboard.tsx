import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { StatsCard } from "./StatsCard.memo";
import { RecentGroups } from "./OptimizedDashboard";
import { DashboardCharts } from "./DashboardCharts";
import { FinancialSummaryWidget } from "./FinancialSummaryWidget";
import { Button } from "@/components/ui/button";
import { Users, Building, UserPlus, Activity, Plus } from "@/lib/icons";
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';
import sigegLogo from "@/assets/sigeg-logo.png";

interface DashboardStats {
  totalGroups: number;
  totalMembers: number;
  activeGroups: number;
  recentActivity: number;
}

export function Dashboard() {
  const { toast } = useToast();
  const navigate = useNavigate();
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

      // ULTRA-OPTIMIZED: Use COUNT queries for statistics + limit groups to 5
      const [groupsResult, totalGroupsCount, totalMembersCount, activeGroupsCount] = await Promise.all([
        supabase
          .from('groups')
          .select('id, name, municipality, province, is_active, created_at')
          .order('created_at', { ascending: false })
          .limit(5), // Reduced from 10 to 5
        supabase
          .from('groups')
          .select('id', { count: 'exact', head: true }),
        supabase
          .from('members')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true),
        supabase
          .from('groups')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
      ]);

      const { data: groupsData, error: groupsError } = groupsResult;
      const { count: totalGroups, error: totalGroupsError } = totalGroupsCount;
      const { count: totalMembers, error: totalMembersError } = totalMembersCount;
      const { count: activeGroups, error: activeGroupsError } = activeGroupsCount;

      if (groupsError || totalGroupsError || totalMembersError || activeGroupsError) {
        console.error('Error loading dashboard data:', { groupsError, totalGroupsError, totalMembersError, activeGroupsError });
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar alguns dados do painel.",
          variant: "destructive",
        });
        setStats({ totalGroups: 0, totalMembers: 0, activeGroups: 0, recentActivity: 0 });
        setGroups([]);
        return;
      }

      setStats({
        totalGroups: totalGroups || 0,
        totalMembers: totalMembers || 0,
        activeGroups: activeGroups || 0,
        recentActivity: totalGroups || 0
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
          <img 
            src={sigegLogo} 
            alt="SIGEG Logo" 
            className="w-16 h-16 object-contain"
            loading="eager"
            decoding="async"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Sistema de Gestão de Grupos
          </h1>
        </div>
        <div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Plataforma completa para gestão eficiente de grupos musicais em Angola. Administre membros, organize eventos, solicite arranjos e gere relatórios detalhados com segurança e praticidade.
          </p>
        </div>
        <div className="flex flex-row gap-3 justify-center">
          <Button 
            variant="gradient" 
            size="default"
            className="text-sm"
            onClick={() => navigate("/groups")}
          >
            <Users className="w-4 h-4" />
            Ver Grupos
          </Button>
          <Button 
            variant="outline" 
            size="default"
            className="text-sm"
          >
            <Activity className="w-4 h-4" />
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

      {/* Financial Summary Widget */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Resumo Financeiro</h2>
        <FinancialSummaryWidget />
      </section>

      {/* Interactive Charts */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Estatísticas e Tendências</h2>
        <DashboardCharts />
      </section>

      {/* Recent Groups - Optimized */}
      <RecentGroups groups={groups} />
      
      {/* Novo Grupo Button at the end */}
      <PermissionGuard require="canCreateGroup">
        <div className="flex justify-center pt-8">
          <Button 
            variant="gradient" 
            size="lg" 
            className="shadow-medium"
            onClick={() => navigate("/groups/new")}
          >
            <Plus className="w-5 h-5" />
            Novo Grupo
          </Button>
        </div>
      </PermissionGuard>
    </div>
  );
}
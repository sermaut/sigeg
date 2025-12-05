import { lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "./StatsCard.memo";
import { RecentGroups } from "./OptimizedDashboard";
import { Button } from "@/components/ui/button";
import { Users, Building, UserPlus, Activity, Plus } from "@/lib/icons";
import { PermissionGuard } from '@/components/common/PermissionGuard';
import { useDashboardStats, useRecentGroups } from '@/hooks/useOptimizedQueries';
import { Skeleton } from "@/components/ui/skeleton";
import sigegLogo from "@/assets/sigeg-logo.png";

// Lazy load heavy chart components (below the fold)
const DashboardCharts = lazy(() => import("./DashboardCharts").then(m => ({ default: m.DashboardCharts })));
const FinancialSummaryWidget = lazy(() => import("./FinancialSummaryWidget").then(m => ({ default: m.FinancialSummaryWidget })));

// Skeleton for lazy loaded sections
function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-48" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}

// Skeleton component for stats cards
function StatsCardSkeleton() {
  return (
    <div className="p-6 rounded-lg border bg-card">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <Skeleton className="h-8 w-16 mt-2" />
      <Skeleton className="h-3 w-20 mt-2" />
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  
  // Use React Query hooks for optimized data fetching - all run in parallel
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: groups = [], isLoading: groupsLoading } = useRecentGroups(5);

  const loading = statsLoading && !stats;

  // Show skeleton while loading (but show cached data immediately if available)
  if (loading) {
    return (
      <div className="space-y-6">
        {/* Welcome Header Skeleton */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center space-x-4 mb-6">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>

        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[0, 1, 2, 3].map((i) => (
            <StatsCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="text-center space-y-6">
        <div className="flex flex-col items-center mb-6">
          <img 
            src={sigegLogo} 
            alt="SIGEG Logo" 
            width={80}
            height={80}
            className="w-20 h-20 object-contain mb-4"
            loading="eager"
            decoding="async"
            fetchPriority="high"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Sistema de Gestão de Grupos
          </h1>
        </div>
        <div>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed text-justify">
            O SIGEG-BV (Sistema de Gestão de Grupos - Boa Vista) é uma plataforma completa para gestão de grupos musicais, oferecendo funcionalidades de gestão de membros, finanças, programas semanais e muito mais. Este sistema foi desenvolvido com dedicação para facilitar a organização e administração de grupos. Administre membros, organize eventos, solicite serviços como: Arranjos Musicais Automatizados, Acompanhamentos de Hinos, Revisão de Arranjos, e gere relatórios detalhados com segurança e praticidade.
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
          value={stats?.totalGroups ?? 0}
          change="+2 este mês"
          changeType="positive"
          icon={Building}
        />
        <StatsCard
          title="Membros Ativos"
          value={stats?.totalMembers ?? 0}
          change="+15 este mês"
          changeType="positive"
          icon={Users}
        />
        <StatsCard
          title="Grupos Ativos"
          value={stats?.activeGroups ?? 0}
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

      {/* Financial Summary Widget - Lazy loaded */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Resumo Financeiro</h2>
        <Suspense fallback={<SectionSkeleton />}>
          <FinancialSummaryWidget />
        </Suspense>
      </section>

      {/* Interactive Charts - Lazy loaded */}
      <section>
        <h2 className="text-2xl font-semibold mb-6">Estatísticas e Tendências</h2>
        <Suspense fallback={<SectionSkeleton />}>
          <DashboardCharts />
        </Suspense>
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
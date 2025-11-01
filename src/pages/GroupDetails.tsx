import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Building, 
  MapPin, 
  Users, 
  Edit, 
  UserPlus, 
  Search,
  ArrowLeft,
  Crown,
  Shield,
  FileText,
  Activity,
  Filter,
  CreditCard
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MembersTable } from "@/components/members/MembersTable";
import { OptimizedMembersTable } from "@/components/members/OptimizedMembersTable";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { WeeklyProgramUpload } from "@/components/technical/WeeklyProgramUpload";
import { WeeklyProgramList } from "@/components/technical/WeeklyProgramList";

interface Group {
  id: string;
  name: string;
  province: string;
  municipality: string;
  direction: string;
  is_active: boolean;
  max_members: number;
  monthly_fee: number;
  access_code: string;
  created_at: string;
  president_id: string;
  vice_president_1_id: string;
  vice_president_2_id: string;
  secretary_1_id: string;
  secretary_2_id: string;
  president_name?: string;
  vice_president_1_name?: string;
  vice_president_2_name?: string;
  secretary_1_name?: string;
  secretary_2_name?: string;
  plan_id?: string;
  monthly_plans?: {
    name: string;
    max_members: number;
    price_per_member: number;
    is_active: boolean;
  };
}

export default function GroupDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isMember } = useAuth();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshPrograms, setRefreshPrograms] = useState(0);

  // Obter ID do membro atual se for membro
  const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : undefined;
  
  // Verificar se é líder do grupo
  const isGroupLeader = group ? (
    group.president_id === currentMemberId ||
    group.vice_president_1_id === currentMemberId ||
    group.vice_president_2_id === currentMemberId ||
    group.secretary_1_id === currentMemberId ||
    group.secretary_2_id === currentMemberId
  ) : false;

  useEffect(() => {
    if (id) {
      loadGroupDetails();
    }
  }, [id]);

  async function loadGroupDetails() {
    try {
      // Otimizar carregamento paralelo 
      const [groupResponse, membersResponse] = await Promise.all([
        supabase
          .from('groups')
          .select(`
            *,
            monthly_plans (
              name,
              max_members,
              price_per_member,
              is_active
            )
          `)
          .eq('id', id)
          .maybeSingle(),
        supabase
          .from('members')
          .select('id, name, role, partition, is_active, phone, profile_image_url')
          .eq('group_id', id)
          .order('name')
      ]);

      if (groupResponse.error) throw groupResponse.error;
      if (membersResponse.error) throw membersResponse.error;

      if (!groupResponse.data) {
        navigate('/groups');
        return;
      }

      setGroup(groupResponse.data);
      setMembers(membersResponse.data || []);

    } catch (error) {
      console.error('Erro ao carregar detalhes do grupo:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar detalhes do grupo",
        variant: "destructive",
      });
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.role && member.role.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.partition && member.partition.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeMembers = members.filter(m => m.is_active);
  const leadersCount = [
    group?.president_id,
    group?.vice_president_1_id,
    group?.vice_president_2_id,
    group?.secretary_1_id,
    group?.secretary_2_id
  ].filter(Boolean).length;

  const handleMemberView = (memberId: string) => {
    navigate(`/members/${memberId}`);
  };

  const handleMemberEdit = (memberId: string) => {
    navigate(`/members/${memberId}/edit`);
  };

  const handleMemberToggleStatus = async (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;

    const newStatus = !member.is_active;
    const action = newStatus ? 'ativar' : 'desativar';
    
    if (confirm(`Tem certeza que deseja ${action} este membro?`)) {
      try {
        const { error } = await supabase
          .from('members')
          .update({ is_active: newStatus })
          .eq('id', memberId);
        
        if (error) throw error;
        
        toast({
          title: `Membro ${newStatus ? 'ativado' : 'desativado'} com sucesso!`,
        });
        
        // Reload members
        loadGroupDetails();
      } catch (error) {
        console.error('Erro ao alterar status do membro:', error);
        toast({
          title: "Erro",
          description: "Falha ao alterar status do membro",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!group) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Grupo não encontrado</h1>
          <Button onClick={() => navigate('/groups')}>
            Voltar para Grupos
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/3 to-accent/3">
        {/* Breadcrumb com hover effects */}
        <div className="flex items-center space-x-2 mb-6 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/groups')}
            className="text-muted-foreground hover:text-primary hover:bg-primary/5 
                       transition-all hover:scale-105"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            Grupos
          </span>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-semibold text-primary">{group.name}</span>
        </div>

        {/* Header do grupo com gradiente */}
        <div className="space-y-4 mb-6 animate-scale-in">
          <div className="flex items-center space-x-4">
            <div className="relative group">
              <div className="absolute inset-0 gradient-primary rounded-2xl blur-xl opacity-50 
                              group-hover:opacity-100 transition-opacity" />
              <div className="relative w-20 h-20 gradient-primary rounded-2xl flex items-center 
                              justify-center shadow-strong group-hover:scale-110 
                              transition-transform duration-500">
                <Building className="w-10 h-10 text-white" />
              </div>
              {group.is_active && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full 
                                border-4 border-white animate-pulse shadow-glow-accent" />
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary 
                               bg-clip-text text-transparent">
                  {group.name}
                </h1>
                <Badge variant={group.is_active ? "success" : "secondary"} 
                       className="text-sm px-3 py-1">
                  {group.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{group.municipality}, {group.province}</span>
              </div>
            </div>
          </div>
          
          {/* Botões de ação com gradientes */}
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/groups/${id}/edit`)}
              className="hover:border-primary hover:text-primary hover:bg-primary/5 
                         transition-all hover:scale-105"
            >
              <Edit className="w-4 h-4" />
              Editar Grupo
            </Button>
            <Button
              variant="gradient"
              onClick={() => navigate(`/members/new?groupId=${id}`)}
              className="hover:shadow-glow"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Membro
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/plans/${id}`)}
              className="hover:border-accent hover:text-accent hover:bg-accent/5 
                         transition-all hover:scale-105"
            >
              <CreditCard className="w-4 h-4" />
              Gerenciar Plano
            </Button>
          </div>
        </div>

        {/* Stats Cards - removed as requested */}

        {/* Tabs modernizadas */}
        <Tabs defaultValue="info" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 p-1 bg-gradient-to-r from-muted/50 to-muted/30 
                               rounded-xl border-2 border-primary/10 shadow-soft">
            <TabsTrigger value="info"
                         className="rounded-lg data-[state=active]:gradient-primary 
                                   data-[state=active]:text-white data-[state=active]:shadow-soft
                                   transition-all duration-300 hover:scale-105">
              Informações
            </TabsTrigger>
            <TabsTrigger value="members"
                         className="rounded-lg data-[state=active]:gradient-primary 
                                   data-[state=active]:text-white data-[state=active]:shadow-soft
                                   transition-all duration-300 hover:scale-105">
              Membros
            </TabsTrigger>
            <TabsTrigger value="financial"
                         className="rounded-lg data-[state=active]:gradient-primary 
                                   data-[state=active]:text-white data-[state=active]:shadow-soft
                                   transition-all duration-300 hover:scale-105">
              Finanças
            </TabsTrigger>
            <TabsTrigger value="technical"
                         className="rounded-lg data-[state=active]:gradient-primary 
                                   data-[state=active]:text-white data-[state=active]:shadow-soft
                                   transition-all duration-300 hover:scale-105">
              Área Técnica
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Informações Detalhadas
                </h3>
                 <div className="space-y-6">
                  {/* Liderança do Grupo */}
                  <div>
                    <h4 className="text-md font-semibold text-foreground mb-3 flex items-center gap-2">
                      <Crown className="w-4 h-4" />
                      Liderança do Grupo
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {group.president_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Presidente</label>
                          <p className="text-foreground">{group.president_name}</p>
                        </div>
                      )}
                      {group.vice_president_1_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Vice-presidente 1</label>
                          <p className="text-foreground">{group.vice_president_1_name}</p>
                        </div>
                      )}
                      {group.vice_president_2_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Vice-presidente 2</label>
                          <p className="text-foreground">{group.vice_president_2_name}</p>
                        </div>
                      )}
                      {group.secretary_1_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Secretário 1</label>
                          <p className="text-foreground">{group.secretary_1_name}</p>
                        </div>
                      )}
                      {group.secretary_2_name && (
                        <div>
                          <label className="text-sm font-medium text-muted-foreground">Secretário 2</label>
                          <p className="text-foreground">{group.secretary_2_name}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Informações Gerais */}
                  <div>
                    <h4 className="text-md font-semibold text-foreground mb-3">Informações Gerais</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Direção</label>
                        <p className="text-foreground capitalize">{group.direction}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                        <p className="text-foreground">
                          {new Date(group.created_at).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Código de Acesso</label>
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {group.access_code || 'Não definido'}
                        </code>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Plano Atual</label>
                        <div className="flex items-center space-x-2">
                          <p className="text-foreground">
                            {group.monthly_plans?.name || 'Nenhum plano definido'}
                          </p>
                          {group.monthly_plans && (
                            <Badge variant={group.monthly_plans.is_active ? "default" : "secondary"}>
                              {group.monthly_plans.is_active ? "Ativo" : "Inativo"}
                            </Badge>
                          )}
                        </div>
                        {group.monthly_plans && (
                          <div className="mt-1 text-sm text-muted-foreground">
                            Máx. {group.monthly_plans.max_members} membros • {group.monthly_plans.price_per_member} Kz por membro
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            {/* Search and Filters */}
            <Card className="card-elevated">
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar membros..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="outline">
                    <Filter className="w-4 h-4" />
                    Filtros
                  </Button>
                </div>
              </div>
            </Card>

            {/* Members Table - Optimized */}
            <Card className="card-elevated p-0">
              <OptimizedMembersTable 
                members={filteredMembers}
                onMemberView={handleMemberView}
                onMemberEdit={handleMemberEdit}
              />
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard 
              groupId={id!} 
              currentMemberId={currentMemberId}
              isGroupLeader={isGroupLeader}
            />
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Tabs defaultValue="program" className="w-full">
              <TabsList className="grid w-full grid-cols-2 p-1 bg-gradient-to-r from-muted/50 to-muted/30 
                                   rounded-xl border-2 border-primary/10 shadow-soft">
                <TabsTrigger value="program"
                             className="rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white data-[state=active]:shadow-soft
                                       transition-all duration-300">
                  Programa Semanal
                </TabsTrigger>
                <TabsTrigger value="rehearsals"
                             className="rounded-lg data-[state=active]:gradient-primary 
                                       data-[state=active]:text-white data-[state=active]:shadow-soft
                                       transition-all duration-300">
                  Participação nos Ensaios
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="program" className="space-y-4">
                <WeeklyProgramUpload 
                  groupId={id!}
                  onUploadComplete={() => setRefreshPrograms(prev => prev + 1)}
                />
                <WeeklyProgramList 
                  groupId={id!}
                  refreshTrigger={refreshPrograms}
                />
              </TabsContent>
              
              <TabsContent value="rehearsals" className="space-y-4">
                <Card className="card-elevated">
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-foreground mb-4">
                      Participação nos Ensaios
                    </h3>
                    <div className="space-y-4">
                      <p className="text-muted-foreground text-sm">
                        Selecione os membros que participaram nos ensaios por partição
                      </p>
                      <div className="grid gap-4">
                        {/* Placeholder for rehearsal participation */}
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium mb-2">Soprano</h4>
                          <p className="text-sm text-muted-foreground">
                            Funcionalidade em desenvolvimento
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
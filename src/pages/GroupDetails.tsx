import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
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
  CreditCard,
  Info,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { MembersTable } from "@/components/members/MembersTable";
import { OptimizedMembersTable } from "@/components/members/OptimizedMembersTable";
import { FinancialDashboard } from "@/components/financial/FinancialDashboard";
import { WeeklyProgramUpload } from "@/components/technical/WeeklyProgramUpload";
import { WeeklyProgramList } from "@/components/technical/WeeklyProgramList";
import { RehearsalAttendance } from "@/components/technical/RehearsalAttendance";

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
  const permissions = usePermissions();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshPrograms, setRefreshPrograms] = useState(0);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [memberToToggle, setMemberToToggle] = useState<{ id: string; isActive: boolean } | null>(null);

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

  const handleMemberToggleStatus = (memberId: string) => {
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    setMemberToToggle({ id: memberId, isActive: member.is_active });
    setStatusDialogOpen(true);
  };

  const confirmToggleStatus = async () => {
    if (!memberToToggle) return;
    
    const newStatus = !memberToToggle.isActive;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ is_active: newStatus })
        .eq('id', memberToToggle.id);
      
      if (error) throw error;
      
      toast({
        title: newStatus ? "Membro ativado" : "Membro desativado",
        description: `O membro foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
      });
      
      loadGroupDetails();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do membro",
        variant: "destructive",
      });
    } finally {
      setStatusDialogOpen(false);
      setMemberToToggle(null);
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
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary 
                               bg-clip-text text-transparent">
                  {group.name}
                </h1>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-5 h-5" />
                <span className="text-lg">{group.municipality}, {group.province}</span>
              </div>
            </div>
          </div>
          
          {/* Botões de ação com gradientes */}
          <div className="flex flex-wrap gap-2 justify-center mt-5">
            <PermissionGuard require="canEditGroup">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/groups/${id}/edit`)}
                className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-all hover:scale-105 h-9 w-9"
                title="Editar Grupo"
              >
                <Edit className="w-4 h-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard require="canAddMember">
              <Button
                variant="gradient"
                size="icon"
                onClick={() => navigate(`/members/new?groupId=${id}`)}
                className="hover:shadow-glow h-9 w-9"
                title="Adicionar Membro"
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard require="canAccessMonthlyPlans">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigate(`/plans/${id}`)}
                className="hover:border-accent hover:text-accent hover:bg-accent/5 transition-all hover:scale-105 h-9 w-9"
                title="Gerenciar Plano"
              >
                <CreditCard className="w-4 h-4" />
              </Button>
            </PermissionGuard>
          </div>
        </div>

        {/* Stats Cards - removed as requested */}

        {/* Tabs modernizadas */}
        <Tabs defaultValue="info" className="flex-1">
          <TabsList className="grid w-full grid-cols-4 h-10 p-0.5 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl border-2 border-primary/15 shadow-sm backdrop-blur-sm">
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

          <TabsContent value="info">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <CardTitle className="text-foreground">Detalhes do Grupo</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                {/* Liderança Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/10">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Liderança</h3>
                  </div>
                  
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

                {/* Informações Gerais Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-3 border-b-2 border-primary/10">
                    <div className="p-2 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg">
                      <Info className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground">Informações Gerais</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Direção</label>
                      <p className="text-foreground capitalize">{group.direction}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Província</label>
                      <p className="text-foreground">{group.province}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Município</label>
                      <p className="text-foreground">{group.municipality}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Total de Membros</label>
                      <p className="text-foreground">{members.length} / {group.max_members}</p>
                    </div>
                    {permissions.canViewGroupFinancialInfo && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Mensalidade</label>
                        <p className="text-foreground">{group.monthly_fee} Kz</p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Criação</label>
                      <p className="text-foreground">
                        {new Date(group.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    {permissions.canViewGroupFinancialInfo && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Código de Acesso</label>
                        <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                          {group.access_code || 'Não definido'}
                        </code>
                      </div>
                    )}
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
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="members">
            <Card className="border-2 border-primary/10 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <CardTitle className="text-foreground text-center">Membros do Grupo</CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar membro..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <OptimizedMembersTable
                  members={filteredMembers}
                  onMemberView={handleMemberView}
                  onMemberEdit={handleMemberEdit}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial">
            <FinancialDashboard 
              groupId={id!} 
              currentMemberId={currentMemberId}
              isGroupLeader={isGroupLeader}
            />
          </TabsContent>

          <TabsContent value="technical">
            <Tabs defaultValue="programa" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2 h-9 p-0.5 bg-gradient-to-r from-muted/60 to-muted/40 
                                   rounded-lg border border-primary/10 shadow-sm backdrop-blur-sm">
                <TabsTrigger 
                  value="programa"
                  className="rounded-md h-8 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                             data-[state=active]:to-primary/90 data-[state=active]:text-white 
                             data-[state=active]:shadow-sm
                             transition-all duration-200 font-medium
                             hover:bg-primary/5 flex items-center justify-center gap-1.5"
                >
                  Programa Semanal
                </TabsTrigger>
                <TabsTrigger 
                  value="ensaios"
                  className="rounded-md h-8 text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary 
                             data-[state=active]:to-primary/90 data-[state=active]:text-white 
                             data-[state=active]:shadow-sm
                             transition-all duration-200 font-medium
                             hover:bg-primary/5 flex items-center justify-center gap-1.5"
                >
                  Participação nos Ensaios
                </TabsTrigger>
              </TabsList>

              <TabsContent value="programa" className="space-y-6 mt-6">
                <WeeklyProgramUpload
                  groupId={id!}
                  onUploadComplete={() => {
                    window.location.reload();
                  }}
                />
                <WeeklyProgramList groupId={id!} refreshTrigger={0} />
              </TabsContent>

              <TabsContent value="ensaios" className="space-y-6 mt-6">
                <RehearsalAttendance 
                  groupId={id!} 
                  members={members}
                  groupLeaders={{
                    president_id: group?.president_id,
                    vice_president_1_id: group?.vice_president_1_id,
                    vice_president_2_id: group?.vice_president_2_id,
                    secretary_1_id: group?.secretary_1_id,
                    secretary_2_id: group?.secretary_2_id,
                  }}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* Status Change Confirmation Dialog */}
        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  {memberToToggle?.isActive ? (
                    <UserX className="w-6 h-6 text-warning" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-success" />
                  )}
                </div>
                <AlertDialogTitle>
                  {memberToToggle?.isActive ? 'Desativar Membro' : 'Ativar Membro'}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Tem certeza que deseja {memberToToggle?.isActive ? 'desativar' : 'ativar'} este membro?
                {memberToToggle?.isActive && ' O membro não poderá mais acessar o sistema.'}
                {!memberToToggle?.isActive && ' O membro poderá voltar a acessar o sistema.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmToggleStatus}
                className={memberToToggle?.isActive ? "bg-warning hover:bg-warning/90" : "bg-success hover:bg-success/90"}
              >
                {memberToToggle?.isActive ? 'Desativar' : 'Ativar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
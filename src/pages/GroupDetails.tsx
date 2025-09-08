import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
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
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

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
          .select('id, name, role, partition, is_active, phone, member_code, profile_image_url')
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
      <div className="space-y-6">
        {/* Header with breadcrumb */}
        <div className="flex items-center space-x-2 md:space-x-4 mb-4 md:mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/groups')}
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden md:inline">Voltar</span>
          </Button>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-xs md:text-sm text-muted-foreground">Grupos</span>
          <span className="text-muted-foreground text-sm">/</span>
          <span className="text-xs md:text-sm font-medium text-foreground truncate">{group.name}</span>
        </div>

        {/* Group Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3 md:space-x-4">
            <div className="w-12 h-12 md:w-16 md:h-16 gradient-primary rounded-xl md:rounded-2xl flex items-center justify-center">
              <Building className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-2xl font-bold text-foreground mb-1 truncate">{group.name}</h1>
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                  <span className="text-sm truncate">{group.municipality}, {group.province}</span>
                </div>
                <Badge variant={group.is_active ? "default" : "secondary"} className="w-fit mt-1 md:mt-0">
                  {group.is_active ? "Ativo" : "Inativo"}
                </Badge>
              </div>
            </div>
          </div>
          
          {/* Action buttons below title */}
          <div className="flex flex-col sm:flex-row gap-2 sm:space-x-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/groups/${id}/edit`)}
              className="w-full sm:w-auto"
            >
              <Edit className="w-4 h-4" />
              Editar Grupo
            </Button>
            <Button
              variant="gradient"
              onClick={() => navigate(`/members/new?groupId=${id}`)}
              className="w-full sm:w-auto"
            >
              <UserPlus className="w-4 h-4" />
              Adicionar Membro
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate(`/plans/${id}`)}
              className="w-full sm:w-auto"
            >
              <CreditCard className="w-4 h-4" />
              Gerenciar Plano
            </Button>
          </div>
        </div>

        {/* Stats Cards - removed as requested */}

        {/* Tabs */}
        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Membros</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Financeiro</span>
            </TabsTrigger>
            <TabsTrigger value="info" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Informações</span>
            </TabsTrigger>
          </TabsList>

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
            <FinancialDashboard groupId={id!} />
          </TabsContent>

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
        </Tabs>
      </div>
    </MainLayout>
  );
}
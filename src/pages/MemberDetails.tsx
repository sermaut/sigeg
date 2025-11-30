import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useMember } from "@/hooks/useQueries";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { 
  ArrowLeft,
  Edit,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Music,
  User,
  Users,
  Shield,
  Crown,
  AlertTriangle,
  Eye,
  EyeOff,
  UserCheck,
  UserX
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { PageLoadingOverlay } from "@/components/common/LoadingIndicators";

interface Member {
  id: string;
  name: string;
  phone?: string;
  neighborhood?: string;
  birth_province?: string;
  birth_municipality?: string;
  birth_date?: string;
  profession?: string;
  education_level?: string;
  marital_status?: string;
  role?: string;
  partition?: string;
  member_code?: string;
  is_active: boolean;
  profile_image_url?: string;
  group_id: string;
  created_at: string;
  updated_at: string;
}

interface Group {
  id: string;
  name: string;
  province: string;
  municipality: string;
  direction: string;
}

export default function MemberDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const permissions = usePermissions();
  
  const [showMemberCode, setShowMemberCode] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);

  // Use React Query hooks with cache - queries run in parallel
  const { data: member, isLoading: memberLoading, refetch: refetchMember } = useMember(id || '');
  
  const { data: group, isLoading: groupLoading } = useQuery({
    queryKey: ['groups', member?.group_id],
    queryFn: async () => {
      if (!member?.group_id) return null;
      
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, province, municipality, direction')
        .eq('id', member.group_id)
        .single();

      if (error) throw error;
      return data as Group;
    },
    enabled: !!member?.group_id,
    staleTime: 30 * 60 * 1000, // 30 minutes cache
  });

  const loading = memberLoading || groupLoading;

  // Try to load from localStorage cache first for instant display
  const getCachedData = (key: string) => {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 30 * 60 * 1000) return data;
      }
    } catch {}
    return null;
  };

  const cachedMember = getCachedData(`member_${id}`);
  const displayMember = member || cachedMember;

  // Show cached data immediately
  if (loading && !displayMember) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Redirect if member not found
  if (!memberLoading && !displayMember && id) {
    navigate('/groups');
  }

  // Cache data for instant subsequent loads
  if (member && !loading) {
    localStorage.setItem(`cache_member_${id}`, JSON.stringify({ data: member, timestamp: Date.now() }));
  }

  const handleSoftDelete = () => {
    setStatusDialogOpen(true);
  };

  const confirmSoftDelete = async () => {
    if (!displayMember) return;
    
    try {
      const { error } = await supabase
        .from('members')
        .update({ 
          is_active: !displayMember.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', displayMember.id);
      
      if (error) throw error;
      
      toast({
        title: displayMember.is_active ? "Membro desativado" : "Membro reativado",
        description: `${displayMember.name} foi ${displayMember.is_active ? 'desativado' : 'reativado'} com sucesso.`,
      });
      
      refetchMember();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro",
        description: "Falha ao alterar status do membro",
        variant: "destructive",
      });
    } finally {
      setStatusDialogOpen(false);
    }
  };

  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'presidente':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'vice_presidente':
      case 'secretario':
        return <Shield className="w-5 h-5 text-blue-500" />;
      default:
        return <User className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const formatMaritalStatus = (status?: string) => {
    const statusMap: { [key: string]: string } = {
      'solteiro': 'Solteiro(a)',
      'casado': 'Casado(a)',
      'divorciado': 'Divorciado(a)',
      'viuvo': 'Viúvo(a)'
    };
    return status ? statusMap[status] || status : 'Não informado';
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const toggleMemberCodeVisibility = () => {
    setShowMemberCode(true);
    setTimeout(() => {
      setShowMemberCode(false);
    }, 10000);
  };

  if (loading && !displayMember) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  // Só mostrar "não encontrado" se já carregou e realmente não existe
  if (!memberLoading && !displayMember) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-foreground mb-4">Membro não encontrado</h1>
          <Button onClick={() => navigate('/groups')}>
            Voltar para Grupos
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Aguardar dados do grupo sem mostrar erro
  if (!displayMember || (displayMember && !group && groupLoading)) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageLoadingOverlay isLoading={loading} showCachedData={!!displayMember}>
        <div className="space-y-6">
        {/* Header with breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/groups/${group.id}`)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Grupos</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{group.name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Membro</span>
        </div>

        {/* Status Alert */}
        {!member.is_active && (
          <Alert className="border-orange-200 bg-orange-50">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              Este membro está inativo no sistema.
            </AlertDescription>
          </Alert>
        )}

        {/* Member Header */}
        <Card className="card-elevated">
          <div className="p-6 text-center">
            <Avatar className="w-20 h-20 mx-auto mb-4">
              <AvatarImage 
                src={member.profile_image_url} 
                alt={member.name}
              />
              <AvatarFallback className="gradient-primary text-white text-lg">
                {getInitials(member.name)}
              </AvatarFallback>
            </Avatar>
            
            <h1 className="text-xl font-bold text-foreground mb-4">{member.name}</h1>
            
            <div className="flex items-center justify-center space-x-3 mb-6">
              <PermissionGuard require="canEditMember">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/members/${member.id}/edit`)}
                >
                  <Edit className="w-4 h-4" />
                  Editar
                </Button>
              </PermissionGuard>
              <PermissionGuard require="canToggleMemberStatus">
                <Button
                  variant={member.is_active ? "destructive" : "default"}
                  onClick={handleSoftDelete}
                >
                  {member.is_active ? "Desativar" : "Reativar"}
                </Button>
              </PermissionGuard>
            </div>
          </div>
        </Card>

        {/* Member Details Tabs */}
        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Info. Pessoais</TabsTrigger>
            <TabsTrigger value="group">Info. do Grupo</TabsTrigger>
            <TabsTrigger value="observations">Observações</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2" />
                  Informações Pessoais
                </h3>
                
                <div className="space-y-4">
                  {permissions.canViewMemberBirthDate && member.birth_date && (
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Data de Nascimento</label>
                        <p className="text-foreground">
                          {new Date(member.birth_date).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>
                  )}

                  {(member.birth_province || member.birth_municipality) && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Local de Nascimento</label>
                        <p className="text-foreground">
                          {[member.birth_municipality, member.birth_province].filter(Boolean).join(', ')}
                        </p>
                      </div>
                    </div>
                  )}

                  {member.neighborhood && (
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Bairro</label>
                        <p className="text-foreground">{member.neighborhood}</p>
                      </div>
                    </div>
                  )}

                  {permissions.canViewMemberPhone && member.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Telefone</label>
                        <p className="text-foreground">{member.phone}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Heart className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Estado Civil</label>
                      <p className="text-foreground">{formatMaritalStatus(member.marital_status)}</p>
                    </div>
                  </div>

                  {member.profession && (
                    <div className="flex items-center space-x-3">
                      <Briefcase className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Profissão</label>
                        <p className="text-foreground">{member.profession}</p>
                      </div>
                    </div>
                  )}

                  {member.education_level && (
                    <div className="flex items-center space-x-3">
                      <GraduationCap className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nível de Escolaridade</label>
                        <p className="text-foreground">{member.education_level}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="group" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  Informações do Grupo
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Grupo</label>
                      <p className="text-foreground">{group.name}</p>
                    </div>
                  </div>

                  {member.role && (
                    <div className="flex items-center space-x-3">
                      {getRoleIcon(member.role)}
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Função</label>
                        <p className="text-foreground">{member.role.replace('_', ' ')}</p>
                      </div>
                    </div>
                  )}

                  {member.partition && (
                    <div className="flex items-center space-x-3">
                      <Music className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Partição Musical</label>
                        <p className="text-foreground capitalize">{member.partition}</p>
                      </div>
                    </div>
                  )}

                  {permissions.canViewMemberCode && member.member_code && (
                    <div className="flex items-center space-x-3">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <div className="flex-1">
                        <label className="text-sm font-medium text-muted-foreground">Código de Membro</label>
                        <div className="flex items-center space-x-2">
                          {showMemberCode ? (
                            <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                              {member.member_code}
                            </code>
                          ) : (
                            <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                              ••••••••
                            </code>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleMemberCodeVisibility}
                            className="h-6 w-6 p-0"
                          >
                            {showMemberCode ? (
                              <EyeOff className="w-3 h-3" />
                            ) : (
                              <Eye className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Data de Cadastro</label>
                      <p className="text-foreground">
                        {new Date(member.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Última Atualização</label>
                      <p className="text-foreground">
                        {new Date(member.updated_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Badge variant={member.is_active ? "default" : "secondary"}>
                        {member.is_active ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="observations" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Observações
                </h3>
                <p className="text-muted-foreground">
                  Nenhuma observação registrada para este membro.
                </p>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Status Change Confirmation Dialog */}
        <AlertDialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                  {member?.is_active ? (
                    <UserX className="w-6 h-6 text-warning" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-success" />
                  )}
                </div>
                <AlertDialogTitle>
                  {member?.is_active ? 'Desativar Membro' : 'Reativar Membro'}
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription>
                Tem certeza que deseja {member?.is_active ? 'desativar' : 'reativar'} {member?.name}?
                {member?.is_active && ' O membro não poderá mais acessar o sistema.'}
                {!member?.is_active && ' O membro poderá voltar a acessar o sistema.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSoftDelete}
                className={member?.is_active ? "bg-warning hover:bg-warning/90" : "bg-success hover:bg-success/90"}
              >
                {member?.is_active ? 'Desativar' : 'Reativar'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      </PageLoadingOverlay>
    </MainLayout>
  );
}
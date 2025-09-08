import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  EyeOff
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
  
  const [member, setMember] = useState<Member | null>(null);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMemberCode, setShowMemberCode] = useState(false);

  useEffect(() => {
    if (id) {
      loadMemberDetails();
    }
  }, [id]);

  async function loadMemberDetails() {
    try {
      // Carregar dados do membro
      const { data: memberData, error: memberError } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (memberError) throw memberError;
      setMember(memberData);

      // Carregar dados do grupo
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id, name, province, municipality, direction')
        .eq('id', memberData.group_id)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

    } catch (error) {
      console.error('Erro ao carregar detalhes do membro:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do membro",
        variant: "destructive",
      });
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }

  const handleSoftDelete = async () => {
    if (!member) return;
    
    const confirmMessage = `Tem certeza que deseja ${member.is_active ? 'desativar' : 'reativar'} o membro ${member.name}?`;
    
    if (confirm(confirmMessage)) {
      try {
        const { error } = await supabase
          .from('members')
          .update({ 
            is_active: !member.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', member.id);
        
        if (error) throw error;
        
        toast({
          title: `Membro ${!member.is_active ? 'reativado' : 'desativado'} com sucesso!`,
        });
        
        // Reload member data
        loadMemberDetails();
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

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  if (!member || !group) {
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

  return (
    <MainLayout>
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
              <Button
                variant="outline"
                onClick={() => navigate(`/members/${member.id}/edit`)}
              >
                <Edit className="w-4 h-4" />
                Editar
              </Button>
              <Button
                variant={member.is_active ? "destructive" : "default"}
                onClick={handleSoftDelete}
              >
                {member.is_active ? "Desativar" : "Reativar"}
              </Button>
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
                  {member.birth_date && (
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

                  {member.phone && (
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

                  {member.member_code && (
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
      </div>
    </MainLayout>
  );
}
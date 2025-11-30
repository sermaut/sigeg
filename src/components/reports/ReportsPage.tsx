import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { 
  Users, 
  Building, 
  Download, 
  FileText, 
  BarChart3, 
  Activity,
  Crown,
  Music,
  Filter,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportData {
  totalGroups: number;
  activeGroups: number;
  totalMembers: number;
  activeMembers: number;
  membersByPartition: { [key: string]: number };
  membersByRole: { [key: string]: number };
  groupsByProvince: { [key: string]: number };
  recentJoins: any[];
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    totalGroups: 0,
    activeGroups: 0,
    totalMembers: 0,
    activeMembers: 0,
    membersByPartition: {},
    membersByRole: {},
    groupsByProvince: {},
    recentJoins: []
  });
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    loadReportData();
  }, [selectedGroup]);

  async function loadReportData() {
    try {
      setLoading(true);

      // Base queries
      let groupsQuery = supabase.from('groups').select('*');
      let membersQuery = supabase.from('members').select('*');

      // Filter by group if selected
      if (selectedGroup !== "all") {
        membersQuery = membersQuery.eq('group_id', selectedGroup);
      }

      const [groupsResponse, membersResponse] = await Promise.all([
        groupsQuery,
        membersQuery
      ]);

      const groups = groupsResponse.data || [];
      const members = membersResponse.data || [];

      // Calculate statistics
      const totalGroups = groups.length;
      const activeGroups = groups.filter(g => g.is_active).length;
      const totalMembers = members.length;
      const activeMembers = members.filter(m => m.is_active).length;

      // Group by partition
      const membersByPartition = members.reduce((acc, member) => {
        if (member.partition) {
          acc[member.partition] = (acc[member.partition] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });

      // Group by role
      const membersByRole = members.reduce((acc, member) => {
        if (member.role) {
          acc[member.role] = (acc[member.role] || 0) + 1;
        }
        return acc;
      }, {} as { [key: string]: number });

      // Group by province
      const groupsByProvince = groups.reduce((acc, group) => {
        acc[group.province] = (acc[group.province] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number });

      // Recent joins (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentJoins = members
        .filter(m => new Date(m.created_at) >= thirtyDaysAgo)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 10);

      setReportData({
        totalGroups,
        activeGroups,
        totalMembers,
        activeMembers,
        membersByPartition,
        membersByRole,
        groupsByProvince,
        recentJoins
      });

      setGroups(groups);
    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do relatório",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const exportToCSV = async (type: string) => {
    try {
      let data: any[] = [];
      let filename = '';

      if (type === 'members') {
        const { data: members } = await supabase
          .from('members')
          .select('*, groups(name)')
          .eq('group_id', selectedGroup !== 'all' ? selectedGroup : undefined);
        
        data = members || [];
        filename = 'membros.csv';
      } else if (type === 'groups') {
        const { data: groups } = await supabase
          .from('groups')
          .select('*');
        
        data = groups || [];
        filename = 'grupos.csv';
      }

      // Convert to CSV
      if (data.length === 0) {
        toast({
          title: "Aviso",
          description: "Nenhum dado encontrado para exportar",
          variant: "default",
        });
        return;
      }

      const headers = Object.keys(data[0]).join(',');
      const rows = data.map(row => Object.values(row).join(',')).join('\n');
      const csv = `${headers}\n${rows}`;

      // Download
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Sucesso",
        description: "Relatório exportado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Falha ao exportar relatório",
        variant: "destructive",
      });
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

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('reports.title')}</h1>
            <p className="text-muted-foreground">
              {t('reports.description')}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder={t('reports.filterByGroup')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('reports.allGroups')}</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="card-elevated">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {reportData.totalGroups}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Building className="w-4 h-4 mr-1" />
                {t('reports.totalGroups')}
              </div>
            </div>
          </Card>

          <Card className="card-elevated">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {reportData.totalMembers}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Users className="w-4 h-4 mr-1" />
                {t('reports.totalMembers')}
              </div>
            </div>
          </Card>

          <Card className="card-elevated">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-success mb-2">
                {reportData.activeMembers}
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <Activity className="w-4 h-4 mr-1" />
                {t('reports.activeMembers')}
              </div>
            </div>
          </Card>

          <Card className="card-elevated">
            <div className="p-6 text-center">
              <div className="text-3xl font-bold text-accent mb-2">
                {reportData.totalMembers > 0 
                  ? Math.round((reportData.activeMembers / reportData.totalMembers) * 100)
                  : 0
                }%
              </div>
              <div className="text-sm text-muted-foreground flex items-center justify-center">
                <BarChart3 className="w-4 h-4 mr-1" />
                {t('reports.activityRate')}
              </div>
            </div>
          </Card>
        </div>

        {/* Detailed Reports */}
        <Tabs defaultValue="distributions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="distributions">{t('reports.distributions')}</TabsTrigger>
            <TabsTrigger value="activity">{t('reports.activity')}</TabsTrigger>
            <TabsTrigger value="geography">{t('reports.geography')}</TabsTrigger>
            <TabsTrigger value="export">{t('reports.exports')}</TabsTrigger>
          </TabsList>

          <TabsContent value="distributions" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Partitions Distribution */}
              <Card className="card-elevated">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Music className="w-5 h-5 mr-2" />
                    Distribuição por Partições
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reportData.membersByPartition).map(([partition, count]) => (
                      <div key={partition} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{partition}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full"
                              style={{ 
                                width: `${(count / reportData.totalMembers) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* Roles Distribution */}
              <Card className="card-elevated">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Crown className="w-5 h-5 mr-2" />
                    Distribuição por Funções
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reportData.membersByRole).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between">
                        <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-accent rounded-full"
                              style={{ 
                                width: `${(count / reportData.totalMembers) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Novos Membros (Últimos 30 dias)
                </h3>
                <div className="space-y-4">
                  {reportData.recentJoins.length > 0 ? (
                    reportData.recentJoins.map((member) => (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {member.role && (
                              <Badge variant="outline" className="mr-2">
                                {member.role}
                              </Badge>
                            )}
                            {member.partition && (
                              <Badge variant="outline">
                                {member.partition}
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(member.created_at).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      Nenhum novo membro nos últimos 30 dias
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="geography" className="space-y-6">
            <Card className="card-elevated">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Distribuição Geográfica dos Grupos
                </h3>
                <div className="space-y-3">
                  {Object.entries(reportData.groupsByProvince).map(([province, count]) => (
                    <div key={province} className="flex items-center justify-between">
                      <span className="text-sm">{province}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-success rounded-full"
                            style={{ 
                              width: `${(count / reportData.totalGroups) * 100}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium">{count} grupos</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-elevated">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    Exportar Dados de Membros
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Baixe uma planilha com todos os dados dos membros
                  </p>
                  <Button 
                    onClick={() => exportToCSV('members')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Membros (CSV)
                  </Button>
                </div>
              </Card>

              <Card className="card-elevated">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2" />
                    Exportar Dados de Grupos
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Baixe uma planilha com todos os dados dos grupos
                  </p>
                  <Button 
                    onClick={() => exportToCSV('groups')}
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Grupos (CSV)
                  </Button>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
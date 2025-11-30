import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { Calendar as CalendarIcon, Users, Save, Music, Crown, Shield, ChevronDown, Eye, Loader2, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format, startOfMonth, endOfMonth, getWeek, startOfWeek, endOfWeek } from "date-fns";
import { pt } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";

interface Member {
  id: string;
  name: string;
  partition?: string;
  is_active: boolean;
}

interface GroupLeaders {
  president_id?: string;
  vice_president_1_id?: string;
  vice_president_2_id?: string;
  secretary_1_id?: string;
  secretary_2_id?: string;
}

interface RehearsalAttendanceProps {
  groupId: string;
  members: Member[];
  groupLeaders?: GroupLeaders;
}

interface DayRecord {
  date: string;
  membersByPartition: Record<string, { id: string; name: string }[]>;
  totalCount: number;
}

interface WeekRecord {
  weekNumber: number;
  weekLabel: string;
  days: DayRecord[];
  totalCount: number;
}

export function RehearsalAttendance({ groupId, members, groupLeaders }: RehearsalAttendanceProps) {
  const [date, setDate] = useState<Date>();
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [expandedPartitions, setExpandedPartitions] = useState<Set<string>>(new Set());
  const [showRecordsDialog, setShowRecordsDialog] = useState(false);
  const [monthlyRecords, setMonthlyRecords] = useState<any[]>([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [expandedWeeks, setExpandedWeeks] = useState<Set<number>>(new Set());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const permissions = usePermissions();

  // Filter only active members
  const activeMembers = members.filter(m => m.is_active);

  // Group members by partition
  const membersByPartition = activeMembers.reduce((acc, member) => {
    const partition = member.partition || "Sem Partição";
    if (!acc[partition]) {
      acc[partition] = [];
    }
    acc[partition].push(member);
    return acc;
  }, {} as Record<string, Member[]>);

  const partitionOrder = [
    "soprano",
    "alto",
    "contralto",
    "tenor",
    "baixo",
    "base",
    "instrumental",
    "Sem Partição"
  ];

  const sortedPartitions = Object.keys(membersByPartition).sort((a, b) => {
    const indexA = partitionOrder.indexOf(a);
    const indexB = partitionOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const getPartitionLabel = (partition: string) => {
    const labels: Record<string, string> = {
      soprano: "Soprano",
      alto: "Alto/Contralto",
      contralto: "Contralto",
      tenor: "Tenor",
      baixo: "Baixo",
      base: "Baixo/Base",
      instrumental: "Instrumental",
    };
    return labels[partition] || partition;
  };

  const toggleMember = (memberId: string) => {
    const newSelected = new Set(selectedMembers);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedMembers(newSelected);
  };

  const togglePartitionExpansion = (partition: string) => {
    const newExpanded = new Set(expandedPartitions);
    if (newExpanded.has(partition)) {
      newExpanded.delete(partition);
    } else {
      newExpanded.add(partition);
    }
    setExpandedPartitions(newExpanded);
  };

  const togglePartition = (partition: string) => {
    const partitionMembers = membersByPartition[partition];
    const allSelected = partitionMembers.every(m => selectedMembers.has(m.id));
    
    const newSelected = new Set(selectedMembers);
    partitionMembers.forEach(member => {
      if (allSelected) {
        newSelected.delete(member.id);
      } else {
        newSelected.add(member.id);
      }
    });
    setSelectedMembers(newSelected);
  };

  const getPartitionLeaders = (partition: string) => {
    if (!groupLeaders) return [];
    
    const leaderIds = [
      groupLeaders.president_id,
      groupLeaders.vice_president_1_id,
      groupLeaders.vice_president_2_id,
      groupLeaders.secretary_1_id,
      groupLeaders.secretary_2_id,
    ].filter(Boolean);
    
    return members.filter(m => 
      leaderIds.includes(m.id) && m.partition === partition
    );
  };

  const loadMonthlyRecords = async () => {
    setLoadingRecords(true);
    try {
      const currentMonth = format(new Date(), 'yyyy-MM');
      
      // Check for and delete records from previous months
      const { data: oldRecords, error: oldRecordsError } = await supabase
        .from('rehearsal_attendance')
        .select('id')
        .eq('group_id', groupId)
        .neq('month_year', currentMonth);

      if (!oldRecordsError && oldRecords && oldRecords.length > 0) {
        const { error: deleteError } = await supabase
          .from('rehearsal_attendance')
          .delete()
          .eq('group_id', groupId)
          .neq('month_year', currentMonth);
        
        if (!deleteError && permissions.canSelectRehearsalDate) {
          toast({
            title: "Registros arquivados",
            description: `${oldRecords.length} registro(s) do mês anterior foram excluídos automaticamente.`,
          });
        }
      }
      
      const { data: attendanceData, error: attendanceError } = await supabase
        .from('rehearsal_attendance')
        .select('*')
        .eq('group_id', groupId)
        .eq('month_year', currentMonth)
        .order('rehearsal_date', { ascending: false });

      if (attendanceError) throw attendanceError;
      
      const memberMap = new Map(
        members.map(m => [m.id, { name: m.name, partition: m.partition }])
      );
      
      const enrichedData = attendanceData.map(record => ({
        ...record,
        member: memberMap.get(record.member_id) || { name: 'Desconhecido', partition: null }
      }));
      
      const groupedByDate = enrichedData.reduce((acc: any, record: any) => {
        const dateKey = record.rehearsal_date;
        if (!acc[dateKey]) {
          acc[dateKey] = [];
        }
        acc[dateKey].push(record);
        return acc;
      }, {});
      
      setMonthlyRecords(Object.entries(groupedByDate).map(([date, records]) => ({
        date,
        records,
        count: (records as any[]).length
      })));
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os registros",
        variant: "destructive",
      });
    } finally {
      setLoadingRecords(false);
    }
  };

  // Process monthly records into weeks and days with partition grouping
  const processedRecords = useMemo((): WeekRecord[] => {
    if (monthlyRecords.length === 0) return [];

    const weekMap = new Map<number, DayRecord[]>();

    monthlyRecords.forEach((record) => {
      const recordDate = new Date(record.date);
      const weekNum = getWeek(recordDate, { locale: pt, weekStartsOn: 0 });
      
      // Group members by partition for this day
      const membersByPart: Record<string, { id: string; name: string }[]> = {};
      
      record.records.forEach((r: any) => {
        const partition = r.member?.partition || "Sem Partição";
        if (!membersByPart[partition]) {
          membersByPart[partition] = [];
        }
        membersByPart[partition].push({
          id: r.member_id,
          name: r.member?.name || 'Desconhecido'
        });
      });

      // Sort members alphabetically within each partition
      Object.keys(membersByPart).forEach(partition => {
        membersByPart[partition].sort((a, b) => a.name.localeCompare(b.name));
      });

      const dayRecord: DayRecord = {
        date: record.date,
        membersByPartition: membersByPart,
        totalCount: record.count
      };

      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, []);
      }
      weekMap.get(weekNum)!.push(dayRecord);
    });

    // Convert to array and sort
    const weeks: WeekRecord[] = [];
    weekMap.forEach((days, weekNum) => {
      // Sort days within week (most recent first)
      days.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Count unique members in the week (not total attendances)
      const uniqueMembersInWeek = new Set<string>();
      days.forEach(day => {
        Object.values(day.membersByPartition).flat().forEach(m => uniqueMembersInWeek.add(m.id));
      });
      const uniqueMembersCount = uniqueMembersInWeek.size;
      
      // Get week date range
      const firstDayOfWeek = days[days.length - 1]?.date;
      const lastDayOfWeek = days[0]?.date;
      
      const weekLabel = firstDayOfWeek && lastDayOfWeek
        ? `Semana ${weekNum} (${format(new Date(firstDayOfWeek), 'dd')}-${format(new Date(lastDayOfWeek), 'dd MMM', { locale: pt })})`
        : `Semana ${weekNum}`;

      weeks.push({
        weekNumber: weekNum,
        weekLabel,
        days,
        totalCount: uniqueMembersCount // Now represents unique members, not total attendances
      });
    });

    // Sort weeks (most recent first)
    weeks.sort((a, b) => b.weekNumber - a.weekNumber);

    return weeks;
  }, [monthlyRecords]);

  const toggleWeekExpansion = (weekNum: number) => {
    const newExpanded = new Set(expandedWeeks);
    if (newExpanded.has(weekNum)) {
      newExpanded.delete(weekNum);
    } else {
      newExpanded.add(weekNum);
    }
    setExpandedWeeks(newExpanded);
  };

  const toggleDayExpansion = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const deleteWeekRecords = async (weekNumber: number) => {
    try {
      const weekDays = processedRecords.find(w => w.weekNumber === weekNumber)?.days || [];
      const datesToDelete = weekDays.map(d => d.date);
      
      if (datesToDelete.length === 0) return;

      const { error } = await supabase
        .from('rehearsal_attendance')
        .delete()
        .eq('group_id', groupId)
        .in('rehearsal_date', datesToDelete);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Registros da semana ${weekNumber} excluídos.`,
      });
      loadMonthlyRecords();
    } catch (error) {
      console.error('Erro ao excluir semana:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os registros da semana.",
        variant: "destructive",
      });
    }
  };

  const deleteDayRecords = async (date: string) => {
    try {
      const { error } = await supabase
        .from('rehearsal_attendance')
        .delete()
        .eq('group_id', groupId)
        .eq('rehearsal_date', date);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Registros do dia ${format(new Date(date), "dd/MM/yyyy")} excluídos.`,
      });
      loadMonthlyRecords();
    } catch (error) {
      console.error('Erro ao excluir dia:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os registros do dia.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (showRecordsDialog) {
      loadMonthlyRecords();
      // Reset expansion state when dialog opens
      setExpandedWeeks(new Set());
      setExpandedDays(new Set());
    }
  }, [showRecordsDialog]);

  const handleSave = async () => {
    if (!date) {
      toast({
        title: "Erro",
        description: "Por favor, selecione uma data",
        variant: "destructive",
      });
      return;
    }

    if (selectedMembers.size === 0) {
      toast({
        title: "Erro",
        description: "Por favor, selecione pelo menos um membro",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const monthYear = format(date, 'yyyy-MM');
      const attendanceRecords = Array.from(selectedMembers).map(memberId => ({
        group_id: groupId,
        member_id: memberId,
        rehearsal_date: format(date, "yyyy-MM-dd"),
        month_year: monthYear,
        created_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('rehearsal_attendance')
        .insert(attendanceRecords);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: `Presença registrada para ${selectedMembers.size} membros em ${format(date, "dd/MM/yyyy", { locale: pt })}`,
      });

      setSelectedMembers(new Set());
      setDate(undefined);
    } catch (error: any) {
      console.error("Erro ao salvar presença:", error);
      
      if (error.code === '23505') {
        toast({
          title: "Atenção",
          description: "Já existe um registro para esta data. Use o botão 'Ver Registros' para visualizar.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro",
          description: "Falha ao registrar presença. Tente novamente.",
          variant: "destructive",
        });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-2 border-primary/10 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-accent/5 pb-3">
          <div className="flex flex-col gap-3">
            <CardTitle className="text-foreground flex items-center justify-center gap-2 text-base">
              <Music className="w-5 h-5 text-primary" />
              Registros de Presença nos Ensaios
            </CardTitle>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <PermissionGuard require="canSelectRehearsalDate">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="border-primary/20 text-xs h-8 px-2.5">
                      <CalendarIcon className="mr-1.5 h-4 w-4" />
                      {date ? format(date, "dd/MM/yyyy", { locale: pt }) : "Selecionar data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      locale={pt}
                      disabled={(date) => date > new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </PermissionGuard>
              
              <Button
                variant="outline"
                onClick={() => setShowRecordsDialog(true)}
                className="border-primary/20 text-xs h-8 px-2.5"
              >
                <Eye className="mr-1.5 h-4 w-4" />
                Ver Registros
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-3">
          <div className="space-y-6">
            {sortedPartitions.map((partition) => {
              const partitionMembers = membersByPartition[partition];
              const allSelected = partitionMembers.every(m => selectedMembers.has(m.id));
              const someSelected = partitionMembers.some(m => selectedMembers.has(m.id));
              const isExpanded = expandedPartitions.has(partition);
              const partitionLeaders = getPartitionLeaders(partition);

              // Sort members: selected first, then alphabetically
              const sortedMembers = [...partitionMembers].sort((a, b) => {
                const aSelected = selectedMembers.has(a.id);
                const bSelected = selectedMembers.has(b.id);
                if (aSelected && !bSelected) return -1;
                if (!aSelected && bSelected) return 1;
                return a.name.localeCompare(b.name);
              });

              const selectedInPartition = partitionMembers.filter(m => selectedMembers.has(m.id)).length;

              return (
                <Collapsible
                  key={partition}
                  open={isExpanded}
                  onOpenChange={() => togglePartitionExpansion(partition)}
                >
                  <div className="space-y-3">
                    <CollapsibleTrigger asChild>
                      <div className="flex items-center justify-between p-3 bg-gradient-to-r from-primary/5 to-accent/5 rounded-lg border border-primary/10 cursor-pointer hover:border-primary/20 transition-colors">
                        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={allSelected}
                            onCheckedChange={() => togglePartition(partition)}
                            className="border-primary/30"
                          />
                          <h3 className="font-semibold text-foreground">
                            {getPartitionLabel(partition)}
                          </h3>
                          <Badge variant="outline" className="border-primary/20 text-primary">
                            {selectedInPartition} {selectedInPartition === 1 ? "membro" : "membros"}
                          </Badge>
                          {someSelected && !allSelected && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary">
                              Parcial
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {partitionLeaders.length > 0 && (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Crown className="w-4 h-4 text-amber-500" />
                                </Button>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-64">
                                <div className="space-y-2">
                                  <h4 className="font-semibold text-sm">Chefes desta partição:</h4>
                                  <ul className="text-sm space-y-1">
                                    {partitionLeaders.map(leader => (
                                      <li key={leader.id} className="flex items-center gap-2">
                                        <Shield className="w-3 h-3 text-primary" />
                                        {leader.name}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          )}
                          <ChevronDown 
                            className={`w-5 h-5 text-primary transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>
                      </div>
                    </CollapsibleTrigger>

                    <CollapsibleContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pl-4 mt-3">
                        {sortedMembers.map((member) => (
                          <div
                            key={member.id}
                            className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border hover:border-primary/30 transition-colors cursor-pointer"
                            onClick={() => toggleMember(member.id)}
                          >
                            <Checkbox
                              checked={selectedMembers.has(member.id)}
                              onCheckedChange={() => toggleMember(member.id)}
                              className="border-primary/30"
                            />
                            <div className="flex items-center gap-2 flex-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-foreground">{member.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              );
            })}
          </div>

          {activeMembers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum membro ativo encontrado</p>
            </div>
          )}

          {activeMembers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-primary/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                <strong className="text-foreground">{selectedMembers.size}</strong> de{" "}
                <strong className="text-foreground">{activeMembers.length}</strong> membros selecionados
              </div>
              <Button
                onClick={handleSave}
                disabled={!date || selectedMembers.size === 0 || saving}
                variant="gradient"
                className="shadow-md"
              >
                {saving ? (
                  <>
                    <Save className="w-4 h-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Presença
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Registros Mensais - Reorganized */}
      <Dialog open={showRecordsDialog} onOpenChange={setShowRecordsDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-[4px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Registros de {format(new Date(), 'MMMM yyyy', { locale: pt })}
            </DialogTitle>
            <DialogDescription>
              Visualize todos os registros de presença deste mês, agrupados por semana e partição
            </DialogDescription>
          </DialogHeader>
          
          {loadingRecords ? (
            <div className="text-center py-8">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
            </div>
          ) : processedRecords.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Nenhum registro encontrado neste mês</p>
            </div>
          ) : (
            <div className="space-y-3">
              {processedRecords.map((week) => (
                <Collapsible
                  key={week.weekNumber}
                  open={expandedWeeks.has(week.weekNumber)}
                  onOpenChange={() => toggleWeekExpansion(week.weekNumber)}
                >
                  <Card className="border-primary/10 p-[4px]">
                    <CardHeader className="p-[4px] cursor-pointer hover:bg-primary/5 transition-colors relative">
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between pr-8">
                          <CardTitle className="text-sm flex items-center gap-2">
                            <ChevronDown 
                              className={`w-4 h-4 text-primary transition-transform ${expandedWeeks.has(week.weekNumber) ? 'rotate-180' : ''}`}
                            />
                            {week.weekLabel}
                          </CardTitle>
                          <Badge variant="outline" className="border-primary/20">
                            {week.totalCount} {week.totalCount === 1 ? 'membro' : 'membros'}
                          </Badge>
                        </div>
                      </CollapsibleTrigger>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir semana?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Todos os registros de presença da {week.weekLabel} serão excluídos permanentemente.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => deleteWeekRecords(week.weekNumber)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardHeader>
                    
                    <CollapsibleContent>
                      <CardContent className="pt-0 p-[4px] space-y-2">
                        {week.days.map((day) => (
                          <Collapsible
                            key={day.date}
                            open={expandedDays.has(day.date)}
                            onOpenChange={() => toggleDayExpansion(day.date)}
                          >
                            <Card className="border-border/50 p-[4px]">
                              <CardHeader className="py-1 px-2 cursor-pointer hover:bg-muted/50 transition-colors relative">
                                <CollapsibleTrigger asChild>
                                  <div className="flex items-center justify-between pr-8">
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                      <ChevronDown 
                                        className={`w-3 h-3 text-muted-foreground transition-transform ${expandedDays.has(day.date) ? 'rotate-180' : ''}`}
                                      />
                                      {format(new Date(day.date), "dd 'de' MMMM", { locale: pt })}
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {day.totalCount} {day.totalCount === 1 ? 'presente' : 'presentes'}
                                    </Badge>
                                  </div>
                                </CollapsibleTrigger>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="absolute top-1 right-1 h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Excluir dia?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Todos os registros de presença do dia {format(new Date(day.date), "dd/MM/yyyy")} serão excluídos permanentemente.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction onClick={() => deleteDayRecords(day.date)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                        Excluir
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </CardHeader>
                              
                              <CollapsibleContent>
                                <CardContent className="pt-0 pb-2 px-2">
                                  <div className="space-y-2">
                                    {partitionOrder
                                      .filter(p => day.membersByPartition[p]?.length > 0)
                                      .map((partition) => (
                                        <div key={partition} className="p-2 bg-primary/5 rounded-lg">
                                          <Badge variant="outline" className="border-primary/30 text-xs mb-2">
                                            {getPartitionLabel(partition)} ({day.membersByPartition[partition].length})
                                          </Badge>
                                          <div className="flex flex-wrap gap-1.5 mt-1">
                                            {day.membersByPartition[partition].map((m) => (
                                              <span key={m.id} className="text-xs bg-background px-2 py-0.5 rounded border border-border">
                                                {m.name}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      ))}
                                    {/* Handle "Sem Partição" */}
                                    {day.membersByPartition["Sem Partição"]?.length > 0 && (
                                      <div className="p-2 bg-muted/50 rounded-lg">
                                        <Badge variant="outline" className="border-muted-foreground/30 text-xs mb-2">
                                          Sem Partição ({day.membersByPartition["Sem Partição"].length})
                                        </Badge>
                                        <div className="flex flex-wrap gap-1.5 mt-1">
                                          {day.membersByPartition["Sem Partição"].map((m) => (
                                            <span key={m.id} className="text-xs bg-background px-2 py-0.5 rounded border border-border">
                                              {m.name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </CollapsibleContent>
                            </Card>
                          </Collapsible>
                        ))}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, Calendar, Music, FileText, Edit, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import { WeeklyProgramEditDialog } from "./WeeklyProgramEditDialog";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
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

interface ProgramItem {
  subtitle?: string;
  image_url?: string;
  audio_url?: string;
}

interface WeeklyProgram {
  id: string;
  title: string;
  category: string;
  items: ProgramItem[];
  image_url: string | null;
  audio_url: string | null;
  created_at: string;
  expires_at: string;
}

interface WeeklyProgramListProps {
  groupId: string;
  refreshTrigger: number;
}

export function WeeklyProgramList({ groupId, refreshTrigger }: WeeklyProgramListProps) {
  const [programs, setPrograms] = useState<WeeklyProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const [editProgram, setEditProgram] = useState<WeeklyProgram | null>(null);
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({});
  const { toast } = useToast();
  const permissions = usePermissions();

  useEffect(() => {
    loadPrograms();
  }, [groupId, refreshTrigger]);

  const loadPrograms = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_program_content')
        .select('*')
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      // Converter items de Json para ProgramItem[]
      const typedPrograms = (data || []).map(program => ({
        ...program,
        items: Array.isArray(program.items) ? program.items as ProgramItem[] : []
      }));
      setPrograms(typedPrograms);
      
      // Inicializar todos os programas como expandidos
      const initialExpanded: Record<string, boolean> = {};
      typedPrograms.forEach(p => {
        initialExpanded[p.id] = true;
      });
      setExpandedPrograms(initialExpanded);
    } catch (error) {
      console.error('Erro ao carregar programas:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar programas semanais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('weekly_program_content')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Programa removido com sucesso",
      });

      loadPrograms();
    } catch (error) {
      console.error('Erro ao remover programa:', error);
      toast({
        title: "Erro",
        description: "Falha ao remover programa",
        variant: "destructive",
      });
    } finally {
      setDeleteId(null);
    }
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days;
  };

  const hymnsPrograms = programs.filter(p => p.category === 'hino');
  const accompanimentPrograms = programs.filter(p => p.category === 'acompanhamento');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (programs.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">
          Nenhum programa semanal adicionado ainda
        </p>
      </Card>
    );
  }

  const toggleProgram = (programId: string) => {
    setExpandedPrograms(prev => ({
      ...prev,
      [programId]: !prev[programId]
    }));
  };

  const renderProgram = (program: WeeklyProgram) => {
    const daysRemaining = getDaysRemaining(program.expires_at);
    const isExpanded = expandedPrograms[program.id] ?? true;
    
    return (
      <Card key={program.id} className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-shadow duration-300">
        <Collapsible open={isExpanded} onOpenChange={() => toggleProgram(program.id)}>
          <div className="p-4 space-y-3 bg-gradient-to-br from-background to-accent/5">
            <div className="flex items-start justify-between">
              <CollapsibleTrigger className="flex items-center gap-2 hover:opacity-70 transition-opacity">
                <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  {program.title}
                </h3>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </CollapsibleTrigger>
              <div className="flex gap-2 flex-shrink-0">
              <PermissionGuard require="canEditWeeklyProgram">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setEditProgram(program)}
                  className="text-primary hover:text-primary hover:bg-primary/10"
                >
                  <Edit className="w-4 h-4" />
                </Button>
              </PermissionGuard>
              <PermissionGuard require="canDeleteWeeklyProgram">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteId(program.id)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </PermissionGuard>
            </div>
          </div>

          <CollapsibleContent>
            {/* Renderizar items */}
            {program.items && Array.isArray(program.items) && program.items.length > 0 && (
            <div className="space-y-4">
              {program.items.map((item: ProgramItem, index: number) => (
                <div key={index} className="space-y-2 p-3 bg-background/50 rounded-lg border border-primary/10">
                  {item.subtitle && (
                    <p className="text-sm font-medium text-foreground">{item.subtitle}</p>
                  )}
                  
                  {item.image_url && (
                    <div
                      className="relative cursor-pointer group"
                      onClick={() => setFullscreenImage(item.image_url!)}
                    >
                      <img
                        src={item.image_url}
                        alt={item.subtitle || `Item ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                    </div>
                  )}

                  {item.audio_url && (
                    <CustomAudioPlayer audioUrl={item.audio_url} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Legado: imagem e áudio únicos (para programas antigos) */}
          {program.image_url && (
            <div
              className="relative cursor-pointer group"
              onClick={() => setFullscreenImage(program.image_url!)}
            >
              <img
                src={program.image_url}
                alt={program.title}
                className="w-full h-64 object-cover rounded-lg border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
            </div>
          )}

          {program.audio_url && (
            <CustomAudioPlayer audioUrl={program.audio_url} />
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-primary/10">
            <div className="flex items-center">
              <Calendar className="w-3 h-3 mr-1" />
              Expira em {daysRemaining} {daysRemaining === 1 ? 'dia' : 'dias'}
            </div>
            <span>
              {new Date(program.created_at).toLocaleDateString('pt-BR')}
            </span>
          </div>
          </CollapsibleContent>
          </div>
        </Collapsible>
      </Card>
    );
  };

  return (
    <>
      <Tabs defaultValue="hinos" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="hinos">
            Hinos ({hymnsPrograms.length})
          </TabsTrigger>
          <TabsTrigger value="acompanhamentos">
            Acompanhamentos ({accompanimentPrograms.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hinos" className="space-y-4">
          {hymnsPrograms.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum programa de hino adicionado ainda
              </p>
            </Card>
          ) : (
            hymnsPrograms.map(renderProgram)
          )}
        </TabsContent>

        <TabsContent value="acompanhamentos" className="space-y-4">
          {accompanimentPrograms.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">
                Nenhum programa de acompanhamento adicionado ainda
              </p>
            </Card>
          ) : (
            accompanimentPrograms.map(renderProgram)
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={deleteId !== null} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover este programa? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && handleDelete(deleteId)}
              className="bg-destructive hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {fullscreenImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={fullscreenImage}
              alt="Fullscreen"
              className="max-w-full max-h-screen object-contain"
            />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-white hover:bg-white/20"
              onClick={() => setFullscreenImage(null)}
            >
              <Trash2 className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {editProgram && (
        <WeeklyProgramEditDialog
          program={editProgram}
          onClose={() => setEditProgram(null)}
          onUpdate={loadPrograms}
        />
      )}
    </>
  );
}

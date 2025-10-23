import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Calendar, Music, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CustomAudioPlayer } from "./CustomAudioPlayer";
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

interface WeeklyProgram {
  id: string;
  title: string;
  image_url: string;
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
  const { toast } = useToast();

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
      setPrograms(data || []);
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

  return (
    <>
      <div className="space-y-4">
        {programs.map((program) => {
          const daysRemaining = getDaysRemaining(program.expires_at);
          
          return (
            <Card key={program.id} className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-shadow duration-300">
              <div className="p-4 space-y-3 bg-gradient-to-br from-background to-accent/5">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    {program.title}
                  </h3>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteId(program.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div
                  className="relative cursor-pointer group"
                  onClick={() => setFullscreenImage(program.image_url)}
                >
                  <img
                    src={program.image_url}
                    alt={program.title}
                    className="w-full h-64 object-cover rounded-lg border-2 border-primary/20 shadow-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-lg" />
                </div>

                {program.audio_url && (
                  <div className="space-y-2">
                    <div className="flex items-center text-sm font-medium text-foreground">
                      <Music className="w-4 h-4 mr-2 text-primary" />
                      Áudio do Programa
                    </div>
                    <CustomAudioPlayer audioUrl={program.audio_url} />
                  </div>
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
              </div>
            </Card>
          );
        })}
      </div>

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
    </>
  );
}

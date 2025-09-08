import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { GroupForm } from "@/components/forms/GroupForm";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditGroup() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadGroup();
    }
  }, [id]);

  async function loadGroup() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setGroup(data);
    } catch (error) {
      console.error('Erro ao carregar grupo:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar dados do grupo",
        variant: "destructive",
      });
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  }

  const handleSuccess = () => {
    navigate(`/groups/${id}`);
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
        {/* Header with breadcrumb */}
        <div className="flex items-center space-x-2 mb-6 text-xs">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/groups/${id}`)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-3 h-3" />
            Voltar
          </Button>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">Grupos</span>
          <span className="text-muted-foreground">/</span>
          <span className="text-muted-foreground">{group?.name}</span>
          <span className="text-muted-foreground">/</span>
          <span className="font-medium text-foreground">Editar</span>
        </div>

        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Editar Grupo
          </h1>
          <p className="text-muted-foreground">
            Atualize as informações do grupo musical
          </p>
        </div>

        {group && (
          <GroupForm 
            groupId={id}
            initialData={group}
            onSuccess={handleSuccess}
            isEditing={true}
          />
        )}
      </div>
    </MainLayout>
  );
}
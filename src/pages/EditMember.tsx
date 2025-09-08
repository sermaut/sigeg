import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { MemberForm } from "@/components/forms/MemberForm";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EditMember() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [member, setMember] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadMember();
    }
  }, [id]);

  async function loadMember() {
    try {
      const { data, error } = await supabase
        .from('members')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setMember(data);
    } catch (error) {
      console.error('Erro ao carregar membro:', error);
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

  const handleSuccess = () => {
    navigate(`/groups/${member.group_id}`);
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
        <div className="flex items-center space-x-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/groups/${member?.group_id}`)}
            className="text-muted-foreground hover:text-foreground text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground">Grupos</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs text-muted-foreground">Membros</span>
          <span className="text-muted-foreground text-xs">/</span>
          <span className="text-xs font-medium text-foreground">Editar</span>
        </div>

        <div>
          <h1 className="text-xl font-bold text-foreground mb-2">
            Editar Membro
          </h1>
          <p className="text-muted-foreground">
            Atualize as informações do membro
          </p>
        </div>

        {member && (
          <MemberForm 
            memberId={id}
            initialData={member}
            groupId={member.group_id}
            onSuccess={handleSuccess}
            isEditing={true}
          />
        )}
      </div>
    </MainLayout>
  );
}
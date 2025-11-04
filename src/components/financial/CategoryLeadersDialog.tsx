import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Crown, UserCheck, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface CategoryLeadersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  groupId: string;
  categoryName: string;
}

interface CategoryRole {
  id: string;
  member_id: string;
  role: 'presidente' | 'secretario' | 'auxiliar';
  members: {
    id: string;
    name: string;
    profile_image_url: string | null;
  };
}

interface Member {
  id: string;
  name: string;
  profile_image_url: string | null;
}

export function CategoryLeadersDialog({
  open,
  onOpenChange,
  categoryId,
  groupId,
  categoryName,
}: CategoryLeadersDialogProps) {
  const [leaders, setLeaders] = useState<CategoryRole[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'presidente' | 'secretario' | 'auxiliar'>("auxiliar");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadLeaders();
      loadMembers();
    }
  }, [open, categoryId, groupId]);

  const loadLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select(`
          id,
          member_id,
          role,
          members!category_roles_member_id_fkey (
            id,
            name,
            profile_image_url
          )
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      setLeaders(data as any);
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, profile_image_url")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("name", { ascending: true });

      if (error) {
        console.error("Erro ao carregar membros:", error);
        toast({
          title: "Erro ao carregar membros",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Membros carregados:", data?.length || 0, "para o grupo:", groupId);
      setMembers(data || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      toast({
        title: "Erro ao carregar membros",
        variant: "destructive",
      });
    }
  };

  const handleAddLeader = async () => {
    if (!selectedMember) return;

    setLoading(true);
    try {
      // Verificar se já existe presidente ou secretário
      if (selectedRole === 'presidente' || selectedRole === 'secretario') {
        const existing = leaders.find(l => l.role === selectedRole);
        if (existing) {
          toast({
            title: "Erro",
            description: `Já existe um ${selectedRole} nesta categoria.`,
            variant: "destructive",
          });
          setLoading(false);
          return;
        }
      }

      const { error } = await supabase
        .from("category_roles")
        .insert({
          category_id: categoryId,
          member_id: selectedMember,
          role: selectedRole,
          group_id: groupId,
        });

      if (error) throw error;

      // Criar notificação para o membro atribuído
      const { error: notificationError } = await supabase
        .from("category_role_notifications")
        .insert({
          member_id: selectedMember,
          category_id: categoryId,
          role: selectedRole,
          is_read: false,
        });

      if (notificationError) {
        console.error("Erro ao criar notificação:", notificationError);
      }

      toast({
        title: "Líder adicionado",
        description: "O membro foi atribuído à categoria com sucesso e será notificado.",
      });

      setSelectedMember("");
      loadLeaders();
    } catch (error) {
      console.error("Erro ao adicionar líder:", error);
      toast({
        title: "Erro ao adicionar líder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLeader = async (roleId: string) => {
    try {
      const { error } = await supabase
        .from("category_roles")
        .delete()
        .eq("id", roleId);

      if (error) throw error;

      toast({
        title: "Líder removido",
        description: "O membro foi removido da categoria.",
      });

      loadLeaders();
    } catch (error) {
      console.error("Erro ao remover líder:", error);
      toast({
        title: "Erro ao remover líder",
        variant: "destructive",
      });
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'presidente':
        return <Crown className="h-4 w-4" />;
      case 'secretario':
        return <UserCheck className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'presidente':
        return 'default';
      case 'secretario':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Gerir Líderes - {categoryName}</DialogTitle>
          <DialogDescription>
            Atribua presidente, secretário e auxiliares para esta categoria financeira.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Adicionar novo líder */}
          <div className="space-y-3 p-4 border rounded-lg bg-muted/30">
            <h4 className="font-medium text-sm">Adicionar Líder</h4>
            <div className="flex gap-2">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecionar membro..." />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => !leaders.find(l => l.member_id === m.id))
                    .map(member => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(val) => setSelectedRole(val as any)}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidente">Presidente</SelectItem>
                  <SelectItem value="secretario">Secretário</SelectItem>
                  <SelectItem value="auxiliar">Auxiliar</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleAddLeader} disabled={!selectedMember || loading}>
                Adicionar
              </Button>
            </div>
          </div>

          {/* Lista de líderes atuais */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Líderes Atuais</h4>
            {leaders.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                Nenhum líder atribuído a esta categoria.
              </p>
            ) : (
              <div className="space-y-2">
                {leaders.map((leader) => (
                  <div
                    key={leader.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={leader.members.profile_image_url || undefined} />
                        <AvatarFallback>{leader.members.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{leader.members.name}</p>
                        <Badge variant={getRoleBadgeVariant(leader.role)} className="mt-1 flex items-center gap-1 w-fit">
                          {getRoleIcon(leader.role)}
                          <span className="capitalize">{leader.role}</span>
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveLeader(leader.id)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { GroupCard } from "./GroupCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Search, Filter, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from '@/hooks/usePermissions';
import { PermissionGuard } from '@/components/common/PermissionGuard';
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

export function GroupsList() {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const { toast } = useToast();
  const permissions = usePermissions();

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      setLoading(true);
      
      // Otimizar consulta carregando apenas campos necessários
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, municipality, province, is_active, max_members, monthly_fee, created_at')
        .order('name', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar grupos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
    group.province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleView = (id: string) => {
    window.location.href = `/groups/${id}`;
  };

  const handleEdit = (id: string) => {
    window.location.href = `/groups/${id}/edit`;
  };

  const handleDelete = (id: string) => {
    setGroupToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!groupToDelete) return;
    
    try {
      const { error } = await supabase
        .from('groups')
        .delete()
        .eq('id', groupToDelete);
      
      if (error) throw error;
      
      toast({
        title: "Grupo excluído com sucesso!",
      });
      
      loadGroups();
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast({
        title: "Erro",
        description: "Falha ao excluir grupo",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="card-elevated p-4">
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar por nome, município ou província..."
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
      </Card>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <GroupCard
              key={group.id}
              group={group}
              onView={handleView}
              onEdit={permissions.canEditGroup ? handleEdit : undefined}
              onDelete={permissions.canDeleteGroup ? handleDelete : undefined}
            />
          ))}
        </div>
      ) : (
        <Card className="card-elevated">
          <div className="p-12 text-center">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo cadastrado'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? 'Tente ajustar os termos de busca para encontrar grupos'
                : 'Comece criando seu primeiro grupo musical no sistema'
              }
            </p>
            {!searchTerm && (
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => window.location.href = "/groups/new"}
              >
                <Plus className="w-5 h-5" />
                Criar Primeiro Grupo
              </Button>
            )}
          </div>
        </Card>
      )}

      {/* Novo Grupo Button - moved to bottom */}
      <PermissionGuard require="canCreateGroup">
        <div className="flex justify-center pt-6">
          <Button 
            variant="gradient" 
            size="lg"
            onClick={() => window.location.href = "/groups/new"}
          >
            <Plus className="w-5 h-5" />
            Novo Grupo
          </Button>
        </div>
      </PermissionGuard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle>
                Excluir Grupo
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este grupo? Esta ação não pode ser desfeita e todos os dados relacionados ao grupo serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
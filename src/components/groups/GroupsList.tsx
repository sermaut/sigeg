import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { GroupCard } from "./GroupCard.memo";
import { Button } from "@/components/ui/button";
import { Plus, Search, Filter, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { useToast } from "@/hooks/use-toast";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { useGroups } from "@/hooks/useQueries";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useLanguage } from "@/contexts/LanguageContext";

export function GroupsList() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { t } = useLanguage();
  const { data: groups = [], isLoading: loading } = useGroups();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null);
  const permissions = usePermissions();
  
  // Get current user's group_id from localStorage
  const currentUserGroupId = localStorage.getItem('group_id');

  // Filtrar grupos: admins veem todos, membros veem ativos + seu próprio grupo inativo
  const filteredGroups = groups
    .filter(group => {
      // Admins veem todos os grupos
      if (permissions.canAccessAdmins) return true;
      // Grupos ativos são visíveis para todos
      if (group.is_active !== false) return true;
      // Membros podem ver seu próprio grupo mesmo que inativo
      if (currentUserGroupId && group.id === currentUserGroupId) return true;
      return false;
    })
    .filter(group =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.municipality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.province.toLowerCase().includes(searchTerm.toLowerCase())
    );

  // Prefetch group and members data on hover for instant navigation
  const handleGroupHover = useCallback((groupId: string) => {
    // Prefetch group details
    queryClient.prefetchQuery({
      queryKey: ['groups', groupId],
      queryFn: async () => {
        const { data } = await supabase
          .from('groups')
          .select('*')
          .eq('id', groupId)
          .single();
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
    
    // Prefetch members list
    queryClient.prefetchQuery({
      queryKey: ['members', groupId, undefined, 'id, name, role, partition, is_active, phone, profile_image_url'],
      queryFn: async () => {
        const { data } = await supabase
          .from('members')
          .select('id, name, role, partition, is_active, phone, profile_image_url')
          .eq('group_id', groupId)
          .order('created_at', { ascending: false });
        return data;
      },
      staleTime: 30 * 60 * 1000,
    });
  }, [queryClient]);

  const handleView = (id: string) => {
    navigate(`/groups/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/groups/${id}/edit`);
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
        title: t('common.delete'),
      });
      
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    } catch (error) {
      console.error('Erro ao excluir grupo:', error);
      toast({
        title: t('error.general'),
        description: t('error.general'),
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setGroupToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="card-elevated p-4">
          <Skeleton className="h-10 w-full" />
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-6">
              <div className="space-y-3">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="card-elevated p-[5px]">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              placeholder={t('groups.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-12"
              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            />
          </div>
          <Button 
            variant="default" 
            size="icon"
            className="h-10 w-10 rounded-full bg-green-600 hover:bg-green-700 shrink-0"
          >
            <Search className="w-4 h-4 text-white" />
          </Button>
        </div>
      </Card>

      {/* Groups Grid */}
      {filteredGroups.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGroups.map((group) => (
            <div key={group.id} onMouseEnter={() => handleGroupHover(group.id)}>
              <GroupCard
                group={group}
                onView={handleView}
                onEdit={permissions.canEditGroup ? handleEdit : undefined}
                onDelete={permissions.canDeleteGroup ? handleDelete : undefined}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card className="card-elevated">
          <div className="p-12 text-center">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {t('groups.noGroups')}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t('common.noResults')}
            </p>
            {!searchTerm && (
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => navigate("/groups/new")}
              >
                <Plus className="w-5 h-5" />
                {t('groups.newGroup')}
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
            onClick={() => navigate("/groups/new")}
            className="h-9 py-[5px] px-3 text-sm"
          >
            <Plus className="w-4 h-4" />
            {t('groups.newGroup')}
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
                {t('common.delete')}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              {t('dialog.areYouSure')} {t('dialog.actionCannotBeUndone')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteDialogOpen(false)}>
              {t('common.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              {t('common.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
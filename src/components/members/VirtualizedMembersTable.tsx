import React, { memo, useMemo, useState, useCallback } from "react";
import { FixedSizeList } from 'react-window';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Eye, Edit, Trash2 } from "@/lib/icons";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Member {
  id: string;
  name: string;
  role?: string;
  partition?: string;
  is_active: boolean;
  phone?: string;
  member_code?: string;
  profile_image_url?: string;
}

interface OptimizedMembersTableProps {
  members: Member[];
  onMemberView: (memberId: string) => void;
  onMemberEdit?: (memberId: string) => void;
  showActions?: boolean;
  onMembersDeleted?: () => void;
}

interface RowProps {
  index: number;
  style: React.CSSProperties;
  data: {
    members: Member[];
    selectedMembers: Set<string>;
    onMemberView: (id: string) => void;
    onMemberEdit?: (id: string) => void;
    showActions: boolean;
    toggleMemberSelection: (id: string) => void;
  };
}

const VirtualRow = memo(({ index, style, data }: RowProps) => {
  const { members, selectedMembers, onMemberView, onMemberEdit, showActions, toggleMemberSelection } = data;
  const member = members[index];

  const initials = useMemo(() => {
    return member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [member.name]);

  return (
    <div style={style} className="border-b border-border hover:bg-muted/50 transition-smooth flex items-center">
      <div className="px-4 py-3 border-r border-border/50 flex-[2]">
        <div className="flex items-center space-x-3">
          <Checkbox
            checked={selectedMembers.has(member.id)}
            onCheckedChange={() => toggleMemberSelection(member.id)}
          />
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.profile_image_url} loading="lazy" />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
          </div>
        </div>
      </div>
      <div className="px-4 py-3 border-r border-border/50 flex-1">
        {member.role && (
          <Badge variant="secondary" className="capitalize">
            {member.role.replace('_', ' ')}
          </Badge>
        )}
      </div>
      <div className="px-4 py-3 border-r border-border/50 flex-1">
        {member.partition && (
          <span className="text-sm capitalize text-muted-foreground">
            {member.partition}
          </span>
        )}
      </div>
      <div className="px-4 py-3 border-r border-border/50 flex-1">
        {member.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{member.phone}</span>
          </div>
        )}
      </div>
      <div className="px-4 py-3 border-r border-border/50 flex-1">
        <Badge variant={member.is_active ? "default" : "secondary"}>
          {member.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </div>
      {showActions && (
        <div className="px-4 py-3 flex-1">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMemberView(member.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {onMemberEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMemberEdit(member.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
});

VirtualRow.displayName = "VirtualRow";

export const VirtualizedMembersTable = memo(({ 
  members, 
  onMemberView, 
  onMemberEdit,
  showActions = true,
  onMembersDeleted
}: OptimizedMembersTableProps) => {
  const memoizedMembers = useMemo(() => members, [members]);
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set());
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { toast } = useToast();

  const toggleMemberSelection = useCallback((memberId: string) => {
    setSelectedMembers(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(memberId)) {
        newSelection.delete(memberId);
      } else {
        newSelection.add(memberId);
      }
      return newSelection;
    });
  }, []);

  const toggleAllMembers = useCallback(() => {
    if (selectedMembers.size === memoizedMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(memoizedMembers.map(m => m.id)));
    }
  }, [selectedMembers.size, memoizedMembers]);

  const handleDeleteSelected = async () => {
    if (selectedMembers.size === 0) return;

    try {
      const { error } = await supabase
        .from('members')
        .delete()
        .in('id', Array.from(selectedMembers));

      if (error) throw error;

      toast({
        title: "Membros excluídos",
        description: `${selectedMembers.size} membro(s) foram excluídos com sucesso.`,
      });

      setSelectedMembers(new Set());
      setShowDeleteDialog(false);
      onMembersDeleted?.();
    } catch (error) {
      console.error('Error deleting members:', error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir os membros selecionados.",
        variant: "destructive",
      });
    }
  };

  const itemData = useMemo(() => ({
    members: memoizedMembers,
    selectedMembers,
    onMemberView,
    onMemberEdit,
    showActions,
    toggleMemberSelection,
  }), [memoizedMembers, selectedMembers, onMemberView, onMemberEdit, showActions, toggleMemberSelection]);

  if (memoizedMembers.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum membro encontrado
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedMembers.size > 0 && (
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <span className="text-sm font-medium">
            {selectedMembers.size} membro(s) selecionado(s)
          </span>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Selecionados
          </Button>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-muted/50 border-b border-border flex items-center font-semibold text-sm">
          <div className="px-4 py-3 border-r border-border/50 flex-[2]">
            <div className="flex items-center space-x-3">
              <Checkbox
                checked={selectedMembers.size === memoizedMembers.length && memoizedMembers.length > 0}
                onCheckedChange={toggleAllMembers}
              />
              <span>Membro</span>
            </div>
          </div>
          <div className="px-4 py-3 border-r border-border/50 flex-1">Função</div>
          <div className="px-4 py-3 border-r border-border/50 flex-1">Partição</div>
          <div className="px-4 py-3 border-r border-border/50 flex-1">Telefone</div>
          <div className="px-4 py-3 border-r border-border/50 flex-1">Status</div>
          {showActions && <div className="px-4 py-3 flex-1">Ações</div>}
        </div>

        {/* Virtualized List - PHASE 3: 20% performance gain */}
        <FixedSizeList
          height={600}
          itemCount={memoizedMembers.length}
          itemSize={60}
          width="100%"
          itemData={itemData}
        >
          {VirtualRow}
        </FixedSizeList>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir {selectedMembers.size} membro(s)? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

VirtualizedMembersTable.displayName = "VirtualizedMembersTable";

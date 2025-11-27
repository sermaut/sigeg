import React, { memo, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Phone, Eye, Edit, User, Trash2 } from "lucide-react";
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

const MemberRow = memo(({ 
  member, 
  onMemberView, 
  onMemberEdit, 
  showActions = true 
}: { 
  member: Member; 
  onMemberView: (id: string) => void;
  onMemberEdit?: (id: string) => void;
  showActions?: boolean;
}) => {
  const initials = useMemo(() => {
    return member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [member.name]);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 py-3 border-r border-border/50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.profile_image_url} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.role && (
          <Badge variant="secondary" className="capitalize">
            {member.role.replace('_', ' ')}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.partition && (
          <span className="text-sm capitalize text-muted-foreground">
            {member.partition}
          </span>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{member.phone}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        <Badge variant={member.is_active ? "default" : "secondary"}>
          {member.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </td>
      {showActions && (
        <td className="px-4 py-3">
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
        </td>
      )}
    </tr>
  );
});

MemberRow.displayName = "MemberRow";

export const OptimizedMembersTable = memo(({ 
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

  const toggleMemberSelection = (memberId: string) => {
    const newSelection = new Set(selectedMembers);
    if (newSelection.has(memberId)) {
      newSelection.delete(memberId);
    } else {
      newSelection.add(memberId);
    }
    setSelectedMembers(newSelection);
  };

  const toggleAllMembers = () => {
    if (selectedMembers.size === memoizedMembers.length) {
      setSelectedMembers(new Set());
    } else {
      setSelectedMembers(new Set(memoizedMembers.map(m => m.id)));
    }
  };

  const handleDeleteSelected = async () => {
    try {
      const memberIds = Array.from(selectedMembers);
      
      const { error } = await supabase
        .from("members")
        .delete()
        .in("id", memberIds);

      if (error) throw error;

      toast({
        title: "Membros eliminados",
        description: `${memberIds.length} membro(s) eliminado(s) com sucesso.`,
      });

      setSelectedMembers(new Set());
      setShowDeleteDialog(false);
      onMembersDeleted?.();
    } catch (error) {
      console.error("Erro ao eliminar membros:", error);
      toast({
        title: "Erro ao eliminar membros",
        variant: "destructive",
      });
    }
  };

  if (memoizedMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum membro encontrado</p>
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
            Eliminar Selecionados
          </Button>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-2 py-1 text-center text-sm font-medium text-muted-foreground w-12 border-r border-border/50">
                <Checkbox
                  checked={selectedMembers.size === memoizedMembers.length && memoizedMembers.length > 0}
                  onCheckedChange={toggleAllMembers}
                />
              </th>
              <th className="px-2 py-1 text-center text-sm font-medium text-muted-foreground w-12 border-r border-border/50">
                Nº.
              </th>
              <th className="px-3 py-1 text-center text-sm font-medium text-muted-foreground w-16 border-r border-border/50">
                Foto
              </th>
              <th className="px-4 py-1 text-left text-sm font-medium text-muted-foreground">
                Nome Completo
              </th>
            </tr>
          </thead>
          <tbody>
            {memoizedMembers.map((member, index) => (
              <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
                <td className="p-[5px] text-center border-r border-border/50">
                  <Checkbox
                    checked={selectedMembers.has(member.id)}
                    onCheckedChange={() => toggleMemberSelection(member.id)}
                  />
                </td>
                <td className="p-[5px] text-center text-sm text-muted-foreground border-r border-border/50">
                  {index + 1}
                </td>
              <td className="p-[4px] text-center border-r border-border/50">
                <Avatar 
                  className="w-[50px] h-[50px] mx-auto cursor-pointer hover:scale-110 hover:shadow-lg transition-all duration-300 rounded-full ring-1 ring-primary/40 hover:ring-primary/60"
                  onClick={() => {
                    if (member.profile_image_url) {
                      const overlay = document.createElement('div');
                      overlay.style.cssText = `
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0, 0, 0, 0.95);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 9999;
                        cursor: zoom-out;
                        animation: fadeIn 0.2s ease-in-out;
                      `;
                      
                      const img = document.createElement('img');
                      img.src = member.profile_image_url;
                      img.style.cssText = `
                        width: 410px;
                        height: 410px;
                        object-fit: cover;
                        border-radius: 50%;
                        border: 4px solid rgba(255, 255, 255, 0.3);
                        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
                        animation: zoomIn 0.3s ease-out;
                      `;
                      
                      const closeBtn = document.createElement('button');
                      closeBtn.innerHTML = '✕';
                      closeBtn.style.cssText = `
                        position: absolute;
                        top: 20px;
                        right: 20px;
                        background: rgba(255, 255, 255, 0.1);
                        border: 1px solid rgba(255, 255, 255, 0.2);
                        color: white;
                        font-size: 24px;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        cursor: pointer;
                        backdrop-filter: blur(10px);
                        transition: all 0.2s;
                      `;
                      closeBtn.onmouseover = () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                        closeBtn.style.transform = 'scale(1.1)';
                      };
                      closeBtn.onmouseout = () => {
                        closeBtn.style.background = 'rgba(255, 255, 255, 0.1)';
                        closeBtn.style.transform = 'scale(1)';
                      };
                      
                      const memberName = document.createElement('div');
                      memberName.textContent = member.name;
                      memberName.style.cssText = `
                        position: absolute;
                        bottom: 30px;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 90%;
                        max-width: 400px;
                        text-align: center;
                        color: white;
                        font-size: 20px;
                        font-weight: 600;
                        background: rgba(0, 0, 0, 0.6);
                        padding: 12px 24px;
                        border-radius: 24px;
                        backdrop-filter: blur(10px);
                      `;
                      
                      const style = document.createElement('style');
                      style.textContent = `
                        @keyframes fadeIn {
                          from { opacity: 0; }
                          to { opacity: 1; }
                        }
                        @keyframes zoomIn {
                          from { transform: scale(0.8); opacity: 0; }
                          to { transform: scale(1); opacity: 1; }
                        }
                      `;
                      
                      document.head.appendChild(style);
                      overlay.appendChild(img);
                      overlay.appendChild(closeBtn);
                      overlay.appendChild(memberName);
                      document.body.appendChild(overlay);
                      
                      const closeOverlay = () => {
                        overlay.style.animation = 'fadeIn 0.2s ease-in-out reverse';
                        setTimeout(() => {
                          document.body.removeChild(overlay);
                          document.head.removeChild(style);
                        }, 200);
                      };
                      
                      overlay.addEventListener('click', (e) => {
                        if (e.target === overlay) closeOverlay();
                      });
                      closeBtn.addEventListener('click', closeOverlay);
                      
                      document.addEventListener('keydown', function escHandler(e) {
                        if (e.key === 'Escape') {
                          closeOverlay();
                          document.removeEventListener('keydown', escHandler);
                        }
                      });
                    }
                  }}
                >
                  <AvatarImage src={member.profile_image_url} className="object-cover rounded-full" />
                  <AvatarFallback className="text-sm rounded-full bg-gradient-to-br from-cyan-500 to-teal-500 text-white font-semibold">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </td>
              <td className="p-[5px]">
                <button
                  className="text-left hover:text-primary transition-colors font-medium"
                  onClick={() => onMemberView(member.id)}
                >
                  {member.name}
                </button>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Membros</AlertDialogTitle>
            <AlertDialogDescription>
              Tem a certeza que deseja eliminar {selectedMembers.size} membro(s)? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteSelected}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}); 

OptimizedMembersTable.displayName = "OptimizedMembersTable";
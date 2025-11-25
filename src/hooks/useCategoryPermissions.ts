import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryPermission {
  canView: boolean;
  canViewBalance: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canManageLeaders: boolean;
  canLockCategory: boolean;
  permissionLevel: number; // 0=group leader, 1=presidente, 2=secretario, 3=auxiliar, 999=no access
  role?: 'presidente' | 'secretario' | 'auxiliar';
  isGroupLeader: boolean;
}

export function useCategoryPermissions(
  categoryId: string | undefined,
  memberId: string | undefined,
  groupId: string | undefined,
  userType?: 'admin' | 'member' | 'group',
  permissionLevel?: string
) {
  const [permissions, setPermissions] = useState<CategoryPermission>({
    canView: true,
    canViewBalance: false,
    canEdit: false,
    canDelete: false,
    canManageLeaders: false,
    canLockCategory: false,
    permissionLevel: 999,
    isGroupLeader: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      if (!categoryId || !groupId) {
        setLoading(false);
        return;
      }

      try {
        // Verificar se é super admin ou admin principal
        if (userType === 'admin' && 
            (permissionLevel === 'super_admin' || permissionLevel === 'admin_principal')) {
          setPermissions({
            canView: true,
            canViewBalance: true,
            canEdit: true,
            canDelete: true,
            canManageLeaders: true,
            canLockCategory: true,
            permissionLevel: 0,
            isGroupLeader: false,
            role: undefined,
          });
          setLoading(false);
          return;
        }

        // Para membros ou quando memberId não está disponível
        if (!memberId) {
          setLoading(false);
          return;
        }
        // Verificar se é líder do grupo
        const { data: groupData } = await supabase
          .from("groups")
          .select("president_id, vice_president_1_id, vice_president_2_id")
          .eq("id", groupId)
          .single();

        const isGroupLeader = groupData ? (
          groupData.president_id === memberId ||
          groupData.vice_president_1_id === memberId ||
          groupData.vice_president_2_id === memberId
        ) : false;

        // Verificar se tem role na categoria
        const { data: roleData } = await supabase
          .from("category_roles")
          .select("role")
          .eq("category_id", categoryId)
          .eq("member_id", memberId)
          .eq("is_active", true)
          .maybeSingle();

        // Verificar se categoria está bloqueada
        const { data: categoryData } = await supabase
          .from("financial_categories")
          .select("is_locked")
          .eq("id", categoryId)
          .single();

        const isLocked = categoryData?.is_locked ?? false;
        const hasRole = !!roleData;
        const canViewBalance = isGroupLeader || hasRole;
        
        // Determinar nível de permissão
        let level = 999;
        if (isGroupLeader) {
          level = 0;
        } else if (roleData?.role === 'presidente') {
          level = 1;
        } else if (roleData?.role === 'secretario') {
          level = 2;
        } else if (roleData?.role === 'auxiliar') {
          level = 3;
        }

        // Permissões baseadas no nível
        const canEdit = level <= 2 && (!isLocked || level <= 1);
        const canDelete = level <= 1;
        const canManageLeaders = level <= 1;
        const canLockCategory = level === 0 || level === 1;

        setPermissions({
          canView: true,
          canViewBalance,
          canEdit,
          canDelete,
          canManageLeaders,
          canLockCategory,
          permissionLevel: level,
          role: roleData?.role,
          isGroupLeader,
        });
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
      } finally {
        setLoading(false);
      }
    }

    checkPermissions();
  }, [categoryId, memberId, groupId, userType, permissionLevel]);

  return { ...permissions, loading };
}

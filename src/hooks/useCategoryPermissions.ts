import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryPermission {
  canView: boolean;
  canViewBalance: boolean;
  canEdit: boolean;
  role?: 'presidente' | 'secretario' | 'auxiliar';
  isGroupLeader: boolean;
}

export function useCategoryPermissions(
  categoryId: string | undefined,
  memberId: string | undefined,
  groupId: string | undefined
) {
  const [permissions, setPermissions] = useState<CategoryPermission>({
    canView: true,
    canViewBalance: false,
    canEdit: false,
    isGroupLeader: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermissions() {
      if (!categoryId || !memberId || !groupId) {
        setLoading(false);
        return;
      }

      try {
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

        setPermissions({
          canView: true,
          canViewBalance,
          canEdit: !isLocked || hasRole || isGroupLeader,
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
  }, [categoryId, memberId, groupId]);

  return { ...permissions, loading };
}

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getRoleLevel } from '@/lib/memberHelpers';

export interface SystemAdmin {
  id: string;
  name: string;
  email: string;
  access_code: string;
  permission_level: 'super_admin' | 'admin_principal' | 'admin_adjunto' | 'admin_supervisor';
  is_active: boolean;
  last_login_at?: string;
  created_by_admin_id?: string;
  access_attempts?: number;
  locked_until?: string;
}

export interface Member {
  id: string;
  name: string;
  member_code: string;
  group_id: string;
  role: string;
  is_active: boolean;
  profile_image_url?: string;
}

export interface Group {
  id: string;
  name: string;
  access_code: string;
  province: string;
  municipality: string;
  is_active: boolean;
  president_name?: string;
  vice_president_1_name?: string;
  vice_president_2_name?: string;
}

export interface AuthUser {
  type: 'admin' | 'member' | 'group';
  data: SystemAdmin | Member | Group;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (code: string, type: 'admin' | 'member' | 'group') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  isGroup: () => boolean;
  getPermissionLevel: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_PERMISSION_LEVELS: Record<string, number> = {
  'super_admin': 0,
  'admin_principal': 0,
  'admin_adjunto': 0,
  'admin_supervisor': 0,
};

const PERMISSION_MAP: Record<number, string[]> = {
  0: ['*'],
  1: ['manage_group_members', 'update_group_info', 'view_group_data', 'manage_finances', 'manage_technical', 'manage_groups'],
  2: ['view_group_data', 'manage_technical'],
  3: ['view_group_data', 'manage_technical'],
  4: ['view_group_data'],
  5: ['view_group_data'],
  6: ['view_group_data', 'manage_category_finances'],
  7: ['view_group_data'],
};

// ULTRA-FAST: Reduced timeout for faster feedback (5 seconds)
const LOGIN_TIMEOUT = 5000;

// INSTANT: Parse stored user synchronously before React hydration
const getStoredUser = (): AuthUser | null => {
  try {
    const stored = localStorage.getItem('sigeg_user');
    if (stored) return JSON.parse(stored);
  } catch {
    localStorage.removeItem('sigeg_user');
  }
  return null;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  // INSTANT: Initialize with stored user immediately (no useEffect delay)
  const [user, setUser] = useState<AuthUser | null>(getStoredUser);
  const [loading, setLoading] = useState(false); // Start false - no loading needed if cached

  const login = async (code: string, type: 'admin' | 'member' | 'group') => {
    try {
      setLoading(true);
      const normalizedCode = code.trim().toUpperCase();

      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('TIMEOUT')), LOGIN_TIMEOUT)
      );

      if (type === 'admin') {
        const queryPromise = supabase
          .from('system_admins')
          .select('*')
          .eq('access_code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle()
          .then(res => res);

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]);

        if (error) {
          if (error.message?.includes('fetch') || error.message?.includes('network')) {
            return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
          }
          return { success: false, error: 'Erro ao verificar código. Tente novamente.' };
        }

        if (!data) {
          return { success: false, error: 'Código de administrador inválido ou inativo' };
        }

        if (!data.id || !data.name || !data.email || !data.permission_level) {
          return { success: false, error: 'Dados de administrador incompletos' };
        }

        const adminLevel = ADMIN_PERMISSION_LEVELS[data.permission_level] ?? 0;
        const permissions = PERMISSION_MAP[adminLevel] || PERMISSION_MAP[0];
        const authUser: AuthUser = {
          type: 'admin',
          data: data as SystemAdmin,
          permissions
        };

        setUser(authUser);
        localStorage.setItem('sigeg_user', JSON.stringify(authUser));
        return { success: true };

      } else if (type === 'member') {
        // OPTIMIZED: Parallel queries for member + groups
        const memberPromise = supabase
          .from('members')
          .select('*')
          .eq('member_code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle()
          .then(res => res);

        const groupsPromise = supabase
          .from('groups')
          .select('id, name, is_active')
          .limit(1000)
          .then(res => res);

        const [memberResult, groupResult] = await Promise.race([
          Promise.all([memberPromise, groupsPromise]),
          timeoutPromise.then(() => { throw new Error('TIMEOUT'); })
        ]) as [typeof memberResult, typeof groupResult];

        const { data: memberData, error: memberError } = memberResult;

        if (memberError) {
          if (memberError.message?.includes('fetch') || memberError.message?.includes('network')) {
            return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
          }
          return { success: false, error: 'Erro ao verificar código. Tente novamente.' };
        }

        if (!memberData) {
          return { success: false, error: 'Código de membro inválido ou inativo' };
        }

        if (!memberData.id || !memberData.name || !memberData.group_id) {
          return { success: false, error: 'Dados de membro incompletos' };
        }

        if (!memberData.role) {
          return { success: false, error: 'Dados de membro incompletos: função não definida' };
        }

        const { data: groupsData, error: groupError } = groupResult;
        
        if (groupError) {
          return { success: false, error: 'Erro ao verificar grupo' };
        }

        const groupData = groupsData?.find(g => g.id === memberData.group_id);

        if (!groupData || !groupData.is_active) {
          return { success: false, error: 'Grupo inativo ou não encontrado' };
        }

        const roleLevel = getRoleLevel(memberData.role);
        const permissions = PERMISSION_MAP[roleLevel] || PERMISSION_MAP[7];

        const authUser: AuthUser = {
          type: 'member',
          data: memberData as Member,
          permissions
        };

        setUser(authUser);
        localStorage.setItem('sigeg_user', JSON.stringify(authUser));

        // Async notifications (non-blocking)
        setTimeout(async () => {
          try {
            const { data: notifications } = await supabase
              .from('category_role_notifications')
              .select(`
                id,
                role,
                is_read,
                financial_categories (
                  name
                )
              `)
              .eq('member_id', memberData.id)
              .eq('is_read', false)
              .order('created_at', { ascending: false })
              .limit(3);

            if (notifications && notifications.length > 0) {
              const roleLabels: Record<string, string> = {
                'presidente': 'Presidente',
                'secretario': 'Secretário',
                'auxiliar': 'Auxiliar'
              };

              notifications.forEach((notification: any) => {
                const categoryName = notification.financial_categories?.name || 'N/A';
                const roleLabel = roleLabels[notification.role] || notification.role;
                
                toast({
                  title: "Nova Atribuição de Liderança! 🎉",
                  description: `Você foi designado como ${roleLabel} da categoria "${categoryName}".`,
                  duration: 8000,
                });
              });
            }
          } catch (err) {
            console.warn('Failed to load notifications:', err);
          }
        }, 0);

        return { success: true };

      } else if (type === 'group') {
        const queryPromise = supabase
          .from('groups')
          .select('*')
          .eq('access_code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle()
          .then(res => res);

        const { data: groupData, error: groupError } = await Promise.race([queryPromise, timeoutPromise]);

        if (groupError) {
          if (groupError.message?.includes('fetch') || groupError.message?.includes('network')) {
            return { success: false, error: 'Erro de conexão. Verifique sua internet.' };
          }
          return { success: false, error: 'Erro ao verificar código. Tente novamente.' };
        }

        if (!groupData) {
          return { success: false, error: 'Código de grupo inválido ou grupo inativo' };
        }

        const permissions = ['view_group_data', 'view_all_members', 'view_finances'];

        const authUser: AuthUser = {
          type: 'group',
          data: groupData as Group,
          permissions
        };

        setUser(authUser);
        localStorage.setItem('sigeg_user', JSON.stringify(authUser));
        return { success: true };
      }

      return { success: false, error: 'Tipo de login inválido' };
    } catch (error: any) {
      if (error.message === 'TIMEOUT') {
        return { success: false, error: 'Tempo esgotado. Verifique sua conexão e tente novamente.' };
      }
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sigeg_user');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    if (user.permissions.includes('*')) return true;
    if (!permission) return true;
    return user.permissions.includes(permission);
  };

  const isAdmin = () => user?.type === 'admin';
  const isMember = () => user?.type === 'member';
  const isGroup = () => user?.type === 'group';

  const getPermissionLevel = () => {
    if (!user) return 999;
    
    if (user.type === 'admin') {
      return 0;
    } else {
      const memberData = user.data as Member;
      return getRoleLevel(memberData.role);
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasPermission,
    isAdmin,
    isMember,
    isGroup,
    getPermissionLevel
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
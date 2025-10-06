import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  role: 'membro' | 'presidente' | 'vice_presidente' | 'secretario' | 'tesoureiro' | 'conselheiro';
  is_active: boolean;
  profile_image_url?: string;
}

export interface AuthUser {
  type: 'admin' | 'member';
  data: SystemAdmin | Member;
  permissions: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  login: (code: string, type: 'admin' | 'member') => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: () => boolean;
  isMember: () => boolean;
  getPermissionLevel: () => number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PERMISSION_LEVELS = {
  'super_admin': 1,        // Dono do Sistema (MB_0608)
  'admin_principal': 2,    // Administrador Principal
  'admin_adjunto': 3,      // Administrador Adjunto
  'admin_supervisor': 4,   // Administrador Supervisor
  'presidente': 5,         // Líderes de Grupo
  'vice_presidente': 5,
  'secretario': 5,
  'tesoureiro': 5,
  'conselheiro': 6,        // Segunda Classe
  'membro': 7              // Terceira/Quarta Classe
};

const PERMISSION_MAP = {
  1: ['*'], // Super Admin - Acesso completo
  2: ['manage_system', 'manage_admins', 'manage_groups', 'manage_members', 'view_statistics', 'manage_permissions'], // Admin Principal
  3: ['manage_groups', 'manage_members', 'view_statistics', 'limited_admin_functions'], // Admin Adjunto
  4: ['view_groups', 'view_members', 'view_statistics', 'supervisor_access'], // Admin Supervisor
  5: ['manage_group_members', 'update_group_info', 'view_group_data'], // Líderes de Grupo
  6: ['view_group_data', 'limited_access'], // Conselheiros
  7: ['view_basic_info', 'view_group_info'] // Membros
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = sessionStorage.getItem('sigeg_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        sessionStorage.removeItem('sigeg_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (code: string, type: 'admin' | 'member') => {
    try {
      setLoading(true);

      if (type === 'admin') {
        const { data, error } = await supabase
          .from('system_admins')
          .select('*')
          .eq('access_code', code)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Admin login error:', error);
          return { success: false, error: 'Erro ao verificar código de administrador' };
        }

        if (!data) {
          return { success: false, error: 'Código de administrador inválido ou inativo' };
        }

        // Validate required fields
        if (!data.id || !data.name || !data.email || !data.permission_level) {
          console.error('Invalid admin data structure:', data);
          return { success: false, error: 'Dados de administrador incompletos' };
        }

        const permissions = PERMISSION_MAP[PERMISSION_LEVELS[data.permission_level as keyof typeof PERMISSION_LEVELS]];
        const authUser: AuthUser = {
          type: 'admin',
          data: data as SystemAdmin,
          permissions
        };

        setUser(authUser);
        sessionStorage.setItem('sigeg_user', JSON.stringify(authUser));
        return { success: true };

      } else {
        // First, get the member data
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('member_code', code)
          .eq('is_active', true)
          .maybeSingle();

        if (memberError) {
          console.error('Member login error:', memberError);
          return { success: false, error: 'Erro ao verificar código de membro' };
        }

        if (!memberData) {
          return { success: false, error: 'Código de membro inválido ou inativo' };
        }

        // Validate required member fields
        if (!memberData.id || !memberData.name || !memberData.group_id || !memberData.role) {
          console.error('Invalid member data structure:', memberData);
          return { success: false, error: 'Dados de membro incompletos' };
        }

        // Verify group is active (separate query)
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, name, is_active')
          .eq('id', memberData.group_id)
          .maybeSingle();

        if (groupError) {
          console.error('Group verification error:', groupError);
          return { success: false, error: 'Erro ao verificar grupo' };
        }

        if (!groupData || !groupData.is_active) {
          return { success: false, error: 'Grupo inativo ou não encontrado' };
        }

        const permissions = PERMISSION_MAP[PERMISSION_LEVELS[memberData.role as keyof typeof PERMISSION_LEVELS]];
        const authUser: AuthUser = {
          type: 'member',
          data: memberData as Member,
          permissions
        };

        setUser(authUser);
        sessionStorage.setItem('sigeg_user', JSON.stringify(authUser));
        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('sigeg_user');
  };

  const hasPermission = (permission: string) => {
    if (!user) return false;
    return user.permissions.includes('*') || user.permissions.includes(permission);
  };

  const isAdmin = () => user?.type === 'admin';
  const isMember = () => user?.type === 'member';

  const getPermissionLevel = () => {
    if (!user) return 999;
    
    if (user.type === 'admin') {
      return PERMISSION_LEVELS[(user.data as SystemAdmin).permission_level];
    } else {
      return PERMISSION_LEVELS[(user.data as Member).role];
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
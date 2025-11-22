import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { getRoleLevel } from '@/lib/memberHelpers';
import type { Session } from '@supabase/supabase-js';

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
  role: string; // Aceita qualquer role do sistema
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

const ADMIN_PERMISSION_LEVELS: Record<string, number> = {
  'super_admin': 0,
  'admin_principal': 0,
  'admin_adjunto': 0,
  'admin_supervisor': 0,
};

const PERMISSION_MAP: Record<number, string[]> = {
  0: ['*'], // Admins - acesso total (manage_groups, manage_admins, etc)
  1: ['manage_group_members', 'update_group_info', 'view_group_data', 'manage_finances', 'manage_technical', 'manage_groups'], // Dirigentes
  2: ['view_group_data', 'manage_technical'], // Inspector/Coordenador
  3: ['view_group_data', 'manage_technical'], // Dirigente Técnico
  4: ['view_group_data'], // Chefe Partição/Categoria
  5: ['view_group_data'], // Protocolo, etc
  6: ['view_group_data', 'manage_category_finances'], // Financeiro (Líder Categoria)
  7: ['view_group_data'], // Membro Simples
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Configurar listener de mudanças de autenticação PRIMEIRO
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setSession(session);
        
        if (session?.user) {
          // Recuperar dados do usuário do metadata
          const metadata = session.user.user_metadata;
          if (metadata?.sigeg_user) {
            setUser(metadata.sigeg_user as AuthUser);
          }
        } else {
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // ENTÃO verificar se já existe uma sessão
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user?.user_metadata?.sigeg_user) {
        setUser(session.user.user_metadata.sigeg_user as AuthUser);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (code: string, type: 'admin' | 'member') => {
    try {
      setLoading(true);

      if (type === 'admin') {
        // Normalizar o código
        const normalizedCode = code.trim().toUpperCase();
        
        console.log('Tentando login de admin com código:', normalizedCode);
        
        const { data, error } = await supabase
          .from('system_admins')
          .select('*')
          .eq('access_code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle();

        if (error) {
          console.error('Admin login error:', error);
          console.error('Error details:', JSON.stringify(error));
          
          // Verificar se é erro de conexão
          if (error.message.includes('fetch') || error.message.includes('network')) {
            return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
          }
          
          return { success: false, error: 'Erro ao verificar código de administrador. Por favor, tente novamente.' };
        }

        if (!data) {
          console.log('Nenhum admin encontrado com o código:', normalizedCode);
          return { success: false, error: 'Código de administrador inválido ou inativo' };
        }
        
        console.log('Admin encontrado:', data.name);

        // Validate required fields
        if (!data.id || !data.name || !data.email || !data.permission_level) {
          console.error('Invalid admin data structure:', data);
          return { success: false, error: 'Dados de administrador incompletos' };
        }

        const adminLevel = ADMIN_PERMISSION_LEVELS[data.permission_level] ?? 0;
        const permissions = PERMISSION_MAP[adminLevel] || PERMISSION_MAP[0];
        const authUser: AuthUser = {
          type: 'admin',
          data: data as SystemAdmin,
          permissions
        };

        // Criar sessão do Supabase Auth
        const email = `admin-${data.id}@sigeg.internal`;
        const password = normalizedCode;

        // Tentar login primeiro
        let authResult = await supabase.auth.signInWithPassword({
          email,
          password
        });

        // Se falhar, criar nova conta
        if (authResult.error) {
          authResult = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                sigeg_user: authUser
              }
            }
          });
        }

        if (authResult.error && authResult.error.message !== 'User already registered') {
          console.error('Supabase auth error:', authResult.error);
          return { success: false, error: 'Erro ao criar sessão' };
        }

        // Atualizar metadata se necessário
        if (authResult.data.user) {
          await supabase.auth.updateUser({
            data: {
              sigeg_user: authUser
            }
          });
        }

        setUser(authUser);
        return { success: true };

      } else {
        // Normalizar o código de membro
        const normalizedCode = code.trim().toUpperCase();
        
        console.log('Tentando login de membro com código:', normalizedCode);
        
        // First, get the member data
        const { data: memberData, error: memberError } = await supabase
          .from('members')
          .select('*')
          .eq('member_code', normalizedCode)
          .eq('is_active', true)
          .maybeSingle();

        if (memberError) {
          console.error('Member login error:', memberError);
          console.error('Error details:', JSON.stringify(memberError));
          
          // Verificar se é erro de conexão
          if (memberError.message.includes('fetch') || memberError.message.includes('network')) {
            return { success: false, error: 'Erro de conexão. Verifique sua internet e tente novamente.' };
          }
          
          return { success: false, error: 'Erro ao verificar código de membro. Por favor, tente novamente.' };
        }

        if (!memberData) {
          console.log('Nenhum membro encontrado com o código:', normalizedCode);
          return { success: false, error: 'Código de membro inválido ou inativo' };
        }
        
        console.log('Membro encontrado:', memberData.name);

        // Validate required member fields
        if (!memberData.id || !memberData.name || !memberData.group_id) {
          console.error('Invalid member data structure:', memberData);
          return { success: false, error: 'Dados de membro incompletos' };
        }

        // Validar role
        if (!memberData.role) {
          console.error('Member without role:', memberData);
          return { success: false, error: 'Dados de membro incompletos: função não definida' };
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

        // Obter nível baseado na função usando getRoleLevel
        const roleLevel = getRoleLevel(memberData.role);
        const permissions = PERMISSION_MAP[roleLevel] || PERMISSION_MAP[7];

        console.log(`Membro ${memberData.name} - Role: ${memberData.role}, Level: ${roleLevel}`);

        const authUser: AuthUser = {
          type: 'member',
          data: memberData as Member,
          permissions
        };

        // Criar sessão do Supabase Auth
        const email = `member-${memberData.id}@sigeg.internal`;
        const password = normalizedCode;

        // Tentar login primeiro
        let authResult = await supabase.auth.signInWithPassword({
          email,
          password
        });

        // Se falhar, criar nova conta
        if (authResult.error) {
          authResult = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                sigeg_user: authUser
              }
            }
          });
        }

        if (authResult.error && authResult.error.message !== 'User already registered') {
          console.error('Supabase auth error:', authResult.error);
          return { success: false, error: 'Erro ao criar sessão' };
        }

        // Atualizar metadata se necessário
        if (authResult.data.user) {
          await supabase.auth.updateUser({
            data: {
              sigeg_user: authUser
            }
          });
        }

        setUser(authUser);

        // Verificar notificações de atribuições pendentes
        setTimeout(async () => {
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
        }, 1000);

        return { success: true };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Erro interno do sistema' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  const hasPermission = (permission: string): boolean => {
    if (!user || !user.permissions) return false;
    // Admins têm acesso completo
    if (user.permissions.includes('*')) return true;
    // Verificar se a permissão existe
    if (!permission) return true;
    return user.permissions.includes(permission);
  };

  const isAdmin = () => user?.type === 'admin';
  const isMember = () => user?.type === 'member';

  const getPermissionLevel = () => {
    if (!user) return 999;
    
    if (user.type === 'admin') {
      return 0; // Todos admins têm nível 0
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
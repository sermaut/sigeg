import { useAuth } from '@/contexts/AuthContext';
import { getRoleLevel } from '@/lib/memberHelpers';

export interface PermissionChecks {
  // Navigation
  canAccessNewMember: boolean;
  canAccessReports: boolean;
  canAccessAdmins: boolean;
  canAccessSettings: boolean;
  canAccessMonthlyPlans: boolean;
  
  // Groups
  canCreateGroup: boolean;
  canEditGroup: boolean;
  canDeleteGroup: boolean;
  canAddMember: boolean;
  canViewGroupFinancialInfo: boolean;
  
  // Group Details
  canEditGroupDetails: boolean;
  canViewMonthlyPlans: boolean;
  canViewMonthlyCost: boolean;
  canViewAccessCode: boolean;
  
  // Members
  canEditMember: boolean;
  canToggleMemberStatus: boolean;
  canViewMemberPhone: boolean;
  canViewMemberCode: boolean;
  
  // Financial - Registros
  canAccessCategoryModal: boolean;
  canAddTransaction: boolean;
  canDeleteTransaction: boolean;
  canManageCategoryLeaders: boolean;
  
  // Financial - Pagamentos
  canCreatePaymentEvent: boolean;
  canEditPaymentEvent: boolean;
  canDeletePaymentEvent: boolean;
  canClickMemberNames: boolean;
  
  // Technical
  canAddWeeklyProgram: boolean;
  canEditWeeklyProgram: boolean;
  canDeleteWeeklyProgram: boolean;
  canSelectRehearsalDate: boolean;
  
  // Permission level
  level: number;
  role?: string;
}

export function usePermissions(): PermissionChecks {
  const { user, isMember, isAdmin } = useAuth();
  
  // Admin sempre tem todas as permissões
  if (isAdmin()) {
    return {
      canAccessNewMember: true,
      canAccessReports: true,
      canAccessAdmins: true,
      canAccessSettings: true,
      canAccessMonthlyPlans: true,
      canCreateGroup: true,
      canEditGroup: true,
      canDeleteGroup: true,
      canAddMember: true,
      canViewGroupFinancialInfo: true,
      canEditGroupDetails: true,
      canViewMonthlyPlans: true,
      canViewMonthlyCost: true,
      canViewAccessCode: true,
      canEditMember: true,
      canToggleMemberStatus: true,
      canViewMemberPhone: true,
      canViewMemberCode: true,
      canAccessCategoryModal: true,
      canAddTransaction: true,
      canDeleteTransaction: true,
      canManageCategoryLeaders: true,
      canCreatePaymentEvent: true,
      canEditPaymentEvent: true,
      canDeletePaymentEvent: true,
      canClickMemberNames: true,
      canAddWeeklyProgram: true,
      canEditWeeklyProgram: true,
      canDeleteWeeklyProgram: true,
      canSelectRehearsalDate: true,
      level: 0,
      role: 'admin',
    };
  }
  
  // Se não for membro, sem permissões
  if (!isMember() || !user?.data) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: false,
      canViewMemberCode: false,
      canAccessCategoryModal: false,
      canAddTransaction: false,
      canDeleteTransaction: false,
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: false,
      canEditPaymentEvent: false,
      canDeletePaymentEvent: false,
      canClickMemberNames: false,
      canAddWeeklyProgram: false,
      canEditWeeklyProgram: false,
      canDeleteWeeklyProgram: false,
      canSelectRehearsalDate: false,
      level: 999,
    };
  }
  
  const memberData = user.data as any;
  const role = memberData.role || 'membro_simples';
  const level = getRoleLevel(role);
  
  // Nível 1: Dirigentes (presidente, vice-presidente, secretário)
  if (level === 1) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: true,
      canViewGroupFinancialInfo: true,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: true,
      canViewAccessCode: true,
      canEditMember: true,
      canToggleMemberStatus: true,
      canViewMemberPhone: true,
      canViewMemberCode: true,
      canAccessCategoryModal: true,
      canAddTransaction: true,
      canDeleteTransaction: true,
      canManageCategoryLeaders: true,
      canCreatePaymentEvent: true,
      canEditPaymentEvent: true,
      canDeletePaymentEvent: true,
      canClickMemberNames: true,
      canAddWeeklyProgram: true,
      canEditWeeklyProgram: true,
      canDeleteWeeklyProgram: true,
      canSelectRehearsalDate: true,
      level,
      role,
    };
  }
  
  // Nível 2: Inspector, Coordenador
  if (level === 2) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: false,
      canViewMemberCode: false,
      canAccessCategoryModal: false,
      canAddTransaction: false,
      canDeleteTransaction: false,
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: false,
      canEditPaymentEvent: false,
      canDeletePaymentEvent: false,
      canClickMemberNames: false,
      canAddWeeklyProgram: true,
      canEditWeeklyProgram: true,
      canDeleteWeeklyProgram: true,
      canSelectRehearsalDate: true,
      level,
      role,
    };
  }
  
  // Nível 3: Dirigente Técnico
  if (level === 3) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: true,
      canViewMemberCode: false,
      canAccessCategoryModal: false,
      canAddTransaction: false,
      canDeleteTransaction: false,
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: false,
      canEditPaymentEvent: false,
      canDeletePaymentEvent: false,
      canClickMemberNames: false,
      canAddWeeklyProgram: true,
      canEditWeeklyProgram: true,
      canDeleteWeeklyProgram: true,
      canSelectRehearsalDate: true,
      level,
      role,
    };
  }
  
  // Nível 4: Chefe de Partição, Chefe de Categoria
  if (level === 4) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: true,
      canViewMemberCode: false,
      canAccessCategoryModal: false,
      canAddTransaction: false,
      canDeleteTransaction: false,
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: false,
      canEditPaymentEvent: false,
      canDeletePaymentEvent: false,
      canClickMemberNames: false,
      canAddWeeklyProgram: false,
      canEditWeeklyProgram: false,
      canDeleteWeeklyProgram: false,
      canSelectRehearsalDate: true,
      level,
      role,
    };
  }
  
  // Nível 5: Protocolo, Relação Pública, etc.
  if (level === 5) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: false,
      canViewMemberCode: false,
      canAccessCategoryModal: false,
      canAddTransaction: false,
      canDeleteTransaction: false,
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: false,
      canEditPaymentEvent: false,
      canDeletePaymentEvent: false,
      canClickMemberNames: false,
      canAddWeeklyProgram: false,
      canEditWeeklyProgram: false,
      canDeleteWeeklyProgram: false,
      canSelectRehearsalDate: false,
      level,
      role,
    };
  }
  
  // Nível 6: Financeiro (Líder de Categoria)
  if (level === 6) {
    return {
      canAccessNewMember: false,
      canAccessReports: false,
      canAccessAdmins: false,
      canAccessSettings: false,
      canAccessMonthlyPlans: false,
      canCreateGroup: false,
      canEditGroup: false,
      canDeleteGroup: false,
      canAddMember: false,
      canViewGroupFinancialInfo: false,
      canEditGroupDetails: false,
      canViewMonthlyPlans: false,
      canViewMonthlyCost: false,
      canViewAccessCode: false,
      canEditMember: false,
      canToggleMemberStatus: false,
      canViewMemberPhone: false,
      canViewMemberCode: false,
      canAccessCategoryModal: true, // Só categoria onde é líder
      canAddTransaction: true, // Na sua categoria
      canDeleteTransaction: true, // Na sua categoria
      canManageCategoryLeaders: false,
      canCreatePaymentEvent: true,
      canEditPaymentEvent: true, // Só eventos da sua categoria
      canDeletePaymentEvent: true, // Só eventos da sua categoria
      canClickMemberNames: true,
      canAddWeeklyProgram: false,
      canEditWeeklyProgram: false,
      canDeleteWeeklyProgram: false,
      canSelectRehearsalDate: false,
      level,
      role,
    };
  }
  
  // Nível 7: Membro Simples (sem permissões especiais)
  return {
    canAccessNewMember: false,
    canAccessReports: false,
    canAccessAdmins: false,
    canAccessSettings: false,
    canAccessMonthlyPlans: false,
    canCreateGroup: false,
    canEditGroup: false,
    canDeleteGroup: false,
    canAddMember: false,
    canViewGroupFinancialInfo: false,
    canEditGroupDetails: false,
    canViewMonthlyPlans: false,
    canViewMonthlyCost: false,
    canViewAccessCode: false,
    canEditMember: false,
    canToggleMemberStatus: false,
    canViewMemberPhone: false,
    canViewMemberCode: false,
    canAccessCategoryModal: false,
    canAddTransaction: false,
    canDeleteTransaction: false,
    canManageCategoryLeaders: false,
    canCreatePaymentEvent: false,
    canEditPaymentEvent: false,
    canDeletePaymentEvent: false,
    canClickMemberNames: false,
    canAddWeeklyProgram: false,
    canEditWeeklyProgram: false,
    canDeleteWeeklyProgram: false,
    canSelectRehearsalDate: false,
    level,
    role,
  };
}

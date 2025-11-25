/**
 * Helper functions for category roles
 */

export const getCategoryRoleLabel = (role: string): string => {
  const labels: Record<string, string> = {
    presidente: "Presidente",
    secretario: "Secretário",
    auxiliar: "Auxiliar",
  };
  return labels[role] || role;
};

export const getCategoryRoleDescription = (role: string): string => {
  const descriptions: Record<string, string> = {
    presidente: "Permissão total: criar, editar, deletar transações e gerir líderes",
    secretario: "Pode criar e editar suas próprias transações",
    auxiliar: "Pode apenas visualizar saldos e transações",
  };
  return descriptions[role] || "";
};

export const getCategoryRoleBadgeVariant = (role: string): "default" | "secondary" | "outline" => {
  const variants: Record<string, "default" | "secondary" | "outline"> = {
    presidente: "default",
    secretario: "secondary",
    auxiliar: "outline",
  };
  return variants[role] || "outline";
};

export const getPermissionLevelLabel = (level: number): string => {
  const labels: Record<number, string> = {
    0: "Líder do Grupo",
    1: "Presidente",
    2: "Secretário",
    3: "Auxiliar",
    999: "Sem acesso",
  };
  return labels[level] || "Desconhecido";
};

export const getPermissionLevelColor = (level: number): string => {
  const colors: Record<number, string> = {
    0: "text-primary",
    1: "text-blue-600",
    2: "text-green-600",
    3: "text-yellow-600",
    999: "text-muted-foreground",
  };
  return colors[level] || "text-muted-foreground";
};

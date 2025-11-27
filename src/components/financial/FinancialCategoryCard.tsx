import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Minus, Lock, Settings, Crown, UserCheck, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CategoryLeadersDialog } from "./CategoryLeadersDialog";

interface FinancialCategoryCardProps {
  category: {
    id: string;
    name: string;
    total_balance: number;
    description?: string;
    is_locked?: boolean;
    group_id: string;
  };
  index: number;
  onClick?: () => void;
  isGroupLeader?: boolean;
  currentMemberId?: string;
  userType?: 'admin' | 'member' | 'group';
  permissionLevel?: string;
  onManageLeaders?: (categoryId: string, categoryName: string) => void;
  leaders?: CategoryLeader[];
}

interface CategoryLeader {
  id: string;
  role: 'presidente' | 'secretario' | 'auxiliar';
  member_id: string;
  members: {
    id: string;
    name: string;
    profile_image_url: string | null;
  };
}

const categoryColors = [
  {
    gradient: "from-blue-500 to-blue-600",
    icon: "bg-blue-500/10 text-blue-600",
    shadow: "hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]",
    border: "border-blue-500/20"
  },
  {
    gradient: "from-emerald-500 to-emerald-600",
    icon: "bg-emerald-500/10 text-emerald-600",
    shadow: "hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
    border: "border-emerald-500/20"
  },
  {
    gradient: "from-amber-500 to-amber-600",
    icon: "bg-amber-500/10 text-amber-600",
    shadow: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
    border: "border-amber-500/20"
  },
  {
    gradient: "from-purple-500 to-purple-600",
    icon: "bg-purple-500/10 text-purple-600",
    shadow: "hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]",
    border: "border-purple-500/20"
  },
  {
    gradient: "from-rose-500 to-rose-600",
    icon: "bg-rose-500/10 text-rose-600",
    shadow: "hover:shadow-[0_0_20px_rgba(244,63,94,0.3)]",
    border: "border-rose-500/20"
  },
  {
    gradient: "from-orange-500 to-orange-600",
    icon: "bg-orange-500/10 text-orange-600",
    shadow: "hover:shadow-[0_0_20px_rgba(249,115,22,0.3)]",
    border: "border-orange-500/20"
  },
  {
    gradient: "from-pink-500 to-pink-600",
    icon: "bg-pink-500/10 text-pink-600",
    shadow: "hover:shadow-[0_0_20px_rgba(236,72,153,0.3)]",
    border: "border-pink-500/20"
  },
  {
    gradient: "from-cyan-500 to-cyan-600",
    icon: "bg-cyan-500/10 text-cyan-600",
    shadow: "hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]",
    border: "border-cyan-500/20"
  },
];

export function FinancialCategoryCard({ 
  category, 
  index, 
  onClick, 
  isGroupLeader = false,
  currentMemberId,
  userType,
  permissionLevel,
  onManageLeaders,
  leaders: externalLeaders
}: FinancialCategoryCardProps) {
  const colorScheme = categoryColors[index % categoryColors.length];
  const [showLeadersDialog, setShowLeadersDialog] = useState(false);
  const [internalLeaders, setInternalLeaders] = useState<CategoryLeader[]>([]);
  const [hasAccess, setHasAccess] = useState(true);

  // Usar leaders externos se disponíveis, senão usar internos
  const leaders = externalLeaders || internalLeaders;

  useEffect(() => {
    // Só carregar leaders se não foram passados externamente
    if (!externalLeaders) {
      loadLeaders();
    }
  }, [category.id, externalLeaders]);

  useEffect(() => {
    // checkAccess depende de leaders, então executa separadamente
    checkAccess();
  }, [leaders, currentMemberId, userType, permissionLevel, category.is_locked, isGroupLeader]);

  const checkAccess = async () => {
    // Admins principais têm acesso a tudo
    if (userType === 'admin' && 
        (permissionLevel === 'super_admin' || permissionLevel === 'admin_principal')) {
      setHasAccess(true);
      return;
    }

    // Verificar se é líder desta categoria específica
    if (!currentMemberId) {
      setHasAccess(false);
      return;
    }

    const isLeader = leaders.some(l => l.member_id === currentMemberId);
    setHasAccess(isLeader || isGroupLeader);
  };

  const loadLeaders = async () => {
    try {
      const { data } = await supabase
        .from("category_roles")
        .select(`
          id,
          role,
          member_id,
          members!category_roles_member_id_fkey (
            id,
            name,
            profile_image_url
          )
        `)
        .eq("category_id", category.id)
        .eq("is_active", true)
        .order("role", { ascending: true });

      if (data) {
        setInternalLeaders(data as any);
      }
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
    }
  };

  const balance = Number(category.total_balance);
  const isLocked = category.is_locked ?? false;

  const getBalanceIcon = () => {
    if (balance > 0) return <TrendingUp className="w-4 h-4" />;
    if (balance < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getBalanceColor = () => {
    return "text-foreground";
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'presidente':
        return <Crown className="h-3 w-3" />;
      case 'secretario':
        return <UserCheck className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const handleManageLeaders = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onManageLeaders) {
      onManageLeaders(category.id, category.name);
    } else {
      setShowLeadersDialog(true);
    }
  };

  const handleCardClick = () => {
    if (hasAccess) {
      onClick?.();
    }
  };

  return (
    <>
      <Card 
        className={`group transition-all duration-500 border-2 ${colorScheme.border} 
                    backdrop-blur-sm relative overflow-hidden
                    ${hasAccess ? 'cursor-pointer hover:-translate-y-2 hover:shadow-2xl ' + colorScheme.shadow : 'opacity-60 cursor-not-allowed'}`}
        onClick={handleCardClick}
      >
        <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.gradient} 
                        ${!hasAccess ? 'opacity-10' : 'opacity-20 group-hover:opacity-30'} 
                        transition-opacity`} />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorScheme.icon}
                              transition-all duration-500 ${hasAccess ? 'group-hover:scale-110 group-hover:rotate-6' : ''} shadow-sm`}>
                {!hasAccess ? (
                  <Lock className="w-6 h-6" />
                ) : (
                  getBalanceIcon()
                )}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-lg text-foreground transition-colors line-clamp-1 ${hasAccess ? 'group-hover:text-primary' : ''}`}>
                  {category.name}
                </h3>
                {category.description && (
                  <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{category.description}</p>
                )}
              </div>
            </div>
            
            {/* Botão Gerir Líderes no canto superior direito */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleManageLeaders}
              className="text-xs flex items-center gap-1 flex-shrink-0"
            >
              <Settings className="h-3 w-3" />
              Gerir Líderes
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Saldo da categoria */}
            <div className="flex items-center justify-between p-3 bg-background/40 rounded-lg">
              <span className="text-sm font-medium text-muted-foreground">Saldo Actual</span>
              <span className={`text-xl font-bold ${getBalanceColor()}`}>
                {balance.toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </span>
            </div>

            {/* Líderes ou mensagem sem cor de fundo */}
            {leaders.length > 0 ? (
              <div className="mt-3 pt-3 border-t border-current/20">
                <div className="flex items-center gap-1 flex-wrap">
                  {leaders.slice(0, 3).map((leader) => (
                    <Badge 
                      key={leader.id} 
                      variant="secondary" 
                      className="text-xs flex items-center gap-1"
                    >
                      {getRoleIcon(leader.role)}
                      <span className="max-w-[80px] truncate">
                        {Array.isArray(leader.members) ? leader.members[0]?.name : leader.members?.name}
                      </span>
                    </Badge>
                  ))}
                  {leaders.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{leaders.length - 3}
                    </Badge>
                  )}
                </div>
              </div>
            ) : (
              <div className="mt-3 pt-3 border-t border-muted/30">
                <p className="text-xs text-muted-foreground text-center">
                  Sem líderes atribuídos
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {!onManageLeaders && (
        <CategoryLeadersDialog
          open={showLeadersDialog}
          onOpenChange={(open) => {
            setShowLeadersDialog(open);
            if (!open && !externalLeaders) loadLeaders();
          }}
          categoryId={category.id}
          groupId={category.group_id}
          categoryName={category.name}
        />
      )}
    </>
  );
}

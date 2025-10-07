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
  { bg: "bg-blue-500/75", border: "border-blue-500", text: "text-blue-900" },
  { bg: "bg-green-500/75", border: "border-green-500", text: "text-green-900" },
  { bg: "bg-yellow-500/75", border: "border-yellow-500", text: "text-yellow-900" },
  { bg: "bg-purple-500/75", border: "border-purple-500", text: "text-purple-900" },
  { bg: "bg-red-500/75", border: "border-red-500", text: "text-red-900" },
  { bg: "bg-orange-500/75", border: "border-orange-500", text: "text-orange-900" },
  { bg: "bg-pink-500/75", border: "border-pink-500", text: "text-pink-900" },
  { bg: "bg-cyan-500/75", border: "border-cyan-500", text: "text-cyan-900" },
];

export function FinancialCategoryCard({ 
  category, 
  index, 
  onClick, 
  isGroupLeader = false,
  currentMemberId 
}: FinancialCategoryCardProps) {
  const colorScheme = categoryColors[index % categoryColors.length];
  const [showLeadersDialog, setShowLeadersDialog] = useState(false);
  const [leaders, setLeaders] = useState<CategoryLeader[]>([]);

  useEffect(() => {
    loadLeaders();
  }, [category.id]);

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
        setLeaders(data as any);
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
    setShowLeadersDialog(true);
  };

  const handleCardClick = () => {
    if (!isLocked || leaders.some(l => l.member_id === currentMemberId) || isGroupLeader) {
      onClick?.();
    }
  };

  return (
    <>
      <Card 
        className={`cursor-pointer transition-all hover:shadow-md border ${colorScheme.border} ${colorScheme.bg} backdrop-blur-sm relative`}
        onClick={handleCardClick}
      >
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <h3 className={`font-semibold text-sm ${colorScheme.text}`}>
                {category.name}
              </h3>
              {isLocked && (
                <Lock className="w-3 h-3 text-muted-foreground" />
              )}
            </div>
            <div className={`flex items-center space-x-1 ${getBalanceColor()}`}>
              {getBalanceIcon()}
            </div>
          </div>
          
          <div className="space-y-2">
            {category.description && (
              <p className={`text-xs ${colorScheme.text} opacity-80`}>
                {category.description}
              </p>
            )}

            {/* Líderes */}
            {leaders.length > 0 && (
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
            )}

            {/* Botão de gestão */}
            {isGroupLeader && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleManageLeaders}
                className="w-full mt-2 text-xs"
              >
                <Settings className="h-3 w-3 mr-1" />
                Gerir Líderes
              </Button>
            )}
          </div>
        </div>
      </Card>

      <CategoryLeadersDialog
        open={showLeadersDialog}
        onOpenChange={(open) => {
          setShowLeadersDialog(open);
          if (!open) loadLeaders();
        }}
        categoryId={category.id}
        groupId={category.group_id}
        categoryName={category.name}
      />
    </>
  );
}

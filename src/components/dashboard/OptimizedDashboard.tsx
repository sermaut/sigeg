import React, { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, Eye, MapPin } from "lucide-react";

interface OptimizedGroupCardProps {
  group: {
    id: string;
    name: string;
    municipality: string;
    province: string;
    is_active: boolean;
  };
}

const OptimizedGroupCard = memo(({ group }: OptimizedGroupCardProps) => {
  const navigate = useNavigate();
  
  const handleViewGroup = () => {
    navigate(`/groups/${group.id}`);
  };

  return (
    <div 
      className="group flex items-center justify-between p-4 rounded-xl
                 bg-gradient-to-r from-muted/30 to-muted/10
                 hover:from-primary/10 hover:to-accent/10
                 border-2 border-transparent hover:border-primary/20
                 transition-all duration-500 hover:-translate-y-1 hover:shadow-medium
                 cursor-pointer animate-fade-in"
      onClick={handleViewGroup}
    >
      <div className="flex items-center space-x-4">
        <div className="relative">
          <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center
                          shadow-soft group-hover:scale-110 group-hover:rotate-3 
                          transition-all duration-500">
            <Building className="w-6 h-6 text-white" />
          </div>
          {group.is_active && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full 
                            animate-pulse shadow-glow-accent" />
          )}
        </div>
        <div>
          <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
            {group.name}
          </h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {group.municipality}, {group.province}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={group.is_active ? "success" : "secondary"}>
          {group.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button 
          variant="ghost" 
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Eye className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
});

OptimizedGroupCard.displayName = "OptimizedGroupCard";

interface RecentGroupsProps {
  groups: Array<{
    id: string;
    name: string;
    municipality: string;
    province: string;
    is_active: boolean;
  }>;
}

export const RecentGroups = memo(({ groups }: RecentGroupsProps) => {
  const navigate = useNavigate();
  const recentGroups = useMemo(() => groups.slice(0, 5), [groups]);

  return (
    <Card className="card-modern p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-foreground to-primary 
                       bg-clip-text text-transparent">
          Grupos Recentes
        </h2>
        <Button 
          variant="gradient" 
          size="sm"
          className="hover:shadow-glow"
          onClick={() => navigate("/groups")}
        >
          <Eye className="w-4 h-4" />
          Ver Todos
        </Button>
      </div>

      <div className="space-y-3">
        {recentGroups.map((group, idx) => (
          <div 
            key={group.id}
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <OptimizedGroupCard group={group} />
          </div>
        ))}
      </div>

      {groups.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center 
                          mx-auto mb-4 animate-pulse">
            <Building className="w-10 h-10 text-white" />
          </div>
          <p className="text-muted-foreground mb-4">Nenhum grupo cadastrado ainda</p>
          <Button 
            variant="gradient" 
            size="lg"
            className="hover:shadow-glow"
            onClick={() => navigate("/groups/new")}
          >
            <Users className="w-5 h-5" />
            Cadastrar Primeiro Grupo
          </Button>
        </div>
      )}
    </Card>
  );
});

RecentGroups.displayName = "RecentGroups";
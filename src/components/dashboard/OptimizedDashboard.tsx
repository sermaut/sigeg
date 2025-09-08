import React, { memo, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Building, Users, Eye } from "lucide-react";

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
  const handleViewGroup = () => {
    window.location.href = `/groups/${group.id}`;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg transition-smooth hover:bg-muted/50">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
          <Building className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{group.name}</h3>
          <p className="text-sm text-muted-foreground">
            {group.municipality}, {group.province}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge 
          variant={group.is_active ? "default" : "secondary"}
          className={group.is_active ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}
        >
          {group.is_active ? 'Ativo' : 'Inativo'}
        </Badge>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleViewGroup}
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
  const recentGroups = useMemo(() => groups.slice(0, 5), [groups]);

  return (
    <Card className="card-elevated">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">
            Grupos Recentes
          </h2>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => window.location.href = "/groups"}
          >
            <Eye className="w-4 h-4" />
            Ver Todos
          </Button>
        </div>

        <div className="space-y-4">
          {recentGroups.map((group) => (
            <OptimizedGroupCard key={group.id} group={group} />
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-8">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum grupo cadastrado ainda</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-3"
              onClick={() => window.location.href = "/groups/new"}
            >
              <Users className="w-4 h-4" />
              Cadastrar Primeiro Grupo
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
});

RecentGroups.displayName = "RecentGroups";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building, MapPin, Users, Eye, Edit, Trash2 } from "lucide-react";

interface GroupCardProps {
  group: {
    id: string;
    name: string;
    province: string;
    municipality: string;
    direction: string;
    is_active: boolean;
    max_members?: number;
    access_code?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function GroupCard({ group, onView, onEdit, onDelete }: GroupCardProps) {
  return (
    <Card className="card-elevated transition-smooth hover:shadow-medium">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center">
              <Building className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground line-clamp-1">
                {group.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{group.municipality}, {group.province}</span>
              </div>
            </div>
          </div>
          <Badge variant={group.is_active ? "default" : "secondary"}>
            {group.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Direção:</span>
            <span className="font-medium text-foreground capitalize">
              {group.direction}
            </span>
          </div>
          
          {group.max_members && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Limite de Membros:</span>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-muted-foreground" />
                <span className="font-medium text-foreground">{group.max_members}</span>
              </div>
            </div>
          )}

          {group.access_code && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Código de Acesso:</span>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {group.access_code}
              </code>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(group.id)}
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit?.(group.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDelete?.(group.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
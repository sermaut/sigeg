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
    <Card className="group relative overflow-hidden card-elevated border-2 border-border hover:border-primary/50 transition-all duration-300 bg-primary/5 backdrop-blur-sm">
      {/* Efeito de luz de fundo */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
      
      <div className="relative p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center
                              shadow-soft transition-all duration-500 
                              group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-glow">
                <Building className="w-7 h-7 text-white" />
              </div>
              {/* Badge de status animado */}
              {group.is_active && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-success rounded-full 
                                animate-pulse shadow-glow-accent" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground line-clamp-1 
                             group-hover:text-primary transition-colors">
                {group.name}
              </h3>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{group.municipality}, {group.province}</span>
              </div>
            </div>
          </div>
          <Badge variant={group.is_active ? "default" : "secondary"}
                 className="transition-all duration-300 hover:scale-110">
            {group.is_active ? "Ativo" : "Inativo"}
          </Badge>
        </div>

        {/* Info com hover effect */}
        <div className="space-y-3 mb-6">
          {group.direction && (
            <div className="flex items-center justify-between text-sm p-3 rounded-lg
                            bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground font-medium">Direção:</span>
              <span className="text-foreground font-medium capitalize">{group.direction}</span>
            </div>
          )}
          {group.access_code && (
            <div className="flex items-center justify-between text-sm p-3 rounded-lg
                            bg-muted/30 hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground font-medium">Código de Acesso:</span>
              <code className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-mono
                              hover:bg-primary/20 transition-colors">
                {group.access_code}
              </code>
            </div>
          )}
        </div>

        {/* Botões modernos */}
        <div className="flex items-center gap-2">
          <Button 
            variant="gradient" 
            size="sm" 
            className="flex-1"
            onClick={() => onView?.(group.id)}
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            onClick={() => onEdit?.(group.id)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            className="hover:border-destructive hover:text-destructive hover:bg-destructive/5 transition-all"
            onClick={() => onDelete?.(group.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
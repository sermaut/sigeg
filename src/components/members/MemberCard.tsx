import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OptimizedImage } from "@/components/common/OptimizedImage";
import { 
  User, 
  Phone, 
  MapPin, 
  Music, 
  Eye, 
  Edit, 
  UserCheck, 
  UserX,
  Crown,
  Shield
} from "lucide-react";

interface MemberCardProps {
  member: {
    id: string;
    name: string;
    phone?: string;
    neighborhood?: string;
    role?: string;
    partition?: string;
    is_active: boolean;
    profile_image_url?: string;
    member_code?: string;
  };
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onToggleStatus?: (id: string) => void;
  showActions?: boolean;
}

export function MemberCard({ 
  member, 
  onView, 
  onEdit, 
  onToggleStatus,
  showActions = true 
}: MemberCardProps) {
  const getRoleIcon = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'presidente':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'vice-presidente':
      case 'secretario':
        return <Shield className="w-4 h-4 text-blue-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <Card className="group card-modern overflow-hidden">
      {/* Gradiente de fundo decorativo */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/3 via-transparent to-accent/3 
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6">
        <div className="flex items-start space-x-4 mb-4">
          <div className="relative">
            <Avatar className="w-16 h-16 border-4 border-primary/10 
                              group-hover:border-primary/30 transition-all duration-500
                              group-hover:scale-110">
              {member.profile_image_url ? (
                <OptimizedImage 
                  src={member.profile_image_url} 
                  alt={member.name}
                  width={64}
                  height={64}
                  className="rounded-full object-cover"
                />
              ) : (
                <AvatarFallback className="gradient-primary text-white text-lg font-bold">
                  {getInitials(member.name)}
                </AvatarFallback>
              )}
            </Avatar>
            {/* Indicador de status */}
            {member.is_active && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full 
                              border-2 border-white animate-pulse shadow-glow-accent" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-bold text-lg text-foreground line-clamp-1
                             group-hover:text-primary transition-colors">
                {member.name}
              </h3>
              {member.role && (
                <div className="transition-transform duration-300 group-hover:scale-125">
                  {getRoleIcon(member.role)}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={member.is_active ? "default" : "secondary"}>
                {member.is_active ? "Ativo" : "Inativo"}
              </Badge>
              {member.role && (
                <Badge variant="outline" className="border-primary/30 text-primary">
                  {member.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Informações com ícones coloridos */}
        <div className="space-y-3 mb-6">
          {member.partition && (
            <div className="flex items-center space-x-3 text-sm p-2 rounded-lg
                            hover:bg-accent/10 transition-colors group/item">
              <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center
                              group-hover/item:scale-110 transition-transform">
                <Music className="w-4 h-4 text-accent" />
              </div>
              <div>
                <span className="text-muted-foreground text-xs">Partição</span>
                <p className="font-semibold text-foreground capitalize">{member.partition}</p>
              </div>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center space-x-3 text-sm p-2 rounded-lg
                            hover:bg-primary/10 transition-colors group/item">
              <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center
                              group-hover/item:scale-110 transition-transform">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <span className="text-foreground font-medium">{member.phone}</span>
            </div>
          )}

          {member.neighborhood && (
            <div className="flex items-center space-x-3 text-sm p-2 rounded-lg
                            hover:bg-muted transition-colors group/item">
              <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center
                              group-hover/item:scale-110 transition-transform">
                <MapPin className="w-4 h-4 text-muted-foreground" />
              </div>
              <span className="text-foreground">{member.neighborhood}</span>
            </div>
          )}

          {member.member_code && (
            <div className="flex items-center justify-between text-sm p-2 rounded-lg
                            hover:bg-muted/50 transition-colors">
              <span className="text-muted-foreground font-medium">Código:</span>
              <code className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-xs font-mono
                              hover:bg-primary/20 transition-colors">
                {member.member_code}
              </code>
            </div>
          )}
        </div>

        {/* Botões com gradientes */}
        {showActions && (
          <div className="flex items-center gap-2">
            <Button 
              variant="gradient" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(member.id)}
            >
              <Eye className="w-4 h-4" />
              Ver Perfil
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="hover:border-primary hover:text-primary hover:bg-primary/5"
              onClick={() => onEdit?.(member.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className={
                member.is_active 
                  ? "hover:border-destructive hover:text-destructive hover:bg-destructive/5" 
                  : "hover:border-success hover:text-success hover:bg-success/5"
              }
              onClick={() => onToggleStatus?.(member.id)}
            >
              {member.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
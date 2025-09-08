import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
    <Card className="card-elevated transition-smooth hover:shadow-medium">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage 
              src={member.profile_image_url} 
              alt={member.name}
            />
            <AvatarFallback className="gradient-primary text-white">
              {getInitials(member.name)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="font-semibold text-foreground line-clamp-1">
                {member.name}
              </h3>
              {member.role && getRoleIcon(member.role)}
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge variant={member.is_active ? "default" : "secondary"}>
                {member.is_active ? "Ativo" : "Inativo"}
              </Badge>
              {member.role && (
                <Badge variant="outline" className="text-xs">
                  {member.role}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-3 mb-6">
          {member.partition && (
            <div className="flex items-center space-x-2 text-sm">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground">Partição:</span>
              <span className="font-medium text-foreground capitalize">
                {member.partition}
              </span>
            </div>
          )}

          {member.phone && (
            <div className="flex items-center space-x-2 text-sm">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.phone}</span>
            </div>
          )}

          {member.neighborhood && (
            <div className="flex items-center space-x-2 text-sm">
              <MapPin className="w-4 h-4 text-muted-foreground" />
              <span className="text-foreground">{member.neighborhood}</span>
            </div>
          )}

          {member.member_code && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Código:</span>
              <code className="px-2 py-1 bg-muted rounded text-xs font-mono">
                {member.member_code}
              </code>
            </div>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(member.id)}
            >
              <Eye className="w-4 h-4" />
              Ver Detalhes
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEdit?.(member.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              className={member.is_active 
                ? "text-destructive hover:text-destructive hover:bg-destructive/10" 
                : "text-success hover:text-success hover:bg-success/10"
              }
              onClick={() => onToggleStatus?.(member.id)}
            >
              {member.is_active ? (
                <UserX className="w-4 h-4" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
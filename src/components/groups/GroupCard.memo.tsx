import { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Edit, Trash2, MapPin, Users, Building } from "lucide-react";

interface Group {
  id: string;
  name: string;
  province: string;
  municipality: string;
  is_active?: boolean;
  created_at?: string;
}

interface GroupCardProps {
  group: Group;
  onView?: (id: string) => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

// Memoized for performance - prevents unnecessary re-renders
export const GroupCard = memo(function GroupCard({ 
  group, 
  onView, 
  onEdit, 
  onDelete 
}: GroupCardProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Prefetch group details on hover for instant navigation
  const handleMouseEnter = () => {
    queryClient.prefetchQuery({
      queryKey: ['groups', group.id],
      queryFn: async () => {
        const { data } = await import("@/integrations/supabase/client").then(m => 
          m.supabase
            .from('groups')
            .select('*')
            .eq('id', group.id)
            .single()
        );
        return data;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    });
    
    // Also prefetch members for this group
    queryClient.prefetchQuery({
      queryKey: ['members', group.id],
      queryFn: async () => {
        const { data } = await import("@/integrations/supabase/client").then(m =>
          m.supabase
            .from('members')
            .select('id, name, role, partition, is_active, phone, profile_image_url')
            .eq('group_id', group.id)
            .order('name')
        );
        return data;
      },
      staleTime: 5 * 60 * 1000,
    });
  };

  const handleViewClick = () => {
    if (onView) {
      onView(group.id);
    } else {
      navigate(`/groups/${group.id}`);
    }
  };

  const isInactive = group.is_active === false;

  return (
    <Card 
      className={`
        bg-gradient-to-br from-card via-card to-primary/5
        border-2 ${isInactive ? 'border-destructive/40 opacity-75' : 'border-primary/15 hover:border-primary/30'}
        shadow-md hover:shadow-lg
        hover:scale-[1.02] transition-all duration-300
        backdrop-blur-sm
      `}
      onMouseEnter={handleMouseEnter}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1 min-w-0">
            <CardTitle className={`text-base font-semibold flex items-center gap-2 ${isInactive ? 'text-muted-foreground' : 'text-foreground'}`}>
              <div className={`p-1.5 rounded-lg ${isInactive ? 'bg-muted' : 'bg-primary/10'}`}>
                <Building className={`w-4 h-4 ${isInactive ? 'text-muted-foreground' : 'text-primary'}`} />
              </div>
              <span className="truncate">{group.name}</span>
            </CardTitle>
          </div>
          {group.is_active !== undefined && (
            <Badge 
              variant={group.is_active ? "default" : "destructive"}
              className={`shrink-0 ${isInactive ? 'animate-pulse' : ''}`}
            >
              {group.is_active ? "Ativo" : "Inativo"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3 pt-0">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground bg-muted/30 rounded-lg px-2.5 py-1.5">
          <MapPin className="w-4 h-4 text-primary/70" />
          <span className="truncate">{group.municipality}, {group.province}</span>
        </div>

        <div className="flex space-x-2 pt-2">
          <Button
            variant="gradient"
            size="sm"
            onClick={handleViewClick}
            className="flex-1"
          >
            <Eye className="w-4 h-4" />
            Ver Detalhes
          </Button>
          {onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(group.id)}
            >
              <Edit className="w-4 h-4" />
            </Button>
          )}
          {onDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onDelete(group.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
});

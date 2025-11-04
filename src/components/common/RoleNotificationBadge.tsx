import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ScrollArea } from "@/components/ui/scroll-area";

interface RoleNotification {
  id: string;
  category_id: string;
  role: string;
  assigned_by: string | null;
  is_read: boolean;
  created_at: string;
  financial_categories: {
    name: string;
  };
  members: {
    name: string;
  } | null;
}

export function RoleNotificationBadge() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<RoleNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user?.type === 'member') {
      loadNotifications();
      
      // Subscribe to real-time updates
      const channel = supabase
        .channel('role-notifications')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'category_role_notifications',
            filter: `member_id=eq.${(user.data as any).id}`
          },
          () => {
            loadNotifications();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const loadNotifications = async () => {
    if (user?.type !== 'member') return;

    const { data } = await supabase
      .from('category_role_notifications')
      .select(`
        id,
        category_id,
        role,
        assigned_by,
        is_read,
        created_at,
        financial_categories (
          name
        ),
        members:assigned_by (
          name
        )
      `)
      .eq('member_id', (user.data as any).id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) {
      setNotifications(data as any);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from('category_role_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    loadNotifications();
  };

  const markAllAsRead = async () => {
    if (user?.type !== 'member') return;

    await supabase
      .from('category_role_notifications')
      .update({ is_read: true })
      .eq('member_id', (user.data as any).id)
      .eq('is_read', false);

    loadNotifications();
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      'presidente': 'Presidente',
      'secretario': 'Secretário',
      'auxiliar': 'Auxiliar'
    };
    return labels[role] || role;
  };

  if (user?.type !== 'member' || notifications.length === 0) {
    return null;
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notificações</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-[400px]">
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => !notification.is_read && markAsRead(notification.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    !notification.is_read ? 'bg-primary' : 'bg-transparent'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      Nova atribuição: {getRoleLabel(notification.role)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Categoria: {(notification.financial_categories as any)?.name || 'N/A'}
                    </p>
                    {notification.members && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Atribuído por: {(notification.members as any)?.name || 'N/A'}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(notification.created_at).toLocaleDateString('pt-AO', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

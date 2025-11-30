import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, DollarSign, MoreVertical, Edit, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { PaymentEventDialog } from "./PaymentEventDialog";
import { PaymentEventDetails } from "./PaymentEventDetails";
import { PaymentEventEditDialog } from "./PaymentEventEditDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { usePermissions } from "@/hooks/usePermissions";
import { PermissionGuard } from "@/components/common/PermissionGuard";
import { useAuth } from '@/contexts/AuthContext';

interface PaymentEventsProps {
  groupId: string;
}

// Category border colors for visual identification
const categoryBorderColors = [
  "border-blue-500",
  "border-emerald-500", 
  "border-amber-500",
  "border-violet-500",
  "border-rose-500",
  "border-orange-500",
  "border-pink-500",
  "border-cyan-500",
];

export function PaymentEvents({ groupId }: PaymentEventsProps) {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [showEventDialog, setShowEventDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [userCategoryLeadership, setUserCategoryLeadership] = useState<string[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const { toast } = useToast();
  const permissions = usePermissions();
  const { user, isMember } = useAuth();
  
  const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : undefined;

  useEffect(() => {
    loadEvents();
    loadUserCategoryLeadership();
    loadCategories();
  }, [groupId]);
  
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("financial_categories")
        .select("id")
        .eq("group_id", groupId)
        .order("created_at", { ascending: true });
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    }
  };
  
  const getCategoryBorderColor = (categoryId: string | null) => {
    if (!categoryId) return "border-border";
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return "border-border";
    return categoryBorderColors[index % categoryBorderColors.length];
  };
  
  const loadUserCategoryLeadership = async () => {
    if (!currentMemberId) return;
    
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select("category_id")
        .eq("member_id", currentMemberId)
        .eq("is_active", true);
      
      if (error) throw error;
      setUserCategoryLeadership(data?.map(d => d.category_id) || []);
    } catch (error) {
      console.error("Erro ao carregar lideranças:", error);
    }
  };

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("payment_events")
        .select("*")
        .eq("group_id", groupId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error("Erro ao carregar eventos:", error);
      toast({
        title: "Erro ao carregar eventos de pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canManageEvent = (event: any) => {
    if (!event.category_id) return permissions.canEditPaymentEvent;
    return userCategoryLeadership.includes(event.category_id);
  };

  const handleEventAdded = () => {
    loadEvents();
    setShowEventDialog(false);
  };

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
  };

  const handleEditEvent = (event: any) => {
    setEditingEvent(event);
    setShowEditDialog(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    setEventToDelete(eventId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteEvent = async () => {
    if (!eventToDelete) return;
    
    try {
      // Primeiro, deletar todos os pagamentos relacionados
      const { error: paymentsError } = await supabase
        .from("member_payments")
        .delete()
        .eq("payment_event_id", eventToDelete);

      if (paymentsError) throw paymentsError;

      // Então, deletar o evento
      const { error: eventError } = await supabase
        .from("payment_events")
        .delete()
        .eq("id", eventToDelete);

      if (eventError) throw eventError;

      toast({
        title: "Evento eliminado",
        description: "O evento e os pagamentos relacionados foram removidos com sucesso.",
      });

      loadEvents();
    } catch (error) {
      console.error("Erro ao eliminar evento:", error);
      toast({
        title: "Erro",
        description: "Não foi possível eliminar o evento.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setEventToDelete(null);
    }
  };

  const handleEventUpdated = () => {
    loadEvents();
    setShowEditDialog(false);
  };

  if (loading) {
    return <div className="text-center py-8">Carregando eventos de pagamento...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Eventos de Pagamento</h3>
        </div>
        <PermissionGuard require="canCreatePaymentEvent">
          <Button 
            onClick={() => setShowEventDialog(true)}
            className="flex items-center gap-2 text-sm py-[5px] px-3 h-auto"
          >
            <Plus className="h-3.5 w-3.5" />
            Novo Evento
          </Button>
        </PermissionGuard>
      </div>

      {/* Events List */}
      {events.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">Nenhum evento de pagamento criado.</p>
            <Button 
              onClick={() => setShowEventDialog(true)}
              className="mt-4"
              variant="outline"
            >
              Criar primeiro evento
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <Card 
              key={event.id}
              className={`hover:shadow-md transition-shadow border-2 ${getCategoryBorderColor(event.category_id)}`}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle 
                  className="text-sm font-medium cursor-pointer hover:text-primary"
                  onClick={() => handleEventClick(event)}
                >
                  {event.title}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {canManageEvent(event) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditEvent(event)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardHeader>
              <CardContent 
                className="cursor-pointer"
                onClick={() => handleEventClick(event)}
              >
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span className="text-lg font-bold">
                    {Number(event.amount_to_pay).toLocaleString('pt-AO', { 
                      style: 'currency', 
                      currency: 'AOA' 
                    })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Criado em {format(new Date(event.created_at), "dd/MM/yyyy")}
                </p>
                {event.created_by && (
                  <p className="text-xs text-muted-foreground">
                    Por: {event.created_by}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Event Details Modal */}
      {selectedEvent && (
        <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto p-0">
            <PaymentEventDetails 
              event={selectedEvent}
              groupId={groupId}
              onClose={() => setSelectedEvent(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Event Dialog */}
      <PaymentEventDialog
        open={showEventDialog}
        onOpenChange={setShowEventDialog}
        groupId={groupId}
        onEventAdded={handleEventAdded}
      />

      {/* Edit Event Dialog */}
      <PaymentEventEditDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        event={editingEvent}
        onEventUpdated={handleEventUpdated}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <AlertDialogTitle>Eliminar Evento</AlertDialogTitle>
            </div>
            <AlertDialogDescription>
              Tem certeza que deseja eliminar este evento? Esta ação não pode ser desfeita e todos os pagamentos relacionados serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteEvent}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
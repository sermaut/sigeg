import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PaymentEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  onEventAdded: () => void;
}

export function PaymentEventDialog({ open, onOpenChange, groupId, onEventAdded }: PaymentEventDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount_to_pay: "",
  });
  const [userCategoryId, setUserCategoryId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, isMember } = useAuth();
  
  useEffect(() => {
    if (open && isMember()) {
      loadUserCategory();
    }
  }, [open]);
  
  const loadUserCategory = async () => {
    const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : undefined;
    if (!currentMemberId) return;
    
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select("category_id")
        .eq("member_id", currentMemberId)
        .eq("is_active", true)
        .limit(1)
        .single();
      
      if (error) throw error;
      setUserCategoryId(data?.category_id || null);
    } catch (error) {
      console.error("Erro ao carregar categoria:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    try {
      // Create payment event
      const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : undefined;
      
      const { data: eventData, error: eventError } = await supabase
        .from("payment_events")
        .insert({
          group_id: groupId,
          title: formData.title,
          amount_to_pay: parseFloat(formData.amount_to_pay),
          category_id: userCategoryId, // Associar evento à categoria do líder
          created_by_member_id: currentMemberId,
        })
        .select()
        .single();

      if (eventError) throw eventError;

      // Get all members of the group and create initial payment records
      const { data: members, error: membersError } = await supabase
        .from("members")
        .select("id")
        .eq("group_id", groupId)
        .eq("is_active", true);

      if (membersError) throw membersError;

      // Create payment records for all members (initially with 0 amount)
      if (members && members.length > 0) {
        const memberPayments = members.map(member => ({
          payment_event_id: eventData.id,
          member_id: member.id,
          amount_paid: 0,
        }));

        const { error: paymentsError } = await supabase
          .from("member_payments")
          .insert(memberPayments);

        if (paymentsError) throw paymentsError;
      }

      toast({
        title: "Evento criado com sucesso!",
        description: "Todos os membros foram adicionados ao evento.",
      });

      // Reset form
      setFormData({
        title: "",
        amount_to_pay: "",
      });

      onEventAdded();
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast({
        title: "Erro ao criar evento",
        description: error.message || "Ocorreu um erro inesperado",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Novo Evento de Pagamento</DialogTitle>
          <DialogDescription>
            Crie um novo evento para controlar os pagamentos dos membros.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título do Evento</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Ex: Taxa mensal de Janeiro"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor a Pagar (AOA)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount_to_pay}
              onChange={(e) => setFormData({...formData, amount_to_pay: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>


          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PaymentEventEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: any;
  onEventUpdated: () => void;
}

export function PaymentEventEditDialog({ open, onOpenChange, event, onEventUpdated }: PaymentEventEditDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount_to_pay: "",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title || "",
        amount_to_pay: event.amount_to_pay?.toString() || "",
      });
    }
  }, [event]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!event) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("payment_events")
        .update({
          title: formData.title,
          amount_to_pay: parseFloat(formData.amount_to_pay),
        })
        .eq("id", event.id);

      if (error) throw error;

      toast({
        title: "Evento atualizado com sucesso!",
      });

      onEventUpdated();
    } catch (error) {
      console.error("Erro ao atualizar evento:", error);
      toast({
        title: "Erro ao atualizar evento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!event) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Editar Evento de Pagamento</DialogTitle>
          <DialogDescription>
            Edite as informações do evento de pagamento.
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
              {loading ? "Atualizando..." : "Atualizar Evento"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
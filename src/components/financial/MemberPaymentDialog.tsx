import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MemberPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberPayment: any;
  eventAmountToPay: number;
  onPaymentUpdated: () => void;
  canEditPayment?: boolean;
}

export function MemberPaymentDialog({ 
  open, 
  onOpenChange, 
  memberPayment, 
  eventAmountToPay, 
  onPaymentUpdated,
  canEditPayment = true
}: MemberPaymentDialogProps) {
  const [loading, setLoading] = useState(false);
  const [amountPaid, setAmountPaid] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (memberPayment) {
      setAmountPaid(memberPayment.amount_paid.toString());
    }
  }, [memberPayment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberPayment) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("member_payments")
        .update({
          amount_paid: parseFloat(amountPaid) || 0,
        })
        .eq("id", memberPayment.id);

      if (error) throw error;

      toast({
        title: "Pagamento atualizado com sucesso!",
      });

      onPaymentUpdated();
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!memberPayment) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from("member_payments")
        .update({
          amount_paid: 0,
        })
        .eq("id", memberPayment.id);

      if (error) throw error;

      setAmountPaid("0");
      toast({
        title: "Pagamento limpo com sucesso!",
      });

      onPaymentUpdated();
    } catch (error) {
      console.error("Erro ao limpar pagamento:", error);
      toast({
        title: "Erro ao limpar pagamento",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paid === 0) return { status: "Pendente", variant: "destructive" as const };
    if (paid >= eventAmountToPay) return { status: "Concluído", variant: "default" as const };
    return { status: "Parcial", variant: "outline" as const };
  };

  const paymentStatus = getPaymentStatus();

  if (!memberPayment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Pagamento de {memberPayment.members?.name}</DialogTitle>
          <DialogDescription>
            Visualize, edite ou limpe o valor pago por este membro.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">Status do Pagamento:</span>
            <Badge variant={paymentStatus.variant}>{paymentStatus.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Valor a pagar:</span>
              <p className="font-semibold">
                {eventAmountToPay.toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">Valor em falta:</span>
              <p className="font-semibold text-red-600">
                {Math.max(0, eventAmountToPay - (parseFloat(amountPaid) || 0)).toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor Pago (AOA)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {canEditPayment ? (
              <div className="flex justify-between space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClear}
                  disabled={loading}
                >
                  Limpar
                </Button>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            ) : (
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="w-full"
              >
                Fechar
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
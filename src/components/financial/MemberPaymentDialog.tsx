import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
        title: t('memberPayment.paymentUpdated'),
      });

      onPaymentUpdated();
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: t('memberPayment.errorUpdating'),
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
        title: t('memberPayment.paymentCleared'),
      });

      onPaymentUpdated();
    } catch (error) {
      console.error("Erro ao limpar pagamento:", error);
      toast({
        title: t('memberPayment.errorClearing'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatus = () => {
    const paid = parseFloat(amountPaid) || 0;
    if (paid === 0) return { status: t('memberPayment.pending'), variant: "destructive" as const };
    if (paid >= eventAmountToPay) return { status: t('memberPayment.completed'), variant: "default" as const };
    return { status: t('memberPayment.partial'), variant: "outline" as const };
  };

  const paymentStatus = getPaymentStatus();

  if (!memberPayment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('memberPayment.paymentOf', { name: memberPayment.members?.name })}</DialogTitle>
          <DialogDescription>
            {t('memberPayment.viewEditClear')}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <span className="text-sm font-medium">{t('memberPayment.paymentStatus')}:</span>
            <Badge variant={paymentStatus.variant}>{paymentStatus.status}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">{t('memberPayment.amountToPay')}:</span>
              <p className="font-semibold">
                {eventAmountToPay.toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </p>
            </div>
            <div>
              <span className="text-muted-foreground">{t('memberPayment.amountMissing')}:</span>
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
              <Label htmlFor="amount">{t('memberPayment.amountPaid')}</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="0.00"
                disabled={!canEditPayment}
                readOnly={!canEditPayment}
                className={!canEditPayment ? "bg-muted cursor-not-allowed" : ""}
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
                  {t('memberPayment.clear')}
                </Button>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? t('memberPayment.saving') : t('memberPayment.save')}
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
                {t('common.close')}
              </Button>
            )}
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
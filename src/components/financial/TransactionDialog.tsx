import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";

interface TransactionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onTransactionAdded: () => void;
  canCreate?: boolean;
  isLocked?: boolean;
}

export function TransactionDialog({ open, onOpenChange, categoryId, onTransactionAdded, canCreate = true, isLocked = false }: TransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "entrada",
    amount: "",
    description: "",
  });
  const { toast } = useToast();
  const { t } = useTranslation();
  const { user, isMember } = useAuth();

  // Get current member ID
  const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      toast({
        title: "Erro",
        description: "ID da categoria não encontrado.",
        variant: "destructive",
      });
      return;
    }

    if (!canCreate || isLocked) {
      toast({
        title: "Ação não permitida",
        description: "Você não tem permissão para criar transações nesta categoria.",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Valor inválido",
        description: "Por favor, insira um valor válido maior que zero.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.description.trim()) {
      toast({
        title: "Descrição obrigatória",
        description: "Por favor, insira uma descrição para a transação.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("financial_transactions")
        .insert({
          category_id: categoryId,
          type: formData.type,
          amount: amount,
          description: formData.description.trim(),
          created_by_member_id: currentMemberId, // Track who created the transaction
        });

      if (error) {
        console.error("Database error:", error);
        throw new Error(error.message || "Erro ao salvar transação");
      }

      toast({
        title: "Transação adicionada com sucesso!",
      });

      // Reset form
      setFormData({
        type: "entrada",
        amount: "",
        description: "",
      });

      onTransactionAdded();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Erro ao adicionar transação:", error);
      toast({
        title: "Erro ao adicionar transação",
        description: error.message || "Tente novamente mais tarde.",
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
          <DialogTitle>{t('transactions.newTransaction')}</DialogTitle>
          <DialogDescription>
            {isLocked ? (
              <span className="text-destructive">{t('transactions.categoryLocked')}</span>
            ) : (
              t('transactions.addTransaction')
            )}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="type">{t('transactions.type')}</Label>
            <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entrada">{t('transactions.income')}</SelectItem>
                <SelectItem value="saida">{t('transactions.expense')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">{t('transactions.amount')}</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t('transactions.description')}</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder={t('transactions.descriptionPlaceholder')}
              required
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" disabled={loading || !canCreate || isLocked}>
              {loading ? t('common.loading') : t('common.add')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
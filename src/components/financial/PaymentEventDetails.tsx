import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Calendar, DollarSign, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MemberPaymentDialog } from "./MemberPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface PaymentEventDetailsProps {
  event: any;
  groupId: string;
  onClose: () => void;
}

export function PaymentEventDetails({ event, groupId, onClose }: PaymentEventDetailsProps) {
  const [memberPayments, setMemberPayments] = useState<any[]>([]);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [categoryLeaders, setCategoryLeaders] = useState<any[]>([]);
  const { toast } = useToast();
  const { user, isGroup, isMember } = useAuth();

  // Verificar se é líder de categoria
  const currentMemberId = isMember() && user?.type === 'member' ? (user.data as any).id : undefined;
  const isCategoryLeader = categoryLeaders.some(leader => leader.member_id === currentMemberId);
  const canEditPayment = !isGroup?.() && !isCategoryLeader;

  useEffect(() => {
    loadMemberPayments();
    if (event.category_id) {
      loadCategoryLeaders();
    }
  }, [event.id]);

  const loadCategoryLeaders = async () => {
    if (!event.category_id) return;
    
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select("*")
        .eq("category_id", event.category_id)
        .eq("is_active", true);

      if (error) throw error;
      setCategoryLeaders(data || []);
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
    }
  };

  const loadMemberPayments = async () => {
    try {
      const { data, error } = await supabase
        .from("member_payments")
        .select(`
          *,
          members:member_id (
            id,
            name
          )
        `)
        .eq("payment_event_id", event.id)
        .order("name", { foreignTable: "members" });

      if (error) throw error;
      setMemberPayments(data || []);
    } catch (error) {
      console.error("Erro ao carregar pagamentos:", error);
      toast({
        title: "Erro ao carregar dados dos pagamentos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberClick = (memberPayment: any) => {
    setSelectedMember(memberPayment);
    setShowPaymentDialog(true);
  };

  const handlePaymentUpdated = () => {
    loadMemberPayments();
    setShowPaymentDialog(false);
  };

  // Categorize members based on payment status
  const completedPayments = memberPayments.filter(mp => 
    Number(mp.amount_paid) >= Number(event.amount_to_pay)
  );
  
  const partialPayments = memberPayments.filter(mp => 
    Number(mp.amount_paid) > 0 && Number(mp.amount_paid) < Number(event.amount_to_pay)
  );
  
  const noPayments = memberPayments.filter(mp => 
    Number(mp.amount_paid) === 0
  );

  const totalCollected = memberPayments.reduce((sum, mp) => sum + Number(mp.amount_paid), 0);
  const expectedTotal = memberPayments.length * Number(event.amount_to_pay);

  if (loading) {
    return <div className="text-center py-8">Carregando detalhes do evento...</div>;
  }

  return (
    <Card className="w-full h-full flex flex-col max-w-none">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              {event.title}
            </CardTitle>
            <CardDescription className="mt-2">
              Criado em {format(new Date(event.created_at), "dd/MM/yyyy")}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Valor por membro</p>
              <p className="font-semibold">
                {Number(event.amount_to_pay).toLocaleString('pt-AO', { 
                  style: 'currency', 
                  currency: 'AOA' 
                })}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Total de membros</p>
              <p className="font-semibold">{memberPayments.length}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Total arrecadado</p>
            <p className="font-semibold text-green-600">
              {totalCollected.toLocaleString('pt-AO', { 
                style: 'currency', 
                currency: 'AOA' 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              de {expectedTotal.toLocaleString('pt-AO', { 
                style: 'currency', 
                currency: 'AOA' 
              })}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-hidden">
        <Tabs defaultValue="completed" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="completed" className="relative">
              Concluído
              <Badge variant="secondary" className="ml-2">{completedPayments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="partial" className="relative">
              Parcial
              <Badge variant="secondary" className="ml-2">{partialPayments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="none" className="relative">
              Pendente
              <Badge variant="secondary" className="ml-2">{noPayments.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="space-y-2">
            {completedPayments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum membro concluiu o pagamento ainda.
              </p>
            ) : (
              completedPayments.map((memberPayment) => (
                <div 
                  key={memberPayment.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMemberClick(memberPayment)}
                >
                  <span className="font-medium">{memberPayment.members.name}</span>
                  <Badge variant="default">
                    {Number(memberPayment.amount_paid).toLocaleString('pt-AO', { 
                      style: 'currency', 
                      currency: 'AOA' 
                    })}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="partial" className="space-y-2">
            {partialPayments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Nenhum membro com pagamento parcial.
              </p>
            ) : (
              partialPayments.map((memberPayment) => (
                <div 
                  key={memberPayment.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMemberClick(memberPayment)}
                >
                  <span className="font-medium">{memberPayment.members.name}</span>
                  <Badge variant="outline">
                    {Number(memberPayment.amount_paid).toLocaleString('pt-AO', { 
                      style: 'currency', 
                      currency: 'AOA' 
                    })}
                  </Badge>
                </div>
              ))
            )}
          </TabsContent>
          
          <TabsContent value="none" className="space-y-2">
            {noPayments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                Todos os membros já contribuíram!
              </p>
            ) : (
              noPayments.map((memberPayment) => (
                <div 
                  key={memberPayment.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMemberClick(memberPayment)}
                >
                  <span className="font-medium">{memberPayment.members.name}</span>
                  <Badge variant="destructive">Pendente</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Member Payment Dialog */}
      <MemberPaymentDialog
        open={showPaymentDialog}
        onOpenChange={setShowPaymentDialog}
        memberPayment={selectedMember}
        eventAmountToPay={Number(event.amount_to_pay)}
        onPaymentUpdated={handlePaymentUpdated}
        canEditPayment={canEditPayment}
      />
    </Card>
  );
}
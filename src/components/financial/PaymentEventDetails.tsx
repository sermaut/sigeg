import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar, DollarSign, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { MemberPaymentDialog } from "./MemberPaymentDialog";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";

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
  const [leadersLoaded, setLeadersLoaded] = useState(false);
  const { toast } = useToast();
  const { user, isGroup, isMember } = useAuth();
  const { t } = useTranslation();

  const currentMemberId = useMemo(() => {
    if (isMember() && user?.type === 'member') {
      return (user.data as any)?.id;
    }
    return undefined;
  }, [user, isMember]);

  const isCategoryLeader = useMemo(() => {
    if (!event.category_id || !currentMemberId || !leadersLoaded) {
      return false;
    }
    return categoryLeaders.some(
      leader => leader.member_id === currentMemberId && leader.category_id === event.category_id
    );
  }, [event.category_id, currentMemberId, categoryLeaders, leadersLoaded]);

  const canEditPayment = !isGroup?.() && isCategoryLeader;

  useEffect(() => {
    loadMemberPayments();
    if (event.category_id) {
      loadCategoryLeaders();
    } else {
      setLeadersLoaded(true);
    }
  }, [event.id, event.category_id]);

  const loadCategoryLeaders = async () => {
    if (!event.category_id) {
      setLeadersLoaded(true);
      return;
    }
    
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
      setCategoryLeaders([]);
    } finally {
      setLeadersLoaded(true);
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
        title: t('common.error'),
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

  const completedPayments = memberPayments
    .filter(mp => Number(mp.amount_paid) >= Number(event.amount_to_pay))
    .sort((a, b) => a.members.name.localeCompare(b.members.name));
  
  const partialPayments = memberPayments
    .filter(mp => Number(mp.amount_paid) > 0 && Number(mp.amount_paid) < Number(event.amount_to_pay))
    .sort((a, b) => a.members.name.localeCompare(b.members.name));
  
  const noPayments = memberPayments
    .filter(mp => Number(mp.amount_paid) === 0)
    .sort((a, b) => a.members.name.localeCompare(b.members.name));

  const totalCollected = memberPayments.reduce((sum, mp) => sum + Number(mp.amount_paid), 0);
  const expectedTotal = memberPayments.length * Number(event.amount_to_pay);

  if (loading) {
    return <div className="text-center py-8">{t('paymentDetails.loadingDetails')}</div>;
  }

  return (
    <Card className="w-full h-full flex flex-col max-w-none border-0 shadow-none">
      <CardHeader className="flex-shrink-0">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Calendar className="h-4 w-4" />
            {event.title}
          </CardTitle>
          <CardDescription className="mt-2">
            {t('paymentDetails.createdOn')} {format(new Date(event.created_at), "dd/MM/yyyy")}
          </CardDescription>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">{t('paymentDetails.amountPerMember')}</p>
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
              <p className="text-sm text-muted-foreground">{t('paymentDetails.totalMembers')}</p>
              <p className="font-semibold">{memberPayments.length}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">{t('paymentDetails.totalCollected')}</p>
            <p className="font-semibold text-green-600">
              {totalCollected.toLocaleString('pt-AO', { 
                style: 'currency', 
                currency: 'AOA' 
              })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t('paymentDetails.of')} {expectedTotal.toLocaleString('pt-AO', { 
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
              {t('paymentDetails.completed')}
              <Badge variant="secondary" className="ml-2">{completedPayments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="partial" className="relative">
              {t('paymentDetails.partial')}
              <Badge variant="secondary" className="ml-2">{partialPayments.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="none" className="relative">
              {t('paymentDetails.pending')}
              <Badge variant="secondary" className="ml-2">{noPayments.length}</Badge>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="completed" className="space-y-2">
            {completedPayments.length === 0 ? (
              <p className="text-center py-4 text-muted-foreground">
                {t('paymentDetails.noMemberCompleted')}
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
                {t('paymentDetails.noPartialPayment')}
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
                {t('paymentDetails.allMembersContributed')}
              </p>
            ) : (
              noPayments.map((memberPayment) => (
                <div 
                  key={memberPayment.id}
                  className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleMemberClick(memberPayment)}
                >
                  <span className="font-medium">{memberPayment.members.name}</span>
                  <Badge variant="destructive">{t('paymentDetails.pending')}</Badge>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>

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
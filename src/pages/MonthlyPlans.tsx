import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { 
  Crown, 
  Users, 
  CheckCircle, 
  Zap,
  Star,
  Award,
  Trophy
} from "lucide-react";
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

interface MonthlyPlan {
  id: string;
  name: string;
  max_members: number;
  price_per_member: number;
  is_active: boolean;
}

interface Group {
  id: string;
  name: string; 
  plan_id?: string;
}

const planIcons = {
  'Plano Gratuito': CheckCircle,
  'Plano Semente': Zap,
  'Plano Broto': Star,
  'Plano Flora': Award,
  'Plano Árvore': Trophy,
  'Plano Floresta': Crown,
  'Plano Máximo': Crown,
};

const planColors = {
  'Plano Gratuito': 'bg-gray-500',
  'Plano Semente': 'bg-green-500',
  'Plano Broto': 'bg-blue-500',
  'Plano Flora': 'bg-purple-500',
  'Plano Árvore': 'bg-orange-500',
  'Plano Floresta': 'bg-red-500',
  'Plano Máximo': 'bg-gradient-to-r from-purple-600 to-pink-600',
};

export default function MonthlyPlans() {
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [group, setGroup] = useState<Group | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MonthlyPlan | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const { isAdmin, hasPermission } = useAuth();
  const { groupId } = useParams();

  useEffect(() => {
    loadPlans();
    if (groupId) {
      loadGroup();
    }
  }, [groupId]);

  async function loadPlans() {
    try {
      const { data, error } = await supabase
        .from('monthly_plans')
        .select('*')
        .eq('is_active', true)
        .order('max_members');

      if (error) throw error;
      setPlans(data || []);
    } catch (error) {
      console.error('Erro ao carregar planos:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar planos mensais",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadGroup() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, plan_id')
        .eq('id', groupId)
        .maybeSingle();

      if (error) throw error;
      setGroup(data || null);
    } catch (error) {
      console.error('Erro ao carregar grupo:', error);
    }
  }

  const handlePlanSelect = (plan: MonthlyPlan) => {
    if (!isAdmin() || !hasPermission('manage_groups') || !groupId) {
      return;
    }
    setSelectedPlan(plan);
    setShowConfirmDialog(true);
  };

  const handleConfirmPlan = async () => {
    if (!selectedPlan || !group) return;

    try {
      const { error } = await supabase
        .from('groups')
        .update({ plan_id: selectedPlan.id } as any)
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "Plano ativado com sucesso!",
        description: `${selectedPlan.name} foi aplicado ao grupo ${group.name}`,
      });

      setGroup({ ...group, plan_id: selectedPlan.id });
      setShowConfirmDialog(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Erro ao ativar plano:', error);
      toast({
        title: "Erro",
        description: "Falha ao ativar o plano",
        variant: "destructive",
      });
    }
  };

  const getPlanFeatures = (planName: string) => {
    const features = {
      'Plano Gratuito': [
        'Limite de 20 membros',
        'Sem fotos no perfil',
        'Sem edição de dados após cadastro',
        'Acesso a serviços musicais',
        'Solicitação de arranjos e acompanhamentos'
      ],
      'Plano Semente': [
        'Limite de 40 membros',
        'Fotos no perfil habilitadas',
        'Edição completa de dados',
        'Todos os recursos do Plano Gratuito',
        'Suporte prioritário'
      ],
      'Plano Broto': [
        'Limite de 70 membros',
        'Recursos completos de gestão',
        'Relatórios avançados',
        'Backup automático',
        'Integração com outros serviços'
      ],
      'Plano Flora': [
        'Limite de 100 membros',
        'Dashboard executivo',
        'Análises financeiras detalhadas',
        'API para integrações',
        'Suporte 24/7'
      ],
      'Plano Árvore': [
        'Limite de 150 membros',
        'Recursos empresariais',
        'Multi-grupos por conta',
        'Auditoria completa',
        'Treinamento personalizado'
      ],
      'Plano Floresta': [
        'Limite de 200 membros',
        'Recursos premium',
        'Customizações avançadas',
        'Integrações ilimitadas',
        'Gerente de conta dedicado'
      ],
      'Plano Máximo': [
        'Limite de 250 membros',
        'Todos os recursos disponíveis',
        'Recursos beta em primeira mão',
        'Suporte VIP',
        'Consultorias especializadas'
      ]
    };
    return features[planName as keyof typeof features] || [];
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground">{t('plans.title')}</h1>
          <p className="text-muted-foreground">
            {groupId && group 
              ? `${t('plans.selectPlanFor')} ${group.name}`
              : t('plans.choosePlan')
            }
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const Icon = planIcons[plan.name as keyof typeof planIcons] || Crown;
            const isSelected = group?.plan_id === plan.id;
            const canSelect = isAdmin() && hasPermission('manage_groups') && groupId;
            const totalMonthly = plan.max_members * plan.price_per_member;

            return (
              <Card 
                key={plan.id} 
                className={`relative overflow-hidden transition-all hover:shadow-lg ${
                  isSelected ? 'ring-2 ring-primary' : ''
                } ${canSelect ? 'cursor-pointer hover:scale-105' : ''}`}
                onClick={() => handlePlanSelect(plan)}
              >
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <Badge variant="default">Atual</Badge>
                  </div>
                )}
                
                <div className="p-6 space-y-4">
                  <div className="text-center space-y-2">
                    <div className={`w-16 h-16 mx-auto rounded-full ${planColors[plan.name as keyof typeof planColors]} flex items-center justify-center`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                  </div>

                  <div className="text-center space-y-1">
                    <div className="flex items-center justify-center space-x-1">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Até {plan.max_members} membros</span>
                    </div>
                    
                    {plan.price_per_member > 0 ? (
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-foreground">
                          {plan.price_per_member} Kz
                          <span className="text-sm font-normal text-muted-foreground"> / membro</span>
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total mensal máximo: {totalMonthly} Kz
                        </p>
                      </div>
                    ) : (
                      <p className="text-2xl font-bold text-green-600">Gratuito</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    {getPlanFeatures(plan.name).map((feature, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {canSelect && !isSelected && (
                    <Button className="w-full" variant="outline">
                      Selecionar Plano
                    </Button>
                  )}

                  {isSelected && (
                    <Button className="w-full" variant="default" disabled>
                      Plano Atual
                    </Button>
                  )}

                  {!canSelect && !groupId && (
                    <div className="text-center">
                      <Badge variant="secondary">Visualização</Badge>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Confirmation Dialog */}
        <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Ativar Plano</AlertDialogTitle>
              <AlertDialogDescription>
                Tem certeza que deseja ativar o <strong>{selectedPlan?.name}</strong> para este grupo?
                {selectedPlan && selectedPlan.price_per_member > 0 && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
                    <p className="text-sm">
                      <strong>Custo:</strong> {selectedPlan.price_per_member} Kz por membro
                    </p>
                    <p className="text-sm">
                      <strong>Limite de membros:</strong> {selectedPlan.max_members}
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirmPlan}>
                Ativar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
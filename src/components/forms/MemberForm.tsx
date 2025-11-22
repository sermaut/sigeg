import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Upload } from "lucide-react";
import { ImageCropper } from "./ImageCropper";
import { compressImage } from "@/lib/imageOptimization";

const memberSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  group_id: z.string().min(1, "Grupo é obrigatório"),
  neighborhood: z.string().optional(),
  birth_province: z.string().optional(),
  birth_municipality: z.string().optional(),
  birth_date: z.string().optional(),
  phone: z.string().optional(),
  marital_status: z.enum(["solteiro", "casado", "divorciado", "viuvo"], {
    required_error: "Estado civil é obrigatório",
  }).default("solteiro"),
  role: z.enum([
    // Nível 1
    "presidente", "vice_presidente_1", "vice_presidente_2", "secretario_1", "secretario_2",
    // Nível 2
    "inspector", "inspector_adj", "coordenador", "coordenador_adj",
    // Nível 3
    "dirigente_tecnico",
    // Nível 4
    "chefe_particao", "chefe_categoria",
    // Nível 5
    "protocolo", "relacao_publica", "evangelista", "conselheiro", "disciplinador",
    // Nível 6
    "financeiro",
    // Nível 7
    "membro_simples"
  ], {
    required_error: "Função é obrigatória",
  }).default("membro_simples"),
  partition: z.enum([
    // Vozes
    "soprano", "alto", "tenor", "base", "baryton",
    // Metais
    "trompete", "trombones", "tubas",
    // Madeiras
    "clarinetes", "saxofone",
    // Percussão
    "caixa_1", "caixa_2", "caixa_3", "percussao"
  ], {
    required_error: "Partição é obrigatória",
  }).optional(),
  member_code: z.string().optional(),
});

type MemberFormData = z.infer<typeof memberSchema>;

interface MemberFormProps {
  memberId?: string;
  groupId?: string;
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
}

export const MemberForm = ({ memberId, groupId, initialData, isEditing, onSuccess }: MemberFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string>("");
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [showCropper, setShowCropper] = useState(false);
  const [memberLimitInfo, setMemberLimitInfo] = useState<{
    currentCount: number;
    limit: number;
    planName: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Get groupId from URL params if not provided
  const urlParams = new URLSearchParams(location.search);
  const urlGroupId = urlParams.get('groupId');
  const effectiveGroupId = groupId || urlGroupId;
  
  const form = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: initialData || {
      name: "",
      group_id: effectiveGroupId || "",
      marital_status: "solteiro",
      role: "membro_simples",
      partition: undefined,
    },
  });

  useEffect(() => {
    if (initialData?.profile_image_url) {
      setProfileImageUrl(initialData.profile_image_url);
    }
  }, [initialData]);

  // Check member limit when component mounts or groupId changes
  useEffect(() => {
    const checkMemberLimit = async () => {
      if (!effectiveGroupId) return;

      try {
        const [membersResponse, groupResponse] = await Promise.all([
          supabase
            .from('members')
            .select('id')
            .eq('group_id', effectiveGroupId)
            .eq('is_active', true),
          supabase
            .from('groups')
            .select(`
              monthly_plans (
                name,
                max_members
              )
            `)
            .eq('id', effectiveGroupId)
            .maybeSingle()
        ]);

        if (membersResponse.data && groupResponse.data?.monthly_plans) {
          setMemberLimitInfo({
            currentCount: membersResponse.data.length,
            limit: groupResponse.data.monthly_plans.max_members,
            planName: groupResponse.data.monthly_plans.name
          });
        }
      } catch (error) {
        console.error('Erro ao verificar limite de membros:', error);
      }
    };

    checkMemberLimit();
  }, [effectiveGroupId]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      const compressedFile = await compressImage(file, 512, 0.7);
      const reader = new FileReader();
      reader.onload = (e) => {
        setTempImageUrl(e.target?.result as string);
        setShowCropper(true);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Falha ao processar imagem",
        variant: "destructive",
      });
    }
  };

  const handleCroppedImage = (croppedImage: string) => {
    setProfileImageUrl(croppedImage);
  };

  const onSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    
    // Check member limit before submitting (only for new members)
    if (!isEditing && memberLimitInfo) {
      if (memberLimitInfo.currentCount >= memberLimitInfo.limit) {
        toast({
          title: "Limite de membros excedido",
          description: `O plano ${memberLimitInfo.planName} permite apenas ${memberLimitInfo.limit} membros. O grupo já tem ${memberLimitInfo.currentCount} membros ativos.`,
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    try {
      const memberData = {
        ...data,
        profile_image_url: profileImageUrl || null,
        birth_date: data.birth_date ? new Date(data.birth_date).toISOString().split('T')[0] : null,
      };

      if (isEditing && memberId) {
        const { error } = await supabase
          .from("members")
          .update(memberData)
          .eq("id", memberId);
        
        if (error) throw error;
        toast({ title: "Membro atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from("members")
          .insert([memberData as any]);
        
        if (error) throw error;
        toast({ title: "Membro criado com sucesso!" });
      }
      
      onSuccess?.();
      // Reset form for adding another member
      form.reset({
        name: "",
        group_id: effectiveGroupId || "",
        marital_status: "solteiro",
        role: "membro_simples",
        partition: undefined,
      });
      setProfileImageUrl("");
    } catch (error: any) {
      console.error("Erro ao salvar membro:", error);
      
      // Handle specific database errors
      let errorMessage = "Verifique os dados e tente novamente";
      if (error?.message?.includes("Limite de membros excedido")) {
        errorMessage = error.message;
      }
      
      toast({
        title: "Erro ao salvar membro",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Photo Upload Section */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-32 h-32">
                <AvatarImage src={profileImageUrl} />
                <AvatarFallback className="text-lg">
                  <Camera className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Carregar Foto
              </Button>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birth_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data de Nascimento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="+244 xxx xxx xxx" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="neighborhood"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bairro</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o bairro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="birth_province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Província de Nascimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite a província" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="birth_municipality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Município de Nascimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o município" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <FormField
                control={form.control}
                name="marital_status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estado Civil</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro</SelectItem>
                        <SelectItem value="casado">Casado</SelectItem>
                        <SelectItem value="divorciado">Divorciado</SelectItem>
                        <SelectItem value="viuvo">Viúvo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Função</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px]">
                        {/* Nível 1 - Liderança Executiva */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5">
                          Nível 1 - Liderança Executiva
                        </div>
                        <SelectItem value="presidente">Presidente</SelectItem>
                        <SelectItem value="vice_presidente_1">Vice-presidente 1</SelectItem>
                        <SelectItem value="vice_presidente_2">Vice-presidente 2</SelectItem>
                        <SelectItem value="secretario_1">Secretário 1</SelectItem>
                        <SelectItem value="secretario_2">Secretário 2</SelectItem>
                        
                        {/* Nível 2 - Coordenação */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 2 - Coordenação
                        </div>
                        <SelectItem value="inspector">Inspector</SelectItem>
                        <SelectItem value="inspector_adj">Inspector Adj.</SelectItem>
                        <SelectItem value="coordenador">Coordenador</SelectItem>
                        <SelectItem value="coordenador_adj">Coordenador Adj.</SelectItem>
                        
                        {/* Nível 3 - Direção Técnica */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 3 - Direção Técnica
                        </div>
                        <SelectItem value="dirigente_tecnico">Dirigente Técnico</SelectItem>
                        
                        {/* Nível 4 - Liderança Setorial */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 4 - Liderança Setorial
                        </div>
                        <SelectItem value="chefe_particao">Chefe de Partição</SelectItem>
                        <SelectItem value="chefe_categoria">Chefe de Categoria</SelectItem>
                        
                        {/* Nível 5 - Serviços Especiais */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 5 - Serviços Especiais
                        </div>
                        <SelectItem value="protocolo">Protocolo</SelectItem>
                        <SelectItem value="relacao_publica">Relação Pública</SelectItem>
                        <SelectItem value="evangelista">Evangelista</SelectItem>
                        <SelectItem value="conselheiro">Conselheiro</SelectItem>
                        <SelectItem value="disciplinador">Disciplinador</SelectItem>
                        
                        {/* Nível 6 - Gestão Financeira */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 6 - Gestão Financeira
                        </div>
                        <SelectItem value="financeiro">Financeiro</SelectItem>
                        
                        {/* Nível 7 - Membros */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Nível 7 - Membros
                        </div>
                        <SelectItem value="membro_simples">Membro Simples</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="partition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partição</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px]">
                        {/* Vozes */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5">
                          Vozes
                        </div>
                        <SelectItem value="soprano">Soprano</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="tenor">Tenor</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="baryton">Baryton</SelectItem>
                        
                        {/* Metais */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Metais
                        </div>
                        <SelectItem value="trompete">Trompete</SelectItem>
                        <SelectItem value="trombones">Trombones</SelectItem>
                        <SelectItem value="tubas">Tubas</SelectItem>
                        
                        {/* Madeiras */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Madeiras
                        </div>
                        <SelectItem value="clarinetes">Clarinetes</SelectItem>
                        <SelectItem value="saxofone">Saxofone</SelectItem>
                        
                        {/* Percussão */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          Percussão
                        </div>
                        <SelectItem value="caixa_1">1ª Caixa</SelectItem>
                        <SelectItem value="caixa_2">2ª Caixa</SelectItem>
                        <SelectItem value="caixa_3">3ª Caixa</SelectItem>
                        <SelectItem value="percussao">Percussão</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="member_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Membro</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de membro" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Member limit warning */}
            {!isEditing && memberLimitInfo && memberLimitInfo.currentCount >= memberLimitInfo.limit && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-destructive font-medium">
                    ⚠️ Limite de membros atingido
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  O plano {memberLimitInfo.planName} permite apenas {memberLimitInfo.limit} membros. 
                  Este grupo já tem {memberLimitInfo.currentCount} membros ativos.
                </p>
              </div>
            )}

            {/* Member limit info */}
            {!isEditing && memberLimitInfo && memberLimitInfo.currentCount < memberLimitInfo.limit && (
              <div className="bg-muted/50 border border-muted rounded-lg p-3">
                <div className="text-sm text-muted-foreground">
                  <strong>Plano {memberLimitInfo.planName}:</strong> {memberLimitInfo.currentCount} de {memberLimitInfo.limit} membros utilizados
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!isEditing && memberLimitInfo && memberLimitInfo.currentCount >= memberLimitInfo.limit)} 
                className="flex-1"
              >
                {isLoading ? "Salvando..." : memberId ? "Atualizar" : "Criar Membro"}
              </Button>
            </div>
          </form>
        </Form>

        {/* Image Cropper */}
        <ImageCropper
          open={showCropper}
          onOpenChange={setShowCropper}
          imageSrc={tempImageUrl}
          onCrop={handleCroppedImage}
        />
      </CardContent>
    </Card>
  );
};
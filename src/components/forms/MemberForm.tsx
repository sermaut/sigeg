import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Camera, Upload, Wand2, Loader2 } from "lucide-react";
import { ImageCropper } from "./ImageCropper";
import { compressImage } from "@/lib/imageOptimization";
import { generateUniqueMemberCode, isMemberCodeUnique } from "@/lib/codeGenerator";
import { useTranslation } from "react-i18next";

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
    "dirigente_tecnico", "chefe_pelotao", "chefe_seccao", "chefe_grupo",
    // Nível 4
    "chefe_particao", "chefe_categoria", "chefe_equipa", "chefe_missao", "chefe_percussao",
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
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
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
  const { t } = useTranslation();
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
    
    // Validar tamanho máximo de 2,5MB
    const maxSizeInBytes = 2.5 * 1024 * 1024; // 2,5MB
    if (file.size > maxSizeInBytes) {
      toast({
        title: t('memberForm.imageTooLarge'),
        description: t('memberForm.maxImageSize'),
        variant: "destructive",
      });
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }
    
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
        title: t('memberForm.errorSave'),
        description: t('memberForm.errorProcessImage'),
        variant: "destructive",
      });
    }
  };

  const handleCroppedImage = (croppedImage: string) => {
    setProfileImageUrl(croppedImage);
  };

  const handleGenerateMemberCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = await generateUniqueMemberCode(memberId);
      form.setValue("member_code", code);
      toast({ title: t('memberForm.codeGenerated') });
    } catch (error) {
      toast({
        title: t('memberForm.errorGenerateCode'),
        description: t('common.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const onSubmit = async (data: MemberFormData) => {
    setIsLoading(true);
    
    // Check member limit before submitting (only for new members)
    if (!isEditing && memberLimitInfo) {
      if (memberLimitInfo.currentCount >= memberLimitInfo.limit) {
        toast({
          title: t('memberForm.memberLimitExceeded'),
          description: t('memberForm.memberLimitDesc', { 
            plan: memberLimitInfo.planName, 
            limit: memberLimitInfo.limit,
            current: memberLimitInfo.currentCount
          }),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }

    // Validar unicidade do código de membro
    if (data.member_code) {
      const isUnique = await isMemberCodeUnique(data.member_code, memberId);
      if (!isUnique) {
        toast({
          title: t('memberForm.codeExists'),
          description: t('memberForm.codeInUse'),
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
        toast({ title: t('memberForm.memberUpdated') });
      } else {
        const { error } = await supabase
          .from("members")
          .insert([memberData as any]);
        
        if (error) throw error;
        toast({ title: t('memberForm.memberCreated') });
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
      let errorMessage = t('common.checkDataTryAgain');
      if (error?.message?.includes("Limite de membros excedido")) {
        errorMessage = error.message;
      }
      
      toast({
        title: t('memberForm.errorSave'),
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
                {t('memberForm.uploadPhoto')}
              </Button>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('memberForm.fullName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('memberForm.enterFullName')} {...field} />
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
                    <FormLabel>{t('memberForm.birthDate')}</FormLabel>
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
                    <FormLabel>{t('memberForm.phone')}</FormLabel>
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
                  <FormLabel>{t('memberForm.neighborhood')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('memberForm.enterNeighborhood')} {...field} />
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
                    <FormLabel>{t('memberForm.birthProvince')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('memberForm.enterProvince')} {...field} />
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
                    <FormLabel>{t('memberForm.birthMunicipality')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('memberForm.enterMunicipality')} {...field} />
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
                    <FormLabel>{t('memberForm.maritalStatus')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="solteiro">{t('memberForm.single')}</SelectItem>
                        <SelectItem value="casado">{t('memberForm.married')}</SelectItem>
                        <SelectItem value="divorciado">{t('memberForm.divorced')}</SelectItem>
                        <SelectItem value="viuvo">{t('memberForm.widowed')}</SelectItem>
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
                    <FormLabel>{t('memberForm.role')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px]">
                        {/* Nível 1 - Liderança Executiva */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5">
                          {t('memberForm.level1')}
                        </div>
                        <SelectItem value="presidente">{t('memberForm.roles.president')}</SelectItem>
                        <SelectItem value="vice_presidente_1">{t('memberForm.roles.vicePresident1')}</SelectItem>
                        <SelectItem value="vice_presidente_2">{t('memberForm.roles.vicePresident2')}</SelectItem>
                        <SelectItem value="secretario_1">{t('memberForm.roles.secretary1')}</SelectItem>
                        <SelectItem value="secretario_2">{t('memberForm.roles.secretary2')}</SelectItem>
                        
                        {/* Nível 2 - Coordenação */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level2')}
                        </div>
                        <SelectItem value="inspector">{t('memberForm.roles.inspector')}</SelectItem>
                        <SelectItem value="inspector_adj">{t('memberForm.roles.inspectorAdj')}</SelectItem>
                        <SelectItem value="coordenador">{t('memberForm.roles.coordinator')}</SelectItem>
                        <SelectItem value="coordenador_adj">{t('memberForm.roles.coordinatorAdj')}</SelectItem>
                        
                        {/* Nível 3 - Direção Técnica */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level3')}
                        </div>
                        <SelectItem value="dirigente_tecnico">{t('memberForm.roles.technicalDirector')}</SelectItem>
                        <SelectItem value="chefe_pelotao">{t('memberForm.roles.platoonChief')}</SelectItem>
                        <SelectItem value="chefe_seccao">{t('memberForm.roles.sectionChief')}</SelectItem>
                        <SelectItem value="chefe_grupo">{t('memberForm.roles.groupChief')}</SelectItem>
                        
                        {/* Nível 4 - Liderança Setorial */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level4')}
                        </div>
                        <SelectItem value="chefe_particao">{t('memberForm.roles.partitionChief')}</SelectItem>
                        <SelectItem value="chefe_categoria">{t('memberForm.roles.categoryChief')}</SelectItem>
                        <SelectItem value="chefe_equipa">{t('memberForm.roles.teamChief')}</SelectItem>
                        <SelectItem value="chefe_missao">{t('memberForm.roles.missionChief')}</SelectItem>
                        <SelectItem value="chefe_percussao">{t('memberForm.roles.percussionChief')}</SelectItem>
                        
                        {/* Nível 5 - Serviços Especiais */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level5')}
                        </div>
                        <SelectItem value="protocolo">{t('memberForm.roles.protocol')}</SelectItem>
                        <SelectItem value="relacao_publica">{t('memberForm.roles.publicRelations')}</SelectItem>
                        <SelectItem value="evangelista">{t('memberForm.roles.evangelist')}</SelectItem>
                        <SelectItem value="conselheiro">{t('memberForm.roles.counselor')}</SelectItem>
                        <SelectItem value="disciplinador">{t('memberForm.roles.disciplinarian')}</SelectItem>
                        
                        {/* Nível 6 - Gestão Financeira */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level6')}
                        </div>
                        <SelectItem value="financeiro">{t('memberForm.roles.financial')}</SelectItem>
                        
                        {/* Nível 7 - Membros */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.level7')}
                        </div>
                        <SelectItem value="membro_simples">{t('memberForm.roles.simpleMember')}</SelectItem>
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
                    <FormLabel>{t('memberForm.partition')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('common.select')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[400px]">
                        {/* Vozes */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5">
                          {t('memberForm.partitions.voices')}
                        </div>
                        <SelectItem value="soprano">Soprano</SelectItem>
                        <SelectItem value="alto">Alto</SelectItem>
                        <SelectItem value="tenor">Tenor</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="baryton">Baryton</SelectItem>
                        
                        {/* Metais */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.partitions.brass')}
                        </div>
                        <SelectItem value="trompete">{t('memberForm.partitions.trumpet')}</SelectItem>
                        <SelectItem value="trombones">{t('memberForm.partitions.trombones')}</SelectItem>
                        <SelectItem value="tubas">{t('memberForm.partitions.tubas')}</SelectItem>
                        
                        {/* Madeiras */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.partitions.woodwinds')}
                        </div>
                        <SelectItem value="clarinetes">{t('memberForm.partitions.clarinets')}</SelectItem>
                        <SelectItem value="saxofone">{t('memberForm.partitions.saxophone')}</SelectItem>
                        
                        {/* Percussão */}
                        <div className="px-2 py-1.5 text-xs font-semibold text-primary bg-primary/5 mt-1">
                          {t('memberForm.partitions.percussion')}
                        </div>
                        <SelectItem value="caixa_1">{t('memberForm.partitions.snare1')}</SelectItem>
                        <SelectItem value="caixa_2">{t('memberForm.partitions.snare2')}</SelectItem>
                        <SelectItem value="caixa_3">{t('memberForm.partitions.snare3')}</SelectItem>
                        <SelectItem value="percussao">{t('memberForm.partitions.percussion')}</SelectItem>
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
                  <FormLabel>{t('memberForm.memberCode')}</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ex: AB3@K7" {...field} className="flex-1" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateMemberCode}
                      disabled={isGeneratingCode}
                      className="shrink-0"
                    >
                      {isGeneratingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">{t('memberForm.generate')}</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Member limit warning */}
            {!isEditing && memberLimitInfo && memberLimitInfo.currentCount >= memberLimitInfo.limit && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="text-destructive font-medium">
                    ⚠️ {t('memberForm.memberLimitReached')}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {t('memberForm.memberLimitDesc', { 
                    plan: memberLimitInfo.planName, 
                    limit: memberLimitInfo.limit,
                    current: memberLimitInfo.currentCount
                  })}
                </p>
              </div>
            )}

            {/* Member limit info */}
            {!isEditing && memberLimitInfo && memberLimitInfo.currentCount < memberLimitInfo.limit && (
              <div className="bg-muted/50 border border-muted rounded-lg p-3">
                <div className="text-sm text-muted-foreground">
                  <strong>{t('memberForm.plan')} {memberLimitInfo.planName}:</strong> {memberLimitInfo.currentCount} {t('memberForm.of')} {memberLimitInfo.limit} {t('memberForm.membersUsed')}
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
                {t('common.cancel')}
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || (!isEditing && memberLimitInfo && memberLimitInfo.currentCount >= memberLimitInfo.limit)} 
                className="flex-1"
              >
                {isLoading ? t('memberForm.saving') : memberId ? t('memberForm.update') : t('memberForm.createMember')}
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

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Wand2, Loader2 } from "lucide-react";
import { generateUniqueGroupCode, isGroupCodeUnique } from "@/lib/codeGenerator";
import { useLanguage } from "@/contexts/LanguageContext";

const groupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  province: z.string().min(1, "Província é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"), 
  direction: z.enum(["geral", "nacional", "provincial", "municipal", "comunal", "seccao", "zona"]),
  president_name: z.string().min(2, "Nome do Presidente é obrigatório"),
  president_id: z.string().uuid().optional().nullable(),
  vice_president_1_name: z.string().min(2, "Nome do Vice-presidente 1 é obrigatório"),
  vice_president_1_id: z.string().uuid().optional().nullable(),
  vice_president_2_name: z.string().optional(),
  vice_president_2_id: z.string().uuid().optional().nullable(),
  secretary_1_name: z.string().min(2, "Nome do Secretário 1 é obrigatório"),
  secretary_1_id: z.string().uuid().optional().nullable(),
  secretary_2_name: z.string().optional(),
  secretary_2_id: z.string().uuid().optional().nullable(),
  access_code: z.string().optional(),
});

type GroupFormData = z.infer<typeof groupSchema>;

interface GroupFormProps {
  groupId?: string;
  initialData?: any;
  isEditing?: boolean;
  onSuccess?: () => void;
}

const provinces = [
  "Luanda", "Benguela", "Huíla", "Bié", "Cuanza Norte", "Cuanza Sul", 
  "Cunene", "Huambo", "Lunda Norte", "Lunda Sul", "Malanje", "Moxico",
  "Namibe", "Uíge", "Zaire", "Cabinda", "Cuando Cubango", "Bengo"
];

export const GroupForm = ({ groupId, initialData, isEditing, onSuccess }: GroupFormProps) => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [groupMembers, setGroupMembers] = useState<Array<{ id: string; name: string }>>([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const form = useForm<GroupFormData>({
    resolver: zodResolver(groupSchema),
    defaultValues: initialData ? {
      name: initialData.name || "",
      province: initialData.province || "",
      municipality: initialData.municipality || "",
      direction: initialData.direction || "geral",
      president_name: initialData.president_name || "",
      president_id: initialData.president_id || null,
      vice_president_1_name: initialData.vice_president_1_name || "",
      vice_president_1_id: initialData.vice_president_1_id || null,
      vice_president_2_name: initialData.vice_president_2_name || "",
      vice_president_2_id: initialData.vice_president_2_id || null,
      secretary_1_name: initialData.secretary_1_name || "",
      secretary_1_id: initialData.secretary_1_id || null,
      secretary_2_name: initialData.secretary_2_name || "",
      secretary_2_id: initialData.secretary_2_id || null,
      access_code: initialData.access_code || "",
    } : {
      name: "",
      province: "",
      municipality: "",
      direction: "geral",
      president_name: "",
      president_id: null,
      vice_president_1_name: "",
      vice_president_1_id: null,
      vice_president_2_name: "",
      vice_president_2_id: null,
      secretary_1_name: "",
      secretary_1_id: null,
      secretary_2_name: "",
      secretary_2_id: null,
      access_code: "",
    },
  });

  // Load group members when editing
  useEffect(() => {
    if (isEditing && groupId) {
      loadGroupMembers();
    }
  }, [isEditing, groupId]);

  async function loadGroupMembers() {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("name");
      
      if (error) throw error;
      if (data) setGroupMembers(data);
    } catch (error) {
      console.error("Error loading members:", error);
    }
  }

  const handleGenerateGroupCode = async () => {
    setIsGeneratingCode(true);
    try {
      const code = await generateUniqueGroupCode(groupId);
      form.setValue("access_code", code);
      toast({ title: t('forms.codeGenerated') });
    } catch (error) {
      toast({
        title: t('forms.codeError'),
        description: t('forms.tryAgain'),
        variant: "destructive",
      });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const onSubmit = async (data: GroupFormData) => {
    setIsLoading(true);
    console.log("Form data being submitted:", data);

    // Validar unicidade do código de acesso
    if (data.access_code) {
      const isUnique = await isGroupCodeUnique(data.access_code, groupId);
      if (!isUnique) {
        toast({
          title: t('forms.codeExists'),
          description: t('forms.codeExistsDescription'),
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
    }
    
    try {
      // Prepare data for database
      const dbData = {
        name: data.name,
        province: data.province,
        municipality: data.municipality,
        direction: data.direction,
        president_name: data.president_name,
        president_id: data.president_id || null,
        vice_president_1_name: data.vice_president_1_name,
        vice_president_1_id: data.vice_president_1_id || null,
        vice_president_2_name: data.vice_president_2_name || null,
        vice_president_2_id: data.vice_president_2_id || null,
        secretary_1_name: data.secretary_1_name,
        secretary_1_id: data.secretary_1_id || null,
        secretary_2_name: data.secretary_2_name || null,
        secretary_2_id: data.secretary_2_id || null,
        access_code: data.access_code || null,
      };
      
      console.log("Database data:", dbData);
      
      if (isEditing && groupId) {
        const { error } = await supabase
          .from("groups")
          .update(dbData)
          .eq("id", groupId);
        
        if (error) {
          console.error("Update error:", error);
          throw error;
        }
        toast({ title: t('groupForm.groupUpdated') });
      } else {
        const { data: newGroup, error } = await supabase
          .from("groups")
          .insert([dbData as any])
          .select()
          .single();
        
        if (error) {
          console.error("Insert error:", error);
          throw error;
        }

        // Create leadership members automatically
        const leadershipMembers = [];
        
        if (data.president_name) {
          leadershipMembers.push({
            name: data.president_name,
            role: 'presidente',
            group_id: newGroup.id,
            is_active: true,
            member_code: `PRES_${newGroup.id.slice(-6)}`
          });
        }

        if (data.vice_president_1_name) {
          leadershipMembers.push({
            name: data.vice_president_1_name,
            role: 'vice_presidente',
            group_id: newGroup.id,
            is_active: true,
            member_code: `VP1_${newGroup.id.slice(-6)}`
          });
        }

        if (data.vice_president_2_name) {
          leadershipMembers.push({
            name: data.vice_president_2_name,
            role: 'vice_presidente',
            group_id: newGroup.id,
            is_active: true,
            member_code: `VP2_${newGroup.id.slice(-6)}`
          });
        }

        if (data.secretary_1_name) {
          leadershipMembers.push({
            name: data.secretary_1_name,
            role: 'secretario',
            group_id: newGroup.id,
            is_active: true,
            member_code: `SEC1_${newGroup.id.slice(-6)}`
          });
        }

        if (data.secretary_2_name) {
          leadershipMembers.push({
            name: data.secretary_2_name,
            role: 'secretario',
            group_id: newGroup.id,
            is_active: true,
            member_code: `SEC2_${newGroup.id.slice(-6)}`
          });
        }

        // Insert leadership members if any
        if (leadershipMembers.length > 0) {
          const { error: membersError } = await supabase
            .from("members")
            .insert(leadershipMembers);

          if (membersError) {
            console.error("Error creating leadership members:", membersError);
            // Don't throw error here to avoid failing the entire operation
          }
        }

        toast({ title: t('groupForm.groupCreated') });
      }
      
      onSuccess?.();
      navigate("/groups");
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: t('groupForm.saveError'),
        description: error?.message || t('groupForm.saveErrorDescription'),
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
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('groupForm.groupName')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('groupForm.groupNamePlaceholder')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('groupForm.province')}</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('groupForm.provincePlaceholder')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {provinces.map((province) => (
                          <SelectItem key={province} value={province}>
                            {province}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="municipality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('groupForm.municipality')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('groupForm.municipalityPlaceholder')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="direction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Direção</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a direção" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="geral">Geral</SelectItem>
                      <SelectItem value="nacional">Nacional</SelectItem>
                      <SelectItem value="provincial">Provincial</SelectItem>
                      <SelectItem value="municipal">Municipal</SelectItem>
                      <SelectItem value="comunal">Comunal</SelectItem>
                      <SelectItem value="seccao">Secção</SelectItem>
                      <SelectItem value="zona">Zona</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Leadership Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">Liderança do Grupo</h3>
              
              {/* Presidente */}
              <div className="space-y-2">
                <FormLabel>Presidente</FormLabel>
                {isEditing && groupMembers.length > 0 && (
                  <>
                    <Select
                      onValueChange={(memberId) => {
                        const member = groupMembers.find(m => m.id === memberId);
                        if (member) {
                          form.setValue("president_id", memberId);
                          form.setValue("president_name", member.name);
                        }
                      }}
                      value={form.watch("president_id") || ""}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecionar membro existente" />
                      </SelectTrigger>
                      <SelectContent>
                        {groupMembers.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">ou digite o nome manualmente:</p>
                  </>
                )}
                <FormField
                  control={form.control}
                  name="president_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input placeholder="Digite o nome do presidente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Vice-presidente 1 */}
                <div className="space-y-2">
                  <FormLabel>Vice-presidente 1</FormLabel>
                  {isEditing && groupMembers.length > 0 && (
                    <>
                      <Select
                        onValueChange={(memberId) => {
                          const member = groupMembers.find(m => m.id === memberId);
                          if (member) {
                            form.setValue("vice_president_1_id", memberId);
                            form.setValue("vice_president_1_name", member.name);
                          }
                        }}
                        value={form.watch("vice_president_1_id") || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">ou digite manualmente:</p>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="vice_president_1_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome do vice-presidente 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Vice-presidente 2 */}
                <div className="space-y-2">
                  <FormLabel>Vice-presidente 2 (Opcional)</FormLabel>
                  {isEditing && groupMembers.length > 0 && (
                    <>
                      <Select
                        onValueChange={(memberId) => {
                          const member = groupMembers.find(m => m.id === memberId);
                          if (member) {
                            form.setValue("vice_president_2_id", memberId);
                            form.setValue("vice_president_2_name", member.name);
                          }
                        }}
                        value={form.watch("vice_president_2_id") || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">ou digite manualmente:</p>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="vice_president_2_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome do vice-presidente 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Secretário 1 */}
                <div className="space-y-2">
                  <FormLabel>Secretário 1</FormLabel>
                  {isEditing && groupMembers.length > 0 && (
                    <>
                      <Select
                        onValueChange={(memberId) => {
                          const member = groupMembers.find(m => m.id === memberId);
                          if (member) {
                            form.setValue("secretary_1_id", memberId);
                            form.setValue("secretary_1_name", member.name);
                          }
                        }}
                        value={form.watch("secretary_1_id") || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">ou digite manualmente:</p>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="secretary_1_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome do secretário 1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Secretário 2 */}
                <div className="space-y-2">
                  <FormLabel>Secretário 2 (Opcional)</FormLabel>
                  {isEditing && groupMembers.length > 0 && (
                    <>
                      <Select
                        onValueChange={(memberId) => {
                          const member = groupMembers.find(m => m.id === memberId);
                          if (member) {
                            form.setValue("secretary_2_id", memberId);
                            form.setValue("secretary_2_name", member.name);
                          }
                        }}
                        value={form.watch("secretary_2_id") || ""}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar membro" />
                        </SelectTrigger>
                        <SelectContent>
                          {groupMembers.map((member) => (
                            <SelectItem key={member.id} value={member.id}>
                              {member.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-sm text-muted-foreground">ou digite manualmente:</p>
                    </>
                  )}
                  <FormField
                    control={form.control}
                    name="secretary_2_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input placeholder="Nome do secretário 2" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>


            <FormField
              control={form.control}
              name="access_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acesso (Opcional)</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="Ex: X7@MN5" {...field} className="flex-1" />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGenerateGroupCode}
                      disabled={isGeneratingCode}
                      className="shrink-0"
                    >
                      {isGeneratingCode ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Wand2 className="w-4 h-4" />
                      )}
                      <span className="ml-2 hidden sm:inline">Gerar</span>
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/groups")}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? "Salvando..." : groupId ? "Atualizar" : "Criar Grupo"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
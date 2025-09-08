import { useState } from "react";
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

const groupSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  province: z.string().min(1, "Província é obrigatória"),
  municipality: z.string().min(1, "Município é obrigatório"), 
  direction: z.enum(["geral", "nacional", "provincial", "municipal", "comunal", "seccao", "zona"]),
  president_name: z.string().min(2, "Nome do Presidente é obrigatório"),
  vice_president_1_name: z.string().min(2, "Nome do Vice-presidente 1 é obrigatório"),
  vice_president_2_name: z.string().optional(),
  secretary_1_name: z.string().min(2, "Nome do Secretário 1 é obrigatório"),
  secretary_2_name: z.string().optional(),
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
  const [isLoading, setIsLoading] = useState(false);
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
      vice_president_1_name: initialData.vice_president_1_name || "",
      vice_president_2_name: initialData.vice_president_2_name || "",
      secretary_1_name: initialData.secretary_1_name || "",
      secretary_2_name: initialData.secretary_2_name || "",
      access_code: initialData.access_code || "",
    } : {
      name: "",
      province: "",
      municipality: "",
      direction: "geral",
      president_name: "",
      vice_president_1_name: "",
      vice_president_2_name: "",
      secretary_1_name: "",
      secretary_2_name: "",
      access_code: "",
    },
  });

  const onSubmit = async (data: GroupFormData) => {
    setIsLoading(true);
    console.log("Form data being submitted:", data);
    
    try {
      // Prepare data for database
      const dbData = {
        ...data,
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
        toast({ title: "Grupo atualizado com sucesso!" });
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

        toast({ title: "Grupo criado com sucesso!" });
      }
      
      onSuccess?.();
      navigate("/groups");
    } catch (error) {
      console.error("Erro ao salvar grupo:", error);
      toast({
        title: "Erro ao salvar grupo",
        description: error?.message || "Verifique os dados e tente novamente",
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
                  <FormLabel>Nome do Grupo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o nome do grupo" {...field} />
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
                    <FormLabel>Província</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a província" />
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
                    <FormLabel>Município</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o município" {...field} />
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
              
              <FormField
                control={form.control}
                name="president_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Presidente</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o nome do presidente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="vice_president_1_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Vice-presidente 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do vice-presidente 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="vice_president_2_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Vice-presidente 2 (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do vice-presidente 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="secretary_1_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Secretário 1</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do secretário 1" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="secretary_2_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Secretário 2 (Opcional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Digite o nome do secretário 2" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>


            <FormField
              control={form.control}
              name="access_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código de Acesso (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o código de acesso" {...field} />
                  </FormControl>
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
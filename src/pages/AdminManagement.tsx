import { useEffect, useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Edit, Lock, Unlock, Users, Shield, Power, PowerOff, Settings, Upload, Trash2, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { compressImage } from "@/lib/imageOptimization";

interface SystemAdmin {
  id: string;
  name: string;
  email: string;
  access_code: string;
  permission_level: string;
  is_active: boolean;
  last_login_at?: string;
  created_by_admin_id?: string;
  access_attempts?: number;
  locked_until?: string;
  created_at: string;
}

interface Group {
  id: string;
  name: string;
  province: string;
  municipality: string;
  access_code: string;
  is_active: boolean;
  created_at: string;
}

interface CreatorInfo {
  name: string;
  whatsapp: string;
  email: string;
  photo_url: string | null;
}

export default function AdminManagement() {
  const { user, hasPermission } = useAuth();
  const { toast } = useToast();
  const [admins, setAdmins] = useState<SystemAdmin[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState<SystemAdmin | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    permission_level: "admin_adjunto",
  });

  // Creator settings state
  const [creatorInfo, setCreatorInfo] = useState<CreatorInfo>({
    name: "Manuel Bemvindo Mendes",
    whatsapp: "+244 927 800 658",
    email: "manuelbmendes01@gmail.com",
    photo_url: null,
  });
  const [savingCreator, setSavingCreator] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user has permission to access this page
  if (!user || !hasPermission('manage_admins')) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-2">Acesso Negado</h1>
            <p className="text-muted-foreground">Você não tem permissão para acessar esta página.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  useEffect(() => {
    loadAdmins();
    loadGroups();
    loadCreatorInfo();
  }, []);

  async function loadAdmins() {
    try {
      const { data, error } = await supabase
        .from('system_admins')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAdmins(data || []);
    } catch (error) {
      console.error('Erro ao carregar administradores:', error);
      toast({
        title: "Erro",
        description: "Falha ao carregar lista de administradores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function loadGroups() {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('id, name, province, municipality, access_code, is_active, created_at')
        .order('name', { ascending: true });

      if (error) throw error;
      setGroups(data || []);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  }

  async function loadCreatorInfo() {
    try {
      const { data, error } = await supabase
        .from('system_settings')
        .select('value')
        .eq('key', 'creator_info')
        .single();

      if (error) throw error;
      if (data?.value) {
        setCreatorInfo(data.value as unknown as CreatorInfo);
      }
    } catch (error) {
      console.error('Erro ao carregar informações do criador:', error);
    }
  }

  async function generateNewCode() {
    try {
      const { data, error } = await supabase.rpc('generate_admin_code');
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erro ao gerar código:', error);
      return `ADM_${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      
      const newCode = await generateNewCode();
      const adminData = {
        ...formData,
        access_code: newCode,
        created_by_admin_id: user?.data?.id,
        is_active: true,
      };

      if (editingAdmin) {
        const { error } = await supabase
          .from('system_admins')
          .update(adminData as any)
          .eq('id', editingAdmin.id);
        
        if (error) throw error;
        toast({ title: "Administrador atualizado com sucesso!" });
      } else {
        const { error } = await supabase
          .from('system_admins')
          .insert([adminData as any]);
        
        if (error) throw error;
        toast({ 
          title: "Administrador criado com sucesso!",
          description: `Código de acesso: ${newCode}` 
        });
      }

      // Log audit action
      await supabase.from('admin_audit_log').insert({
        admin_id: user?.data?.id,
        action: editingAdmin ? 'UPDATE_ADMIN' : 'CREATE_ADMIN',
        target_admin_id: editingAdmin?.id,
        details: { ...adminData, access_code: '[REDACTED]' }
      });

      loadAdmins();
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Erro ao salvar administrador:', error);
      toast({
        title: "Erro ao salvar administrador",
        description: "Verifique os dados e tente novamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function toggleAdminStatus(admin: SystemAdmin) {
    try {
      const { error } = await supabase
        .from('system_admins')
        .update({ is_active: !admin.is_active })
        .eq('id', admin.id);

      if (error) throw error;
      
      toast({ 
        title: `Administrador ${admin.is_active ? 'desativado' : 'ativado'} com sucesso!`
      });

      // Log audit action
      await supabase.from('admin_audit_log').insert({
        admin_id: user?.data?.id,
        action: admin.is_active ? 'DEACTIVATE_ADMIN' : 'ACTIVATE_ADMIN',
        target_admin_id: admin.id,
        details: { previous_status: admin.is_active }
      });

      loadAdmins();
    } catch (error) {
      console.error('Erro ao alterar status:', error);
      toast({
        title: "Erro ao alterar status",
        variant: "destructive",
      });
    }
  }

  async function toggleGroupStatus(group: Group) {
    try {
      const { error } = await supabase
        .from('groups')
        .update({ is_active: !group.is_active })
        .eq('id', group.id);

      if (error) throw error;
      
      toast({ 
        title: `Grupo ${group.is_active ? 'desativado' : 'ativado'} com sucesso!`,
        description: group.is_active 
          ? "O grupo não poderá mais ser acessado até ser ativado novamente."
          : "O grupo agora pode ser acessado normalmente."
      });

      // Log audit action
      await supabase.from('admin_audit_log').insert({
        admin_id: user?.data?.id,
        action: group.is_active ? 'DEACTIVATE_GROUP' : 'ACTIVATE_GROUP',
        details: { group_id: group.id, group_name: group.name, previous_status: group.is_active }
      });

      loadGroups();
    } catch (error) {
      console.error('Erro ao alterar status do grupo:', error);
      toast({
        title: "Erro ao alterar status do grupo",
        variant: "destructive",
      });
    }
  }

  // Creator info functions
  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      toast({
        title: "Erro",
        description: "Apenas imagens PNG, JPG ou WebP são permitidas",
        variant: "destructive",
      });
      return;
    }

    setUploadingPhoto(true);

    try {
      // Compress image
      const compressedFile = await compressImage(file, 512, 0.8);

      // Delete old photo if exists
      if (creatorInfo.photo_url) {
        const oldPath = creatorInfo.photo_url.split('/').pop();
        if (oldPath) {
          await supabase.storage.from('member-photos').remove([`creator/${oldPath}`]);
        }
      }

      // Upload new photo
      const fileName = `creator_${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage
        .from('member-photos')
        .upload(`creator/${fileName}`, compressedFile, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('member-photos')
        .getPublicUrl(`creator/${fileName}`);

      const newPhotoUrl = urlData.publicUrl;

      // Update creator info
      const updatedInfo = { ...creatorInfo, photo_url: newPhotoUrl };
      await saveCreatorInfo(updatedInfo);
      setCreatorInfo(updatedInfo);

      toast({
        title: "Foto atualizada com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast({
        title: "Erro ao fazer upload da foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }

  async function handleRemovePhoto() {
    if (!creatorInfo.photo_url) return;

    setUploadingPhoto(true);
    try {
      // Delete photo from storage
      const oldPath = creatorInfo.photo_url.split('/').pop();
      if (oldPath) {
        await supabase.storage.from('member-photos').remove([`creator/${oldPath}`]);
      }

      // Update creator info
      const updatedInfo = { ...creatorInfo, photo_url: null };
      await saveCreatorInfo(updatedInfo);
      setCreatorInfo(updatedInfo);

      toast({
        title: "Foto removida com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao remover foto:', error);
      toast({
        title: "Erro ao remover foto",
        variant: "destructive",
      });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveCreatorInfo(info: CreatorInfo) {
    const { error } = await supabase
      .from('system_settings')
      .update({ 
        value: JSON.parse(JSON.stringify(info)),
        updated_at: new Date().toISOString(),
        updated_by: user?.data?.id
      })
      .eq('key', 'creator_info');

    if (error) throw error;
  }

  async function handleSaveCreatorInfo() {
    setSavingCreator(true);
    try {
      await saveCreatorInfo(creatorInfo);
      toast({
        title: "Informações salvas com sucesso!",
      });
    } catch (error) {
      console.error('Erro ao salvar informações:', error);
      toast({
        title: "Erro ao salvar informações",
        variant: "destructive",
      });
    } finally {
      setSavingCreator(false);
    }
  }

  function resetForm() {
    setFormData({ name: "", email: "", permission_level: "admin_adjunto" });
    setEditingAdmin(null);
  }

  function openEditDialog(admin: SystemAdmin) {
    setEditingAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      permission_level: admin.permission_level,
    });
    setIsDialogOpen(true);
  }

  const getPermissionLevelLabel = (level: string) => {
    const labels = {
      'super_admin': 'Super Administrador',
      'admin_principal': 'Administrador Principal',
      'admin_adjunto': 'Administrador Adjunto',
      'admin_supervisor': 'Administrador Supervisor',
    };
    return labels[level as keyof typeof labels] || level;
  };

  const getPermissionLevelColor = (level: string) => {
    const colors = {
      'super_admin': 'bg-red-100 text-red-800 border-red-200',
      'admin_principal': 'bg-purple-100 text-purple-800 border-purple-200',
      'admin_adjunto': 'bg-blue-100 text-blue-800 border-blue-200',
      'admin_supervisor': 'bg-green-100 text-green-800 border-green-200',
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  if (loading && admins.length === 0) {
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
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Administração do Sistema
          </h1>
          <p className="text-muted-foreground">
            Gerir administradores, grupos e configurações do sistema SIGEG
          </p>
        </div>

        <Tabs defaultValue="admins" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="admins" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Admins
            </TabsTrigger>
            <TabsTrigger value="groups" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Grupos
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </TabsTrigger>
          </TabsList>

          {/* Tab: Administradores */}
          <TabsContent value="admins" className="space-y-4">
            <div className="flex justify-end">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Administrador
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingAdmin ? "Editar Administrador" : "Novo Administrador"}
                    </DialogTitle>
                    <DialogDescription>
                      {editingAdmin 
                        ? "Atualize as informações do administrador."
                        : "Crie um novo administrador do sistema. Um código de acesso será gerado automaticamente."
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Nome completo"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@exemplo.com"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="permission_level">Nível de Permissão</Label>
                      <Select value={formData.permission_level} onValueChange={(value) => setFormData({ ...formData, permission_level: value })}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin_supervisor">Administrador Supervisor</SelectItem>
                          <SelectItem value="admin_adjunto">Administrador Adjunto</SelectItem>
                          <SelectItem value="admin_principal">Administrador Principal</SelectItem>
                          {user?.data && (user.data as any).permission_level === 'super_admin' && (
                            <SelectItem value="super_admin">Super Administrador</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name || !formData.email}>
                      {editingAdmin ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Administradores do Sistema</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Código de Acesso</TableHead>
                      <TableHead>Nível</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Último Acesso</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.id}>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {admin.access_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPermissionLevelColor(admin.permission_level)}>
                            {getPermissionLevelLabel(admin.permission_level)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={admin.is_active ? "default" : "secondary"}>
                            {admin.is_active ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {admin.last_login_at 
                            ? new Date(admin.last_login_at).toLocaleDateString('pt-AO')
                            : "Nunca"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(admin)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            {admin.permission_level !== 'super_admin' && (
                              <Button
                                variant={admin.is_active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleAdminStatus(admin)}
                              >
                                {admin.is_active ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Grupos */}
          <TabsContent value="groups" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Gestão de Grupos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome do Grupo</TableHead>
                      <TableHead>Província</TableHead>
                      <TableHead>Município</TableHead>
                      <TableHead>Código de Acesso</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data de Criação</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group) => (
                      <TableRow key={group.id} className={!group.is_active ? "opacity-60" : ""}>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>{group.province}</TableCell>
                        <TableCell>{group.municipality}</TableCell>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm">
                            {group.access_code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge variant={group.is_active ? "default" : "destructive"}>
                            {group.is_active ? "Ativo" : "Desativado"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(group.created_at).toLocaleDateString('pt-AO')}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant={group.is_active ? "destructive" : "default"}
                            size="sm"
                            onClick={() => toggleGroupStatus(group)}
                            className="flex items-center gap-2"
                          >
                            {group.is_active ? (
                              <>
                                <PowerOff className="w-4 h-4" />
                                Desativar
                              </>
                            ) : (
                              <>
                                <Power className="w-4 h-4" />
                                Ativar
                              </>
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab: Configurações */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações do Criador do SIGEG
                </CardTitle>
                <CardDescription>
                  Gerir foto e contactos exibidos na página de contacto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Photo Section */}
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="w-32 h-32 border-4 border-primary/20">
                    {creatorInfo.photo_url ? (
                      <AvatarImage src={creatorInfo.photo_url} alt={creatorInfo.name} />
                    ) : null}
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-4xl">
                      <User className="w-16 h-16" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp"
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                    >
                      {uploadingPhoto ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4 mr-2" />
                      )}
                      {creatorInfo.photo_url ? 'Substituir Foto' : 'Adicionar Foto'}
                    </Button>
                    
                    {creatorInfo.photo_url && (
                      <Button
                        variant="destructive"
                        onClick={handleRemovePhoto}
                        disabled={uploadingPhoto}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Remover
                      </Button>
                    )}
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid gap-4 max-w-md mx-auto">
                  <div className="space-y-2">
                    <Label htmlFor="creator_name">Nome</Label>
                    <Input
                      id="creator_name"
                      value={creatorInfo.name}
                      onChange={(e) => setCreatorInfo({ ...creatorInfo, name: e.target.value })}
                      placeholder="Nome completo"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creator_whatsapp">WhatsApp</Label>
                    <Input
                      id="creator_whatsapp"
                      value={creatorInfo.whatsapp}
                      onChange={(e) => setCreatorInfo({ ...creatorInfo, whatsapp: e.target.value })}
                      placeholder="+244 XXX XXX XXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="creator_email">Email</Label>
                    <Input
                      id="creator_email"
                      type="email"
                      value={creatorInfo.email}
                      onChange={(e) => setCreatorInfo({ ...creatorInfo, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>

                  <Button
                    onClick={handleSaveCreatorInfo}
                    disabled={savingCreator}
                    className="mt-4"
                  >
                    {savingCreator ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      'Salvar Alterações'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
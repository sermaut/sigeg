import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle, Crown, FileText, Eye, UserPlus, Trash2, Shield, Info } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { getCategoryRoleLabel, getCategoryRoleDescription, getCategoryRoleBadgeVariant } from "@/lib/categoryRoleHelpers";

interface CategoryLeadersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  groupId: string;
  categoryName: string;
}

interface CategoryRole {
  id: string;
  role: 'presidente' | 'secretario' | 'auxiliar';
  member_id: string;
  members: {
    id: string;
    name: string;
    profile_image_url: string | null;
  };
}

interface Member {
  id: string;
  name: string;
  profile_image_url: string | null;
  role?: string;
}

export function CategoryLeadersDialog({
  open,
  onOpenChange,
  categoryId,
  groupId,
  categoryName,
}: CategoryLeadersDialogProps) {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [leaders, setLeaders] = useState<CategoryRole[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<'presidente' | 'secretario' | 'auxiliar' | "">("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      loadLeaders();
      loadMembers();
    }
  }, [open, categoryId]);

  const loadLeaders = async () => {
    try {
      const { data, error } = await supabase
        .from("category_roles")
        .select(`
          id,
          role,
          member_id,
          members!category_roles_member_id_fkey (
            id,
            name,
            profile_image_url
          )
        `)
        .eq("category_id", categoryId)
        .eq("is_active", true);

      if (error) throw error;
      setLeaders(data as any || []);
    } catch (error) {
      console.error("Erro ao carregar líderes:", error);
      toast.error(t('categoryLeaders.errorLoading'));
    }
  };

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("id, name, profile_image_url, role")
        .eq("group_id", groupId)
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setMembers(data || []);
    } catch (error) {
      console.error("Erro ao carregar membros:", error);
      toast.error(t('categoryLeaders.errorLoadingMembers'));
    }
  };

  const handleAddLeader = async () => {
    if (!selectedMember || !selectedRole) {
      toast.error(t('categoryLeaders.selectMemberAndRole'));
      return;
    }

    setLoading(true);
    try {
      const existingLeader = leaders.find(l => l.role === selectedRole);
      if ((selectedRole === 'presidente' || selectedRole === 'secretario') && existingLeader) {
        toast.error(t('categoryLeaders.roleAlreadyExists', { role: getCategoryRoleLabel(selectedRole) }));
        setLoading(false);
        return;
      }

      const memberHasRole = leaders.find(l => l.member_id === selectedMember);
      if (memberHasRole) {
        toast.error(t('categoryLeaders.memberHasRole'));
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from("category_roles")
        .insert({
          category_id: categoryId,
          member_id: selectedMember,
          role: selectedRole,
          group_id: groupId,
          assigned_by: user?.data?.id,
        });

      if (error) throw error;

      const selectedMemberData = members.find(m => m.id === selectedMember);
      await supabase
        .from("notifications")
        .insert({
          recipient_id: selectedMember,
          recipient_type: 'member',
          type: 'category_role_assigned',
          title: t('categoryLeaders.newRoleAssigned'),
          message: t('categoryLeaders.youWereAssigned', { role: getCategoryRoleLabel(selectedRole), categoryName }),
          link: `/financial?category=${categoryId}`,
        });

      toast.success(t('categoryLeaders.leaderAdded', { name: selectedMemberData?.name, role: getCategoryRoleLabel(selectedRole) }));
      setSelectedMember("");
      setSelectedRole("");
      loadLeaders();
    } catch (error) {
      console.error("Erro ao adicionar líder:", error);
      toast.error(t('categoryLeaders.errorAdding'));
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveLeader = async (leaderId: string, memberName: string, role: string) => {
    if (!confirm(t('categoryLeaders.confirmRemove', { name: memberName, role: getCategoryRoleLabel(role) }))) {
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from("category_roles")
        .delete()
        .eq("id", leaderId);

      if (error) throw error;

      toast.success(t('categoryLeaders.leaderRemoved', { name: memberName }));
      loadLeaders();
    } catch (error) {
      console.error("Erro ao remover líder:", error);
      toast.error(t('categoryLeaders.errorRemoving'));
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'presidente':
        return <Crown className="h-4 w-4" />;
      case 'secretario':
        return <FileText className="h-4 w-4" />;
      case 'auxiliar':
        return <Eye className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  const hasPresidente = leaders.some(l => l.role === 'presidente');
  const hasSecretario = leaders.some(l => l.role === 'secretario');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('categoryLeaders.manageLeaders')} - {categoryName}
          </DialogTitle>
          <DialogDescription>
            {t('categoryLeaders.assignRoles')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription className="text-xs space-y-1">
              <div><strong>{t('categoryLeaders.president')}:</strong> {t('categoryLeaders.presidentPermissions')}</div>
              <div><strong>{t('categoryLeaders.secretary')}:</strong> {t('categoryLeaders.secretaryPermissions')}</div>
              <div><strong>{t('categoryLeaders.auxiliary')}:</strong> {t('categoryLeaders.auxiliaryPermissions')}</div>
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              {t('categoryLeaders.addLeader')}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={selectedMember} onValueChange={setSelectedMember}>
                <SelectTrigger>
                  <SelectValue placeholder={t('categoryLeaders.selectMember')} />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => !leaders.find(l => l.member_id === m.id))
                    .map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>

              <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('categoryLeaders.selectRole')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="presidente" disabled={hasPresidente}>
                    <div className="flex items-center gap-2">
                      <Crown className="h-4 w-4" />
                      {t('categoryLeaders.president')} {hasPresidente && `(${t('categoryLeaders.alreadyAssigned')})`}
                    </div>
                  </SelectItem>
                  <SelectItem value="secretario" disabled={hasSecretario}>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      {t('categoryLeaders.secretary')} {hasSecretario && `(${t('categoryLeaders.alreadyAssigned')})`}
                    </div>
                  </SelectItem>
                  <SelectItem value="auxiliar">
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      {t('categoryLeaders.auxiliary')}
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {selectedRole && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription className="text-xs">
                  {getCategoryRoleDescription(selectedRole)}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              onClick={handleAddLeader} 
              disabled={!selectedMember || !selectedRole || loading}
              className="w-full"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {t('categoryLeaders.addLeader')}
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold">{t('categoryLeaders.currentLeaders')}</h3>
            
            {leaders.length === 0 ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t('categoryLeaders.noLeadersAssigned')}
                </AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-3">
                  {leaders.map((leader) => (
                    <div
                      key={leader.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={leader.members.profile_image_url || undefined} />
                          <AvatarFallback>
                            {leader.members.name.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{leader.members.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={getCategoryRoleBadgeVariant(leader.role)} className="flex items-center gap-1">
                              {getRoleIcon(leader.role)}
                              {getCategoryRoleLabel(leader.role)}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          handleRemoveLeader(leader.id, leader.members.name, leader.role)
                        }
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
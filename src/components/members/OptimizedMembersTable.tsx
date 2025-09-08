import React, { memo, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Phone, Eye, Edit, User } from "lucide-react";

interface Member {
  id: string;
  name: string;
  role?: string;
  partition?: string;
  is_active: boolean;
  phone?: string;
  member_code?: string;
  profile_image_url?: string;
}

interface OptimizedMembersTableProps {
  members: Member[];
  onMemberView: (memberId: string) => void;
  onMemberEdit?: (memberId: string) => void;
  showActions?: boolean;
}

const MemberRow = memo(({ 
  member, 
  onMemberView, 
  onMemberEdit, 
  showActions = true 
}: { 
  member: Member; 
  onMemberView: (id: string) => void;
  onMemberEdit?: (id: string) => void;
  showActions?: boolean;
}) => {
  const initials = useMemo(() => {
    return member.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [member.name]);

  return (
    <tr className="border-b border-border hover:bg-muted/50 transition-smooth">
      <td className="px-4 py-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.profile_image_url} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
            {member.member_code && (
              <div className="text-xs text-muted-foreground">
                Código: {member.member_code}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        {member.role && (
          <Badge variant="secondary" className="capitalize">
            {member.role.replace('_', ' ')}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3">
        {member.partition && (
          <span className="text-sm capitalize text-muted-foreground">
            {member.partition}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        {member.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{member.phone}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <Badge variant={member.is_active ? "default" : "secondary"}>
          {member.is_active ? "Ativo" : "Inativo"}
        </Badge>
      </td>
      {showActions && (
        <td className="px-4 py-3">
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onMemberView(member.id)}
            >
              <Eye className="w-4 h-4" />
            </Button>
            {onMemberEdit && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onMemberEdit(member.id)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            )}
          </div>
        </td>
      )}
    </tr>
  );
});

MemberRow.displayName = "MemberRow";

export const OptimizedMembersTable = memo(({ 
  members, 
  onMemberView, 
  onMemberEdit,
  showActions = true 
}: OptimizedMembersTableProps) => {
  const memoizedMembers = useMemo(() => members, [members]);

  if (memoizedMembers.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground">Nenhum membro encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Membro
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Cargo
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Partição
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Telefone
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
              Status
            </th>
            {showActions && (
              <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {memoizedMembers.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              onMemberView={onMemberView}
              onMemberEdit={onMemberEdit}
              showActions={showActions}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}); 

OptimizedMembersTable.displayName = "OptimizedMembersTable";
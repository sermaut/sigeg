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
      <td className="px-4 py-3 border-r border-border/50">
        <div className="flex items-center space-x-3">
          <Avatar className="w-8 h-8">
            <AvatarImage src={member.profile_image_url} />
            <AvatarFallback className="text-xs">{initials}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium text-foreground">{member.name}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.role && (
          <Badge variant="secondary" className="capitalize">
            {member.role.replace('_', ' ')}
          </Badge>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.partition && (
          <span className="text-sm capitalize text-muted-foreground">
            {member.partition}
          </span>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
        {member.phone && (
          <div className="flex items-center space-x-1">
            <Phone className="w-3 h-3 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{member.phone}</span>
          </div>
        )}
      </td>
      <td className="px-4 py-3 border-r border-border/50">
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
            <th className="px-2 py-1 text-center text-sm font-medium text-muted-foreground w-12 border-r border-border/50">
              Nº.
            </th>
            <th className="px-4 py-1 text-center text-sm font-medium text-muted-foreground w-20 border-r border-border/50">
              Foto
            </th>
            <th className="px-4 py-1 text-left text-sm font-medium text-muted-foreground">
              Nome Completo
            </th>
          </tr>
        </thead>
        <tbody>
          {memoizedMembers.map((member, index) => (
            <tr key={member.id} className="border-b border-border hover:bg-muted/50 transition-smooth">
              <td className="px-2 py-1.5 text-center text-sm text-muted-foreground border-r border-border/50">
                {index + 1}
              </td>
              <td className="px-4 py-1.5 text-center border-r border-border/50">
                <Avatar 
                  className="w-9 h-9 mx-auto cursor-pointer hover:scale-105 transition-transform rounded-sm"
                  onClick={() => {
                    if (member.profile_image_url) {
                      const img = new Image();
                      img.src = member.profile_image_url;
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(`
                          <html>
                            <head><title>${member.name}</title></head>
                            <body style="margin:0;background:#000;display:flex;justify-content:center;align-items:center;height:100vh;">
                              <img src="${member.profile_image_url}" style="max-width:100%;max-height:100%;object-fit:contain;" />
                            </body>
                          </html>
                        `);
                      }
                    }
                  }}
                >
                  <AvatarImage src={member.profile_image_url} className="object-cover" />
                  <AvatarFallback className="text-xs rounded-sm">
                    {member.name
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
              </td>
              <td className="px-4 py-1.5">
                <button
                  className="text-left hover:text-primary transition-colors font-medium"
                  onClick={() => onMemberView(member.id)}
                >
                  {member.name}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}); 

OptimizedMembersTable.displayName = "OptimizedMembersTable";
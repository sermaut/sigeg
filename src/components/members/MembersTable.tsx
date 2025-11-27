import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";

interface Member {
  id: string;
  name: string;
  profile_image_url?: string;
}

interface MembersTableProps {
  members: Member[];
  onMemberView: (id: string) => void;
}

export function MembersTable({ members, onMemberView }: MembersTableProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  return (
    <div className="rounded-xl overflow-hidden border-[1.3px] border-primary/20 shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="bg-cyan-100 hover:bg-cyan-200 border-0 transition-colors">
            <TableHead className="w-16 text-center text-sm font-semibold text-cyan-900 border-r border-cyan-200">Nº</TableHead>
            <TableHead className="w-24 text-center text-sm font-semibold text-cyan-900 border-r border-cyan-200">FOTO</TableHead>
            <TableHead className="text-sm font-semibold text-cyan-900">NOME COMPLETO</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => (
            <TableRow key={member.id} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
              <TableCell className="text-center font-semibold text-sm border-r border-primary/10 text-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="text-center border-r border-primary/10 p-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer hover:scale-105 transition-transform">
                      <Avatar className="w-14 h-14 mx-auto ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                        <AvatarImage 
                          src={member.profile_image_url} 
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-base font-semibold">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <div className="flex justify-center">
                      <Avatar className="w-64 h-64">
                        <AvatarImage 
                          src={member.profile_image_url} 
                          alt={member.name}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-cyan-500 to-teal-500 text-white text-6xl">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-2xl font-semibold text-center mt-4 px-6 w-full">
                      {member.name}
                    </h3>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  onClick={() => onMemberView(member.id)}
                  className="h-auto p-2 text-left justify-start hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="font-medium text-sm truncate max-w-[300px] text-foreground">{member.name}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-sm">
                Nenhum membro cadastrado neste grupo
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
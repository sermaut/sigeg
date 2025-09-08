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
    <div className="rounded-md border-0">
      <Table>
        <TableHeader>
          <TableRow className="border-b">
            <TableHead className="w-16 text-center text-xs border-r">Nº</TableHead>
            <TableHead className="w-20 text-center text-xs border-r">FOTO</TableHead>
            <TableHead className="text-xs font-semibold">NOME</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member, index) => (
            <TableRow key={member.id} className="h-12 border-b">
              <TableCell className="text-center font-medium text-xs py-2 border-r">
                {index + 1}
              </TableCell>
              <TableCell className="text-center py-2 border-r">
                <Dialog>
                  <DialogTrigger asChild>
                    <div className="cursor-pointer hover:opacity-80 transition-opacity">
                      <Avatar className="w-8 h-8 mx-auto">
                        <AvatarImage 
                          src={member.profile_image_url} 
                          alt={member.name}
                        />
                        <AvatarFallback className="gradient-primary text-white text-xs">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <div className="flex justify-center">
                      <Avatar className="w-64 h-64">
                        <AvatarImage 
                          src={member.profile_image_url} 
                          alt={member.name}
                          className="object-cover"
                        />
                        <AvatarFallback className="gradient-primary text-white text-6xl">
                          {getInitials(member.name)}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <h3 className="text-xl font-semibold text-center mt-4">
                      {member.name}
                    </h3>
                  </DialogContent>
                </Dialog>
              </TableCell>
              <TableCell className="py-2">
                <Button
                  variant="ghost"
                  onClick={() => onMemberView(member.id)}
                  className="h-auto p-0 text-left justify-start hover:bg-transparent hover:text-primary"
                >
                  <span className="font-medium text-xs truncate max-w-[200px]">{member.name}</span>
                </Button>
              </TableCell>
            </TableRow>
          ))}
          {members.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-xs">
                Nenhum membro cadastrado neste grupo
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
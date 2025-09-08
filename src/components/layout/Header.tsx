import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Search, User, LogOut, Shield, Users, Menu, Eye, EyeOff } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { user, logout, isAdmin, isMember } = useAuth();
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (showCode) {
      const timer = setTimeout(() => {
        setShowCode(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showCode]);

  const getDisplayInfo = () => {
    if (!user) return { name: 'Usuário', code: '---', icon: User };

    if (isAdmin()) {
      const admin = user.data as any;
      return {
        name: admin.name || 'Administrador',
        code: admin.access_code,
        icon: Shield
      };
    } else {
      const member = user.data as any;
      return {
        name: member.name || 'Membro',
        code: member.member_code,
        icon: Users
      };
    }
  };

  const { name, code, icon: UserIcon } = getDisplayInfo();

  return (
    <header className="h-16 border-b border-border bg-card shadow-soft">
      <div className="flex items-center justify-between h-full px-3 md:px-6">
        {/* Mobile menu button */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Search - hidden on mobile */}
        <div className="hidden md:flex items-center space-x-4 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar grupos, membros..."
              className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-smooth"
            />
          </div>
        </div>

        {/* User info and actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <Button variant="ghost" size="icon" className="relative hidden md:flex">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full" />
            </span>
          </Button>
          
          <div className="flex items-center space-x-2 md:space-x-3 pl-2 md:pl-3 border-l border-border">
            <div className="text-right">
              <p className="text-xs md:text-sm font-medium text-foreground">{name}</p>
              <div className="flex items-center space-x-1">
                <p className="text-xs text-muted-foreground">Código:</p>
                {showCode ? (
                  <span className="text-xs text-foreground font-mono">{code}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">••••••</span>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowCode(!showCode)}
                  className="h-4 w-4 p-0 text-muted-foreground hover:text-foreground"
                >
                  {showCode ? (
                    <EyeOff className="w-3 h-3" />
                  ) : (
                    <Eye className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <Button variant="outline" size="icon" className="rounded-full w-8 h-8 md:w-10 md:h-10">
              <UserIcon className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={logout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 w-8 h-8 md:w-10 md:h-10 hidden md:flex"
              title="Sair do sistema"
            >
              <LogOut className="w-3 h-3 md:w-4 md:h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}